import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "almaktaba.id — Ensiklopedia Islam",
    short_name: "almaktaba.id",
    description: "Tempat membaca dan mencari Tafsir Al-Qur'an, Hadis beserta Syarah, dan Kitab Ulama Klasik gratis tanpa berbayar.",
    start_url: "/",
    display: "standalone",
    background_color: "#041310",
    theme_color: "#061e1a",
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
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
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
