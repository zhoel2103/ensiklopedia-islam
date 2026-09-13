"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { SURAH_DETAIL_LIST, type SurahDetailMeta } from "@/lib/tafsir-metadata"
import SimpanRiwayatButton from "@/components/simpan-riwayat-button"

type AyatData = {
  nomor: number
  arab: string
  terjemah: string
  juz: number
  tafsir?: string
}

const TAFSIR_SOURCES = [
  {
    id: "tahlili",
    name: "Tafsir Kemenag (Tahlili)",
    desc: "Tafsir komprehensif resmi dari Kementerian Agama RI",
  },
  {
    id: "jalalayn",
    name: "Tafsir al-Jalalayn",
    desc: "Tafsir ringkas klasik karya Jalaluddin al-Mahalli dan Jalaluddin as-Suyuthi",
  },
  {
    id: "wajiz",
    name: "Tafsir Kemenag (Wajiz)",
    desc: "Tafsir ringkas dan padat dari Kementerian Agama RI",
  },
  {
    id: "almukhtashar",
    name: "Al-Mukhtaṣar fī Tafsīr",
    desc: "Tafsir ringkas Al-Qur'an al-Karim (via QuranEnc)",
  },
  {
    id: "assadi",
    name: "Tafsir as-Sa'di",
    desc: "Tafsir as-Sa'di (via QuranEnc)",
  },
  {
    id: "quraish",
    name: "Tafsir Quraish Shihab",
    desc: "Tafsir Al-Mishbah karya Prof. Dr. M. Quraish Shihab",
  }
]

type TafsirUnifiedProps = {
  initialSurahNomor?: number
  initialRange?: string
}

