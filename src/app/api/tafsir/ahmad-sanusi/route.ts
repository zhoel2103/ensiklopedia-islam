import { NextResponse } from "next/server"
import { fetchTafsir } from "@/lib/ahmad-sanusi"

export async function POST(req: Request) {
  try {
    const { surahNomor, start, end, sourceId } = await req.json()

    if (!surahNomor || !start || !end || !sourceId) {
      return NextResponse.json(
        { error: "Parameter tidak lengkap" },
        { status: 400 }
      )
    }

    let combinedTafsirHtml = ""
    let equranTafsirData: any = null
    let providerName = "Ahmad Sanusi API (Kemenag RI)"

    if (sourceId === "almukhtashar" || sourceId === "assadi") {
      providerName = "QuranEnc API"
    }

    // Iterate through requested ayahs
    for (let ayatNum = start; ayatNum <= end; ayatNum++) {
      let teksTafsir = ""
      
      if (sourceId === "almukhtashar" || sourceId === "assadi") {
        const quranencKey = sourceId === "almukhtashar" ? "indonesian_complex" : "indonesian_sabiq"
        try {
          const res = await fetch(`https://quranenc.com/api/v1/translation/aya/${quranencKey}/${surahNomor}/${ayatNum}`)
          if (res.ok) {
            const data = await res.json()
            if (data && data.result && data.result.translation) {
              teksTafsir = data.result.translation
              if (data.result.footnotes) {
                teksTafsir += `\n\nCatatan Kaki: ${data.result.footnotes}`
              }
            }
          }
        } catch(e) {
          console.error("QuranEnc fetch error:", e)
        }
      } else {
        // 1. Try Ahmad Sanusi API first
        const tafsirData = await fetchTafsir(surahNomor, ayatNum)
        if (tafsirData) {
          if (sourceId === "tahlili" && tafsirData.tahlili) teksTafsir = tafsirData.tahlili
          else if (sourceId === "jalalayn" && tafsirData.jalalayn) teksTafsir = tafsirData.jalalayn
          else if (sourceId === "wajiz" && tafsirData.wajiz) teksTafsir = tafsirData.wajiz
          else if (sourceId === "quraish" && tafsirData.quraish) teksTafsir = tafsirData.quraish
        }
        
        // 2. Fallback to EQuran for Tahlili if Ahmad Sanusi failed (blocked/missing key)
        if (!teksTafsir && sourceId === "tahlili") {
          if (!equranTafsirData) {
            try {
              const res = await fetch(`https://equran.id/api/v2/tafsir/${surahNomor}`)
              if (res.ok) {
                const json = await res.json()
                equranTafsirData = json.data?.tafsir || []
              }
            } catch (e) {
              console.error("Equran fallback error:", e)
            }
          }
          
          if (equranTafsirData && Array.isArray(equranTafsirData)) {
            const matchedAyat = equranTafsirData.find((a: any) => a.ayat === ayatNum)
            if (matchedAyat && matchedAyat.teks) {
              teksTafsir = matchedAyat.teks
            }
          }
        }
      }

      if (!teksTafsir) continue

      combinedTafsirHtml += `<div class="mb-6"><h3 class="font-bold text-emerald-400 mb-2 border-b border-emerald-900/50 pb-2">Ayat ${ayatNum}</h3><div class="text-emerald-100/90 leading-relaxed text-sm">${teksTafsir.replace(/\n/g, '<br/>')}</div></div>`
    }

    if (!combinedTafsirHtml) {
      return NextResponse.json(
        { error: "Tafsir tidak ditemukan untuk ayat tersebut pada sumber ini" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      summary: combinedTafsirHtml,
      provider: providerName,
    })
  } catch (err) {
    console.error("Ahmad Sanusi API Error:", err)
    return NextResponse.json(
      { error: "Gagal memproses permintaan tafsir" },
      { status: 500 }
    )
  }
}
