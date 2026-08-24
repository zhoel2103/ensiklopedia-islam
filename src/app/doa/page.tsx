import type { Metadata } from "next"
import { getDaftarDoa } from "@/lib/doa-api"
import DaftarDoa from "@/components/doa/daftar-doa"

export const metadata: Metadata = {
  title: "Kumpulan Doa Harian — ALMAKTABA Ensiklopedia Islam",
  description:
    "Kumpulan doa-doa harian dalam Islam lengkap dengan teks Arab, transliterasi Latin, terjemahan bahasa Indonesia, dan rujukan hadis shahih sumber equran.id.",
}

export default async function DoaPage() {
  const doas = await getDaftarDoa()

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <DaftarDoa initialDoas={doas} />
    </main>
  )
}
