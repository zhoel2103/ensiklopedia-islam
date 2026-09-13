
export type ApiSurah = {
  id: number
  name_id: string
  name_arabic: string
  name_transliteration: string
  translate_id: string
  location: string
  num_ayah: number
}

export type ApiSurahMeta = {
  id: number
  name_arabic: string
  name_id: string
  translate_id: string
  num_ayah: number
}

export type ApiAyat = {
  ayah_number: number
  arabic: string
  translation_id: string
  juz: number
  tafsir_wajiz: string | null
}

type ApiAyatBase = Omit<ApiAyat, "tafsir_wajiz">

export type ApiTafsir = {
  wajiz?: string | null
  tahlili?: string | null
  jalalayn?: string | null
  quraish?: string | null
}

async function apiGet<T>(path: string): Promise<T | null> {
  const apiKey = process.env.AHMAD_SANUSI_API_KEY
  const baseUrl = process.env.AHMAD_SANUSI_API_URL ?? "https://api.ahmadsanusi.com/v1"
  
  if (!apiKey) return null
  
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { "X-API-Key": apiKey },
      cache: "no-store",
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data?: T | null }
    return json.data ?? null
  } catch {
    return null
  }
}

export function isApiConfigured(): boolean {
  return Boolean(process.env.AHMAD_SANUSI_API_KEY)
}

export async function fetchSurahList(): Promise<ApiSurah[] | null> {
  return apiGet<ApiSurah[]>("/quran/surah")
}

export async function fetchSurahMeta(
  nomor: number,
): Promise<ApiSurahMeta | null> {
  return apiGet<ApiSurahMeta>(`/quran/surah/${nomor}`)
}

export async function fetchSurahAyat(
  nomor: number,
): Promise<ApiAyat[] | null> {
  const list = await apiGet<ApiAyatBase[]>(`/quran/surah/${nomor}/ayat`)
  if (!list) return null

  const result: ApiAyat[] = []
  for (const a of list) {
    const t = await apiGet<ApiTafsir>(
      `/quran/surah/${nomor}/ayat/${a.ayah_number}/tafsir`,
    )
    result.push({
      ...a,
      tafsir_wajiz: t?.wajiz ?? null,
    })
  }
  return result
}

export async function fetchTafsir(surah: number, ayat: number): Promise<ApiTafsir | null> {
  return apiGet<ApiTafsir>(`/quran/surah/${surah}/ayat/${ayat}/tafsir`)
}

export type ApiHadisKitab = {
  slug: string
  nama: string
  jumlah: number
}

export type ApiHadisDetail = {
  nomor: number
  kitab: string
  arab: string
  terjemah: string
  has_terjemah: boolean
}

export async function fetchHadisKitabList(): Promise<ApiHadisKitab[] | null> {
  const json = await apiGet<{ kitab: ApiHadisKitab[] }>("/hadits")
  return json?.kitab ?? null
}

export async function fetchHadisDetail(
  slug: string,
  nomor: number,
): Promise<ApiHadisDetail | null> {
  return apiGet<ApiHadisDetail>(`/hadits/${slug}/${nomor}`)
}

export type ApiKitab = {
  id: number
  slug: string
  nama: string
  nama_arab: string
  pengarang: string
  pengarang_arab: string
  tahun_lahir: string
  tahun_wafat: string
  mazhab: string
  kategori: string
  bahasa: string
  fitur: string
  deskripsi: string
  catatan: string
  total_bab: number
}

export type ApiKitabBab = {
  id: number
  nomor: number
  judul: string
  judul_arab: string | null
  bagian: string | null
  keterangan: string | null
  file: string
  section_id: number | null
  urutan: number
}

export type ApiKitabDetail = {
  kitab: ApiKitab
  total: number
  bab: ApiKitabBab[]
}

export async function fetchKitabList(): Promise<ApiKitab[] | null> {
  const json = await apiGet<{ kitab: ApiKitab[] }>("/kitab")
  return json?.kitab ?? null
}

export async function fetchKitabDetail(
  slug: string,
): Promise<ApiKitabDetail | null> {
  const first = await apiGet<ApiKitabDetail>(
    `/kitab/${slug}?page=1&limit=100`,
  )
  if (!first) return null
  const bab = [...(first.bab ?? [])]
  const total = first.total ?? 0
  const pages = Math.ceil(total / 100)
  for (let p = 2; p <= pages; p++) {
    const pg = await apiGet<ApiKitabDetail>(
      `/kitab/${slug}?page=${p}&limit=100`,
    )
    if (pg?.bab) bab.push(...pg.bab)
  }
  return { ...first, bab }
}
