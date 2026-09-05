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
      <body className="min-h-full flex flex-col bg-[#fcf9f8] text-[#1c1b1b]">
        <header className="bg-[#003311] text-white sticky top-0 z-50 shadow-md">
          {/* Top Utility Bar */}
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-1.5 border-b border-white/10">
             <div className="flex justify-between items-center text-[10px] font-sans font-medium text-white/70 uppercase tracking-widest">
               <span className="flex items-center gap-2">
                 <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d8561c] animate-pulse"></span>
                 {formattedDate}
               </span>
               <div className="flex items-center space-x-4">
                 <span className="hidden sm:inline text-white/40">Portal de Notícias</span>
                 <Link href="/admin" className="text-white hover:text-[#d8561c] font-bold transition-colors">
                   Painel da Redação →
                 </Link>
               </div>
             </div>
          </div>

          {/* Main Brand & Navigation */}
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
            <div className="flex items-baseline space-x-3">
              <Link 
                href="/" 
                className="font-serif-title font-normal text-[32px] md:text-[36px] tracking-tight text-white lowercase leading-none hover:opacity-95 transition-opacity"
              >
                tagma
              </Link>
              <span className="text-[9px] uppercase tracking-[0.25em] text-white/50 font-sans hidden sm:inline">
                Jornalismo Independente
              </span>
            </div>

            <nav className="flex items-center space-x-5 md:space-x-7 text-[11px] font-sans font-bold uppercase tracking-[0.14em] overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <Link href="/politica" className="hover:text-[#d8561c] transition-colors border-b-2 border-transparent hover:border-[#d8561c] pb-0.5">Política</Link>
              <Link href="/economia" className="hover:text-[#d8561c] transition-colors border-b-2 border-transparent hover:border-[#d8561c] pb-0.5">Economia</Link>
              <Link href="/internacional" className="hover:text-[#d8561c] transition-colors border-b-2 border-transparent hover:border-[#d8561c] pb-0.5">Internacional</Link>
              <Link href="/esportes" className="hover:text-[#d8561c] transition-colors border-b-2 border-transparent hover:border-[#d8561c] pb-0.5">Esportes</Link>
              <Link href="/cultura" className="hover:text-[#d8561c] transition-colors border-b-2 border-transparent hover:border-[#d8561c] pb-0.5">Cultura</Link>
              <Link href="/tecnologia" className="hover:text-[#d8561c] transition-colors border-b-2 border-transparent hover:border-[#d8561c] pb-0.5">Tecnologia</Link>
            </nav>
          </div>
        </header>

        {children}

        {/* Footer */}
        <footer className="bg-[#001c06] text-white mt-auto border-t-4 border-[#003311]">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/10 pb-8">
              <div className="flex items-baseline space-x-3">
                <span className="font-serif-title text-3xl lowercase font-normal tracking-tight">tagma</span>
                <span className="text-[10px] uppercase tracking-widest text-white/50 font-sans">Informação em tempo real</span>
              </div>
              <div className="flex space-x-6 text-xs font-sans font-bold uppercase tracking-wider text-white/70">
                <Link href="/politica" className="hover:text-white">Política</Link>
                <Link href="/economia" className="hover:text-white">Economia</Link>
                <Link href="/internacional" className="hover:text-white">Internacional</Link>
                <Link href="/admin" className="hover:text-[#d8561c]">Área Editorial</Link>
              </div>
            </div>
            <div className="pt-6 text-center text-[10px] uppercase tracking-[0.2em] text-white/40 font-sans">
              © {new Date().getFullYear()} TAGMA NEWS • TODOS OS DIREITOS RESERVADOS
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

