"use client"

import Link from "next/link"
import SimpanRiwayatButton from "@/components/simpan-riwayat-button"

export type KutubusSittahInfo = {
  id: string
  perawiKey: string
  judul: string
  arabic: string
  muallif: string
  wafat: string
  jumlahHadis: string
  derajat: string
  keistimewaan: string
  deskripsi: string
}

export const KUTUBUS_SITTAH_LIST: KutubusSittahInfo[] = [
  {
    id: "bukhari",
    perawiKey: "Bukhari",
    judul: "Shahih Al-Bukhari",
    arabic: "صَحِيحُ الْبُخَارِيِّ",
    muallif: "Imam Muhammad bin Ismail Al-Bukhari",
    wafat: "194–256 H (810–870 M)",
    jumlahHadis: "7.563 Hadits (97 Kitab)",
    derajat: "Shahih Mutlak (A'la Maratib)",
    keistimewaan: "Kitab paling otentik di muka bumi setelah Al-Qur'an dengan syarat sanad muttashil & perawi tsiqah liqa' (bertemu langsung).",
    deskripsi: "Disaring selama 16 tahun dari 600.000 hadis dengan shalat istikharah 2 rakaat pada setiap penulisan hadis.",
  },
  {
    id: "muslim",
    perawiKey: "Muslim",
    judul: "Shahih Muslim",
    arabic: "صَحِيحُ مُسْلِمٍ",
    muallif: "Imam Muslim bin Al-Hajjaj An-Naisaburi",
    wafat: "204–261 H (820–875 M)",
    jumlahHadis: "3.033 Hadits (54 Kitab)",
    derajat: "Shahih (Setingkat Bukhari)",
    keistimewaan: "Sistematika susunan matan dan perbandingan jalur sanad (turuq) terbaik tanpa pengulangan terpisah di berbagai bab.",
    deskripsi: "Disaring dari 300.000 hadis dengan metode penyajian sanad komparatif yang sangat mempermudah kajian takhrij.",
  },
  {
    id: "abu-dawud",
    perawiKey: "Abu Dawud",
    judul: "Sunan Abu Dawud",
    arabic: "سُنَنُ أَبِي دَاوُدَ",
    muallif: "Imam Abu Dawud Sulaiman bin Al-Asy'ats As-Sijistani",
    wafat: "202–275 H (817–889 M)",
    jumlahHadis: "5.274 Hadits (43 Kitab)",
    derajat: "Shahih & Hasan (Pokok Hadis Ahkam)",
    keistimewaan: "Rujukan induk terlengkap bagi para fuqaha dalam menetapkan hukum-hukum syariat dan fiqih amaliyah empat madzhab.",
    deskripsi: "Dipilih dari 500.000 hadis dengan fokus utama hadis hukum (*Ahaditsul Ahkam*) yang menjadi landasan ijtihad ulama.",
  },
  {
    id: "tirmidzi",
    perawiKey: "Tirmidzi",
    judul: "Jami' At-Tirmidzi",
    arabic: "جَامِعُ التِّرْمِذِيِّ",
    muallif: "Imam Abu Isa Muhammad bin Isa At-Tirmidzi",
    wafat: "209–279 H (824–892 M)",
    jumlahHadis: "3.956 Hadits (50 Kitab)",
    derajat: "Hasan Shahih & Kritik Sanad",
    keistimewaan: "Pelopor istilah 'Hasan', mencantumkan derajat hadis, perselisihan madzhab sahabat & tabi'in, serta penjelasan 'ilal.",
    deskripsi: "Sangat istimewa karena menjelaskan siapa saja ulama madzhab dan sahabat Nabi yang mengamalkan hadis tersebut.",
  },
  {
    id: "nasai",
    perawiKey: "An-Nasai",
    judul: "Sunan An-Nasa'i (Al-Mujtaba)",
    arabic: "سُنَنُ النَّسَائِيِّ (الْمُجْتَبَى)",
    muallif: "Imam Abu Abdirrahman Ahmad bin Syu'aib An-Nasa'i",
    wafat: "215–303 H (829–915 M)",
    jumlahHadis: "5.761 Hadits (51 Kitab)",
    derajat: "Shahih & Hasan (Kritik Terketat)",
    keistimewaan: "Tingkat seleksi kritik sanad paling ketat di antara kitab Sunan, membeberkan cacat tersembunyi ('ilal) dan perbedaan redaksi lafaz.",
    deskripsi: "Merupakan intisari pilihan (*al-Mujtaba*) dari karya Sunan Al-Kubra dengan sanad periwayatan yang sangat terjaga ketsiqahannya.",
  },
  {
    id: "ibnu-majah",
    perawiKey: "Ibnu Majah",
    judul: "Sunan Ibnu Majah",
    arabic: "سُنَنُ ابْنِ مَاجَهْ",
    muallif: "Imam Abu Abdillah Muhammad bin Yazid Ibnu Majah",
    wafat: "209–273 H (824–887 M)",
    jumlahHadis: "4.341 Hadits (37 Kitab)",
    derajat: "Shahih, Hasan & Zawa'id",
    keistimewaan: "Sistematika bab fiqih yang sangat rapi dan memuat hadis-hadis tambahan (*zawa'id*) penting yang melengkapi lima kitab lainnya.",
    deskripsi: "Melengkapi khazanah lima kitab induk hadis dengan bab-bab fiqih terperinci yang memudahkan pencarian tema hukum spesifik.",
  },
]

