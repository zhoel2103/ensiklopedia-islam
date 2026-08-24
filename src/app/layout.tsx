import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Amiri, Cinzel } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import PWAProvider from "@/components/pwa-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  weight: ["400", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#061e1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "ALMAKTABA — Ensiklopedia Islam",
  description:
    "Satu tempat untuk membaca tafsir Al-Qur'an, hadis beserta syarah, kitab ulama klasik, dan kumpulan doa harian offline.",
  manifest: "/manifest.webmanifest",
  applicationName: "ALMAKTABA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ALMAKTABA",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#041310] text-emerald-100 selection:bg-amber-500 selection:text-black">
        <PWAProvider />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
