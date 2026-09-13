"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { getSurahDetailMeta } from "@/lib/tafsir-metadata"
import type { SurahTafsir, AyatTafsir } from "@/lib/tafsir-data"

type TafsirReaderProps = {
  surah: SurahTafsir
  prevSurah: { id: string; namaLatin: string } | null
  nextSurah: { id: string; namaLatin: string } | null
}

export default function TafsirReader({
  surah,
  prevSurah,
  nextSurah,
}: TafsirReaderProps) {
  const meta = useMemo(() => getSurahDetailMeta(surah.id), [surah.id])
  const juzList = useMemo(() => {
    return Array.from(new Set(surah.ayat.map((a) => a.juz))).sort(
      (a, b) => a - b,
    )
  }, [surah])

  const [selectedAyat, setSelectedAyat] = useState<number>(1)
  const [jumpInput, setJumpInput] = useState<string>("")
  const [bookmarks, setBookmarks] = useState<Record<number, boolean>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [cardModalAyat, setCardModalAyat] = useState<AyatTafsir | null>(null)

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null)

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToastMessage(msg)
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Load bookmarks
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`ensiklopedi_bookmarks_surah_${surah.id}`)
      if (saved) {
        setBookmarks(JSON.parse(saved))
      }
    } catch {
      // ignore
    }
  }, [surah.id])

  const toggleBookmark = (nomor: number) => {
    const updated = { ...bookmarks, [nomor]: !bookmarks[nomor] }
    setBookmarks(updated)
    try {
      localStorage.setItem(
        `ensiklopedi_bookmarks_surah_${surah.id}`,
        JSON.stringify(updated),
      )
    } catch {
      // ignore
    }
    showToast(
      updated[nomor]
        ? `⭐ QS. ${surah.namaLatin} Ayat #${nomor} ditambahkan ke bookmark`
        : `Ayat #${nomor} dihapus dari bookmark`,
    )
  }

  // Scroll to ayat
  const scrollToAyat = (nomor: number) => {
    const el = document.getElementById(`ayat-${nomor}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      el.classList.remove("highlight-pulse")
      void el.offsetWidth
      el.classList.add("highlight-pulse")
      setSelectedAyat(nomor)
    }
  }

  const handleJump = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const target = parseInt(jumpInput.trim(), 10)
    if (!isNaN(target)) {
      if (target >= 1 && target <= surah.jumlahAyat) {
        scrollToAyat(target)
        showToast(`Membuka Ayat #${target}`)
      } else {
        showToast(`Ayat #${target} tidak ditemukan dalam Surah ini`)
      }
    }
  }

  // Copy Ayat
  const handleCopy = (ayat: AyatTafsir) => {
    const text = `[QS. ${surah.namaLatin}: ${ayat.nomor}]\n\n${ayat.arab}\n\n"${ayat.terjemah}"\n\nTafsir:\n${ayat.tafsir}\n\n--- Ensiklopedia Islam`
    navigator.clipboard.writeText(text).then(() => {
      showToast(`✓ Ayat #${ayat.nomor} & Tafsir disalin!`)
    })
  }

  // Share Ayat
  const handleShare = (ayat: AyatTafsir) => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/tafsir/${surah.id}#ayat-${ayat.nomor}` : ""
    if (navigator.share) {
      navigator.share({
        title: `QS. ${surah.namaLatin} Ayat ${ayat.nomor}`,
        text: ayat.terjemah,
        url,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url).then(() => {
        showToast(`✓ Tautan Ayat #${ayat.nomor} disalin ke clipboard!`)
      })
    }
  }


  return (
    <div className="min-h-screen bg-[#041310] text-emerald-100 pb-20">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-3 py-6 sm:px-6 sm:py-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/tafsir"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 transition hover:text-amber-300"
          >
            ← Kembali ke Daftar Surah
          </Link>
          <span className="text-xs font-medium text-emerald-500">
            {meta?.tempatTurun ?? "Al-Qur'an Al-Karim"}
          </span>
        </div>

        {/* 1. Surah Hero Banner Card */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-800/40 bg-[#061e1a] p-6 sm:p-8 shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            {/* Left Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-950 border border-amber-500/30">
                  {meta?.nomor ?? 1}
                </span>
                <span>SURAH KE-{meta?.nomor ?? 1}</span>
              </div>

              <h1 className="font-serif-title text-2xl sm:text-4xl font-extrabold tracking-wider text-white uppercase drop-shadow-sm">
                Surah {surah.namaLatin}
              </h1>

              <p className="text-sm font-medium text-amber-300/90">
                &quot;{surah.arti}&quot;
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-emerald-300/85 pt-1">
                <span className="rounded-lg bg-emerald-950/80 px-2.5 py-1 border border-emerald-800/50">
                  {surah.jumlahAyat} Ayat
                </span>
                <span className="rounded-lg bg-emerald-950/80 px-2.5 py-1 border border-emerald-800/50">
                  Golongan: {meta?.tempatTurun ?? "Makkiyah"}
                </span>
                {juzList.length > 0 && (
                  <span className="rounded-lg bg-emerald-950/80 px-2.5 py-1 border border-emerald-800/50">
                    Juz {juzList.join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* Right Calligraphy */}
            <div className="text-left md:text-right">
              <h2
                dir="rtl"
                lang="ar"
                className="font-arabic text-4xl font-bold leading-relaxed tracking-wide text-amber-400 drop-shadow-md sm:text-5xl lg:text-6xl"
              >
                {surah.nama || meta?.namaArab}
              </h2>
            </div>
          </div>
        </section>

        {/* Basmalah Card (except for At-Taubah) */}
        {surah.id !== "at-taubah" && (
          <div className="rounded-2xl border border-emerald-800/40 bg-[#061e1a] py-6 text-center shadow-lg">
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-2xl sm:text-3xl font-bold text-amber-400 leading-relaxed drop-shadow"
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}

        {/* 2. Filter & Jump Navigation Bar */}
        <section className="rounded-2xl border border-emerald-800/40 bg-[#061e1a] p-4 sm:p-5 shadow-lg">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
            {/* Select Ayat Dropdown */}
            <div className="md:col-span-8">
              <label
                htmlFor="pilih-ayat-dropdown"
                className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-300"
              >
                <span className="text-amber-400">📖</span> Pilih Ayat:
              </label>
              <div className="relative">
                <select
                  id="pilih-ayat-dropdown"
                  value={selectedAyat}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setSelectedAyat(val)
                    scrollToAyat(val)
                  }}
                  className="w-full appearance-none truncate rounded-xl border border-emerald-700/50 bg-[#041411] px-4 py-2.5 pr-10 text-sm font-medium text-emerald-100 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40"
                >
                  {surah.ayat.map((a) => (
                    <option
                      key={a.nomor}
                      value={a.nomor}
                      className="bg-[#061e1a] text-emerald-100"
                    >
                      Ayat {a.nomor} — {a.terjemah.slice(0, 70)}...
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-emerald-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Jump to Ayat Form */}
            <div className="md:col-span-4">
              <form onSubmit={handleJump} className="flex flex-col">
                <label
                  htmlFor="jump-ayat-input"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-300"
                >
                  <span className="text-amber-400">🎯</span> Lompat ke Nomor Ayat:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="jump-ayat-input"
                    type="number"
                    min={1}
                    max={surah.jumlahAyat}
                    placeholder="No. Ayat"
                    value={jumpInput}
                    onChange={(e) => setJumpInput(e.target.value)}
                    className="w-full rounded-xl border border-emerald-700/50 bg-[#041411] px-3.5 py-2 text-sm font-medium text-emerald-100 placeholder-emerald-700 outline-none transition focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#e5a93c] px-4 py-2 text-sm font-bold text-slate-950 shadow-md transition hover:bg-[#d6982f] active:scale-95 cursor-pointer"
                  >
                    <span>➔</span>
                    <span>Buka</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* 3. Ayat & Tafsir Cards Feed */}
        <div className="space-y-6">
          {surah.ayat.map((ayat) => {
            const isBookmarked = !!bookmarks[ayat.nomor]

            return (
              <article
                key={ayat.nomor}
                id={`ayat-${ayat.nomor}`}
                className="scroll-mt-24 rounded-2xl border border-emerald-800/40 bg-[#061e1a] p-5 sm:p-7 shadow-xl transition hover:border-emerald-700/60"
              >
                {/* Top Badge Row */}
                <div className="flex items-center justify-between border-b border-emerald-800/30 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-[#0c2b23] px-2.5 py-1 text-xs font-bold text-amber-300">
                      📖 QS. {surah.namaLatin}
                    </span>

                    <span className="rounded-md border border-emerald-700/50 bg-[#041411] px-2.5 py-1 font-mono text-xs font-bold text-emerald-200">
                      Ayat #{ayat.nomor}
                    </span>

                    <span className="rounded-md border border-emerald-500/40 bg-emerald-700/20 px-2.5 py-1 text-xs font-medium text-emerald-300">
                      Juz {ayat.juz}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => toggleBookmark(ayat.nomor)}
                    title={
                      isBookmarked
                        ? "Hapus dari Bookmark"
                        : "Simpan ke Bookmark"
                    }
                    className={`rounded-lg p-2 transition active:scale-95 cursor-pointer ${
                      isBookmarked
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "text-emerald-400/70 hover:bg-emerald-900/40 hover:text-amber-300 border border-transparent"
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill={isBookmarked ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Arabic Ayat Section */}
                <div className="my-6 rounded-2xl bg-[#041411]/60 p-5 sm:p-6">
                  <p
                    dir="rtl"
                    lang="ar"
                    className="font-arabic text-right text-2xl sm:text-3xl font-normal leading-loose tracking-wide text-emerald-50"
                  >
                    {ayat.arab}{" "}
                    <span className="inline-flex font-mono text-lg font-bold text-amber-400">
                      ۝{ayat.nomor}
                    </span>
                  </p>
                </div>

                {/* Indonesian Translation */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Terjemahan:
                  </span>
                  <p className="text-sm sm:text-base leading-relaxed text-emerald-100/90 font-normal">
                    {ayat.terjemah}
                  </p>
                </div>

                {/* Tafsir Box */}
                {ayat.tafsir && (
                  <div className="mt-4 rounded-xl border border-emerald-800/40 bg-[#041411]/80 p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1.5">
                      <span>❖</span> Tafsir Wajiz:
                    </span>
                    <p className="text-xs sm:text-sm leading-relaxed text-emerald-200/90">
                      {ayat.tafsir}
                    </p>
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-800/30 pt-4">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(ayat)}
                      title="Salin Ayat & Tafsir"
                      className="rounded-xl border border-emerald-800/40 bg-[#041411] p-2 text-emerald-300 transition hover:border-emerald-600 hover:text-white active:scale-95 cursor-pointer"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCardModalAyat(ayat)}
                      title="Buat Kartu Kutipan Ayat"
                      className="rounded-xl border border-emerald-800/40 bg-[#041411] p-2 text-emerald-300 transition hover:border-emerald-600 hover:text-white active:scale-95 cursor-pointer"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShare(ayat)}
                      title="Bagikan Tautan Ayat"
                      className="rounded-xl border border-emerald-800/40 bg-[#041411] p-2 text-emerald-300 transition hover:border-emerald-600 hover:text-white active:scale-95 cursor-pointer"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* 4. Footer Surah Navigation */}
        <nav className="flex flex-wrap items-center justify-between gap-4 border-t border-emerald-800/30 pt-6">
          {prevSurah ? (
            <Link
              href={`/tafsir/${prevSurah.id}`}
              className="flex items-center gap-2 rounded-xl border border-emerald-800/40 bg-[#061e1a] px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-900/30 hover:text-white"
            >
              <span>←</span>
              <span>Surah {prevSurah.namaLatin}</span>
            </Link>
          ) : (
            <div />
          )}

          {nextSurah ? (
            <Link
              href={`/tafsir/${nextSurah.id}`}
              className="flex items-center gap-2 rounded-xl border border-emerald-800/40 bg-[#061e1a] px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-900/30 hover:text-white"
            >
              <span>Surah {nextSurah.namaLatin}</span>
              <span>→</span>
            </Link>
          ) : (
            <div />
          )}
        </nav>

      </div>

      {/* Floating Bottom Ayat Controller */}
      <div className="fixed bottom-4 inset-x-0 z-40 mx-auto flex w-fit items-center gap-3 rounded-full border border-emerald-800/60 bg-[#061e1a]/95 px-4 py-2 shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => scrollToAyat(Math.max(1, selectedAyat - 1))}
          disabled={selectedAyat <= 1}
          className="rounded-full bg-[#041411] px-3.5 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-800/40 hover:text-white disabled:opacity-40 cursor-pointer"
        >
          ‹ Sebelumnya
        </button>
        <span className="text-xs font-bold text-amber-400 font-mono">
          Ayat {selectedAyat} / {surah.jumlahAyat}
        </span>
        <button
          type="button"
          onClick={() => scrollToAyat(Math.min(surah.jumlahAyat, selectedAyat + 1))}
          disabled={selectedAyat >= surah.jumlahAyat}
          className="rounded-full bg-[#041411] px-3.5 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-800/40 hover:text-white disabled:opacity-40 cursor-pointer"
        >
          Berikutnya ›
        </button>
      </div>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-16 right-6 z-50 flex items-center gap-2 rounded-xl border border-amber-400/40 bg-[#061e1a] px-4 py-3 text-sm font-semibold text-emerald-100 shadow-2xl backdrop-blur">
          <svg
            className="h-4 w-4 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}



      {/* Card Modal */}
      {cardModalAyat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-emerald-700/50 bg-[#061e1a] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-800/40">
              <h3 className="text-sm font-bold text-white">
                Kartu Kutipan Ayat Al-Qur&apos;an
              </h3>
              <button
                type="button"
                onClick={() => setCardModalAyat(null)}
                className="text-emerald-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-6 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-[#061e1a] via-[#041411] to-[#0a2f26] p-6 text-center shadow-2xl">
              <span className="font-serif-title text-xs font-bold tracking-widest text-amber-400 uppercase">
                QS. {surah.namaLatin} • Ayat {cardModalAyat.nomor}
              </span>

              <p
                dir="rtl"
                lang="ar"
                className="my-5 font-arabic text-2xl font-medium leading-loose text-amber-100"
              >
                {cardModalAyat.arab}
              </p>

              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-emerald-200/90 italic">
                &quot;{cardModalAyat.terjemah}&quot;
              </p>

              <div className="mt-5 border-t border-emerald-800/40 pt-3 text-[11px] text-emerald-400/80">
                Tafsir Al-Qur&apos;an • Ensiklopedia Islam
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleCopy(cardModalAyat)
                  setCardModalAyat(null)
                }}
                className="flex-1 rounded-xl bg-[#e5a93c] py-2.5 text-xs font-bold text-slate-950 transition hover:bg-[#d6982f] cursor-pointer"
              >
                Salin Ayat
              </button>
              <button
                type="button"
                onClick={() => {
                  handleShare(cardModalAyat)
                  setCardModalAyat(null)
                }}
                className="rounded-xl border border-emerald-700/50 bg-[#041411] px-4 py-2.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-900/40 cursor-pointer"
              >
                Bagikan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
