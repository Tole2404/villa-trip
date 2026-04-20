import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PWAHandler } from "@/components/PWAHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Villa Trip Manager 😼",
  description: "Kelola anggota, DP, dan pembayaran untuk acara villa Maganghub Family Gathering",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    title: "Villa Trip Manager 😼",
    description: "Cek progres pembayaran dan pengeluaran trip villa kita di sini!",
    images: [{ url: "/logo.png" }],
    type: 'website'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col transition-colors duration-200" suppressHydrationWarning>
        <ThemeProvider>
          <PWAHandler />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
