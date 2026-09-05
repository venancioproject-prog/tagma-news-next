import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade • Tagma News',
  description: 'Conheça nossa Política de Privacidade, uso de cookies e conformidade com a LGPD e Google AdSense.'
}

export default function PrivacidadePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 lg:px-8 py-12">
      <div className="bg-white p-8 sm:p-12 rounded-lg border border-gray-200 shadow-sm font-serif">
        <div className="border-b-2 border-[#003311] pb-4 mb-8">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#d8561c]">
            Termos Legais
          </span>
          <h1 className="text-3xl sm:text-4xl font-sans font-extrabold text-[#001c06] mt-1">
            Política de Privacidade
          </h1>
        </div>

        <div className="space-y-6 text-[#1c1b1b] leading-relaxed text-base sm:text-lg">
          <p>
            A sua privacidade é de extrema importância para o <strong>Tagma News</strong>. Esta política detalha como coletamos, utilizamos e protegemos as informações fornecidas por nossos usuários, em estrita conformidade com a Lei Geral de Proteção de Dados (LGPD) e as diretrizes de redes de anúncios, incluindo o Google AdSense.
          </p>

          <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#001c06] pt-4 border-t border-gray-100">
            1. Coleta de Informações e Cookies
          </h2>
          <p>
            Utilizamos cookies e tecnologias similares para aprimorar sua experiência de navegação, analisar o tráfego do portal e exibir anúncios relevantes. Cookies de terceiros, como os do Google (DoubleClick DART Cookie), podem ser utilizados para veicular anúncios com base nas suas visitas anteriores ao nosso ou a outros sites na internet.
          </p>

          <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#001c06] pt-4 border-t border-gray-100">
            2. Desativação de Cookies
          </h2>
          <p>
            O usuário pode optar por desativar o uso de cookies personalizados nas configurações do seu navegador ou visitando a página de Configurações de Anúncios do Google (<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[#d8561c] underline">www.google.com/settings/ads</a>).
          </p>

          <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#001c06] pt-4 border-t border-gray-100">
            3. Segurança dos Dados
          </h2>
          <p>
            Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acessos não autorizados, alterações ou divulgações indevidas.
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center font-sans text-xs">
          <Link href="/" className="text-[#003311] font-bold hover:underline">
            ← Voltar para a Página Inicial
          </Link>
          <Link href="/termos" className="text-[#d8561c] font-bold hover:underline">
            Ver Termos de Uso →
          </Link>
        </div>
      </div>
    </main>
  )
}
