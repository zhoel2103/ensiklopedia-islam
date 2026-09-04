import { db } from "@/db"
import { kitab, kitabBab } from "@/db/schema"
import { eq } from "drizzle-orm"
import { fetchKitabList, fetchKitabDetail } from "@/lib/ahmad-sanusi"
import {
  kitabList as fallbackKitabList,
  allKitabRegistry,
  getKitab,
  type KitabItem,
} from "@/lib/kitab-data"

const KUTUBUS_SITTAH_IDS = new Set([
  "bukhari",
  "muslim",
  "abu-dawud",
  "tirmidzi",
  "nasai",
  "ibnu-majah",
])

export async function getKitabListFromDb(): Promise<KitabItem[]> {
  if (!db) {
    return fallbackKitabList.filter((item) => !KUTUBUS_SITTAH_IDS.has(item.id))
  }

  try {
    const rows = await db.select().from(kitab).orderBy(kitab.judul)
    // Exclude Kutubus Sittah from general Kitab list because they belong to the Hadis section
    const nonKutubRows = rows.filter((r: any) => !KUTUBUS_SITTAH_IDS.has(r.id))

    if (nonKutubRows.length === 0) {
      return fallbackKitabList.filter((item) => !KUTUBUS_SITTAH_IDS.has(item.id))
    }

    const babCounts = await db
      .select({
        kitabId: kitabBab.kitabId,
        nomor: kitabBab.nomor,
        judul: kitabBab.judul,
        teks: kitabBab.teks,
      })
      .from(kitabBab)
      .orderBy(kitabBab.nomor)

    const babByKitab = new Map<string, typeof babCounts>()
    for (const b of babCounts) {
      const list = babByKitab.get(b.kitabId) ?? []
      list.push(b)
      babByKitab.set(b.kitabId, list)
    }

    const dbItems: KitabItem[] = nonKutubRows.map((k: any) => {
      const fallback = fallbackKitabList.find((fb) => fb.id === k.id)
      const bList = babByKitab.get(k.id) ?? []
      return {
        id: k.id,
        ulama: k.ulama,
        kategori: k.kategori,
        judul: k.judul,
        deskripsi: k.deskripsi,
        bab: fallback && fallback.bab.length > bList.length ? fallback.bab : bList,
      }
    })

    // Merge any items in fallbackKitabList not yet in db
    for (const fb of fallbackKitabList) {
      if (!dbItems.some((item) => item.id === fb.id)) {
        dbItems.push(fb)
      }
    }

    return dbItems.filter((item) => !KUTUBUS_SITTAH_IDS.has(item.id))
  } catch {
    return fallbackKitabList.filter((item) => !KUTUBUS_SITTAH_IDS.has(item.id))
  }
}

export async function getKitabDetailFromDb(
  id: string,
): Promise<KitabItem | null> {
  const fallback = getKitab(id)
  if (fallback) {
    return fallback
  }

  if (!db) return null

  try {
    const rows = await db.select().from(kitab).where(eq(kitab.id, id))
    if (rows.length === 0) {
      return null
    }

    const bRows = await db
      .select()
      .from(kitabBab)
      .where(eq(kitabBab.kitabId, id))
      .orderBy(kitabBab.nomor)

    return {
      id: rows[0].id,
      ulama: rows[0].ulama,
      kategori: rows[0].kategori,
      judul: rows[0].judul,
      deskripsi: rows[0].deskripsi,
      bab: bRows.map((b: any) => ({
        nomor: b.nomor,
        judul: b.judul,
        teks: b.teks,
      })),
    }
  } catch {
    return null
  }
}

export async function getUlamaListFromDb(): Promise<string[]> {
  if (!db) {
    return Array.from(new Set(fallbackKitabList.map((k) => k.ulama))).sort()
  }
  try {
    const rows = await db.selectDistinct({ ulama: kitab.ulama }).from(kitab)
    const list = rows.map((r: any) => r.ulama).filter(Boolean).sort()
    return list.length > 0
      ? list
      : Array.from(new Set(fallbackKitabList.map((k) => k.ulama))).sort()
  } catch {
    return Array.from(new Set(fallbackKitabList.map((k) => k.ulama))).sort()
  }
}

export async function getKategoriListFromDb(): Promise<string[]> {
  if (!db) {
    return Array.from(new Set(fallbackKitabList.map((k) => k.kategori))).sort()
  }
  try {
    const rows = await db
      .selectDistinct({ kategori: kitab.kategori })
      .from(kitab)
    const list = rows.map((r: any) => r.kategori).filter(Boolean).sort()
    return list.length > 0
      ? list
      : Array.from(new Set(fallbackKitabList.map((k) => k.kategori))).sort()
  } catch {
    return Array.from(new Set(fallbackKitabList.map((k) => k.kategori))).sort()
  }
}

export async function syncKitabList(): Promise<boolean> {
  if (!db) return false
  const list = await fetchKitabList()
  if (!list) return false

  try {
    for (const k of list) {
      await db
        .insert(kitab)
        .values({
          id: k.slug,
          ulama: k.pengarang ?? "",
          kategori: k.kategori ?? "Umum",
          judul: k.nama,
          deskripsi: k.deskripsi ?? "",
        })
        .onConflictDoUpdate({
          target: kitab.id,
          set: {
            ulama: k.pengarang ?? "",
            kategori: k.kategori ?? "Umum",
            judul: k.nama,
            deskripsi: k.deskripsi ?? "",
          },
        })
    }
    return true
  } catch {
    return false
  }
}

export async function syncKitabDetail(id: string): Promise<boolean> {
  if (!db) return false
  const detail = await fetchKitabDetail(id)
  if (!detail) return false

  try {
    await db.delete(kitabBab).where(eq(kitabBab.kitabId, id))

    for (const b of detail.bab) {
      await db.insert(kitabBab).values({
        id: crypto.randomUUID(),
        kitabId: id,
        nomor: b.nomor,
        judul: b.judul,
        teks: b.keterangan ?? "",
      })
    }
    return true
  } catch {
    return false
  }
}
