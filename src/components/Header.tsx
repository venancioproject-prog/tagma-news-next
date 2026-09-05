'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

  const mainCategories = [
    { name: 'Política', href: '/politica' },
    { name: 'Economia', href: '/economia' },
    { name: 'Internacional', href: '/internacional' },
    { name: 'Esportes', href: '/esportes' },
    { name: 'Cultura', href: '/cultura' },
    { name: 'Tecnologia', href: '/tecnologia' },
  ];

  const subLinks = [
    { name: 'Últimas', href: '/ultimas' },
    { name: 'Ao Vivo', href: '/ao-vivo', badge: 'LIVE' },
    { name: 'Vídeos', href: '/videos' },
    { name: 'Áudios', href: '/audios' },
    { name: 'Newsletter', href: '/newsletter' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/busca?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Skip to Content Link (WCAG 2.2 AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-[#d8561c] focus:text-white focus:px-4 focus:py-2 focus:rounded focus:font-bold focus:shadow-lg focus:outline-none"
      >
        Pular para o conteúdo principal
      </a>

      <header className="bg-[#003311] text-white sticky top-0 z-50 shadow-md">
        {/* Top Utility Bar */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-1.5 border-b border-white/10">
          <div className="flex justify-between items-center text-[10px] font-sans font-medium text-white/70 uppercase tracking-widest">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d8561c] animate-pulse"></span>
                {formattedDate}
              </span>
              <span className="hidden md:inline text-white/30">•</span>
              <Link
                href="/ao-vivo"
                className="hidden md:inline-flex items-center gap-1.5 text-[#ff8f5a] hover:text-white font-bold transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                Ao Vivo
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/newsletter" className="hidden sm:inline text-white/70 hover:text-white transition-colors">
                Newsletters
              </Link>
              <span className="hidden sm:inline text-white/30">•</span>
              <Link href="/admin" className="text-white hover:text-[#d8561c] font-bold transition-colors">
                Painel da Redação →
              </Link>
            </div>
          </div>
        </div>

        {/* Main Brand & Primary Navigation */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-baseline space-x-3">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-1.5 -ml-1 text-white hover:text-[#d8561c] focus:outline-none focus:ring-2 focus:ring-[#d8561c] rounded"
              aria-label={menuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              aria-expanded={menuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

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

          {/* Desktop Category Navigation */}
          <nav
            aria-label="Navegação Principal"
            className="hidden lg:flex items-center space-x-6 text-[11px] font-sans font-bold uppercase tracking-[0.14em]"
          >
            {mainCategories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="hover:text-[#d8561c] transition-colors border-b-2 border-transparent hover:border-[#d8561c] pb-0.5"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Search & Media Actions */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#d8561c]"
              aria-label="Abrir barra de busca"
              aria-expanded={searchOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <Link
              href="/ultimas"
              className="hidden md:inline-flex items-center px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Últimas
            </Link>
          </div>
        </div>

        {/* Sub-bar for Formats (Últimas, Ao Vivo, Vídeos, Áudios, Newsletter) */}
        <div className="hidden lg:block bg-[#00220a] border-t border-white/5 py-1.5 px-4 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-sans font-bold uppercase tracking-wider text-white/70">
            <div className="flex items-center space-x-6">
              {subLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  {item.name}
                  {item.badge && (
                    <span className="bg-red-600 text-white px-1.5 py-0.2 rounded text-[8px] font-black animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4 text-white/50 text-[10px]">
              <Link href="/sobre" className="hover:text-white">Sobre</Link>
              <span>•</span>
              <Link href="/contato" className="hover:text-white">Contato</Link>
            </div>
          </div>
        </div>

        {/* Expandable Search Drawer */}
        {searchOpen && (
          <div className="bg-[#001c06] border-t-2 border-[#d8561c] px-4 lg:px-8 py-4 shadow-xl">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <input
                    type="search"
                    name="q"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar notícias, matérias, análises e temas..."
                    className="w-full bg-white text-gray-900 px-4 py-2.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#d8561c]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#d8561c] hover:bg-[#b04313] text-white px-6 py-2.5 rounded font-bold uppercase text-xs tracking-wider transition-colors"
                >
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2.5 text-white/60 hover:text-white text-sm"
                  aria-label="Fechar busca"
                >
                  ✕
                </button>
              </form>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/60">
                <span>Temas quentes:</span>
                <Link href="/busca?q=Copom" className="text-white hover:underline">#Copom</Link>
                <Link href="/busca?q=Congresso" className="text-white hover:underline">#Congresso</Link>
                <Link href="/busca?q=Loterias" className="text-white hover:underline">#Loterias</Link>
                <Link href="/busca?q=Mercado" className="text-white hover:underline">#Mercado</Link>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="lg:hidden bg-[#001c06] border-t border-white/10 px-6 py-6 space-y-6 shadow-2xl">
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#d8561c] block">
                Editorias Principais
              </span>
              <div className="grid grid-cols-2 gap-3 text-sm font-bold uppercase tracking-wider">
                {mainCategories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="py-2 px-3 bg-white/5 hover:bg-white/10 rounded text-white"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#d8561c] block">
                Canais & Formatos
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                {subLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="py-1.5 text-white/80 hover:text-white flex items-center gap-1.5"
                  >
                    {item.name}
                    {item.badge && (
                      <span className="bg-red-600 text-white px-1 py-0.2 rounded text-[7px] font-black">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-white/60">
              <Link href="/sobre" className="hover:text-white">Quem Somos</Link>
              <Link href="/contato" className="hover:text-white">Fale Conosco</Link>
              <Link href="/privacidade" className="hover:text-white">Privacidade</Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