export default function TafsirUnified({
  initialSurahNomor = 1,
  initialRange = "1-7",
}: TafsirUnifiedProps) {
  // Surah Selection
  const [selectedSurahNomor, setSelectedSurahNomor] = useState<number>(initialSurahNomor)
  const currentSurah = useMemo<SurahDetailMeta>(() => {
    return (
      SURAH_DETAIL_LIST.find((s) => s.nomor === selectedSurahNomor) ||
      SURAH_DETAIL_LIST[0]
    )
  }, [selectedSurahNomor])

  // Ayat Range Input
  const [ayatInput, setAyatInput] = useState<string>(initialRange)
  const [activeRange, setActiveRange] = useState<{ start: number; end: number }>({
    start: 1,
    end: Math.min(7, currentSurah.jumlahAyat),
  })

  // All Ayats for current Surah
  const [allAyatList, setAllAyatList] = useState<AyatData[]>([])
  const [loadingAyat, setLoadingAyat] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Translation accordion toggle
  const [showTranslation, setShowTranslation] = useState(false)

  // Selected Tafsir Source
  const [selectedTafsirSource, setSelectedTafsirSource] = useState(TAFSIR_SOURCES[0].id)
  const currentTafsirMeta = useMemo(() => {
    return (
      TAFSIR_SOURCES.find((t) => t.id === selectedTafsirSource) ||
      TAFSIR_SOURCES[0]
    )
  }, [selectedTafsirSource])

  // Tafsir Summary State
  const [tafsirLoading, setTafsirLoading] = useState(false)
  const [tafsirSummary, setTafsirSummary] = useState<string | null>(null)
  const [tafsirProvider, setTafsirProvider] = useState<string | null>(null)

  // Murottal Audio Player State
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingAyatIndex, setPlayingAyatIndex] = useState(0)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null)

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToastMessage(msg)
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Parse Range String (e.g. "1-7", "5", "10-20")
  const parseRange = (str: string, max: number): { start: number; end: number } | null => {
    const cleaned = str.trim()
    if (!cleaned) return null

    if (cleaned.includes("-")) {
      const parts = cleaned.split("-").map((p) => parseInt(p.trim(), 10))
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const start = Math.max(1, Math.min(parts[0], max))
        const end = Math.max(start, Math.min(parts[1], max))
        return { start, end }
      }
    } else {
      const single = parseInt(cleaned, 10)
      if (!isNaN(single)) {
        const clamped = Math.max(1, Math.min(single, max))
        return { start: clamped, end: clamped }
      }
    }
    return null
  }

  // Load Ayats when Surah changes
  useEffect(() => {
    let isMounted = true
    setLoadingAyat(true)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    const loadDirectFromPublic = () => {
      fetch(`https://equran.id/api/v2/surat/${currentSurah.nomor}`)
        .then((r) => r.json())
        .then((eqData) => {
          if (!isMounted) return
          if (eqData.data && Array.isArray(eqData.data.ayat) && eqData.data.ayat.length > 0) {
            setAllAyatList(
              eqData.data.ayat.map((a: any) => ({
                nomor: a.nomorAyat,
                arab: a.teksArab,
                terjemah: a.teksIndonesia,
                tafsir: "",
                juz: 1,
              })),
            )
          } else {
            setAllAyatList([])
          }
        })
        .catch(() => {
          if (isMounted) setAllAyatList([])
        })
        .finally(() => {
          if (isMounted) setLoadingAyat(false)
        })
    }

    fetch(`/api/tafsir/surah/${currentSurah.nomor}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return
        if (data.ayat && Array.isArray(data.ayat) && data.ayat.length > 0) {
          setAllAyatList(data.ayat)
          setLoadingAyat(false)
        } else {
          loadDirectFromPublic()
        }
      })
      .catch(() => {
        if (isMounted) loadDirectFromPublic()
      })

    return () => {
      isMounted = false
    }
  }, [currentSurah])

  // When user changes surah via dropdown
  const handleSurahChange = (nomor: number) => {
    setSelectedSurahNomor(nomor)
    const surahObj = SURAH_DETAIL_LIST.find((s) => s.nomor === nomor)
    const max = surahObj ? surahObj.jumlahAyat : 7
    const defaultEnd = Math.min(7, max)
    const newRangeStr = max === 1 ? "1" : `1-${defaultEnd}`
    setAyatInput(newRangeStr)
    setActiveRange({ start: 1, end: defaultEnd })
    setPlayingAyatIndex(0)
    setTafsirSummary(null)
    setTafsirProvider(null)
  }

  // When user clicks "Muat"
  const handleLoadRange = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const parsed = parseRange(ayatInput, currentSurah.jumlahAyat)
    if (parsed) {
      setActiveRange(parsed)
      setPlayingAyatIndex(0)
      setIsPlaying(false)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      showToast(
        parsed.start === parsed.end
          ? `Memuat QS. ${currentSurah.namaLatin} Ayat ${parsed.start}`
          : `Memuat QS. ${currentSurah.namaLatin} Ayat ${parsed.start}-${parsed.end}`,
      )
    } else {
      showToast(`Format ayat salah. Masukkan nomor (misal: 1) atau rentang (misal: 1-7)`)
    }
  }

  // Filtered loaded ayats in active range
  const displayedAyats = useMemo(() => {
    if (allAyatList.length === 0) return []
    return allAyatList.filter(
      (a) => a.nomor >= activeRange.start && a.nomor <= activeRange.end,
    )
  }, [allAyatList, activeRange])

  // Current playing ayat object
  const currentPlayingAyat = useMemo(() => {
    if (displayedAyats.length === 0) return null
    const safeIdx = Math.min(
      Math.max(0, playingAyatIndex),
      displayedAyats.length - 1,
    )
    return displayedAyats[safeIdx] || null
  }, [displayedAyats, playingAyatIndex])

  // Audio URL Helper for EveryAyah CDN
  const getAudioUrl = (surahNum: number, ayahNum: number) => {
    const sPadded = String(surahNum).padStart(3, "0")
    const aPadded = String(ayahNum).padStart(3, "0")
    return `https://everyayah.com/data/Alafasy_128kbps/${sPadded}${aPadded}.mp3`
  }

  // Audio Event Handlers
  const togglePlayAudio = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          showToast("Gagal memutar audio murottal.")
          setIsPlaying(false)
        })
    }
  }

  const handleNextAyatAudio = () => {
    if (playingAyatIndex < displayedAyats.length - 1) {
      setPlayingAyatIndex((prev) => prev + 1)
      setIsPlaying(true)
    } else {
      setIsPlaying(false)
    }
  }

  const handlePrevAyatAudio = () => {
    if (playingAyatIndex > 0) {
      setPlayingAyatIndex((prev) => prev - 1)
      setIsPlaying(true)
    }
  }

  const handleAudioEnded = () => {
    if (playingAyatIndex < displayedAyats.length - 1) {
      setPlayingAyatIndex((prev) => prev + 1)
    } else {
      setIsPlaying(false)
      setPlayingAyatIndex(0)
    }
  }

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return "0:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  // Generate / Fetch Tafsir Summary with Google Gemini API
  const handleGetTafsir = async () => {
    setTafsirLoading(true)
    setTafsirSummary(null)
    setTafsirProvider(null)

    try {
      const res = await fetch("/api/tafsir/ahmad-sanusi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surahNomor: currentSurah.nomor,
          start: activeRange.start,
          end: activeRange.end,
          sourceId: selectedTafsirSource,
        }),
      })

      if (res.ok) {
        const json = await res.json()
        setTafsirSummary(json.summary)
        setTafsirProvider(json.provider || "quran.foundation + Google Translate")
      } else {
        const err = await res.json()
        showToast(err.error || "Gagal memuat tafsir dari quran.foundation.")
      }
    } catch {
      showToast("Gagal menghubungi server. Silakan coba lagi.")
    } finally {
      setTafsirLoading(false)
    }
  }

  const currentTafsirRiwayatItem = {
    id: `tafsir-${currentSurah.nomor}-${activeRange.start}-${activeRange.end}`,
    kategori: "tafsir" as const,
    judul: `QS. ${currentSurah.namaLatin} (${currentSurah.namaArab}) — Ayat ${activeRange.start}${activeRange.start !== activeRange.end ? `-${activeRange.end}` : ""}`,
    subjudul: `${currentTafsirMeta.name} • ${currentSurah.tempatTurun} (${currentSurah.jumlahAyat} Ayat)`,
    ringkasan:
      displayedAyats.length > 0
        ? `"${displayedAyats[0].terjemah.slice(0, 100)}${displayedAyats[0].terjemah.length > 100 ? "..." : ""}"`
        : `Telaah QS. ${currentSurah.namaLatin} ayat ${activeRange.start}-${activeRange.end}`,
    url: `/tafsir?surah=${currentSurah.nomor}&range=${activeRange.start}-${activeRange.end}&source=${selectedTafsirSource}`,
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 py-4 px-2 sm:px-4 text-emerald-100">
      
      {/* CARD 1: Surah Selection Box */}
      <section className="rounded-2xl border border-[#143026] bg-[#071915] p-4 sm:p-5 shadow-lg">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="surah-select-dropdown"
            className="block text-xs sm:text-sm font-semibold text-emerald-200"
          >
            Surah
          </label>
          <SimpanRiwayatButton
            item={currentTafsirRiwayatItem}
            variant="compact"
            label="Simpan Riwayat"
          />
        </div>
        <div className="relative">
          <select
            id="surah-select-dropdown"
            value={selectedSurahNomor}
            onChange={(e) => handleSurahChange(Number(e.target.value))}
            className="w-full appearance-none rounded-xl border border-[#1a4438] bg-[#041310] px-4 py-3 text-sm font-medium text-emerald-100 outline-none transition focus:border-[#00d492] cursor-pointer"
          >
            {SURAH_DETAIL_LIST.map((s) => (
              <option
                key={s.nomor}
                value={s.nomor}
                className="bg-[#071915] text-emerald-100"
              >
                {s.nomor}. {s.namaLatin} ({s.namaArab})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-400">
            <span className="text-xs">⇅</span>
          </div>
        </div>
      </section>

      {/* CARD 2: Ayat Selection & Muat Box */}
      <section className="rounded-2xl border border-[#143026] bg-[#071915] p-4 sm:p-5 shadow-lg">
        <form onSubmit={handleLoadRange}>
          <label
            htmlFor="ayat-range-input"
            className="mb-2 block text-xs sm:text-sm font-semibold text-emerald-200"
          >
            Ayat
          </label>
          <div className="flex items-center gap-2.5">
            <input
              id="ayat-range-input"
              type="text"
              placeholder={`Contoh: 1-${currentSurah.jumlahAyat} atau 1`}
              value={ayatInput}
              onChange={(e) => setAyatInput(e.target.value)}
              className="w-full rounded-xl border border-[#1a4438] bg-[#041310] px-4 py-2.5 text-sm font-medium text-emerald-100 placeholder-emerald-700 outline-none transition focus:border-[#00d492]"
            />
            <button
              type="submit"
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#1a4438] bg-[#051c17] px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-300 transition hover:bg-[#0c2e26] hover:text-white active:scale-95 cursor-pointer shadow-sm"
            >
              <span>🔄</span>
              <span>Muat</span>
            </button>
          </div>
        </form>
      </section>

      {/* CARD 3: Teks Ayat (Continuous Mushaf + Murottal + Translation) */}
      <section className="rounded-2xl border border-[#143026] bg-[#071915] p-4 sm:p-6 shadow-xl space-y-4">
        <h2 className="text-xs sm:text-sm font-bold text-emerald-200">
          Teks Ayat
        </h2>

        {/* Sub-box: Continuous Arabic Text */}
        <div className="rounded-2xl border border-[#122e25] bg-[#041310] p-5 sm:p-7 text-center">
          {loadingAyat ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00d492] border-t-transparent" />
              <p className="text-xs text-emerald-400">Memuat teks ayat...</p>
            </div>
          ) : displayedAyats.length > 0 ? (
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-xl sm:text-2xl lg:text-3xl font-normal leading-[2.5] tracking-wide text-white text-justify"
            >
              {displayedAyats.map((ayat) => (
                <span key={ayat.nomor} className="inline">
                  {ayat.arab}{" "}
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-emerald-500/70 bg-[#072c23] text-[#00d492] text-[11px] font-mono font-bold align-middle mx-1.5 shadow-sm"
                    title={`Ayat ${ayat.nomor}`}
                  >
                    {ayat.nomor}
                  </span>{" "}
                </span>
              ))}
            </p>
          ) : (
            <p className="text-xs text-emerald-400/80 py-4">
              Tidak ada ayat untuk rentang ini. Silakan klik &quot;Muat&quot;.
            </p>
          )}
        </div>

        {/* Sub-box: Murottal Audio Player */}
        <div className="rounded-2xl border border-[#122e25] bg-[#041310] p-4 sm:p-5 space-y-3">
          {/* Audio Header */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium text-emerald-300">
              <span className="text-emerald-400">🔊</span>
              <span>Misyari Rasyid Al-Afasi</span>
            </div>
            {currentPlayingAyat && (
              <span className="font-semibold text-[#00d492] font-mono text-xs">
                Ayat {currentPlayingAyat.nomor}{" "}
                <span className="text-emerald-500 font-normal">
                  ({playingAyatIndex + 1}/{displayedAyats.length})
                </span>
              </span>
            )}
          </div>

          {/* Hidden HTML Audio Element */}
          {currentPlayingAyat && (
            <audio
              ref={audioRef}
              src={getAudioUrl(currentSurah.nomor, currentPlayingAyat.nomor)}
              onTimeUpdate={(e) =>
                setAudioCurrentTime((e.target as HTMLAudioElement).currentTime)
              }
              onLoadedMetadata={(e) =>
                setAudioDuration((e.target as HTMLAudioElement).duration)
              }
              onEnded={handleAudioEnded}
              autoPlay={isPlaying}
            />
          )}

          {/* Timeline Bar */}
          <div className="space-y-1">
            <div className="relative flex items-center">
              <input
                type="range"
                min={0}
                max={audioDuration || 100}
                value={audioCurrentTime}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setAudioCurrentTime(val)
                  if (audioRef.current) audioRef.current.currentTime = val
                }}
                className="h-1 w-full appearance-none rounded-full bg-[#0d3328] accent-[#00d492] outline-none cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-emerald-500">
              <span>{formatTime(audioCurrentTime)}</span>
              <span>{formatTime(audioDuration)}</span>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center justify-center gap-5 pt-1">
            <button
              type="button"
              onClick={handlePrevAyatAudio}
              disabled={playingAyatIndex <= 0}
              className="text-emerald-400 hover:text-white transition disabled:opacity-30 cursor-pointer text-sm"
              title="Ayat Sebelumnya"
            >
              ⏮
            </button>

            <button
              type="button"
              onClick={togglePlayAudio}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00d492] text-slate-950 shadow-lg transition hover:bg-[#00c082] active:scale-95 cursor-pointer font-bold"
              title={isPlaying ? "Jeda" : "Putar Murottal"}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <button
              type="button"
              onClick={handleNextAyatAudio}
              disabled={playingAyatIndex >= displayedAyats.length - 1}
              className="text-emerald-400 hover:text-white transition disabled:opacity-30 cursor-pointer text-sm"
              title="Ayat Berikutnya"
            >
              ⏭
            </button>
          </div>
        </div>

        {/* Translation Toggle Link */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowTranslation(!showTranslation)}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-400 hover:text-[#00d492] transition cursor-pointer"
          >
            <span>📖</span>
            <span>Terjemahan Bahasa Indonesia</span>
            <span className="text-[10px]">{showTranslation ? "▲" : "▼"}</span>
          </button>

          {showTranslation && (
            <div className="mt-3 space-y-3 rounded-xl border border-[#122e25] bg-[#041411] p-4 text-xs sm:text-sm leading-relaxed text-emerald-100/90">
              {displayedAyats.map((ayat) => (
                <div key={ayat.nomor} className="space-y-1 border-b border-emerald-900/40 pb-2.5 last:border-b-0 last:pb-0">
                  <span className="font-bold text-[#00d492]">
                    Ayat {ayat.nomor}:
                  </span>{" "}
                  <span>{ayat.terjemah}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CARD 4: Pilih Sumber Tafsir & Dapatkan Ringkasan */}
      <section className="rounded-2xl border border-[#143026] bg-[#071915] p-4 sm:p-6 shadow-xl space-y-4">
        <div>
          <label
            htmlFor="sumber-tafsir-dropdown"
            className="mb-2 block text-xs sm:text-sm font-bold text-emerald-200"
          >
            Pilih Sumber Tafsir
          </label>
          <div className="relative">
            <select
              id="sumber-tafsir-dropdown"
              value={selectedTafsirSource}
              onChange={(e) => setSelectedTafsirSource(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#1a4438] bg-[#041310] px-4 py-3 text-sm font-medium text-emerald-100 outline-none transition focus:border-[#00d492] cursor-pointer"
            >
              {TAFSIR_SOURCES.map((t) => (
                <option
                  key={t.id}
                  value={t.id}
                  className="bg-[#071915] text-emerald-100"
                >
                  {t.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-400">
              <span className="text-xs">▼</span>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-emerald-400/80">
            {currentTafsirMeta.desc}
          </p>
        </div>

        {/* Big Emerald Action Button */}
        <button
          type="button"
          onClick={handleGetTafsir}
          disabled={tafsirLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00d492] py-3.5 px-6 text-sm font-bold text-slate-950 shadow-xl transition hover:bg-[#00c082] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {tafsirLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
              <span>Memuat dan Menerjemahkan Tafsir...</span>
            </>
          ) : (
            <>
              <span className="text-base">📖</span>
              <span>Muat Tafsir</span>
            </>
          )}
        </button>

        {/* Tafsir Summary Content Box */}
        {tafsirSummary && (
          <div className="mt-4 rounded-2xl border border-emerald-700/60 bg-[#041310] p-5 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-amber-400 font-bold text-xs sm:text-sm">
                  ✦ Ringkasan Tafsir Komprehensif
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">
                {currentTafsirMeta.name}
              </span>
            </div>

            <div 
              className="space-y-4 text-xs sm:text-sm leading-relaxed text-justify text-white max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-2"
              dangerouslySetInnerHTML={{ __html: tafsirSummary }}
            />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-emerald-900/40 pt-3.5 text-xs text-emerald-400">
              <span className="text-[11px] text-emerald-400 font-medium">
                {currentTafsirMeta.name} • QS. {currentSurah.namaLatin}: {activeRange.start}
                {activeRange.start !== activeRange.end ? `-${activeRange.end}` : ""}
              </span>
              <div className="flex items-center gap-2">
                <SimpanRiwayatButton
                  item={{
                    ...currentTafsirRiwayatItem,
                    id: `tafsir-ringkasan-${currentSurah.nomor}-${activeRange.start}-${activeRange.end}`,
                    judul: `Ringkasan Tafsir QS. ${currentSurah.namaLatin} (${activeRange.start}-${activeRange.end})`,
                    subjudul: `${currentTafsirMeta.name} • QS. ${currentSurah.namaLatin}`,
                    ringkasan: tafsirSummary.slice(0, 140) + "...",
                  }}
                  variant="compact"
                  label="Simpan Ringkasan"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(tafsirSummary)
                    showToast("✓ Ringkasan tafsir disalin!")
                  }}
                  className="rounded-lg border border-[#1a4438] bg-[#071915] px-3 py-1.5 text-xs text-emerald-300 hover:text-white transition active:scale-95 cursor-pointer"
                >
                  Salin Tafsir
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-[#071915] px-4 py-3 text-sm font-semibold text-emerald-100 shadow-2xl backdrop-blur">
          <span className="text-[#00d492]">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  )
}
