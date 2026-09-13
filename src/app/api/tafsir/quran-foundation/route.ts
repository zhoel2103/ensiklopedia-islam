import { NextResponse } from "next/server"
import { translate } from "@vitalets/google-translate-api"

export async function POST(req: Request) {
  try {
    const { surahNomor, start, end, sourceId } = await req.json()

    if (!surahNomor || !start || !end || !sourceId) {
      return NextResponse.json(
        { error: "Parameter surahNomor, start, end, dan sourceId diperlukan" },
        { status: 400 }
      )
    }

    let combinedTafsirHtml = ""

    // Fetch from quran.foundation API (or fallback for Jalalayn) sequentially
    for (let ayat = start; ayat <= end; ayat++) {
      try {
        if (sourceId === "ar.jalalayn") {
          const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNomor}:${ayat}/ar.jalalayn`)
          if (res.ok) {
            const json = await res.json()
            if (json.data && json.data.text) {
              combinedTafsirHtml += `<div class="mb-4"><strong>Ayat ${ayat}:</strong><br/>${json.data.text}</div>`
            }
          }
        } else {
          const res = await fetch(
            `https://api.quran.com/api/v4/tafsirs/${sourceId}/by_ayah/${surahNomor}:${ayat}`
          )

          if (res.ok) {
            const json = await res.json()
            if (json.tafsir && json.tafsir.text) {
              combinedTafsirHtml += `<div class="mb-4"><strong>Ayat ${ayat}:</strong><br/>${json.tafsir.text}</div>`
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching tafsir for ayat ${ayat}:`, err)
      }
    }

    if (!combinedTafsirHtml) {
      return NextResponse.json(
        { error: "Tidak dapat memuat tafsir dari quran.foundation" },
        { status: 404 }
      )
    }

    // Translate to Indonesian
    let translatedHtml = combinedTafsirHtml
    try {
      const { text } = await translate(combinedTafsirHtml, { to: "id" })
      translatedHtml = text
    } catch (err) {
      console.error("Error translating tafsir:", err)
      // Fallback to original text with a warning note
      translatedHtml = `<div class="mb-4 text-emerald-400 text-sm border border-emerald-900/50 bg-[#03100e] p-3 rounded-lg"><em>Catatan: Gagal menerjemahkan teks ke Bahasa Indonesia karena limitasi API publik. Menampilkan teks asli.</em></div>${combinedTafsirHtml}`
    }

    return NextResponse.json({
      summary: translatedHtml,
      provider: "quran.foundation + Google Translate",
    })
  } catch (err) {
    console.error("quran.foundation API Error:", err)
    return NextResponse.json(
      { error: "Gagal memproses permintaan tafsir" },
      { status: 500 }
    )
  }
}
