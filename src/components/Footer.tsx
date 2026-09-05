import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#001c06] text-white mt-auto border-t-4 border-[#003311]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
          <div className="flex items-baseline space-x-3">
            <span className="font-serif-title text-3xl lowercase font-normal tracking-tight">tagma</span>
            <span className="text-[10px] uppercase tracking-widest text-white/50 font-sans">
              Jornalismo em tempo real
            </span>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6 text-xs font-sans font-bold uppercase tracking-wider text-white/70">
            <Link href="/politica" className="hover:text-white">Política</Link>
            <Link href="/economia" className="hover:text-white">Economia</Link>
            <Link href="/internacional" className="hover:text-white">Internacional</Link>
            <Link href="/tecnologia" className="hover:text-white">Tecnologia</Link>
            <Link href="/esportes" className="hover:text-white">Esportes</Link>
            <Link href="/cultura" className="hover:text-white">Cultura</Link>
            <Link href="/ultimas" className="hover:text-white">Últimas</Link>
            <Link href="/ao-vivo" className="hover:text-[#d8561c]">Ao Vivo</Link>
          </div>
        </div>

        {/* Links Institucionais e Governança */}
        <div className="py-6 border-b border-white/10 flex flex-wrap gap-x-6 gap-y-2 justify-center text-xs font-sans text-white/60">
          <Link href="/sobre" className="hover:text-white transition-colors">Quem Somos</Link>
          <span>•</span>
          <Link href="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
          <span>•</span>
          <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
          <span>•</span>
          <Link href="/contato" className="hover:text-white transition-colors">Fale Conosco / Contato</Link>
          <span>•</span>
          <Link href="/newsletter" className="hover:text-white transition-colors">Newsletters</Link>
          <span>•</span>
          <Link href="/feed.xml" className="hover:text-white transition-colors">Feed RSS</Link>
          <span>•</span>
          <Link href="/admin" className="hover:text-[#d8561c] transition-colors">Área da Redação</Link>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-sans">
          <span>© {new Date().getFullYear()} TAGMA NEWS • TODOS OS DIREITOS RESERVADOS</span>
          <span>Princípios Editoriais de Isenção, Apuração e Acessibilidade</span>
        </div>
      </div>
    </footer>
  );
}
