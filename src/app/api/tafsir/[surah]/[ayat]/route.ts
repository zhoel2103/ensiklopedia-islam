import { NextResponse } from "next/server"
import { fetchTafsir } from "@/lib/ahmad-sanusi"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ surah: string; ayat: string }> }
) {
  const resolvedParams = await params
  const surah = parseInt(resolvedParams.surah, 10)
  const ayat = parseInt(resolvedParams.ayat, 10)

  if (isNaN(surah) || isNaN(ayat)) {
    return NextResponse.json({ error: "Invalid surah or ayat parameter" }, { status: 400 })
  }

  const tafsir = await fetchTafsir(surah, ayat)

  if (!tafsir) {
    return NextResponse.json({ error: "Tafsir not found" }, { status: 404 })
  }

  return NextResponse.json(tafsir)
}
