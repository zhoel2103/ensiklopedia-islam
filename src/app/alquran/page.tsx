"use client"

import { useState, useRef } from "react"
import { surahList } from "@/lib/quran-surahs"
import { searchAyatSemantik, getAyatSpecific, type AyatDetail } from "@/lib/kalimat-quran-service"
import AyatCard from "@/components/alquran/ayat-card"
import TafsirModal from "@/components/alquran/tafsir-modal"
import Link from "next/link"

export default function AlQuranPage() {
  const [activeTab, setActiveTab] = useState<"dropdown" | "semantic">("dropdown")
  
  // Dropdown State
  const [selectedSurah, setSelectedSurah] = useState<number>(1)
  const [selectedAyat, setSelectedAyat] = useState<number>(1)
  
  // Semantic State
  const [searchQuery, setSearchQuery] = useState("")
  const [isListening, setIsListening] = useState(false)
  
  // Data State
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<AyatDetail[]>([])
  
  // Tafsir Modal State
  const [tafsirModal, setTafsirModal] = useState<{surahId: number, ayatId: number} | null>(null)

  // Handlers
  const handleDropdownSearch = async () => {
    setLoading(true)
    setResults([])
    try {
      const result = await getAyatSpecific(selectedSurah, selectedAyat)
      if (result) {
        setResults([result])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSemanticSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setResults([])
    try {
      const semanticResults = await searchAyatSemantik(searchQuery)
      setResults(semanticResults)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Voice Recognition Web Speech API
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Browser Anda tidak mendukung fitur pencarian suara. Gunakan Google Chrome.")
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.lang = 'id-ID'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setSearchQuery(transcript)
      setIsListening(false)
      // trigger search automatically after voice input
      setTimeout(() => {
        document.getElementById("btn-semantic-search")?.click()
      }, 500)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  return (
    <div className="min-h-screen bg-[#020a09] font-sans pb-24">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[#03100e]/80 backdrop-blur-xl border-b border-emerald-900/50">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black shadow-lg shadow-emerald-900/50 group-hover:shadow-emerald-500/30 transition-all">
              EN
            </div>
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-emerald-400">
              Al-Qur'an
            </span>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-8">
        
        {/* Tab Controls */}
        <div className="flex p-1 mb-8 bg-[#041613] rounded-2xl border border-emerald-900/50 shadow-inner">
          <button 
            onClick={() => { setActiveTab("dropdown"); setResults([]) }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === "dropdown" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/50" : "text-emerald-500 hover:text-emerald-300"}`}
          >
            Pilih Surah & Ayat
          </button>
          <button 
            onClick={() => { setActiveTab("semantic"); setResults([]) }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === "semantic" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/50" : "text-emerald-500 hover:text-emerald-300"}`}
          >
            Pencarian Semantik
          </button>
        </div>

        {/* Search Interfaces */}
        <div className="mb-10 bg-gradient-to-br from-[#051a17] to-[#030e0c] p-6 rounded-3xl border border-emerald-800/40 shadow-xl">
          
          {activeTab === "dropdown" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-emerald-100 font-bold mb-2">Pilih Surah dan Ayat</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <select 
                  suppressHydrationWarning
                  value={selectedSurah}
                  onChange={(e) => {
                    setSelectedSurah(Number(e.target.value))
                    setSelectedAyat(1) // reset ayat to 1 on surah change
                  }}
                  className="flex-1 bg-[#020a09] border border-emerald-800/60 text-emerald-100 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition"
                >
                  {surahList.map(s => (
                    <option className="bg-[#020a09] text-emerald-100" key={s.id} value={s.id}>{s.id}. {s.name}</option>
                  ))}
                </select>

                <select 
                  suppressHydrationWarning
                  value={selectedAyat}
                  onChange={(e) => setSelectedAyat(Number(e.target.value))}
                  className="w-full sm:w-32 bg-[#020a09] border border-emerald-800/60 text-emerald-100 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition"
                >
                  {Array.from({ length: surahList.find(s => s.id === selectedSurah)?.ayat || 1 }).map((_, i) => (
                    <option className="bg-[#020a09] text-emerald-100" key={i+1} value={i+1}>Ayat {i+1}</option>
                  ))}
                </select>
                
                <button 
                  onClick={handleDropdownSearch}
                  className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/50"
                >
                  Tampilkan
                </button>
              </div>
            </div>
          )}

          {activeTab === "semantic" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-emerald-100 font-bold mb-2">Pencarian Cerdas berbasis AI</h2>
              <form onSubmit={handleSemanticSearch} className="flex flex-col sm:flex-row gap-4 relative">
                <div className="relative flex-1">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Contoh: Ayat tentang bersabar..."
                    className="w-full bg-[#020a09] border border-emerald-800/60 text-emerald-100 rounded-xl pl-4 pr-12 py-3 outline-none focus:border-emerald-500 transition"
                  />
                  <button 
                    type="button"
                    onClick={startVoiceRecognition}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-emerald-900/50 text-emerald-400 hover:bg-emerald-800"}`}
                  >
                    🎤
                  </button>
                </div>
                
                <button 
                  id="btn-semantic-search"
                  type="submit"
                  disabled={!searchQuery.trim() || loading}
                  className="bg-emerald-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/50"
                >
                  Cari Ayat
                </button>
              </form>
              {isListening && <p className="text-xs text-emerald-400 animate-pulse mt-1">Sedang mendengarkan...</p>}
            </div>
          )}

        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
             <div className="h-10 w-10 rounded-full border-4 border-emerald-900 border-t-emerald-400 animate-spin" />
             <p className="text-emerald-400 font-medium animate-pulse">Memuat ayat suci...</p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="flex flex-col gap-2">
            {results.map((ayat, index) => (
              <AyatCard 
                key={`${ayat.surahId}-${ayat.ayatId}-${index}`} 
                ayat={ayat} 
                onOpenTafsir={(surah, ayat) => setTafsirModal({surahId: surah, ayatId: ayat})} 
              />
            ))}
          </div>
        )}

        {!loading && results.length === 0 && activeTab === "semantic" && searchQuery && (
          <div className="text-center py-12">
            <p className="text-emerald-600">Tidak ada ayat yang cocok dengan pencarian Anda.</p>
          </div>
        )}
      </main>

      {/* Tafsir Modal */}
      {tafsirModal && (
        <TafsirModal 
          surahId={tafsirModal.surahId} 
          ayatId={tafsirModal.ayatId} 
          onClose={() => setTafsirModal(null)} 
        />
      )}
    </div>
  )
}
