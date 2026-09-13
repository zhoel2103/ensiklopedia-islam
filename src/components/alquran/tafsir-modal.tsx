"use client"

import { useEffect, useState } from "react"
import { surahList } from "@/lib/quran-surahs"

interface TafsirModalProps {
  surahId: number
  ayatId: number
  onClose: () => void
}

export default function TafsirModal({ surahId, ayatId, onClose }: TafsirModalProps) {
  const [tafsir, setTafsir] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)

  const surah = surahList.find(s => s.id === surahId)
  const surahName = surah ? surah.name : `Surah ${surahId}`

  useEffect(() => {
    const fetchTafsir = async () => {
      try {
        const res = await fetch(`/api/tafsir/${surahId}/${ayatId}`)
        
        if (res.ok) {
          const data = await res.json()
          if (data.tahlili) {
            setTafsir(data.tahlili)
          } else {
            setTafsir("Tafsir Tahlili tidak tersedia untuk ayat ini.")
          }
        } else {
          setTafsir("Gagal memuat tafsir dari server.")
        }
      } catch (error) {
        setTafsir("Terjadi kesalahan jaringan.")
      } finally {
        setLoading(false)
      }
    }

    fetchTafsir()
  }, [surahId, ayatId, surahName])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[85vh] rounded-3xl border border-emerald-700/60 bg-gradient-to-b from-[#061e1a] to-[#041411] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-800/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-slate-950 font-black shadow-md">
              📖
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">Tafsir Kemenag (Tahlili)</h2>
              <p className="text-xs text-amber-400 font-medium">
                {surahName} • Ayat {ayatId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900/50 text-emerald-300 hover:bg-emerald-800 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-4">
              <span className="inline-flex items-center gap-1">
                <span className="h-3 w-3 animate-bounce rounded-full bg-amber-400 [animation-delay:-0.3s]" />
                <span className="h-3 w-3 animate-bounce rounded-full bg-amber-400 [animation-delay:-0.15s]" />
                <span className="h-3 w-3 animate-bounce rounded-full bg-amber-400" />
              </span>
              <p className="text-sm text-emerald-300 animate-pulse">Memuat Tafsir Tahlili...</p>
            </div>
          ) : (
            <div className="text-sm sm:text-base leading-relaxed text-emerald-100 font-medium whitespace-pre-line">
              {tafsir.split('\n').map((line, idx) => {
                if (line.trim() === "") return <br key={idx} />
                return <p key={idx} className="mb-3">{line}</p>
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-emerald-800/60 bg-[#041411] px-6 py-4 rounded-b-3xl">
          <p className="text-xs text-center text-emerald-600 font-medium">
            Sumber: Tafsir Tahlili Kementerian Agama RI (API Ahmad Sanusi)
          </p>
        </div>
      </div>
    </div>
  )
}
