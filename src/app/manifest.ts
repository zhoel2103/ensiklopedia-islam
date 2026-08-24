import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "ALMAKTABA — Ensiklopedia Islam",
    short_name: "ALMAKTABA",
    description:
      "Satu tempat untuk membaca Tafsir Al-Qur'an, Hadis beserta Syarah, Kitab Ulama Klasik, dan Kumpulan Doa Harian offline gratis.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#041310",
    theme_color: "#061e1a",
    lang: "id",
    categories: ["books", "education", "reference"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Tafsir Al-Qur'an",
        url: "/tafsir",
      },
      {
        name: "Hadis & Syarah",
        url: "/hadis",
      },
      {
        name: "Kitab Ulama",
        url: "/kitab",
      },
      {
        name: "Kumpulan Doa",
        url: "/doa",
      },
    ],
  }
}
