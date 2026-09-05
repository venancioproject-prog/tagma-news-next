import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quem Somos • Tagma News',
  description: 'Conheça a história, missão editorial e princípios jornalísticos do portal Tagma News.'
}

export default function SobrePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 lg:px-8 py-12">
      <div className="bg-white p-8 sm:p-12 rounded-lg border border-gray-200 shadow-sm font-serif">
        <div className="border-b-2 border-[#003311] pb-4 mb-8">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#d8561c]">
            Institucional
          </span>
          <h1 className="text-3xl sm:text-4xl font-sans font-extrabold text-[#001c06] mt-1">
            Quem Somos
          </h1>
        </div>

        <div className="space-y-6 text-[#1c1b1b] leading-relaxed text-base sm:text-lg">
          <p>
            O <strong>Tagma News</strong> é um portal de notícias independente comprometido com a agilidade, a precisão e a transparência factual. Fundado com o propósito de oferecer cobertura em tempo real sobre os principais acontecimentos do Brasil e do mundo, atuamos com rigor técnico nas editorias de <em>Política, Economia, Tecnologia, Internacional, Esportes e Cultura</em>.
          </p>

          <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#001c06] pt-4 border-t border-gray-100">
            Nossos Pilares Editoriais
          </h2>
          <ul className="list-disc pl-6 space-y-2 font-sans text-base text-gray-700">
            <li><strong>Veracidade e Checagem:</strong> Todas as nossas apurações são baseadas em fontes primárias, agências oficiais e dados abertos.</li>
            <li><strong>Isenção Partidária:</strong> Cobertura equilibrada e plural dos acontecimentos políticos e institucionais.</li>
            <li><strong>Inovação Tecnológica:</strong> Utilização responsável de inteligência de dados para entrega rápida de conteúdo aos nossos leitores.</li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#001c06] pt-4 border-t border-gray-100">
            Compromisso com o Leitor
          </h2>
          <p>
            Acreditamos que o acesso à informação de qualidade é um direito fundamental. Por isso, mantemos nossa redação aberta a sugestões, correções e contribuições de nossa comunidade.
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center font-sans text-xs">
          <Link href="/" className="text-[#003311] font-bold hover:underline">
            ← Voltar para a Página Inicial
          </Link>
          <Link href="/contato" className="text-[#d8561c] font-bold hover:underline">
            Fale com a Redação →
          </Link>
        </div>
      </div>
    </main>
  )
}
