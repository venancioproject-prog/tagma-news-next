import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Vídeos e Reportagens Audiovisuais • Tagma News',
  description: 'Assista a análises em vídeo, explicadores e reportagens especiais produzidas pela redação do Tagma News.',
};

export default function VideosPage() {
  const videoItems = [
    {
      id: 'vid-1',
      title: 'Entenda como as decisões da taxa Selic impactam o financiamento imobiliário',
      duration: '04:15',
      category: 'Economia',
      date: 'Hoje',
      author: 'Redação Economia',
      description: 'Análise técnica e didática sobre a evolução das taxas de juros e o planejamento financeiro das famílias brasileiras.',
    },
    {
      id: 'vid-2',
      title: 'Marco Regulatório da Inteligência Artificial: os pontos centrais em debate',
      duration: '06:40',
      category: 'Tecnologia',
      date: 'Ontem',
      author: 'Equipe Tech',
      description: 'Especialistas debatem a proteção de dados pessoais, salvaguardas algorítmicas e o impacto no setor público.',
    },
    {
      id: 'vid-3',
      title: 'Transição Energética e as metas de descarbonização da indústria brasileira',
      duration: '05:20',
      category: 'Especial',
      date: 'Há 2 dias',
      author: 'Reportagem Especial',
      description: 'Investimentos em fontes renováveis e os novos projetos de crédito de carbono em votação no Congresso.',
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 min-h-screen">
      <Breadcrumbs items={[{ label: 'Vídeos e Especiais' }]} />

      <div className="border-b-2 border-[#003311] pb-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#001c06] font-sans">
          Central de Vídeos & Reportagens
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Explicadores multimídia, debates e análises aprofundadas com acessibilidade e transcrição.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videoItems.map((vid) => (
          <article key={vid.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col justify-between group hover:border-[#003311] transition-all">
            <div>
              <div className="relative aspect-video bg-stone-900 flex items-center justify-center text-white">
                <span className="w-12 h-12 bg-white/20 group-hover:bg-[#d8561c] rounded-full flex items-center justify-center text-xl transition-colors">
                  ▶
                </span>
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                  {vid.duration}
                </span>
              </div>
              <div className="p-5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#003311] bg-gray-100 px-2 py-0.5 rounded">
                  {vid.category}
                </span>
                <h2 className="text-base font-bold text-[#001c06] group-hover:text-[#d8561c] transition-colors mt-2 mb-2">
                  {vid.title}
                </h2>
                <p className="text-xs text-gray-600 line-clamp-2 font-serif leading-relaxed">
                  {vid.description}
                </p>
              </div>
            </div>
            <div className="p-5 pt-0 text-[11px] text-gray-400 flex justify-between items-center border-t border-gray-100">
              <span>{vid.author}</span>
              <span>{vid.date}</span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
