import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Cobertura Ao Vivo • Tagma News',
  description: 'Acompanhe transmissões, eventos de última hora e atualizações minuto a minuto no portal Tagma News.',
};

export default function AoVivoPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 min-h-screen">
      <Breadcrumbs items={[{ label: 'Central Ao Vivo' }]} />

      <div className="border-b-2 border-red-700 pb-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 bg-red-600 rounded-full animate-ping"></span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#001c06] font-sans">
              Central Ao Vivo & Acompanhamento
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Transmissões institucionais, cobertura de eventos de urgência e atualização factual contínua.
            </p>
          </div>
        </div>
        <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded text-xs font-black uppercase tracking-widest">
          Sinal Aberto
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Stream Player & Fallback */}
        <div className="lg:col-span-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex flex-col items-center justify-center text-white p-6 text-center border border-gray-800">
            <span className="text-4xl mb-3">📡</span>
            <h2 className="text-lg sm:text-xl font-bold font-sans">
              Cobertura Especial • Atualização do Dia
            </h2>
            <p className="text-xs text-gray-400 mt-2 max-w-md">
              Acompanhamento contínuo dos principais desdobramentos de política, economia e decisões em Brasília.
            </p>
            <div className="mt-4 px-3 py-1 bg-red-600/80 rounded text-[10px] uppercase font-bold tracking-widest">
              Fallback Textual Ativo
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 font-sans block mb-1">
              • Em Atualização Constante
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#001c06] font-sans">
              Sessão Extraordinária e Indicadores Financeiros da Tarde
            </h2>
            <p className="text-sm text-gray-600 font-serif leading-relaxed mt-2">
              A equipe da redação do Tagma News acompanha os pronunciamentos oficiais e divulga análises técnicas em tempo real.
            </p>
          </div>

          {/* Live Timeline */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#003311] mb-4">
              Linha do Tempo dos Acontecimentos
            </h3>
            <div className="space-y-4 border-l-2 border-[#003311] pl-4 ml-2">
              <div className="relative">
                <span className="absolute -left-[21px] top-1.5 w-2 h-2 bg-[#d8561c] rounded-full"></span>
                <span className="text-[11px] font-mono font-bold text-gray-500">16:30</span>
                <h4 className="text-sm font-bold text-[#001c06] mt-0.5">Banco Central publica comunicado sobre liquidez do sistema</h4>
                <p className="text-xs text-gray-600 font-serif mt-1">Autoridade monetária reforça estabilidade nas transações e taxas interbancárias.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[21px] top-1.5 w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="text-[11px] font-mono font-bold text-gray-500">15:15</span>
                <h4 className="text-sm font-bold text-[#001c06] mt-0.5">Comissão do Senado conclui votação de parecer econômico</h4>
                <p className="text-xs text-gray-600 font-serif mt-1">Texto segue para análise do plenário em regime de urgência acordado entre lideranças.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[21px] top-1.5 w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="text-[11px] font-mono font-bold text-gray-500">14:00</span>
                <h4 className="text-sm font-bold text-[#001c06] mt-0.5">Abertura dos trabalhos e verificação de quórum</h4>
                <p className="text-xs text-gray-600 font-serif mt-1">Início da sessão de debates sobre sustentabilidade energética.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#001c06] border-b border-gray-200 pb-2 mb-4">
              Programação da Redação
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded border border-gray-100">
                <span className="text-[10px] font-bold text-[#d8561c] uppercase block">Manhã • 08:00</span>
                <p className="font-bold text-gray-800">Giro de Notícias & Abertura dos Mercados</p>
              </div>
              <div className="p-3 bg-gray-50 rounded border border-gray-100">
                <span className="text-[10px] font-bold text-[#003311] uppercase block">Tarde • 14:00</span>
                <p className="font-bold text-gray-800">Boletim Político & Cobertura do Congresso</p>
              </div>
              <div className="p-3 bg-gray-50 rounded border border-gray-100">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Noite • 20:00</span>
                <p className="font-bold text-gray-800">Resultados das Loterias da Caixa & Fechamento</p>
              </div>
            </div>
          </div>

          <div className="bg-[#001c06] text-white p-5 rounded-lg">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#d8561c] mb-2">
              Participe da Apuração
            </h3>
            <p className="text-xs text-white/80 leading-relaxed mb-4">
              Envie informações verificáveis, sugestões de pauta ou relatos de sua região diretamente para os nossos editores.
            </p>
            <Link
              href="/contato"
              className="block text-center py-2 bg-[#d8561c] hover:bg-[#b04313] text-white text-xs font-bold uppercase rounded transition-colors"
            >
              Enviar Mensagem à Redação
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
