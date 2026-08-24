import localDoaData from "@/data/doa-data.json"

export type DoaItem = {
  id: number
  grup: string
  nama: string
  ar: string
  tr: string
  idn: string
  tentang: string
  tag: string[]
}

const EQURAN_DOA_API = "https://equran.id/api/doa"

/**
 * Mengambil daftar lengkap 227 doa harian dari API equran.id
 * Dilengkapi dengan fallback dataset lokal agar selalu andal dan cepat.
 */
export async function getDaftarDoa(): Promise<DoaItem[]> {
  try {
    const res = await fetch(EQURAN_DOA_API, {
      next: { revalidate: 86400 }, // Cache selama 24 jam di Next.js ISR
    })

    if (!res.ok) {
      return localDoaData as DoaItem[]
    }

    const json = await res.json()
    if (json && Array.isArray(json.data) && json.data.length > 0) {
      return json.data as DoaItem[]
    }

    return localDoaData as DoaItem[]
  } catch {
    // Fallback ke data lokal jika koneksi gagal atau offline
    return localDoaData as DoaItem[]
  }
}

/**
 * Mengambil satu doa berdasarkan ID
 */
export async function getDoaById(id: number): Promise<DoaItem | null> {
  const list = await getDaftarDoa()
  return list.find((item) => item.id === id) || null
}

/**
 * Mengambil daftar unik seluruh kategori/grup doa
 */
export function getKategoriList(doas: DoaItem[]): string[] {
  const groups = new Set<string>()
  for (const d of doas) {
    if (d.grup) {
      groups.add(d.grup.trim())
    }
  }
  return Array.from(groups)
}

/**
 * Mengambil daftar unik seluruh tag doa
 */
export function getTagList(doas: DoaItem[]): string[] {
  const tags = new Set<string>()
  for (const d of doas) {
    if (Array.isArray(d.tag)) {
      for (const t of d.tag) {
        if (t && t.trim()) {
          tags.add(t.trim().toLowerCase())
        }
      }
    }
  }
  return Array.from(tags).sort()
}
