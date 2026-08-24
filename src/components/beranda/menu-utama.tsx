import Link from "next/link"
import { menuUtama } from "@/lib/mock-data"

function MenuIcon({ name }: { name: (typeof menuUtama)[number]["icon"] }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  switch (name) {
    case "quran":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 6c-2-1.5-4-1.5-6-1v13c2 .5 4 .5 6 2 2-1.5 4-1.5 6-2V5c-2 .5-4 .5-6 1Z" />
          <path d="M12 6v13" />
        </svg>
      )
    case "hadis":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z" />
        </svg>
      )
    case "kitab":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 4h11a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4Z" />
          <path d="M4 4v14a2 2 0 0 0 2 2h12" />
        </svg>
      )
    case "doa":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      )
    case "search":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      )
    case "ai":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case "riwayat":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      )
    case "info":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      )
  }
}

export default function MenuUtama() {
  return (
    <section aria-labelledby="menu-utama" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="menu-utama" className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-amber-400">❖</span>
          <span>Fitur & Pustaka Utama</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {menuUtama.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-emerald-800/40 bg-[#061e1a] p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-[#082621] hover:shadow-xl"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-[#0c2b23] text-amber-400 shadow-md transition group-hover:bg-[#e5a93c] group-hover:text-slate-950 group-hover:scale-105">
                <MenuIcon name={item.icon} />
              </span>
              <div className="space-y-1">
                <span className="block font-bold text-white transition group-hover:text-amber-300">
                  {item.title}
                </span>
                <span className="block text-xs leading-relaxed text-emerald-200/80">
                  {item.description}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-emerald-800/30 pt-3 text-xs font-semibold text-emerald-400 group-hover:text-amber-300">
              <span>Buka Menu</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                ➔
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
