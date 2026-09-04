"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import {
  getKitabMetadata,
  parseBabContent,
  type ParsedBabItem,
  type ParsedHadisCard,
} from "@/lib/kitab-metadata"
import type { KitabItem, KitabBab } from "@/lib/kitab-data"
import SimpanRiwayatButton from "@/components/simpan-riwayat-button"

type KitabReaderProps = {
  kitab: KitabItem
  allKitab: KitabItem[]
  prevKitab: KitabItem | null
  nextKitab: KitabItem | null
}

export default function KitabReader({
  kitab,
  prevKitab,
  nextKitab,
}: KitabReaderProps) {
  const [activeBab, setActiveBab] = useState<KitabBab[]>(kitab.bab)

  useEffect(() => {
    // If chapters don't have text yet (e.g. lightweight SSR bundle), fetch full static JSON from CDN
    const needsFetch = kitab.bab.length > 0 && !kitab.bab[0]?.teks
    if (needsFetch) {
      fetch(`/data/kitab/${kitab.id}.json`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch kitab data")
          return res.json()
        })
        .then((fullKitab: KitabItem) => {
          if (fullKitab?.bab && fullKitab.bab.length > 0) {
            setActiveBab(fullKitab.bab)
          }
        })
        .catch((err) => {
          console.warn("[KitabReader] Static book fetch:", err)
        })
    } else {
      setActiveBab(kitab.bab)
    }
  }, [kitab])

  const metadata = useMemo(
    () =>
      getKitabMetadata(
        kitab.id,
        kitab.judul,
        kitab.ulama,
        activeBab.length || kitab.bab.length,
      ),
    [kitab, activeBab],
  )

  const parsedList = useMemo<ParsedBabItem[]>(() => {
    return activeBab.map((b) =>
      parseBabContent(b.nomor, b.judul, b.teks, kitab.id),
    )
  }, [activeBab, kitab.id])

  const [selectedBab, setSelectedBab] = useState<number>(
    parsedList[0]?.nomor ?? 1,
  )
  const [babSearchQuery, setBabSearchQuery] = useState("")
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Filter Bab options based on search query
  const filteredBabOptions = useMemo(() => {
    if (!babSearchQuery.trim()) return parsedList
    const q = babSearchQuery.toLowerCase().trim()
    return parsedList.filter(
      (b) =>
        b.cleanJudul.toLowerCase().includes(q) ||
        b.subBabArab.includes(q) ||
        b.fullTeks.toLowerCase().includes(q) ||
        b.teksIndo.toLowerCase().includes(q) ||
        b.teksArab.includes(q) ||
        b.hadisList.some(
          (h: ParsedHadisCard) =>
            h.subJudul.toLowerCase().includes(q) ||
            h.teksIndo.toLowerCase().includes(q) ||
            h.syarah.toLowerCase().includes(q) ||
            h.teksArab.includes(q),
        ) ||
        String(b.nomor) === q ||
        String(b.nomor).includes(q),
    )
  }, [parsedList, babSearchQuery])

  // Automatically switch selected Bab to first match when search query changes
  useEffect(() => {
    if (babSearchQuery.trim() && filteredBabOptions.length > 0) {
      if (!filteredBabOptions.some((b) => b.nomor === selectedBab)) {
        setSelectedBab(filteredBabOptions[0].nomor)
      }
    }
  }, [filteredBabOptions, babSearchQuery, selectedBab])

  // Filter only currently selected Bab
  const displayedList = useMemo(() => {
    const list = parsedList.filter((item) => item.nomor === selectedBab)
    return list.length > 0 ? list : [parsedList[0]]
  }, [parsedList, selectedBab])

  // Modal States
  const [modalItem, setModalItem] = useState<ParsedBabItem | null>(null)
  const [cardModalItem, setCardModalItem] = useState<ParsedBabItem | null>(null)

  const isKutubusSittah = useMemo(() => {
    return (
      ["bukhari", "muslim", "abu-dawud", "tirmidzi", "nasai", "ibnu-majah"].includes(
        kitab.id,
      ) || metadata.tag === "Kutubus Sittah"
    )
  }, [kitab.id, metadata.tag])

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
      const saved = localStorage.getItem(`ensiklopedi_bookmarks_${kitab.id}`)
      if (saved) {
        setBookmarks(JSON.parse(saved))
      }
    } catch {
      // ignore
    }
  }, [kitab.id])

  const toggleBookmark = (key: string | number) => {
    const strKey = String(key)
    const updated: Record<string, boolean> = { ...bookmarks, [strKey]: !bookmarks[strKey] }
    setBookmarks(updated)
    try {
      localStorage.setItem(
        `ensiklopedi_bookmarks_${kitab.id}`,
        JSON.stringify(updated),
      )
    } catch {
      // ignore
    }
    showToast(
      updated[strKey]
        ? `⭐ Ditambahkan ke bookmark`
        : `Dihapus dari bookmark`,
    )
  }

  // Copy item content
  const handleCopy = (item: ParsedBabItem) => {
    const textToCopy = `[${kitab.judul} #${item.nomor} - ${item.cleanJudul}]\n\n${item.teksArab ? item.teksArab + "\n\n" : ""}${item.teksIndo ? item.teksIndo + "\n\n" : ""}---\nSumber: Ensiklopedia Islam (${metadata.fullAuthor})`
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast(`✓ Teks Hadis #${item.nomor} berhasil disalin!`)
    })
  }

  // Share item
  const handleShare = (item: ParsedBabItem) => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/kitab/${kitab.id}#hadis-${item.nomor}` : ""
    if (navigator.share) {
      navigator
        .share({
          title: `${kitab.judul} #${item.nomor} - ${item.cleanJudul}`,
          text: item.cleanJudul,
          url,
        })
        .catch(() => {
          // ignore
        })
    } else {
      navigator.clipboard.writeText(url).then(() => {
        showToast(`✓ Tautan Hadis #${item.nomor} disalin ke clipboard!`)
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#041310] text-emerald-100">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-3 py-6 sm:px-6 sm:py-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/kitab"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 transition hover:text-amber-300"
          >
            ← Kembali ke Pustaka Kitab
          </Link>
          <span className="text-xs font-medium text-emerald-500/80">
            {metadata.tag}
          </span>
        </div>

        {/* 1. Header Card (Hero Banner) */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-800/40 bg-[#061e1a] p-6 sm:p-8 shadow-2xl">
          {/* Subtle Islamic Geometry / Glow Background */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-start">
            {/* Left Info */}
            <div className="space-y-4">
              <h1 className="font-serif-title text-2xl font-extrabold tracking-widest text-white sm:text-3xl lg:text-4xl uppercase drop-shadow-sm">
                {kitab.judul}
              </h1>

              <div className="flex items-center gap-2 text-sm font-medium text-amber-400/90">
                <svg
                  className="h-4 w-4 shrink-0 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                <span>{metadata.fullAuthor}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-emerald-300/85">
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-950/80 px-2.5 py-1 border border-emerald-800/50">
                  <svg
                    className="h-3.5 w-3.5 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span>{metadata.hadisCountLabel}</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-950/80 px-2.5 py-1 border border-emerald-800/50">
                  <svg
                    className="h-3.5 w-3.5 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span>{metadata.babCountLabel}</span>
                </div>
              </div>
            </div>

            {/* Right Calligraphy */}
            <div className="text-left md:text-right">
              <h2
                dir="rtl"
                lang="ar"
                className="font-arabic text-3xl font-bold leading-relaxed tracking-wide text-amber-400 drop-shadow-md sm:text-4xl lg:text-5xl"
              >
                {metadata.arabicTitle}
              </h2>
            </div>
          </div>
        </section>

        {/* 2. Bab / Kitab Navigation & Search Bar */}
        <section className="rounded-2xl border border-emerald-800/50 bg-gradient-to-b from-[#061e1a] to-[#041411] p-4 sm:p-6 shadow-xl space-y-4">
          {/* Top Row: Search Input & Simpan Riwayat */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/30 pb-3.5">
            {/* Search Input Box */}
            <div className="flex-1">
              <div className="relative flex items-center rounded-xl border border-emerald-700/60 bg-[#041411] px-3 py-1.5 shadow-inner transition focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/40">
                <span className="text-emerald-400 mr-2">
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder={
                    isKutubusSittah
                      ? `Cari dari ${parsedList.length} Kitab dalam ${kitab.judul} (misal: Iman, Shalat, Zakat, Jihad, Nikah)...`
                      : "Cari Bab atau Hadis dalam Kitab ini (misal: niat, shalat, ilmu, thaharah)..."
                  }
                  value={babSearchQuery}
                  onChange={(e) => {
                    setBabSearchQuery(e.target.value)
                    const q = e.target.value.toLowerCase().trim()
                    if (q) {
                      const match = parsedList.find(
                        (b) =>
                          b.cleanJudul.toLowerCase().includes(q) ||
                          b.fullTeks.toLowerCase().includes(q) ||
                          b.teksIndo.toLowerCase().includes(q) ||
                          String(b.nomor).includes(q),
                      )
                      if (match) {
                        setSelectedBab(match.nomor)
                      }
                    }
                  }}
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-emerald-100 placeholder-emerald-700 outline-none"
                />
                {babSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setBabSearchQuery("")}
                    className="ml-2 text-xs text-emerald-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Simpan Riwayat Action */}
            {displayedList[0] && (
              <div className="self-end sm:self-center">
                <SimpanRiwayatButton
                  item={{
                    id: `kitab-${kitab.id}-bab-${selectedBab}`,
                    kategori: "kitab",
                    judul: `${kitab.judul} — ${isKutubusSittah ? "Kitab" : "Bab"} ${selectedBab}`,
                    subjudul: displayedList[0].cleanJudul || kitab.ulama,
                    ringkasan: (displayedList[0].teksIndo || displayedList[0].fullTeks || "").slice(0, 120) + "...",
                    url: `/kitab/${kitab.id}#bab-${selectedBab}`,
                  }}
                  variant="compact"
                  label={isKutubusSittah ? `Simpan Riwayat Kitab ${selectedBab}` : "Simpan Riwayat Bab"}
                />
              </div>
            )}
          </div>

          {/* Bottom Row: Dropdown Filter Bab & Prev/Next Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Select Bab Dropdown */}
            <div className="flex-1 space-y-1.5">
              <label
                htmlFor="pilih-bab-kitab"
                className="flex items-center justify-between text-xs font-semibold text-emerald-300"
              >
                <span className="flex items-center gap-1.5">
                  <svg
                    className="h-3.5 w-3.5 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span>
                    {isKutubusSittah
                      ? `Filter / Pilih Kitab (${kitab.judul}):`
                      : "Filter / Pilih Bab Kitab:"}
                  </span>
                </span>
                <span className="text-[11px] font-mono text-amber-300">
                  {babSearchQuery
                    ? `${filteredBabOptions.length} ${isKutubusSittah ? "Kitab" : "Bab"} ditemukan`
                    : `Total ${parsedList.length} ${isKutubusSittah ? "Kitab" : "Bab"}`}
                </span>
              </label>

              <div className="relative">
                <select
                  id="pilih-bab-kitab"
                  value={selectedBab}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setSelectedBab(val)
                    showToast(`Memuat ${isKutubusSittah ? "Kitab" : "Bab"} ${val}`)
                  }}
                  className="w-full appearance-none truncate rounded-xl border border-emerald-700/60 bg-[#041411] px-4 py-2.5 pr-10 text-sm font-medium text-emerald-100 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 cursor-pointer"
                >
                  {filteredBabOptions.map((b) => (
                    <option
                      key={b.nomor}
                      value={b.nomor}
                      className="bg-[#061e1a] text-emerald-100"
                    >
                      {b.cleanJudul.startsWith("Kitab")
                        ? b.cleanJudul
                        : `${isKutubusSittah ? "Kitab" : "Bab"} ${b.nomor}: ${b.cleanJudul}`}{" "}
                      {b.subBabArab ? `(${b.subBabArab})` : ""}
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

            {/* Quick Bab Prev / Next Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-end pt-1">
              <button
                type="button"
                onClick={() => {
                  const prevVal = Math.max(1, selectedBab - 1)
                  setSelectedBab(prevVal)
                  showToast(`Memuat ${isKutubusSittah ? "Kitab" : "Bab"} ${prevVal}`)
                }}
                disabled={selectedBab <= 1}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-700/50 bg-[#041411] px-3.5 py-2.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-900/40 hover:text-white disabled:opacity-30 cursor-pointer"
                title={`${isKutubusSittah ? "Kitab" : "Bab"} Sebelumnya`}
              >
                <span>‹</span>
                <span>{isKutubusSittah ? "Kitab Sebelumnya" : "Bab Sebelumnya"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextVal = Math.min(parsedList.length, selectedBab + 1)
                  setSelectedBab(nextVal)
                  showToast(`Memuat ${isKutubusSittah ? "Kitab" : "Bab"} ${nextVal}`)
                }}
                disabled={selectedBab >= parsedList.length}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-700/50 bg-[#041411] px-3.5 py-2.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-900/40 hover:text-white disabled:opacity-30 cursor-pointer"
                title={`${isKutubusSittah ? "Kitab" : "Bab"} Berikutnya`}
              >
                <span>{isKutubusSittah ? "Kitab Berikutnya" : "Bab Berikutnya"}</span>
                <span>›</span>
              </button>
            </div>
          </div>
        </section>

        {/* 3. Hadith / Bab Cards Feed (Displaying ALL Hadiths in Selected Bab/Kitab) */}
        <div className="space-y-6">
          {displayedList.map((item) => {
            return (
              <div key={item.nomor} className="space-y-6">
                {/* Kitab / Bab Header Banner */}
                <div className="rounded-2xl border border-emerald-700/50 bg-gradient-to-r from-[#041411] via-[#082823] to-[#041411] p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                        {isKutubusSittah ? "Kitab" : "Bab"} {item.nomor}
                      </span>
                      <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-800/60">
                        {item.hadisList.length} Hadis Ditampilkan
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-lg sm:text-xl font-bold text-white">
                      {item.cleanJudul}
                    </h3>
                  </div>

                  {item.subBabArab && (
                    <div className="text-left sm:text-right">
                      <span
                        dir="rtl"
                        lang="ar"
                        className="font-arabic text-xl sm:text-2xl font-bold text-amber-400 drop-shadow-sm"
                      >
                        {item.subBabArab}
                      </span>
                    </div>
                  )}
                </div>

                {/* List of All Hadiths in this Bab/Kitab */}
                {item.hadisList.map((hadis, hIdx) => {
                  const hadisUniqueKey = `${kitab.id}-${item.nomor}-${hadis.nomorHadis || hIdx + 1}`
                  const isBookmarked = !!bookmarks[hadisUniqueKey] || (hIdx === 0 && !!bookmarks[String(item.nomor)])

                  // Modal proxy item for compatibility with modals
                  const hadisProxyItem: ParsedBabItem = {
                    nomor: Number(hadis.nomorHadis) || item.nomor,
                    judul: `${item.cleanJudul} — Hadits #${hadis.nomorHadis || hIdx + 1}`,
                    cleanJudul: hadis.subJudul || item.cleanJudul,
                    subBabArab: item.subBabArab,
                    teksArab: hadis.teksArab,
                    teksIndo: hadis.teksIndo,
                    fullTeks: `${hadis.teksArab}\n\n${hadis.teksIndo}\n\n${hadis.syarah}`,
                    hasArabic: Boolean(hadis.teksArab && hadis.teksArab.trim().length > 0),
                    hasIndo: Boolean(hadis.teksIndo && hadis.teksIndo.trim().length > 0),
                    hadisList: [hadis],
                  }

                  return (
                    <article
                      key={hadis.id || hadisUniqueKey}
                      id={`hadis-${item.nomor}-${hIdx + 1}`}
                      className="scroll-mt-20 rounded-2xl border border-emerald-800/40 bg-[#061e1a] p-5 sm:p-7 shadow-xl transition hover:border-emerald-700/70 space-y-4"
                    >
                      {/* Header Row: Badges & Actions */}
                      <div className="flex items-center justify-between gap-2 border-b border-emerald-800/30 pb-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Kitab badge */}
                          <span className="flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-[#0c2b23] px-2.5 py-1 text-xs font-bold text-amber-300">
                            <svg
                              className="h-3.5 w-3.5 text-amber-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                            {kitab.judul}
                          </span>

                          {/* Number badge */}
                          <span className="rounded-md border border-emerald-700/50 bg-[#041411] px-2.5 py-1 font-mono text-xs font-bold text-emerald-200">
                            Hadits #{hadis.nomorHadis || hIdx + 1}
                          </span>

                          {/* Authenticity Badge */}
                          <span className="rounded-md border border-emerald-500/40 bg-emerald-700/20 px-2.5 py-1 text-xs font-medium text-emerald-300">
                            {hadis.derajat || metadata.defaultDerajat}
                          </span>

                          {/* Takhrij badge */}
                          {hadis.takhrij && (
                            <span className="hidden sm:inline-flex rounded-md border border-emerald-800/40 bg-[#041411] px-2.5 py-1 text-[11px] font-medium text-emerald-400/90">
                              {hadis.takhrij}
                            </span>
                          )}
                        </div>

                        {/* Bookmark Button */}
                        <button
                          type="button"
                          onClick={() => toggleBookmark(hadisUniqueKey)}
                          title={
                            isBookmarked
                              ? "Hapus dari Bookmark"
                              : "Simpan Hadis ke Bookmark"
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

                      {/* Sub-heading Topik Hadits */}
                      {hadis.subJudul && hadis.subJudul !== item.cleanJudul && (
                        <h4 className="text-sm sm:text-base font-bold text-amber-300/90 pt-1">
                          {hadis.subJudul}
                        </h4>
                      )}

                      {/* Arabic Text Section */}
                      {hadis.teksArab ? (
                        <div className="rounded-xl bg-[#041411]/60 p-4 sm:p-6 border border-emerald-900/30 shadow-inner">
                          <p
                            dir="rtl"
                            lang="ar"
                            className="font-arabic text-right text-xl font-normal leading-loose tracking-wide text-emerald-50 sm:text-2xl"
                          >
                            {hadis.teksArab}
                          </p>
                        </div>
                      ) : null}

                      {/* Indonesian Translation */}
                      <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                          Terjemahan:
                        </span>
                        <p className="text-sm font-normal leading-relaxed text-emerald-100/90 sm:text-base whitespace-pre-line">
                          {hadis.teksIndo}
                        </p>
                      </div>

                      {/* Syarah / Penjelasan */}
                      {hadis.syarah && (
                        <div className="rounded-xl border border-amber-500/20 bg-[#0a231d]/60 p-4 text-xs sm:text-sm text-emerald-200/90">
                          <span className="block font-bold text-amber-400 mb-1">
                            Syarah & Pembahasan:
                          </span>
                          <p className="leading-relaxed whitespace-pre-line">
                            {hadis.syarah}
                          </p>
                        </div>
                      )}

                      {/* Footer Action Buttons */}
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-800/30 pt-4">
                        {/* Left Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          {/* Baca Lengkap Button */}
                          <button
                            type="button"
                            onClick={() => setModalItem(hadisProxyItem)}
                            className="flex items-center gap-1.5 rounded-xl bg-[#e5a93c] px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-md transition hover:bg-[#d6982f] active:scale-95 cursor-pointer"
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
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                            <span>Baca Lengkap</span>
                          </button>

                          {/* Simpan Riwayat Hadis ini */}
                          <SimpanRiwayatButton
                            item={{
                              id: `kitab-${kitab.id}-hadis-${item.nomor}-${hadis.nomorHadis || hIdx + 1}`,
                              kategori: "kitab",
                              judul: `${kitab.judul} — Hadits #${hadis.nomorHadis || hIdx + 1}`,
                              subjudul: hadis.subJudul || item.cleanJudul,
                              ringkasan: (hadis.teksIndo || hadis.teksArab || "").slice(0, 120) + "...",
                              url: `/kitab/${kitab.id}#hadis-${item.nomor}-${hIdx + 1}`,
                            }}
                            variant="compact"
                            label="Simpan Riwayat"
                          />
                        </div>

                        {/* Right Icon Actions */}
                        <div className="flex items-center gap-1.5">
                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopy(hadisProxyItem)}
                            title="Salin Hadis"
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

                          {/* Card Generator Button */}
                          <button
                            type="button"
                            onClick={() => setCardModalItem(hadisProxyItem)}
                            title="Buat Kartu Kutipan Hadis"
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

                          {/* Share Button */}
                          <button
                            type="button"
                            onClick={() => handleShare(hadisProxyItem)}
                            title="Bagikan Tautan Hadis"
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
            )
          })}
        </div>

        {/* 4. Footer Kitab Navigation */}
        <nav className="flex flex-wrap items-center justify-between gap-4 border-t border-emerald-800/30 pt-6">
          {prevKitab ? (
            <Link
              href={`/kitab/${prevKitab.id}`}
              className="flex items-center gap-2 rounded-xl border border-emerald-800/40 bg-[#061e1a] px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-900/30 hover:text-white"
            >
              <span>←</span>
              <span>{prevKitab.judul}</span>
            </Link>
          ) : (
            <div />
          )}

          {nextKitab ? (
            <Link
              href={`/kitab/${nextKitab.id}`}
              className="flex items-center gap-2 rounded-xl border border-emerald-800/40 bg-[#061e1a] px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-900/30 hover:text-white"
            >
              <span>{nextKitab.judul}</span>
              <span>→</span>
            </Link>
          ) : (
            <div />
          )}
        </nav>

      </div>

      {/* Floating Bottom Bab Controller */}
      {parsedList.length > 1 && (
        <div className="fixed bottom-4 inset-x-0 z-40 mx-auto flex w-fit items-center gap-3 rounded-full border border-emerald-800/60 bg-[#061e1a]/95 px-4 py-2 shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              const prevVal = Math.max(1, selectedBab - 1)
              setSelectedBab(prevVal)
              showToast(`Memuat Bab ${prevVal}`)
            }}
            disabled={selectedBab <= 1}
            className="rounded-full bg-[#041411] px-3.5 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-800/40 hover:text-white disabled:opacity-40 cursor-pointer"
          >
            ‹ Bab Sebelumnya
          </button>
          <span className="text-xs font-bold text-amber-400 font-mono">
            Bab {selectedBab} / {parsedList.length}
          </span>
          <button
            type="button"
            onClick={() => {
              const nextVal = Math.min(parsedList.length, selectedBab + 1)
              setSelectedBab(nextVal)
              showToast(`Memuat Bab ${nextVal}`)
            }}
            disabled={selectedBab >= parsedList.length}
            className="rounded-full bg-[#041411] px-3.5 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-800/40 hover:text-white disabled:opacity-40 cursor-pointer"
          >
            Bab Berikutnya ›
          </button>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-amber-400/40 bg-[#061e1a] px-4 py-3 text-sm font-semibold text-emerald-100 shadow-2xl backdrop-blur">
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

      {/* MODAL 1: Baca Lengkap */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl border border-emerald-700/50 bg-[#061e1a] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-emerald-800/40 p-5 sm:p-6">
              <div>
                <span className="text-xs font-bold text-amber-400">
                  {kitab.judul} #{modalItem.nomor}
                </span>
                <h3 className="text-lg font-bold text-white">
                  Bab {modalItem.nomor}. {modalItem.cleanJudul}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="rounded-full p-2 text-emerald-400 hover:bg-emerald-900/50 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6 text-emerald-100">
              {modalItem.hasArabic && (
                <div className="rounded-2xl border border-emerald-800/40 bg-[#041411] p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Teks Asli & Matan:
                  </span>
                  <p
                    dir="rtl"
                    lang="ar"
                    className="mt-3 font-arabic text-right text-2xl font-normal leading-loose tracking-wide text-emerald-50"
                  >
                    {modalItem.teksArab}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Terjemahan & Penjelasan:
                </span>
                <div className="rounded-2xl border border-emerald-800/40 bg-[#041411]/50 p-5 text-sm sm:text-base leading-relaxed text-emerald-100/90 whitespace-pre-line">
                  {modalItem.teksIndo || modalItem.fullTeks}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-emerald-950/60 p-3 text-xs text-emerald-400 border border-emerald-800/30">
                <span>Pengarang: {metadata.fullAuthor}</span>
                <span>Derajat: {metadata.defaultDerajat}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-emerald-800/40 p-4">
              <button
                type="button"
                onClick={() => handleCopy(modalItem)}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-700/50 bg-[#041411] px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-900/40 cursor-pointer"
              >
                Salin Teks
              </button>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="rounded-xl bg-[#e5a93c] px-5 py-2 text-xs font-bold text-slate-950 transition hover:bg-[#d6982f] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Kartu Kutipan Hadis */}
      {cardModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-emerald-700/50 bg-[#061e1a] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-800/40">
              <h3 className="text-sm font-bold text-white">
                Kartu Kutipan Hadis
              </h3>
              <button
                type="button"
                onClick={() => setCardModalItem(null)}
                className="text-emerald-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Visual Card Preview */}
            <div className="my-6 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-[#061e1a] via-[#041411] to-[#0a2f26] p-6 text-center shadow-2xl">
              <span className="font-serif-title text-xs font-bold tracking-widest text-amber-400 uppercase">
                {kitab.judul} • #{cardModalItem.nomor}
              </span>

              {cardModalItem.hasArabic && (
                <p
                  dir="rtl"
                  lang="ar"
                  className="my-4 font-arabic text-xl font-medium leading-loose text-amber-100"
                >
                  {cardModalItem.teksArab}
                </p>
              )}

              <h4 className="mt-2 text-sm font-bold text-white">
                Bab {cardModalItem.nomor}. {cardModalItem.cleanJudul}
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-emerald-200/90 line-clamp-3">
                {cardModalItem.teksIndo || cardModalItem.fullTeks}
              </p>

              <div className="mt-5 border-t border-emerald-800/40 pt-3 text-[11px] text-emerald-400/80">
                {metadata.fullAuthor}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleCopy(cardModalItem)
                  setCardModalItem(null)
                }}
                className="flex-1 rounded-xl bg-[#e5a93c] py-2.5 text-xs font-bold text-slate-950 transition hover:bg-[#d6982f] cursor-pointer"
              >
                Salin Teks Kutipan
              </button>
              <button
                type="button"
                onClick={() => {
                  handleShare(cardModalItem)
                  setCardModalItem(null)
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
