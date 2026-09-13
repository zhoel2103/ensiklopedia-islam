"use server"

import { KalimatSearchResult } from "./kalimat-service"
import { db } from "@/db"
import { ayat, surah } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export type AyatDetail = {
  surahId: number
  ayatId: number
  arab: string
  indo: string
  audio: string
}

// Format number to 3 digits e.g. 1 -> 001, 12 -> 012
function padZero(num: number): string {
  return num.toString().padStart(3, "0")
}

export async function searchAyatSemantik(query: string): Promise<AyatDetail[]> {
  const apiKey = process.env.KALIMAT_API_KEY
  if (!apiKey) return []

  try {
    const url = `https://api.kalimat.dev/api/v2/search?query=${encodeURIComponent(query)}&getText=true`
    const res = await fetch(url, {
      headers: { "x-api-key": apiKey, "Accept": "application/json" }
    })
    
    if (!res.ok) return []
    const data = await res.json()
    const results: KalimatSearchResult[] = data?.data?.results || []
    
    const ayats: AyatDetail[] = []
    
    for (const r of results) {
      if (r.type === "quran_verse") {
        const parts = r.id.split(":")
        if (parts.length === 2) {
          const s = parseInt(parts[0])
          const a = parseInt(parts[1])
          
          let indoTranslation = r.translatedText
          
          try {
            // Fetch authentic Indonesian translation from local database
            const surahSlug = `surah-${s}`
            const localAyat = await db.select().from(ayat).where(
              and(
                eq(ayat.surahId, surahSlug),
                eq(ayat.nomor, a)
              )
            ).limit(1)
            
            if (localAyat && localAyat.length > 0) {
              indoTranslation = localAyat[0].terjemah
            }
          } catch(e) {
            console.error("Local DB fetch error:", e)
          }

          ayats.push({
            surahId: s,
            ayatId: a,
            arab: r.text,
            indo: indoTranslation,
            audio: `https://everyayah.com/data/Alafasy_128kbps/${padZero(s)}${padZero(a)}.mp3`
          })
        }
      }
    }
    return ayats
  } catch (error) {
    console.error("Semantic search error:", error)
    return []
  }
}

export async function getAyatSpecific(surahNum: number, ayatNum: number): Promise<AyatDetail | null> {
  try {
    const surahSlug = `surah-${surahNum}`
    
    // Fetch directly from local database
    const localAyat = await db.select().from(ayat).where(
      and(
        eq(ayat.surahId, surahSlug),
        eq(ayat.nomor, ayatNum)
      )
    ).limit(1)
    
    if (localAyat && localAyat.length > 0) {
      return {
        surahId: surahNum,
        ayatId: ayatNum,
        arab: localAyat[0].arab,
        indo: localAyat[0].terjemah,
        audio: `https://everyayah.com/data/Alafasy_128kbps/${padZero(surahNum)}${padZero(ayatNum)}.mp3`
      }
    }
  } catch (error) {
    console.error("Error fetching specific ayah from DB:", error)
  }

  // Fallback to public API
  try {
    const { fetchSurahFromPublicApi } = await import("./tafsir-repo")
    const publicSurah = await fetchSurahFromPublicApi(surahNum, `surah-${surahNum}`)
    if (publicSurah && publicSurah.ayat) {
      const publicAyat = publicSurah.ayat.find(a => a.nomor === ayatNum)
      if (publicAyat) {
        return {
          surahId: surahNum,
          ayatId: ayatNum,
          arab: publicAyat.arab,
          indo: publicAyat.terjemah,
          audio: `https://everyayah.com/data/Alafasy_128kbps/${padZero(surahNum)}${padZero(ayatNum)}.mp3`
        }
      }
    }
  } catch (err) {
    console.error("Error fetching specific ayah from public API:", err)
  }

  return null
}
