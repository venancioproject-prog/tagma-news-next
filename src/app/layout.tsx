import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import Link from 'next/link'

export const metadata: Metadata = {
  title: "Tagma News",
  description: "Portal de Notícias Automatizado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  // Capitalize first letter of weekday
  const formattedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fcf9f8] text-[#1c1b1b] font-serif">
        <header className="bg-[#003311] text-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 border-b border-[#004d1a]">
             <div className="flex justify-between items-center text-[10px] font-sans text-gray-300 uppercase tracking-widest">
               <span>{formattedDate}</span>
               <Link href="/admin" className="hover:text-white">Área do Jornalista</Link>
             </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Link href="/" className="text-4xl font-normal lowercase tracking-tight">
              tagma
            </Link>
            <nav className="flex flex-wrap gap-4 md:space-x-6 text-[11px] font-sans font-bold uppercase tracking-[0.12em]">
              <Link href="/politica" className="hover:text-[#d8561c] transition-colors">Política</Link>
              <Link href="/economia" className="hover:text-[#d8561c] transition-colors">Economia</Link>
              <Link href="/internacional" className="hover:text-[#d8561c] transition-colors">Internacional</Link>
              <Link href="/esportes" className="hover:text-[#d8561c] transition-colors">Esportes</Link>
              <Link href="/cultura" className="hover:text-[#d8561c] transition-colors">Cultura</Link>
              <Link href="/tecnologia" className="hover:text-[#d8561c] transition-colors">Tecnologia</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
