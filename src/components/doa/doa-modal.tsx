"use client"

import { useState, useEffect } from "react"
import { type DoaItem } from "@/lib/doa-api"
import { simpanKeRiwayat, isItemInRiwayat, hapusRiwayatItem } from "@/lib/riwayat-storage"

interface DoaModalProps {
  doa: DoaItem | null
  doaList: DoaItem[]
  onClose: () => void
  onSelectDoa: (doa: DoaItem) => void
  onShowToast: (msg: string) => void
}

export default function DoaModal({
  doa,
  doaList,
  onClose,
  onSelectDoa,
  onShowToast,
}: DoaModalProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!doa) return
    setIsSaved(isItemInRiwayat(`doa-${doa.id}`))
  }, [doa])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  if (!doa) return null

  const currentIndex = doaList.findIndex((d) => d.id === doa.id)
  const prevDoa = currentIndex > 0 ? doaList[currentIndex - 1] : null
  const nextDoa = currentIndex < doaList.length - 1 ? doaList[currentIndex + 1] : null

  const handleToggleSave = () => {
    const riwayatId = `doa-${doa.id}`
    if (isSaved) {
      hapusRiwayatItem(riwayatId)
      setIsSaved(false)
      onShowToast(`✓ Doa "${doa.nama}" dihapus dari riwayat`)
    } else {
      simpanKeRiwayat({
        id: riwayatId,
        kategori: "doa",
        judul: doa.nama,
        subjudul: `${doa.grup} • Kumpulan Doa Harian`,
        ringkasan: doa.idn,
        url: `/doa?id=${doa.id}`,
      })
      setIsSaved(true)
      onShowToast(`✓ Doa "${doa.nama}" berhasil disimpan ke Riwayat!`)
    }
  }

  const handleCopyDoa = async () => {
    const fullText = `*${doa.nama}*\n\n${doa.ar}\n\n_${doa.tr}_\n\n"${doa.idn}"\n\n📖 ${doa.tentang || "Sumber: Hisnul Muslim"}\n\n(Dikutip dari ALMAKTABA - Ensiklopedia Islam)`
    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      onShowToast("✓ Teks doa berhasil disalin ke clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      onShowToast("Gagal menyalin teks")
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: doa.nama,
      text: `${doa.nama}\n\n${doa.ar}\n\n"${doa.idn}"\n\nSumber: ${doa.tentang || "Hisnul Muslim"}`,
      url: typeof window !== "undefined" ? `${window.location.origin}/doa?id=${doa.id}` : "",
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopyDoa()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md transition-all">
      <div
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-emerald-700/60 bg-[#051a17] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-emerald-800/40 bg-[#041411]/90 px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-emerald-700/60 bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                {doa.grup}
              </span>
              <span className="text-xs text-emerald-500 font-mono">
                Doa #{doa.id}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">
              {doa.nama}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Tutup (Esc)"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-800/60 bg-[#06201b] text-emerald-400 hover:border-amber-400 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* 1. Teks Arab */}
          <div className="rounded-2xl border border-emerald-800/40 bg-[#041310] p-6 text-right shadow-inner">
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-2xl sm:text-3xl font-bold leading-[2.2] text-amber-300 drop-shadow-sm select-text"
            >
              {doa.ar}
            </p>
          </div>

          {/* 2. Transliterasi Latin */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Transliterasi Latin
            </h4>
            <p className="text-xs sm:text-sm italic leading-relaxed text-emerald-200/90 bg-[#07241f]/50 p-4 rounded-xl border border-emerald-800/30 select-text">
              {doa.tr}
            </p>
          </div>

          {/* 3. Terjemahan Bahasa Indonesia */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Artinya
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-100 bg-[#061e1a] p-4 rounded-xl border border-emerald-800/40 select-text">
              &ldquo;{doa.idn}&rdquo;
            </p>
          </div>

          {/* 4. Rujukan Sumber / Keterangan Hadis */}
          {doa.tentang && (
            <div className="space-y-1.5 border-t border-emerald-800/30 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                Rujukan &amp; Keterangan
              </h4>
              <div className="rounded-xl bg-[#041411]/80 p-4 text-xs leading-relaxed text-slate-300/80 border border-emerald-900/40 whitespace-pre-line select-text">
                {doa.tentang}
              </div>
            </div>
          )}

          {/* 5. Tag List */}
          {doa.tag && doa.tag.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs font-semibold text-emerald-500 mr-1">
                Tag:
              </span>
              {doa.tag.map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-[#152332] px-2.5 py-0.5 text-xs font-medium text-slate-300 border border-slate-700/40"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions & Navigation Bar */}
        <div className="flex flex-col gap-3 border-t border-emerald-800/40 bg-[#041411]/95 px-6 py-4">
          {/* Quick Actions (Copy, Save, Share) */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyDoa}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-700/60 bg-[#07241f] px-3.5 py-2 text-xs font-bold text-emerald-200 hover:border-amber-400 hover:text-white transition active:scale-95 cursor-pointer"
              >
                <span>{copied ? "✓" : "📋"}</span>
                <span>{copied ? "Tersalin" : "Salin Doa"}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleSave}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition active:scale-95 cursor-pointer ${
                  isSaved
                    ? "bg-[#e5a93c] text-slate-950 shadow-md font-bold"
                    : "border border-emerald-700/60 bg-[#07241f] text-amber-300 hover:border-amber-400 hover:text-white"
                }`}
              >
                <span>{isSaved ? "★" : "☆"}</span>
                <span>{isSaved ? "Tersimpan" : "Simpan Riwayat"}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/60 bg-[#0c1825] px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-[#14263b] hover:text-white transition active:scale-95 cursor-pointer"
            >
              <span>🔗</span>
              <span>Bagikan</span>
            </button>
          </div>

          {/* Prev / Next Navigation */}
          <div className="flex items-center justify-between border-t border-emerald-800/30 pt-3 text-xs">
            {prevDoa ? (
              <button
                type="button"
                onClick={() => onSelectDoa(prevDoa)}
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-amber-300 transition cursor-pointer"
              >
                <span>←</span>
                <span className="font-semibold line-clamp-1 max-w-[150px] sm:max-w-[200px]">
                  {prevDoa.nama}
                </span>
              </button>
            ) : (
              <div />
            )}

            <span className="text-[11px] text-emerald-500 font-mono">
              {currentIndex + 1} dari {doaList.length}
            </span>

            {nextDoa ? (
              <button
                type="button"
                onClick={() => onSelectDoa(nextDoa)}
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-amber-300 transition cursor-pointer"
              >
                <span className="font-semibold line-clamp-1 max-w-[150px] sm:max-w-[200px]">
                  {nextDoa.nama}
                </span>
                <span>→</span>
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
