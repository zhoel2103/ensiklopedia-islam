"use client"

export type RiwayatCategory = "tafsir" | "hadis" | "kitab" | "doa" | "tanya-ai" | "beranda"

export type RiwayatItem = {
  id: string
  kategori: RiwayatCategory
  judul: string
  subjudul?: string
  ringkasan?: string
  url: string
  createdAt: number
  formattedTime: string
}

const STORAGE_KEY = "ensiklopedia_islam_riwayat_v1"

function formatDateTime(date: Date): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ]
  const d = date.getDate()
  const m = months[date.getMonth()]
  const y = date.getFullYear()
  const hh = String(date.getHours()).padStart(2, "0")
  const mm = String(date.getMinutes()).padStart(2, "0")
  return `${d} ${m} ${y}, ${hh}:${mm} WIB`
}

/**
 * Get all saved riwayat items from localStorage
 */
export function getRiwayatList(): RiwayatItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    }
    return []
  } catch {
    return []
  }
}

/**
 * Save or update a riwayat item
 */
export function simpanKeRiwayat(
  item: Omit<RiwayatItem, "createdAt" | "formattedTime">,
): boolean {
  if (typeof window === "undefined") return false
  try {
    const current = getRiwayatList()
    const now = new Date()
    const newItem: RiwayatItem = {
      ...item,
      createdAt: now.getTime(),
      formattedTime: formatDateTime(now),
    }

    // Remove existing item with same ID if any, and prepend new one
    const filtered = current.filter((r) => r.id !== item.id)
    const updated = [newItem, ...filtered].slice(0, 100) // Keep max 100 items

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event("riwayat-updated"))
    return true
  } catch {
    return false
  }
}

/**
 * Delete a specific riwayat item by ID
 */
export function hapusRiwayatItem(id: string): void {
  if (typeof window === "undefined") return
  try {
    const current = getRiwayatList()
    const updated = current.filter((r) => r.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event("riwayat-updated"))
  } catch {
    // ignore
  }
}

/**
 * Clear all saved riwayat items
 */
export function bersihkanSemuaRiwayat(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event("riwayat-updated"))
  } catch {
    // ignore
  }
}

/**
 * Check if a specific ID is already saved in riwayat
 */
export function isItemInRiwayat(id: string): boolean {
  if (typeof window === "undefined") return false
  const list = getRiwayatList()
  return list.some((r) => r.id === id)
}
