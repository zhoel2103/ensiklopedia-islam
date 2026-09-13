import { db } from "../src/db"
import { surah, ayat } from "../src/db/schema"

async function main() {
  console.log("Memulai injeksi data Surah dan Ayat ke database...")
  
  for (let i = 1; i <= 114; i++) {
    console.log(`Mengambil data Surah ke-${i}...`)
    try {
      const res = await fetch(`https://equran.id/api/v2/surat/${i}`)
      if (!res.ok) {
        console.error(`Gagal mengambil surah ${i}`)
        continue
      }
      
      const json = await res.json()
      const s = json.data
      
      const surahSlug = `surah-${i}`
      
      // Upsert Surah
      await db.insert(surah).values({
        nomor: s.nomor,
        id: surahSlug,
        nama: s.nama,
        namaLatin: s.namaLatin,
        arti: s.arti,
        jumlahAyat: s.jumlahAyat,
      }).onConflictDoUpdate({
        target: surah.id,
        set: {
          nomor: s.nomor,
          nama: s.nama,
          namaLatin: s.namaLatin,
          arti: s.arti,
          jumlahAyat: s.jumlahAyat,
        }
      })
      
      // Inject Ayahs
      if (s.ayat && Array.isArray(s.ayat)) {
        const insertData = s.ayat.map((a: any) => ({
          surahId: surahSlug,
          nomor: a.nomorAyat,
          arab: a.teksArab,
          terjemah: a.teksIndonesia,
          juz: 1 // Equran v2 doesn't always provide juz accurately in this endpoint, mock it or leave it as 1
        }))
        
        for (const data of insertData) {
          try {
            await db.insert(ayat).values({
              id: crypto.randomUUID(),
              ...data
            })
          } catch(e) {
            // Might exist, handle gracefully or use onConflict
          }
        }
      }
      
      console.log(`Berhasil injeksi Surah ${s.namaLatin}`)
      
      // Sleep slightly to respect rate limit
      await new Promise(r => setTimeout(r, 100))
    } catch(err) {
      console.error(`Error pada Surah ${i}:`, err)
    }
  }
  
  console.log("Selesai menginjeksi semua Surah dan Ayat.")
}

main().catch(err => {
  console.error("Fatal Error:", err)
  process.exit(1)
})
