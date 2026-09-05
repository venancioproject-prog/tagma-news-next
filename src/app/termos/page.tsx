import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso • Tagma News',
  description: 'Termos e condições para utilização e navegação no portal Tagma News.'
}

export default function TermosPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 lg:px-8 py-12">
      <div className="bg-white p-8 sm:p-12 rounded-lg border border-gray-200 shadow-sm font-serif">
        <div className="border-b-2 border-[#003311] pb-4 mb-8">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#d8561c]">
            Termos Legais
          </span>
          <h1 className="text-3xl sm:text-4xl font-sans font-extrabold text-[#001c06] mt-1">
            Termos de Uso
          </h1>
        </div>

        <div className="space-y-6 text-[#1c1b1b] leading-relaxed text-base sm:text-lg">
          <p>
            Ao acessar e navegar pelo portal <strong>Tagma News</strong>, você concorda expressamente com os presentes Termos de Uso. Caso discorde de qualquer disposição aqui prevista, recomendamos a descontinuação do uso de nossos serviços.
          </p>

          <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#001c06] pt-4 border-t border-gray-100">
            1. Direitos Autorais e Propriedade Intelectual
          </h2>
          <p>
            Todo o conteúdo publicado no Tagma News — incluindo reportagens, textos, fotografias, logotipos e códigos-fonte — é protegido pelas leis de propriedade intelectual. É permitida a citação de trechos mediante menção expressa da fonte com link direcionado à matéria original.
          </p>

          <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#001c06] pt-4 border-t border-gray-100">
            2. Limitação de Responsabilidade
          </h2>
          <p>
            Empregamos os melhores esforços para garantir a precisão de todas as matérias. Contudo, o Tagma News não se responsabiliza por decisões tomadas por leitores com base em matérias informativas ou variações de mercado financeiro.
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center font-sans text-xs">
          <Link href="/" className="text-[#003311] font-bold hover:underline">
            ← Voltar para a Página Inicial
          </Link>
          <Link href="/privacidade" className="text-[#d8561c] font-bold hover:underline">
            Política de Privacidade →
          </Link>
        </div>
      </div>
    </main>
  )
}
