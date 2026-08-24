"use client"

import { type DoaItem } from "@/lib/doa-api"

interface DoaCardProps {
  doa: DoaItem
  onOpenReader: (doa: DoaItem) => void
  onShare: (doa: DoaItem) => void
}

/**
 * Format string sumber/hadis agar ringkas dan rapi untuk preview pada kartu
 */
function formatPreviewTentang(tentang: string): string {
  if (!tentang) return "Doa harian shahih"
  // Bersihkan teks jika ada newline panjang
  const lines = tentang
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
  
  if (lines.length === 0) return tentang
  // Ambil baris pertama atau gabungkan baris sumber
  return lines.slice(0, 3).join(". ")
}

export default function DoaCard({ doa, onOpenReader, onShare }: DoaCardProps) {
  const previewTentang = formatPreviewTentang(doa.tentang)

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-emerald-900/40 bg-[#06181b]/90 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/60 hover:bg-[#082226]/95 hover:shadow-2xl">
      {/* Top Header Card */}
      <div className="border-b border-emerald-950/80 bg-[#041215]/80 p-5 space-y-2.5">
        <h3 className="text-lg font-bold text-emerald-400 transition group-hover:text-emerald-300">
          {doa.nama}
        </h3>
        
        {doa.grup && (
          <div>
            <span className="inline-flex items-center rounded-full border border-emerald-700/60 bg-emerald-950/60 px-3 py-0.5 text-xs font-semibold text-emerald-300">
              {doa.grup}
            </span>
          </div>
        )}
      </div>

      {/* Body Card */}
      <div className="flex-1 p-5 space-y-4">
        {/* Source / Hadis Text */}
        <p className="text-xs leading-relaxed text-slate-300/85 line-clamp-3">
          {previewTentang}
        </p>

        {/* Tag Pills */}
        {doa.tag && doa.tag.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {doa.tag.map((t, idx) => (
              <span
                key={idx}
                className="rounded-full bg-[#152332] px-2.5 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700/40"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center gap-2 p-5 pt-0">
        <button
          type="button"
          onClick={() => onOpenReader(doa)}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-500 active:scale-95 cursor-pointer"
        >
          <span>📖</span>
          <span>Baca</span>
        </button>

        <button
          type="button"
          onClick={() => onShare(doa)}
          title="Bagikan Doa"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700/60 bg-[#0c1825] text-slate-300 shadow transition hover:bg-[#14263b] hover:text-white active:scale-95 cursor-pointer"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
