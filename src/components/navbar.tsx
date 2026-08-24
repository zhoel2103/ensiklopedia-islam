"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { menuUtama } from "@/lib/mock-data"
import { getRiwayatList } from "@/lib/riwayat-storage"

export default function Navbar() {
  const pathname = usePathname()
  const [riwayatCount, setRiwayatCount] = useState(0)

  useEffect(() => {
    const updateCount = () => {
      const list = getRiwayatList()
      setRiwayatCount(list.length)
    }

    updateCount()
    window.addEventListener("riwayat-updated", updateCount)
    window.addEventListener("storage", updateCount)

    return () => {
      window.removeEventListener("riwayat-updated", updateCount)
      window.removeEventListener("storage", updateCount)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-800/40 bg-[#061e1a]/95 backdrop-blur-md shadow-lg">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
        >
          {/* Logo Application */}
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-700/60 bg-[#041411] shadow-md transition group-hover:border-amber-400/80 group-hover:scale-105">
            <Image
              src="/icon.png"
              alt="Logo ALMAKTABA"
              width={36}
              height={36}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          {/* Symmetrical Brand Title & Sub-Title */}
          <div className="flex flex-col justify-center">
            <span className="font-sans text-[13px] sm:text-[14px] font-black uppercase tracking-[0.22em] text-white leading-tight transition group-hover:text-emerald-100">
              ALMAKTABA
            </span>
            <span className="font-serif text-[10.5px] sm:text-[11.5px] font-bold tracking-[0.02em] text-[#e5a93c] leading-tight transition group-hover:text-amber-300">
              Ensiklopedia Islam
            </span>
          </div>
        </Link>

        <ul className="flex items-center gap-1.5 overflow-x-auto py-1">
          {menuUtama.map((item) => {
            const active =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"))
            const isRiwayat = item.href === "/riwayat"

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    active
                      ? "bg-[#e5a93c] text-slate-950 shadow-md font-bold"
                      : "text-emerald-300/80 hover:bg-[#092822] hover:text-white"
                  }`}
                >
                  <span>{item.title}</span>
                  {isRiwayat && riwayatCount > 0 && (
                    <span
                      className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                        active
                          ? "bg-slate-950 text-amber-300"
                          : "bg-amber-400 text-slate-950"
                      }`}
                    >
                      {riwayatCount}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