export default function DaftarHadis() {
  return (
    <div className="space-y-8">
      {/* 1. Hero Banner Header - Only Title & Description */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-800/40 bg-gradient-to-b from-[#061e1a] via-[#051b17] to-[#041411] p-6 sm:p-10 shadow-2xl text-center">
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl space-y-3">
          <h1 className="font-serif-title text-2xl sm:text-3xl font-black tracking-widest text-white uppercase drop-shadow-sm">
            Hadis &amp; Syarah Nabawi
          </h1>

          <p className="text-xs sm:text-sm leading-relaxed text-emerald-200/85 max-w-2xl mx-auto">
            Pelajari khazanah sabda Rasulullah SAW dari Enam Kitab Induk Hadis Utama (*Kutubus Sittah*), lengkap dengan Matan Arab, Takhrij Sanad, Derajat Keshahihan, dan Syarah Ilmiah Para Ulama.
          </p>
        </div>
      </section>

      {/* 2. DAFTAR KUTUBUS SITTAH SECTION */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/40 pb-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-[#07241f] px-3 py-0.5 text-xs font-semibold text-amber-300 shadow-inner">
              <span>📜</span>
              <span>Enam Kitab Induk Hadis</span>
            </div>
            <h2 className="font-serif-title text-xl sm:text-2xl font-black tracking-wide text-white uppercase flex items-center gap-2">
              <span>DAFTAR KUTUBUS SITTAH</span>
              <span className="text-amber-400 font-arabic text-base sm:text-lg font-normal">
                (الْكُتُبُ السِّتَّةُ)
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-950 border border-emerald-700/60 px-3 py-1 text-xs font-bold text-amber-300">
              {KUTUBUS_SITTAH_LIST.length} Kitab
            </span>
          </div>
        </div>

        {/* 6 Kutubus Sittah Interactive Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {KUTUBUS_SITTAH_LIST.map((kitabItem, idx) => {
            return (
              <Link
                key={kitabItem.id}
                href={`/kitab/${kitabItem.id}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-emerald-800/50 bg-[#061e1a] p-5 transition-all duration-300 shadow-lg hover:-translate-y-1 hover:border-amber-400/80 hover:bg-[#07241f] hover:shadow-2xl"
              >
                <div className="space-y-3">
                  {/* Top: Number Badge & Arabic Title */}
                  <div className="flex items-start justify-between gap-2 border-b border-emerald-800/30 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-950 border border-amber-500/40 text-xs font-black text-amber-300">
                        {idx + 1}
                      </span>
                      <span className="rounded-md border border-emerald-700/50 bg-[#041411] px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
                        {kitabItem.jumlahHadis}
                      </span>
                    </div>

                    <span
                      dir="rtl"
                      lang="ar"
                      className="font-arabic text-xl font-bold text-amber-400 group-hover:scale-105 transition drop-shadow-sm text-right"
                    >
                      {kitabItem.arabic}
                    </span>
                  </div>

                  {/* Title & Author */}
                  <div>
                    <h3 className="font-serif-title text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition">
                      {kitabItem.judul}
                    </h3>
                    <p className="text-xs text-amber-300/90 font-medium mt-0.5">
                      {kitabItem.muallif} <span className="text-emerald-500 font-normal">({kitabItem.wafat})</span>
                    </p>
                  </div>

                  {/* Stats Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="rounded-md border border-amber-500/30 bg-[#0c2b23] px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                      📖 {kitabItem.jumlahHadis}
                    </span>
                    <span className="rounded-md border border-emerald-600/40 bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      ✓ {kitabItem.derajat}
                    </span>
                  </div>

                  {/* Keistimewaan */}
                  <p className="text-xs leading-relaxed text-emerald-200/80 line-clamp-3">
                    {kitabItem.keistimewaan}
                  </p>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-emerald-800/30 pt-3 text-xs">
                  <span className="font-bold text-amber-400 group-hover:translate-x-1 transition inline-flex items-center gap-1">
                    <span>Buka Kitab &amp; Filter Bab</span>
                    <span>➔</span>
                  </span>

                  <SimpanRiwayatButton
                    item={{
                      id: `kutubus-sittah-${kitabItem.id}`,
                      kategori: "hadis",
                      judul: `Kutubus Sittah: ${kitabItem.judul}`,
                      subjudul: `${kitabItem.muallif} • ${kitabItem.jumlahHadis}`,
                      ringkasan: kitabItem.keistimewaan,
                      url: `/kitab/${kitabItem.id}`,
                    }}
                    variant="icon"
                  />
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
