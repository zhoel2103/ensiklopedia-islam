"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  getRiwayatList,
  hapusRiwayatItem,
  bersihkanSemuaRiwayat,
  type RiwayatItem,
  type RiwayatCategory,
} from "@/lib/riwayat-storage"

const CATEGORIES: { key: "all" | RiwayatCategory; label: string; icon: string }[] = [
  { key: "all", label: "Semua", icon: "📑" },
  { key: "tafsir", label: "Tafsir", icon: "📖" },
  { key: "hadis", label: "Hadis", icon: "📜" },
  { key: "kitab", label: "Kitab Ulama", icon: "📚" },
  { key: "doa", label: "Doa Harian", icon: "🤲" },
  { key: "tanya-ai", label: "Tanya AI", icon: "✨" },
]

export default function RiwayatPage() {
  const [riwayatList, setRiwayatList] = useState<RiwayatItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<"all" | RiwayatCategory>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadRiwayat = () => {
    setRiwayatList(getRiwayatList())
  }

  useEffect(() => {
    loadRiwayat()

    const handleUpdate = () => {
      loadRiwayat()
    }

    window.addEventListener("riwayat-updated", handleUpdate)
    window.addEventListener("storage", handleUpdate)

    return () => {
      window.removeEventListener("riwayat-updated", handleUpdate)
      window.removeEventListener("storage", handleUpdate)
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleDelete = (id: string, judul: string) => {
    hapusRiwayatItem(id)
    showToast(`✓ Riwayat "${judul.slice(0, 30)}..." dihapus`)
  }

  const handleClearAll = () => {
    bersihkanSemuaRiwayat()
    setShowConfirmClear(false)
    showToast("✓ Seluruh riwayat berhasil dibersihkan")
  }

  // Filtered List
  const filteredList = useMemo(() => {
    return riwayatList.filter((item) => {
      const matchCat =
        selectedCategory === "all" || item.kategori === selectedCategory
      const q = searchQuery.toLowerCase().trim()
      const matchQuery =
        !q ||
        item.judul.toLowerCase().includes(q) ||
        (item.subjudul && item.subjudul.toLowerCase().includes(q)) ||
        (item.ringkasan && item.ringkasan.toLowerCase().includes(q))
      return matchCat && matchQuery
    })
  }, [riwayatList, selectedCategory, searchQuery])

  const getCategoryBadge = (kat: RiwayatCategory) => {
    switch (kat) {
      case "tafsir":
        return { label: "Tafsir Al-Qur'an", icon: "📖", color: "border-emerald-700/60 text-emerald-300 bg-emerald-950/80" }
      case "hadis":
        return { label: "Hadis & Syarah", icon: "📜", color: "border-amber-700/60 text-amber-300 bg-amber-950/60" }
      case "kitab":
        return { label: "Kitab Ulama", icon: "📚", color: "border-teal-700/60 text-teal-300 bg-teal-950/80" }
      case "doa":
        return { label: "Doa Harian", icon: "🤲", color: "border-emerald-600/60 text-emerald-300 bg-emerald-950/80" }
      case "tanya-ai":
        return { label: "Tanya AI", icon: "✨", color: "border-yellow-600/60 text-yellow-300 bg-yellow-950/60" }
      default:
        return { label: "Halaman", icon: "📑", color: "border-emerald-700 text-emerald-300 bg-emerald-950" }
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <section className="rounded-3xl border border-emerald-800/40 bg-gradient-to-b from-[#061e1a] to-[#041411] p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-[#07241f] px-3.5 py-1 text-xs font-semibold text-amber-300 shadow-inner">
            <span>🔖</span>
            <span>Khazanah Riwayat Pribadi</span>
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold tracking-wide text-white">
            Riwayat Telaah &amp; Bacaan
          </h1>
          <p className="mx-auto max-w-xl text-xs sm:text-sm text-emerald-200/80 leading-relaxed">
            Daftar penelaahan ayat Al-Qur&apos;an, hadis nabawi, bab kitab ulama, dan konsultasi AI yang telah Anda simpan untuk kemudahan rujukan kembali.
          </p>
        </div>
      </section>

      {/* Toolbar: Category Tabs & Search Bar */}
      <section className="space-y-3">
        {/* Category Tabs & Clear Action */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/40 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.key
              const count =
                cat.key === "all"
                  ? riwayatList.length
                  : riwayatList.filter((r) => r.kategori === cat.key).length
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 cursor-pointer ${
                    active
                      ? "bg-[#e5a93c] text-slate-950 shadow-md font-bold"
                      : "border border-emerald-800/60 bg-[#071915] text-emerald-300 hover:border-amber-400 hover:text-white"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        active
                          ? "bg-slate-950 text-amber-300"
                          : "bg-emerald-900 text-emerald-300"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {riwayatList.length > 0 && (
            <button
              type="button"
              onClick={() => setShowConfirmClear(true)}
              className="rounded-xl border border-red-800/60 bg-red-950/40 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/80 hover:text-white transition active:scale-95 cursor-pointer"
            >
              Bersihkan Semua
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari dalam riwayat tersimpan (misal: Al-Fatihah, Wudhu, Bukhari)..."
            className="w-full rounded-2xl border border-emerald-800/60 bg-[#041411] px-4 py-3 text-xs sm:text-sm text-emerald-100 placeholder-emerald-700 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-bold text-emerald-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </section>

      {/* Confirmation Modal for Clear All */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-red-700/60 bg-[#071915] p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-950 text-red-400 text-xl font-bold border border-red-800">
              ⚠️
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hapus Seluruh Riwayat?</h3>
              <p className="mt-1 text-xs text-emerald-300/80">
                Tindakan ini akan menghapus semua catatan riwayat yang tersimpan di perangkat Anda.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmClear(false)}
                className="rounded-xl border border-emerald-800 bg-[#041411] px-4 py-2 text-xs font-semibold text-emerald-300 hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 shadow-md cursor-pointer"
              >
                Ya, Bersihkan Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Riwayat List Stream */}
      {filteredList.length === 0 ? (
        <div className="rounded-3xl border border-emerald-800/40 bg-[#061e1a]/60 p-10 sm:p-14 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-950/80 border border-emerald-800/60 text-2xl text-amber-400">
            🔖
          </div>
          <div>
            <h3 className="font-serif-title text-lg font-bold text-white">
              {searchQuery ? "Tidak Ditemukan Riwayat yang Sesuai" : "Belum Ada Riwayat Tersimpan"}
            </h3>
            <p className="mt-1 text-xs text-emerald-300/70 max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? `Tidak ada catatan dengan kata kunci "${searchQuery}". Coba kata kunci lain atau bersihkan pencarian.`
                : "Klik tombol 'Simpan Riwayat' pada halaman Kitab, Tafsir, Hadis, atau Tanya AI untuk menyimpan progress bacaan Anda di sini."}
            </p>
          </div>
          {!searchQuery && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              <Link
                href="/tafsir"
                className="rounded-xl border border-emerald-700/60 bg-[#07241f] px-3.5 py-2 text-xs font-bold text-emerald-200 hover:border-amber-400 hover:text-white transition"
              >
                📖 Buka Tafsir
              </Link>
              <Link
                href="/hadis"
                className="rounded-xl border border-emerald-700/60 bg-[#07241f] px-3.5 py-2 text-xs font-bold text-emerald-200 hover:border-amber-400 hover:text-white transition"
              >
                📜 Buka Hadis
              </Link>
              <Link
                href="/kitab"
                className="rounded-xl border border-emerald-700/60 bg-[#07241f] px-3.5 py-2 text-xs font-bold text-emerald-200 hover:border-amber-400 hover:text-white transition"
              >
                📚 Buka Kitab
              </Link>
              <Link
                href="/doa"
                className="rounded-xl border border-emerald-700/60 bg-[#07241f] px-3.5 py-2 text-xs font-bold text-emerald-200 hover:border-amber-400 hover:text-white transition"
              >
                🤲 Buka Doa
              </Link>
              <Link
                href="/tanya-ai"
                className="rounded-xl border border-amber-600/60 bg-amber-950/40 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-900 transition"
              >
                ✨ Tanya AI
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredList.map((item) => {
            const badge = getCategoryBadge(item.kategori)
            return (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-emerald-800/60 bg-[#061e1a] p-4 sm:p-5 shadow-lg transition hover:border-amber-400/80 hover:bg-[#072520]"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold ${badge.color}`}
                      >
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>
                      <span className="text-[11px] text-emerald-500 font-mono">
                        • {item.formattedTime}
                      </span>
                    </div>

                    <h2 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                      {item.judul}
                    </h2>

                    {item.subjudul && (
                      <p className="text-xs text-emerald-300/80 font-medium line-clamp-1">
                        {item.subjudul}
                      </p>
                    )}

                    {item.ringkasan && (
                      <p className="text-xs text-emerald-200/70 line-clamp-2 leading-relaxed pt-0.5">
                        {item.ringkasan}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2 pt-2 sm:pt-0">
                    <Link
                      href={item.url}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#e5a93c] px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md transition hover:bg-[#d6982f] active:scale-95"
                    >
                      <span>Lanjutkan</span>
                      <span>➔</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.judul)}
                      title="Hapus dari riwayat"
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-800/60 bg-[#041411] text-emerald-400 hover:border-red-600 hover:bg-red-950/60 hover:text-red-300 transition cursor-pointer"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-amber-400/40 bg-[#061e1a] px-4 py-3 text-sm font-semibold text-emerald-100 shadow-2xl backdrop-blur">
          <span className="text-amber-400 font-bold">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  )
}
