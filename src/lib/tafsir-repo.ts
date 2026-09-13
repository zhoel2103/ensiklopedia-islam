import { db } from "@/db"
import { surah, ayat, tafsir } from "@/db/schema"
import { eq } from "drizzle-orm"
import { SURAH_DETAIL_LIST } from "@/lib/tafsir-metadata"
import { surahIndex } from "@/lib/surah-index"
import { surahTafsirList, type SurahTafsir, type AyatTafsir, getSurah } from "@/lib/tafsir-data"
import {
  fetchSurahList,
  fetchSurahMeta,
  fetchSurahAyat,
  isApiConfigured,
} from "@/lib/ahmad-sanusi"

export type SyncResult = "synced" | "notfound" | "apifail"

export function resolveSurahMeta(rawId: string) {
  const num = parseInt(rawId, 10)
  if (!isNaN(num) && num >= 1 && num <= 114) {
    return (
      SURAH_DETAIL_LIST.find((s) => s.nomor === num) ||
      surahIndex.find((s) => s.nomor === num) ||
      null
    )
  }

  const cleanRaw = rawId.toLowerCase().replace(/[^a-z0-9]/g, "")
  return (
    SURAH_DETAIL_LIST.find(
      (s) =>
        s.id.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanRaw ||
        s.namaLatin.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanRaw,
    ) ||
    surahIndex.find(
      (s) =>
        s.id.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanRaw ||
        s.namaLatin.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanRaw,
    ) ||
    null
  )
}

export async function syncSurahList(): Promise<boolean> {
  const list = await fetchSurahList()
  if (!list) return false

  for (const s of list) {
    const slug = surahIndex.find((x) => x.nomor === s.id)?.id ?? `surah-${s.id}`
    await db
      .insert(surah)
      .values({
        nomor: s.id,
        id: slug,
        nama: s.name_arabic,
        namaLatin: s.name_id,
        arti: s.translate_id,
        jumlahAyat: s.num_ayah,
      })
      .onConflictDoUpdate({
        target: surah.id,
        set: {
          nomor: s.id,
          nama: s.name_arabic,
          namaLatin: s.name_id,
          arti: s.translate_id,
          jumlahAyat: s.num_ayah,
        },
      })
  }
  return true
}

