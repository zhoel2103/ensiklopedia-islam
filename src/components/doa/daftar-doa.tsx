"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { type DoaItem, getKategoriList, getTagList } from "@/lib/doa-api"
import DoaCard from "@/components/doa/doa-card"
import DoaModal from "@/components/doa/doa-modal"

interface DaftarDoaProps {
  initialDoas: DoaItem[]
}

function DaftarDoaContent({ initialDoas }: DaftarDoaProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGrup, setSelectedGrup] = useState("Semua Kategori")
  const [selectedTag, setSelectedTag] = useState("Semua Tag")
  const [activeDoa, setActiveDoa] = useState<DoaItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Ekstrak daftar kategori dan tag secara dinamis dari dataset
  const kategoriList = useMemo(() => getKategoriList(initialDoas), [initialDoas])
  const tagList = useMemo(() => getTagList(initialDoas), [initialDoas])

  // Sync state dari URL search params (misal: ?id=10 atau ?grup=Doa Saat Wudhu)
  useEffect(() => {
    const idParam = searchParams.get("id")
    const grupParam = searchParams.get("grup")
    const tagParam = searchParams.get("tag")
    const qParam = searchParams.get("q")

    if (idParam) {
      const target = initialDoas.find((d) => d.id.toString() === idParam)
      if (target) {
        setActiveDoa(target)
      }
    }
    if (grupParam && kategoriList.includes(grupParam)) {
      setSelectedGrup(grupParam)
    }
    if (tagParam && tagList.includes(tagParam.toLowerCase())) {
      setSelectedTag(tagParam.toLowerCase())
    }
    if (qParam) {
      setSearchQuery(qParam)
    }
  }, [searchParams, initialDoas, kategoriList, tagList])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Filter daftar doa
  const filteredDoas = useMemo(() => {
    return initialDoas.filter((doa) => {
      // 1. Filter Kategori / Grup
      if (selectedGrup !== "Semua Kategori" && doa.grup !== selectedGrup) {
        return false
      }

      // 2. Filter Tag
      if (selectedTag !== "Semua Tag") {
        if (!doa.tag || !doa.tag.some((t) => t.toLowerCase() === selectedTag.toLowerCase())) {
          return false
        }
      }

      // 3. Filter Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchNama = doa.nama.toLowerCase().includes(q)
        const matchIdn = doa.idn.toLowerCase().includes(q)
        const matchGrup = doa.grup.toLowerCase().includes(q)
        const matchTr = doa.tr.toLowerCase().includes(q)
        const matchTentang = doa.tentang && doa.tentang.toLowerCase().includes(q)
        const matchTag = doa.tag && doa.tag.some((t) => t.toLowerCase().includes(q))
        if (!matchNama && !matchIdn && !matchGrup && !matchTr && !matchTentang && !matchTag) {
          return false
        }
      }

      return true
    })
  }, [initialDoas, selectedGrup, selectedTag, searchQuery])

  // Menghasilkan teks status hasil pencarian / filter
  const getFilterSummaryText = () => {
    const totalCount = initialDoas.length
    const currentCount = filteredDoas.length

    if (searchQuery.trim()) {
      return `Menampilkan ${currentCount} dari ${totalCount} doa untuk pencarian "${searchQuery}"`
    }
    if (selectedGrup !== "Semua Kategori") {
      return `Menampilkan ${currentCount} dari ${totalCount} doa dalam kategori "${selectedGrup}"`
    }
    if (selectedTag !== "Semua Tag") {
      return `Menampilkan ${currentCount} dari ${totalCount} doa dengan tag "${selectedTag}"`
    }
    return `Menampilkan ${currentCount} dari ${totalCount} doa`
  }

  const handleOpenReader = (doa: DoaItem) => {
    setActiveDoa(doa)
  }

  const handleCloseReader = () => {
    setActiveDoa(null)
    // Hapus id dari URL jika ada
    if (searchParams.get("id")) {
      router.replace("/doa", { scroll: false })
    }
  }

  const handleShareCard = async (doa: DoaItem) => {
    const shareText = `*${doa.nama}*\n\n${doa.ar}\n\n"${doa.idn}"\n\n📖 ${doa.tentang || "Hisnul Muslim"}`
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: doa.nama,
          text: shareText,
          url: `${window.location.origin}/doa?id=${doa.id}`,
        })
      } catch {
        // user dismiss
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `${shareText}\n\n(Dikutip dari ALMAKTABA - Ensiklopedia Islam)`
        )
        showToast("✓ Tautan dan teks doa berhasil disalin ke clipboard!")
      } catch {
        showToast("Gagal menyalin teks doa")
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <section className="text-center space-y-4 pt-2">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-sans">
          Kumpulan Doa Harian
        </h1>
        <p className="mx-auto max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-300/85">
          Kumpulan doa-doa harian dalam Islam lengkap dengan teks Arab, transliterasi, dan terjemahan bahasa Indonesia
        </p>

        {/* Pill Badges: 227 Doa & 44 Kategori */}
        <div className="flex items-center justify-center gap-2.5 pt-1">
          <span className="inline-flex items-center rounded-full bg-[#16202c] px-4 py-1 text-xs font-semibold text-slate-200 border border-slate-700/50 shadow-sm">
            {initialDoas.length} Doa
          </span>
          <span className="inline-flex items-center rounded-full bg-[#16202c] px-4 py-1 text-xs font-semibold text-slate-200 border border-slate-700/50 shadow-sm">
            {kategoriList.length} Kategori
          </span>
        </div>
      </section>

      {/* 2. Search & Filters Bar */}
      <section className="mx-auto max-w-3xl space-y-3">
        {/* Search Input Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari doa berdasarkan nama, isi, atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-[#08121f]/90 px-4 py-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 shadow-inner outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-bold text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns Row (Kategori & Tag) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Dropdown Kategori */}
          <div className="relative">
            <select
              value={selectedGrup}
              onChange={(e) => setSelectedGrup(e.target.value)}
              className={`w-full appearance-none rounded-xl border bg-[#081422] px-4 py-3 text-xs sm:text-sm font-medium text-slate-200 outline-none transition cursor-pointer pr-10 shadow-sm ${
                selectedGrup !== "Semua Kategori"
                  ? "border-emerald-500/80 ring-1 ring-emerald-500/30 text-emerald-300"
                  : "border-slate-800 focus:border-emerald-500"
              }`}
            >
              <option value="Semua Kategori" className="bg-[#081422] text-slate-200">
                Semua Kategori
              </option>
              {kategoriList.map((grup) => (
                <option key={grup} value={grup} className="bg-[#081422] text-slate-200">
                  {grup}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Dropdown Tag */}
          <div className="relative">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className={`w-full appearance-none rounded-xl border bg-[#081422] px-4 py-3 text-xs sm:text-sm font-medium text-slate-200 outline-none transition cursor-pointer pr-10 shadow-sm ${
                selectedTag !== "Semua Tag"
                  ? "border-emerald-500/80 ring-1 ring-emerald-500/30 text-emerald-300"
                  : "border-slate-800 focus:border-emerald-500"
              }`}
            >
              <option value="Semua Tag" className="bg-[#081422] text-slate-200">
                Semua Tag
              </option>
              {tagList.map((tag) => (
                <option key={tag} value={tag} className="bg-[#081422] text-slate-200">
                  {tag}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Status Count Text */}
        <div className="pt-2 text-center">
          <p className="text-xs sm:text-sm font-medium text-slate-400">
            {getFilterSummaryText()}
          </p>
        </div>
      </section>

      {/* 3. Doa Cards Grid (2 Columns Responsive) */}
      {filteredDoas.length === 0 ? (
        <div className="mx-auto max-w-lg rounded-3xl border border-emerald-900/40 bg-[#06181b]/60 p-10 text-center space-y-4 shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-950/80 border border-emerald-800/60 text-2xl text-amber-400">
            🔍
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Doa Tidak Ditemukan</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Tidak ada doa yang cocok dengan kriteria filter atau kata kunci Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("")
              setSelectedGrup("Semua Kategori")
              setSelectedTag("Semua Tag")
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition cursor-pointer"
          >
            <span>↺</span>
            <span>Reset Semua Filter</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDoas.map((doa) => (
            <DoaCard
              key={doa.id}
              doa={doa}
              onOpenReader={handleOpenReader}
              onShare={handleShareCard}
            />
          ))}
        </div>
      )}

      {/* 4. Interactive Reader Modal */}
      {activeDoa && (
        <DoaModal
          doa={activeDoa}
          doaList={filteredDoas.length > 0 ? filteredDoas : initialDoas}
          onClose={handleCloseReader}
          onSelectDoa={setActiveDoa}
          onShowToast={showToast}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/60 bg-[#051c17] px-4 py-3 text-sm font-semibold text-emerald-100 shadow-2xl backdrop-blur">
          <span className="text-amber-400 font-bold">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

export default function DaftarDoa({ initialDoas }: DaftarDoaProps) {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-slate-400">
          Memuat Kumpulan Doa Harian...
        </div>
      }
    >
      <DaftarDoaContent initialDoas={initialDoas} />
    </Suspense>
  )
}
