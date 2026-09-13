"use client"

import { useState, useRef } from "react"
import type { AyatDetail } from "@/lib/kalimat-quran-service"

interface AyatCardProps {
  ayat: AyatDetail
  onOpenTafsir: (surahId: number, ayatId: number) => void
}

export default function AyatCard({ ayat, onOpenTafsir }: AyatCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="rounded-3xl border border-emerald-800/40 bg-gradient-to-br from-[#061e1a] to-[#041411] p-5 sm:p-6 shadow-2xl mb-6">
      <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/50 text-sm font-bold text-amber-400 border border-emerald-700/50">
          {ayat.surahId}:{ayat.ayatId}
        </div>
        
        <div className="flex gap-2">
          <audio 
            ref={audioRef} 
            src={ayat.audio} 
            onEnded={() => setIsPlaying(false)} 
            className="hidden" 
          />
          <button
            onClick={toggleAudio}
            className="flex items-center gap-2 rounded-xl bg-[#082621] px-4 py-2 text-xs font-semibold text-emerald-300 border border-emerald-700/60 hover:bg-[#0b332b] hover:text-white hover:border-amber-400 transition"
          >
            {isPlaying ? (
              <>
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Misyhari
              </>
            )}
          </button>
          
          <button
            onClick={() => onOpenTafsir(ayat.surahId, ayat.ayatId)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg hover:from-amber-500 hover:to-amber-400 transition"
          >
            <span>📖</span> Tafsir
          </button>
        </div>
      </div>

      <div className="text-right my-6">
        <p className="text-3xl leading-loose font-arabic text-amber-50">{ayat.arab}</p>
      </div>
      
      <div className="text-left mt-6">
        <p className="text-sm sm:text-base leading-relaxed text-emerald-100 font-medium">
          {ayat.indo.replace(/<sup[^>]*>.*?<\/sup>/g, '').replace(/<[^>]*>?/gm, '')}
        </p>
      </div>
    </div>
  )
}