export async function fetchSurahFromPublicApi(
  surahNomor: number,
  surahSlug: string,
): Promise<SurahTafsir | null> {
  const meta = resolveSurahMeta(String(surahNomor)) || resolveSurahMeta(surahSlug)

  const namaLatin = meta?.namaLatin || `Surah ${surahNomor}`
  const namaArab: string = (meta && "namaArab" in meta && typeof (meta as any).namaArab === "string") ? (meta as any).namaArab : ""
  const arti = meta?.arti || ""
  const jumlahAyat = meta?.jumlahAyat || 0

  // 1. Try Ahmad Sanusi API (Kemenag Standard) if configured
  if (isApiConfigured()) {
    try {
      const apiAyats = await fetchSurahAyat(surahNomor)
      if (apiAyats && apiAyats.length > 0) {
        return {
          nomor: surahNomor,
          id: surahSlug,
          nama: namaArab,
          namaLatin,
          arti,
          jumlahAyat: apiAyats.length,
          ayat: apiAyats.map((a) => ({
            nomor: a.ayah_number,
            arab: a.arabic,
            terjemah: a.translation_id,
            juz: a.juz,
            tafsir: a.tafsir_wajiz ?? "",
          })),
        }
      }
    } catch {
      // Ignore
    }
  }

  // 2. Try EQuran API v2 (Indonesian Kemenag Standard, fast & no auth required)
  try {
    const res = await fetch(`https://equran.id/api/v2/surat/${surahNomor}`, {
      headers: { "User-Agent": "EnsiklopediaIslam/1.0" },
      cache: "no-store",
    })
    if (res.ok) {
      const json = await res.json()
      if (json.data && Array.isArray(json.data.ayat) && json.data.ayat.length > 0) {
        const ayats: AyatTafsir[] = json.data.ayat.map((a: any) => ({
          nomor: a.nomorAyat,
          arab: a.teksArab,
          terjemah: a.teksIndonesia,
          tafsir: "",
          juz: 1,
        }))
        return {
          nomor: json.data.nomor || surahNomor,
          id: surahSlug,
          nama: json.data.nama || namaArab,
          namaLatin: json.data.namaLatin || namaLatin,
          arti: json.data.arti || arti,
          jumlahAyat: json.data.jumlahAyat || ayats.length,
          ayat: ayats,
        }
      }
    }
  } catch {
    // Ignore and proceed to next source
  }

  // 3. Try AlQuran Cloud (Global CDN, 0 auth required)
  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNomor}/editions/quran-uthmani,id.indonesian`,
      { cache: "no-store" },
    )
    if (res.ok) {
      const json = await res.json()
      if (json.data && Array.isArray(json.data) && json.data.length >= 2) {
        const arSurah = json.data[0]
        const idSurah = json.data[1]
        const ayats: AyatTafsir[] = arSurah.ayahs.map((arAyat: any, idx: number) => ({
          nomor: arAyat.numberInSurah,
          arab: arAyat.text,
          terjemah: idSurah.ayahs[idx]?.text || "",
          tafsir: "",
          juz: arAyat.juz || 1,
        }))
        return {
          nomor: arSurah.number || surahNomor,
          id: surahSlug,
          nama: arSurah.name || namaArab,
          namaLatin: namaLatin,
          arti: arti,
          jumlahAyat: arSurah.numberOfAyahs || ayats.length,
          ayat: ayats,
        }
      }
    }
  } catch {
    // Ignore
  }

  // 4. Fallback to local hardcoded mock data
  const local = getSurah(surahSlug)
  if (local) return local

  return null
}

export async function syncSurahDetail(id: string): Promise<SyncResult> {
  const meta = resolveSurahMeta(id)
  if (!meta) return "notfound"

  const [metaApi, ayatList] = await Promise.all([
    fetchSurahMeta(meta.nomor),
    fetchSurahAyat(meta.nomor),
  ])
  if (!ayatList) return "apifail"

  const nama = metaApi?.name_arabic ?? ""

  try {
    await db.delete(ayat).where(eq(ayat.surahId, id))

    await db
      .insert(surah)
      .values({
        nomor: meta.nomor,
        id,
        nama,
        namaLatin: meta.namaLatin,
        arti: meta.arti,
        jumlahAyat: meta.jumlahAyat,
      })
      .onConflictDoUpdate({
        target: surah.id,
        set: {
          nomor: meta.nomor,
          namaLatin: meta.namaLatin,
          arti: meta.arti,
          jumlahAyat: meta.jumlahAyat,
        },
      })

    for (const a of ayatList) {
      const ayatId = crypto.randomUUID()
      await db.insert(ayat).values({
        id: ayatId,
        surahId: id,
        nomor: a.ayah_number,
        arab: a.arabic,
        terjemah: a.translation_id,
        juz: a.juz,
      })
      await db.insert(tafsir).values({
        id: crypto.randomUUID(),
        ayatId,
        surahId: id,
        ayatNomor: a.ayah_number,
        teks: a.tafsir_wajiz ?? "",
      })
    }
    return "synced"
  } catch {
    return "apifail"
  }
}

export async function getSurahDetailFromDb(
  id: string,
): Promise<SurahTafsir | null> {
  const meta = resolveSurahMeta(id)
  const resolvedSlug = meta?.id || id
  const resolvedNomor = meta?.nomor || parseInt(id, 10) || 1

  try {
    const surahRow = await db.select().from(surah).where(eq(surah.id, resolvedSlug))
    const ayatRows = await db
      .select()
      .from(ayat)
      .where(eq(ayat.surahId, resolvedSlug))
      .orderBy(ayat.nomor)
    const tafsirRows = await db
      .select()
      .from(tafsir)
      .where(eq(tafsir.surahId, resolvedSlug))

    if (surahRow.length > 0 && ayatRows.length > 0) {
      const tafsirByNomor = new Map(tafsirRows.map((t: any) => [t.ayatNomor, t.teks]))
      return {
        nomor: surahRow[0].nomor,
        id: surahRow[0].id,
        nama: surahRow[0].nama,
        namaLatin: surahRow[0].namaLatin,
        arti: surahRow[0].arti,
        jumlahAyat: surahRow[0].jumlahAyat,
        ayat: ayatRows.map((a: any) => ({
          nomor: a.nomor,
          arab: a.arab,
          terjemah: a.terjemah,
          juz: a.juz,
          tafsir: tafsirByNomor.get(a.nomor) ?? "",
        })),
      }
    }
  } catch {
    // Ignore DB errors on serverless
  }

  // Fallback to high-speed public Quran CDN (EQuran / AlQuran Cloud)
  return fetchSurahFromPublicApi(resolvedNomor, resolvedSlug)
}
