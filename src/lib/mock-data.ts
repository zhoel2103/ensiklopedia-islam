export type MenuLink = {
  href: string
  title: string
  description: string
  icon: "quran" | "hadis" | "kitab" | "doa" | "search" | "ai" | "riwayat" | "info"
}

export const menuUtama: MenuLink[] = [
  {
    href: "/tafsir",
    title: "Tafsir",
    description: "Baca ayat dan tafsirnya per surah dan per ayat.",
    icon: "quran",
  },
  {
    href: "/hadis",
    title: "Hadist",
    description: "Kumpulan hadis lengkap dengan takhrij dan syarah.",
    icon: "hadis",
  },
  {
    href: "/kitab",
    title: "Kitab",
    description: "Kitab klasik karya ulama dengan navigasi antarbab.",
    icon: "kitab",
  },
  {
    href: "/doa",
    title: "Doa",
    description: "Kumpulan 227 doa harian Islam lengkap dengan Arab, latin, dan terjemahan.",
    icon: "doa",
  },
  {
    href: "/tanya-ai",
    title: "Tanya AI",
    description: "Tanya jawab seputar Islam dengan rujukan pustaka.",
    icon: "ai",
  },
  {
    href: "/riwayat",
    title: "Riwayat",
    description: "Catatan bacaan tafsir, hadis, kitab, dan konsultasi AI yang Anda simpan.",
    icon: "riwayat",
  },
  {
    href: "/tentang",
    title: "Tentang",
    description: "Tentang almaktaba.id, rujukan ahmadsanusi.com, dan panduan instalasi aplikasi.",
    icon: "info",
  },
]

export type KontenPilihan = {
  kind: "ayat" | "hadis" | "kitab"
  arabic: string
  translation: string
  source: string
}

export const kontenPilihanList: KontenPilihan[] = [
  {
    kind: "ayat",
    arabic:
      "ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",
    translation:
      "(Yaitu) orang-orang yang beriman dan hati mereka menjadi tenteram dengan mengingat Allah. Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.",
    source: "QS. Ar-Ra'd: 28",
  },
  {
    kind: "hadis",
    arabic:
      "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    translation:
      "Sesungguhnya segala amalan itu tergantung pada niatnya, dan bagi setiap orang apa yang ia niatkan.",
    source: "Shahih Bukhari 1, Shahih Muslim 1907",
  },
  {
    kind: "kitab",
    arabic:
      "وَاعْلَمْ أَنَّ النَّصْرَ مَعَ الصَّبْرِ، وَالْفَرَجَ مَعَ الْكَرْبِ",
    translation:
      "Ketahuilah bahwa kemenangan bersama kesabaran, dan kelapangan bersama kesempitan.",
    source: "Kitab Hilyatul Awliya' (Al-Hafizh Abu Nu'aim)",
  },
]

export type LanjutanBaca = {
  href: string
  title: string
  subtitle: string
  progress: number
}

export const lanjutkanMembaca: LanjutanBaca[] = [
  {
    href: "/tafsir/al-baqarah",
    title: "Surah Al-Baqarah",
    subtitle: "Ayat 255 — Ayat Kursi",
    progress: 62,
  },
  {
    href: "/kitab/riyadhush-shalihin",
    title: "Riyadhush Shalihin",
    subtitle: "Bab 1 — Kitab Tauhid",
    progress: 20,
  },
  {
    href: "/hadis/bukhari",
    title: "Shahih Bukhari",
    subtitle: "Hadis 1 — Wahyu",
    progress: 8,
  },
]
