import { NextResponse } from "next/server"
import { getDaftarDoa } from "@/lib/doa-api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const grup = searchParams.get("grup")
    const tag = searchParams.get("tag")
    const q = searchParams.get("q")?.toLowerCase().trim()

    let doas = await getDaftarDoa()

    if (id) {
      const single = doas.find((d) => d.id.toString() === id)
      if (!single) {
        return NextResponse.json({ status: false, message: "Doa tidak ditemukan" }, { status: 404 })
      }
      return NextResponse.json({ status: true, data: single })
    }

    if (grup && grup !== "Semua Kategori") {
      doas = doas.filter((d) => d.grup.toLowerCase() === grup.toLowerCase())
    }

    if (tag && tag !== "Semua Tag") {
      doas = doas.filter((d) =>
        d.tag && d.tag.some((t) => t.toLowerCase() === tag.toLowerCase())
      )
    }

    if (q) {
      doas = doas.filter((d) =>
        d.nama.toLowerCase().includes(q) ||
        d.idn.toLowerCase().includes(q) ||
        d.grup.toLowerCase().includes(q) ||
        d.tr.toLowerCase().includes(q) ||
        (d.tentang && d.tentang.toLowerCase().includes(q)) ||
        (d.tag && d.tag.some((t) => t.toLowerCase().includes(q)))
      )
    }

    return NextResponse.json({
      status: true,
      total: doas.length,
      data: doas,
    })
  } catch {
    return NextResponse.json(
      { status: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    )
  }
}
