"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import type { HadisItem } from "@/lib/hadis-data"
import SimpanRiwayatButton from "@/components/simpan-riwayat-button"

type HadisReaderProps = {
  hadis: HadisItem
  prev: HadisItem | null
  next: HadisItem | null
}

export default function HadisReader({ hadis, prev, next }: HadisReaderProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showQuoteModal, setShowQuoteModal] = useState(false)



  const toastTimerRef = useRef<NodeJS.Timeout | null>(null)

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToastMessage(msg)
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Load bookmark
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`ensiklopedi_bookmark_hadis_${hadis.id}`)
      if (saved) setIsBookmarked(JSON.parse(saved))
    } catch {
      // ignore
    }
  }, [hadis.id])

  const toggleBookmark = () => {
    const nextVal = !isBookmarked
    setIsBookmarked(nextVal)
    try {
      localStorage.setItem(
        `ensiklopedi_bookmark_hadis_${hadis.id}`,
        JSON.stringify(nextVal),
      )
    } catch {
      // ignore
    }
    showToast(
      nextVal
        ? `⭐ Hadis "${hadis.judul}" ditambahkan ke bookmark`
        : `Hadis "${hadis.judul}" dihapus dari bookmark`,
    )
  }

  // Copy Hadis
  const handleCopy = () => {
    const text = `[Hadis Riwayat ${hadis.perawi}]\n\n${hadis.arab}\n\n"${hadis.terjemah}"\n\nTakhrij: ${hadis.takhrij} (${hadis.derajat})\n\nSyarah:\n${hadis.syarah}\n\n--- Ensiklopedi Islam`
    navigator.clipboard.writeText(text).then(() => {
      showToast("✓ Hadis & Syarah disalin ke clipboard!")
    })
  }

  // Share Hadis
  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    if (navigator.share) {
      navigator
        .share({
          title: `HR. ${hadis.perawi}: ${hadis.judul}`,
          text: hadis.terjemah,
          url,
        })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(url).then(() => {
        showToast("✓ Tautan hadis disalin ke clipboard!")
      })
    }
  }


  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-3 py-6 sm:px-6 sm:py-8 text-emerald-100">
      
      {/* 1. Top Breadcrumb & Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/hadis"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 transition hover:text-amber-300"
        >
          ← Kembali ke Daftar Hadis
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-amber-500/30 bg-[#0c2b23] px-2.5 py-0.5 text-xs font-bold text-amber-400">
            HR. {hadis.perawi}
          </span>
          <span className="rounded-md border border-emerald-500/40 bg-emerald-950 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
            {hadis.derajat}
          </span>
        </div>
      </div>

      {/* 2. Main Hadith Hero Card */}
      <article className="relative overflow-hidden rounded-3xl border border-emerald-800/40 bg-[#061e1a] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />

        {/* Title and Category Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/30 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Tema: {hadis.tema}
            </span>
            <h1 className="font-serif-title text-xl sm:text-2xl font-black tracking-wide text-white uppercase">
              {hadis.judul}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
            <SimpanRiwayatButton
              item={{
                id: `hadis-${hadis.id}`,
                kategori: "hadis",
                judul: `${hadis.judul} (HR. ${hadis.perawi})`,
                subjudul: `Tema: ${hadis.tema} • Derajat: ${hadis.derajat}`,
                ringkasan: `"${hadis.terjemah.slice(0, 120)}${hadis.terjemah.length > 120 ? "..." : ""}"`,
                url: `/hadis/${hadis.id}`,
              }}
              variant="compact"
              label="Simpan Riwayat"
            />

            <button
              type="button"
              onClick={toggleBookmark}
              title={isBookmarked ? "Hapus dari Bookmark" : "Simpan ke Bookmark"}
              className={`rounded-xl p-2.5 transition active:scale-95 cursor-pointer ${
                isBookmarked
                  ? "border border-amber-500/50 bg-amber-500/20 text-amber-400"
                  : "border border-emerald-800/40 bg-[#041411] text-emerald-300 hover:border-emerald-600 hover:text-white"
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

            <button
              type="button"
              onClick={handleCopy}
              title="Salin Teks Hadis"
              className="rounded-xl border border-emerald-800/40 bg-[#041411] p-2.5 text-emerald-300 transition hover:border-emerald-600 hover:text-white active:scale-95 cursor-pointer"
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
              onClick={() => setShowQuoteModal(true)}
              title="Buat Kartu Kutipan Hadis"
              className="rounded-xl border border-emerald-800/40 bg-[#041411] p-2.5 text-emerald-300 transition hover:border-emerald-600 hover:text-white active:scale-95 cursor-pointer"
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
              onClick={handleShare}
              title="Bagikan Hadis"
              className="rounded-xl border border-emerald-800/40 bg-[#041411] p-2.5 text-emerald-300 transition hover:border-emerald-600 hover:text-white active:scale-95 cursor-pointer"
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

        {/* 3. Arabic Matan Box */}
        <div className="rounded-2xl border border-emerald-800/40 bg-[#041411]/90 p-6 sm:p-8">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-amber-400">
            Matan Hadis Arab:
          </span>
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic text-2xl sm:text-3xl font-normal leading-loose tracking-wide text-white text-right"
          >
            {hadis.arab}
          </p>
        </div>

        {/* 4. Indonesian Translation */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Terjemahan Sabda Nabi SAW:
          </span>
          <p className="text-base sm:text-lg leading-relaxed text-emerald-100 font-normal">
            &quot;{hadis.terjemah}&quot;
          </p>
        </div>

        {/* 5. Takhrij & Sanad Info Box */}
        <div className="rounded-2xl border border-emerald-800/40 bg-[#041411] p-5">
          <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-amber-400">
            ❖ Takhrij &amp; Rujukan Sanad
          </span>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="space-y-1">
              <dt className="text-emerald-400 text-xs">Perawi Utama</dt>
              <dd className="font-semibold text-white">Imam {hadis.perawi}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-emerald-400 text-xs">Kitab Sumber</dt>
              <dd className="font-semibold text-white">{hadis.takhrij}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-emerald-400 text-xs">Derajat Hadis</dt>
              <dd>
                <span className="inline-block rounded-lg bg-emerald-950 border border-emerald-500/50 px-2.5 py-0.5 font-bold text-emerald-300 text-xs">
                  {hadis.derajat}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* 6. Syarah Hadis Box */}
        <div className="space-y-3 rounded-2xl border border-emerald-800/40 bg-[#041411]/80 p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span>📖</span>
              <span>Syarah &amp; Penjelasan Hadis</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-emerald-100/90 whitespace-pre-line">
            {hadis.syarah}
          </p>
        </div>

      </article>

      {/* 7. Bottom Navigation */}
      <nav className="flex flex-wrap items-center justify-between gap-4 border-t border-emerald-800/30 pt-6">
        {prev ? (
          <Link
            href={`/hadis/${prev.id}`}
            className="flex items-center gap-2 rounded-xl border border-emerald-800/40 bg-[#061e1a] px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-300 transition hover:bg-emerald-900/30 hover:text-white"
          >
            <span>←</span>
            <span>{prev.judul}</span>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/hadis/${next.id}`}
            className="flex items-center gap-2 rounded-xl border border-emerald-800/40 bg-[#061e1a] px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-300 transition hover:bg-emerald-900/30 hover:text-white"
          >
            <span>{next.judul}</span>
            <span>→</span>
          </Link>
        ) : (
          <div />
        )}
      </nav>

      {/* Quote Card Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-emerald-700/50 bg-[#061e1a] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-800/40">
              <h3 className="text-sm font-bold text-white">
                Kartu Mutiara Hadis Nabawi
              </h3>
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="text-emerald-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-6 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-[#061e1a] via-[#041411] to-[#0a2f26] p-6 text-center shadow-2xl">
              <span className="font-serif-title text-xs font-bold tracking-widest text-amber-400 uppercase">
                HR. {hadis.perawi} • {hadis.derajat}
              </span>

              <p
                dir="rtl"
                lang="ar"
                className="my-5 font-arabic text-2xl font-medium leading-loose text-amber-100"
              >
                {hadis.arab}
              </p>

              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-emerald-200/90 italic">
                &quot;{hadis.terjemah}&quot;
              </p>

              <div className="mt-5 border-t border-emerald-800/40 pt-3 text-[11px] text-emerald-400/80">
                {hadis.takhrij} • Ensiklopedi Hadis
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleCopy()
                  setShowQuoteModal(false)
                }}
                className="flex-1 rounded-xl bg-[#e5a93c] py-2.5 text-xs font-bold text-slate-950 transition hover:bg-[#d6982f] cursor-pointer"
              >
                Salin Teks Hadis
              </button>
              <button
                type="button"
                onClick={() => {
                  handleShare()
                  setShowQuoteModal(false)
                }}
                className="rounded-xl border border-emerald-700/50 bg-[#041411] px-4 py-2.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-900/40 cursor-pointer"
              >
                Bagikan
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-amber-400/40 bg-[#061e1a] px-4 py-3 text-sm font-semibold text-emerald-100 shadow-2xl backdrop-blur">
          <span className="text-amber-400">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  )
}
