"use client"

import { useEffect, useState } from "react"

export default function PWAProvider() {
  const [isOffline, setIsOffline] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    // 1. Inisialisasi status koneksi awal
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine)
    }

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // 2. Registrasi Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Cek update service worker jika ada
          registration.onupdatefound = () => {
            const installingWorker = registration.installing
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (
                  installingWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // Cache baru terinstall
                  console.log("[PWA] Update konten baru tersedia.")
                }
              }
            }
          }
        })
        .catch((err) => {
          console.warn("[PWA] Registrasi Service Worker gagal:", err)
        })
    }

    // 3. Tangkap event installasi PWA
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      // Tampilkan banner installasi jika belum pernah di-dismiss dalam sesi ini
      const isDismissed = sessionStorage.getItem("pwa_install_dismissed")
      if (!isDismissed) {
        setShowInstallBanner(true)
      }
    }

    const handleAppInstalled = () => {
      setInstallPrompt(null)
      setShowInstallBanner(false)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === "accepted") {
      setShowInstallBanner(false)
    }
    setInstallPrompt(null)
  }

  const handleDismissBanner = () => {
    setShowInstallBanner(false)
    sessionStorage.setItem("pwa_install_dismissed", "true")
  }

  return (
    <>
      {/* A. Offline Banner Notifier */}
      {isOffline && (
        <aside
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="fixed top-14 left-0 right-0 z-40 flex items-center justify-center bg-amber-500/95 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-top"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">📡</span>
            <span>Mode Offline Aktif — Anda tetap dapat membaca data yang tersimpan di perangkat.</span>
          </div>
        </aside>
      )}

      {/* B. Floating Install App Banner */}
      {showInstallBanner && installPrompt && (
        <aside
          role="region"
          aria-label="Pemasangan Aplikasi PWA"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 rounded-2xl border border-amber-400/50 bg-[#051c17]/95 p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-950 text-xl font-bold shadow-md">
                📱
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-white">
                  Pasang Aplikasi ALMAKTABA
                </h2>
                <p className="text-[11px] sm:text-xs text-emerald-200/80 leading-tight mt-0.5">
                  Buka lebih cepat, hemat kuota &amp; siap diakses offline kapan saja.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismissBanner}
              title="Tutup banner"
              className="text-emerald-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t border-emerald-800/40">
            <button
              type="button"
              onClick={handleDismissBanner}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:text-white transition cursor-pointer"
            >
              Nanti Saja
            </button>
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#e5a93c] px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-md transition hover:bg-amber-400 active:scale-95 cursor-pointer"
            >
              <span>⚡</span>
              <span>Install Sekarang</span>
            </button>
          </div>
        </aside>
      )}
    </>
  )
}
