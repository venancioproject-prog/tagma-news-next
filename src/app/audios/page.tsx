import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Áudios e Podcasts • Tagma News',
  description: 'Ouça boletins diários, podcasts de análise política e econômica do Tagma News.',
};

export default function AudiosPage() {
  const podcasts = [
    {
      id: 'pod-1',
      title: 'Boletim Tagma Manhã: O que move os mercados e a agenda política hoje',
      duration: '08:30',
      date: 'Hoje • 07:00',
      category: 'Giro Diário',
      description: 'Os principais destaques do dia resumidos em menos de 10 minutos para começar bem informado.',
    },
    {
      id: 'pod-2',
      title: 'Podcast Poder & Decisão: Os bastidores das votações no Congresso Nacional',
      duration: '22:15',
      date: 'Semanal',
      category: 'Política',
      description: 'Análise profunda dos acordos entre bancadas e as expectativas para as reformas estruturais.',
    },
    {
      id: 'pod-3',
      title: 'Tagma Tech: Inovação e tendências que impactam a sociedade brasileira',
      duration: '18:40',
      date: 'Quinzenal',
      category: 'Tecnologia',
      description: 'Discussões sobre cibersegurança, inteligência artificial e a economia digital.',
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 min-h-screen">
      <Breadcrumbs items={[{ label: 'Áudios e Podcasts' }]} />

      <div className="border-b-2 border-[#003311] pb-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#001c06] font-sans">
          Central de Áudios & Podcasts
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Boletins em áudio, debates sonoros e episódios temáticos para ouvir em qualquer lugar.
        </p>
      </div>

      <div className="space-y-4">
        {podcasts.map((pod) => (
          <article key={pod.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:border-[#003311] transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#003311] text-white rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                🎙️
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#d8561c] bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                    {pod.category}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{pod.date}</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#001c06]">
                  {pod.title}
                </h2>
                <p className="text-xs text-gray-600 mt-1 font-serif max-w-2xl">
                  {pod.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
              <span className="text-xs font-mono font-bold text-gray-500">{pod.duration}</span>
              <button
                type="button"
                className="px-4 py-2 bg-[#003311] hover:bg-[#001c06] text-white text-xs font-bold uppercase rounded tracking-wider transition-colors flex items-center gap-1.5"
              >
                <span>▶</span> Ouvir Episódio
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
