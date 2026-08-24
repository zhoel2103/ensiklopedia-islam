import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mode Offline — ALMAKTABA Ensiklopedia Islam",
  description: "Akses konten Al-Qur'an, Hadis, Kitab, dan Doa secara offline.",
}

export default function OfflinePage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 space-y-8">
      {/* 1. Offline Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#07241e] via-[#051c18] to-[#041310] p-6 sm:p-10 shadow-2xl text-center space-y-4">
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-2xl space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/40 text-amber-300 text-3xl shadow-inner">
            📡
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-[#06201b] px-3.5 py-1 text-xs font-bold text-amber-300 shadow-inner">
            <span>Mode Tanpa Internet</span>
          </div>

          <h1 className="font-serif-title text-2xl sm:text-4xl font-bold tracking-wide text-white">
            Anda Sedang Offline
          </h1>

          <p className="text-xs sm:text-sm leading-relaxed text-emerald-200/90 max-w-xl mx-auto">
            Koneksi internet Anda terputus. Jangan khawatir, Anda tetap dapat membaca Al-Qur&apos;an, Hadis, Kitab, Doa, dan Riwayat yang telah tersimpan di perangkat Anda.
          </p>

          {/* Action Button: Reload */}
          <div className="pt-2">
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e5a93c] to-amber-500 px-5 py-3 text-xs sm:text-sm font-black text-slate-950 shadow-lg transition hover:from-amber-400 hover:to-amber-500 hover:scale-105 active:scale-95"
            >
              <span>↺</span>
              <span>Coba Hubungkan Kembali</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Fitur yang Tersedia Offline */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-emerald-800/40 pb-3">
          <span className="text-amber-400 font-bold">❖</span>
          <h2 className="text-base sm:text-lg font-bold text-white">
            Buka Pustaka yang Tersimpan
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card Tafsir */}
          <Link
            href="/tafsir"
            className="group flex flex-col justify-between rounded-2xl border border-emerald-800/50 bg-[#061e1a] p-5 shadow-lg transition hover:-translate-y-1 hover:border-amber-400/60 hover:bg-[#07241f]"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b2b23] text-amber-400 text-xl border border-amber-500/20">
                  📖
                </span>
                <span className="text-[10px] font-bold uppercase rounded-md bg-emerald-950 border border-emerald-700/60 text-emerald-300 px-2 py-0.5">
                  114 Surah
                </span>
              </div>
              <h3 className="font-bold text-white group-hover:text-amber-300 transition">
                Tafsir Al-Qur&apos;an
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Akses surah dan ayat yang telah pernah dibuka di perangkat Anda.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-emerald-800/30 pt-3 text-xs font-bold text-emerald-400 group-hover:text-amber-300">
              <span>Buka Tafsir</span>
              <span>➔</span>
            </div>
          </Link>

          {/* Card Doa */}
          <Link
            href="/doa"
            className="group flex flex-col justify-between rounded-2xl border border-emerald-800/50 bg-[#061e1a] p-5 shadow-lg transition hover:-translate-y-1 hover:border-amber-400/60 hover:bg-[#07241f]"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b2b23] text-amber-400 text-xl border border-amber-500/20">
                  🤲
                </span>
                <span className="text-[10px] font-bold uppercase rounded-md bg-emerald-950 border border-emerald-700/60 text-emerald-300 px-2 py-0.5">
                  227 Doa
                </span>
              </div>
              <h3 className="font-bold text-white group-hover:text-amber-300 transition">
                Kumpulan Doa Harian
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                227 doa harian lengkap dengan teks Arab, latin, dan terjemahan.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-emerald-800/30 pt-3 text-xs font-bold text-emerald-400 group-hover:text-amber-300">
              <span>Buka Doa</span>
              <span>➔</span>
            </div>
          </Link>

          {/* Card Hadis */}
          <Link
            href="/hadis"
            className="group flex flex-col justify-between rounded-2xl border border-emerald-800/50 bg-[#061e1a] p-5 shadow-lg transition hover:-translate-y-1 hover:border-amber-400/60 hover:bg-[#07241f]"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b2b23] text-amber-400 text-xl border border-amber-500/20">
                  📜
                </span>
                <span className="text-[10px] font-bold uppercase rounded-md bg-emerald-950 border border-emerald-700/60 text-emerald-300 px-2 py-0.5">
                  6 Kitab Induk
                </span>
              </div>
              <h3 className="font-bold text-white group-hover:text-amber-300 transition">
                Kutubus Sittah Hadis
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Shahih Bukhari, Shahih Muslim, Abu Dawud, Tirmidzi, Nasa&apos;i, Ibnu Majah.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-emerald-800/30 pt-3 text-xs font-bold text-emerald-400 group-hover:text-amber-300">
              <span>Buka Hadis</span>
              <span>➔</span>
            </div>
          </Link>

          {/* Card Kitab */}
          <Link
            href="/kitab"
            className="group flex flex-col justify-between rounded-2xl border border-emerald-800/50 bg-[#061e1a] p-5 shadow-lg transition hover:-translate-y-1 hover:border-amber-400/60 hover:bg-[#07241f]"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b2b23] text-amber-400 text-xl border border-amber-500/20">
                  📚
                </span>
                <span className="text-[10px] font-bold uppercase rounded-md bg-emerald-950 border border-emerald-700/60 text-emerald-300 px-2 py-0.5">
                  21 Kitab Turats
                </span>
              </div>
              <h3 className="font-bold text-white group-hover:text-amber-300 transition">
                Kitab Klasik Ulama
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Bulughul Maram, Riyadhush Shalihin, Al-Hikam, Safinatun Naja, dll.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-emerald-800/30 pt-3 text-xs font-bold text-emerald-400 group-hover:text-amber-300">
              <span>Buka Kitab</span>
              <span>➔</span>
            </div>
          </Link>

          {/* Card Riwayat */}
          <Link
            href="/riwayat"
            className="group flex flex-col justify-between rounded-2xl border border-amber-500/40 bg-[#07241f] p-5 shadow-lg transition hover:-translate-y-1 hover:border-amber-400 hover:bg-[#093027]"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-slate-950 text-xl font-bold shadow-md">
                  🔖
                </span>
                <span className="text-[10px] font-bold uppercase rounded-md bg-amber-950 border border-amber-500/60 text-amber-300 px-2 py-0.5">
                  Lokal Perangkat
                </span>
              </div>
              <h3 className="font-bold text-amber-300 transition">
                Riwayat Tersimpan
              </h3>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Semua ayat, hadis, bab kitab, dan doa yang telah Anda simpan selalu siap dibaca offline.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-amber-500/30 pt-3 text-xs font-bold text-amber-400">
              <span>Buka Riwayat</span>
              <span>➔</span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  )
}
