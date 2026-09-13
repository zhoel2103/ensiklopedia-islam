import { NextResponse } from "next/server"

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

    let translatedHtml = combinedTafsirHtml
    try {
      // Split text into safe chunks for GET request to avoid 414 URI Too Long
      // We'll split by div or br tags if possible, or just raw length
      const chunks = combinedTafsirHtml.match(/.{1,1500}/gs) || []
      let translated = ""
      
      for (const chunk of chunks) {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=id&dt=t&q=${encodeURIComponent(chunk)}`
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
          }
        })
        
        if (!res.ok) {
          throw new Error(`Google API returned ${res.status}`)
        }
        
        const data = await res.json()
        if (data && data[0]) {
          translated += data[0].map((s: any) => s[0]).join('')
        } else {
          translated += chunk
        }
      }
      
      translatedHtml = translated
    } catch (err) {
      console.error("Error translating tafsir with fallback:", err)
      translatedHtml = `<div class="mb-4 text-emerald-400 text-sm border border-emerald-900/50 bg-[#03100e] p-3 rounded-lg"><em>Catatan: Gagal menerjemahkan teks ke Bahasa Indonesia karena limitasi API publik (diblokir oleh penyedia layanan terjemahan). Menampilkan teks asli.</em></div>${combinedTafsirHtml}`
    }

    return NextResponse.json({
      summary: translatedHtml,
      provider: "quran.foundation + API Terjemahan Alternatif",
    })
  } catch (err) {
    console.error("quran.foundation API Error:", err)
    return NextResponse.json(
      { error: "Gagal memproses permintaan tafsir" },
      { status: 500 }
    )
  }
}
