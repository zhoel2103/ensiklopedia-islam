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

    // Iterate through requested ayahs
    for (let ayatNum = start; ayatNum <= end; ayatNum++) {
      const tafsirData = await fetchTafsir(surahNomor, ayatNum)
      
      if (!tafsirData) continue
      
      let teksTafsir = ""
      if (sourceId === "tahlili" && tafsirData.tahlili) teksTafsir = tafsirData.tahlili
      else if (sourceId === "jalalayn" && tafsirData.jalalayn) teksTafsir = tafsirData.jalalayn
      else if (sourceId === "wajiz" && tafsirData.wajiz) teksTafsir = tafsirData.wajiz
      
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
      provider: "Ahmad Sanusi API (Kemenag RI)",
    })
  } catch (err) {
    console.error("Ahmad Sanusi API Error:", err)
    return NextResponse.json(
      { error: "Gagal memproses permintaan tafsir" },
      { status: 500 }
    )
  }
}
