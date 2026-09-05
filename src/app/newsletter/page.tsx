import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Newsletters Editoriais • Tagma News',
  description: 'Inscreva-se nas newsletters do Tagma News e receba análises diárias e alertas de urgência direto no seu e-mail.',
};

export default function NewsletterPage() {
  const newsletters = [
    {
      id: 'resumo-diario',
      title: 'Resumo Diário Tagma',
      frequency: 'De segunda a sexta, às 07h00',
      description: 'O resumo executivo dos fatos que vão ditar o ritmo da política, da economia e dos negócios no Brasil.',
      badge: 'Principal',
    },
    {
      id: 'alerta-urgente',
      title: 'Alerta de Última Hora',
      frequency: 'Apenas quando fatos de alta relevância ocorrerem',
      description: 'Breaking news apurada com rigor e enviada imediatamente para você não perder nenhum fato crucial.',
      badge: 'Urgente',
    },
    {
      id: 'briefing-tech',
      title: 'Briefing Tech & Inovação',
      frequency: 'Semanal, aos sábados',
      description: 'Panorama das novidades em inteligência artificial, regulação de tecnologia e novas economias digitais.',
      badge: 'Setorial',
    },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 lg:px-8 py-8 min-h-screen">
      <Breadcrumbs items={[{ label: 'Newsletters' }]} />

      <div className="bg-white p-8 sm:p-12 rounded-lg border border-gray-200 shadow-sm font-sans space-y-8">
        <div className="border-b-2 border-[#003311] pb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#d8561c]">
            Curadoria Direta
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#001c06] mt-1">
            Newsletters do Tagma News
          </h1>
          <p className="text-sm text-gray-600 mt-2 font-serif leading-relaxed">
            Selecione as edições desejadas e receba apurações transparentes e aprofundadas na sua caixa de entrada, sem ruído.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {newsletters.map((nl) => (
            <div key={nl.id} className="p-6 rounded-lg border border-gray-200 bg-[#fcf9f8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-300 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#003311] text-white">
                    {nl.badge}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">{nl.frequency}</span>
                </div>
                <h2 className="text-lg font-bold text-[#001c06]">
                  {nl.title}
                </h2>
                <p className="text-xs text-gray-600 font-serif mt-1 max-w-xl">
                  {nl.description}
                </p>
              </div>

              <input
                type="checkbox"
                defaultChecked={nl.id === 'resumo-diario'}
                className="w-5 h-5 accent-[#003311] rounded cursor-pointer self-end sm:self-center"
              />
            </div>
          ))}
        </div>

        {/* Subscription Form */}
        <form className="pt-6 border-t border-gray-200 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Seu E-mail Corporativo ou Pessoal
            </label>
            <input
              type="email"
              required
              placeholder="seuemail@dominio.com.br"
              className="w-full border border-gray-300 p-3 rounded text-sm focus:outline-none focus:border-[#003311]"
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              required
              id="consent"
              className="mt-1 w-4 h-4 accent-[#003311]"
            />
            <label htmlFor="consent" className="text-xs text-gray-600 leading-relaxed">
              Concordo em receber as newsletters selecionadas do Tagma News. Posso cancelar minha inscrição a qualquer momento com apenas 1 clique através do link no rodapé dos e-mails enviados.
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#001c06] hover:bg-[#003311] text-white font-bold uppercase text-xs tracking-widest rounded transition-colors shadow-md"
          >
            ✓ Confirmar Inscrição Gratuita
          </button>
        </form>

        <div className="pt-4 text-center text-[11px] text-gray-400">
          Respeitamos sua privacidade (LGPD). Nunca comercializamos nem compartilhamos sua lista de contatos.
        </div>
      </div>
    </main>
  );
}
