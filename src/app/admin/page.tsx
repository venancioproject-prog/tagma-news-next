'use client';
import { useState } from 'react';
import Link from 'next/link';

interface PautaItem {
  title: string;
  description: string;
  link?: string;
  source?: string;
}

const LOTTERIES_LIST = [
  { key: 'megasena', name: 'Mega-Sena', tag: 'Acumulada', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'lotofacil', name: 'Lotofácil', tag: 'Diária', badgeBg: 'bg-purple-50 text-purple-700 border-purple-200' },
  { key: 'quina', name: 'Quina', tag: 'Tradicional', badgeBg: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'lotomania', name: 'Lotomania', tag: '20 Dezenas', badgeBg: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'timemania', name: 'Timemania', tag: 'Futebol', badgeBg: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  { key: 'duplasena', name: 'Dupla Sena', tag: '2 Sorteios', badgeBg: 'bg-red-50 text-red-700 border-red-200' },
  { key: 'diadesorte', name: 'Dia de Sorte', tag: 'Meses', badgeBg: 'bg-orange-50 text-orange-700 border-orange-200' },
  { key: 'supersete', name: 'Super Sete', tag: 'Colunas', badgeBg: 'bg-teal-50 text-teal-700 border-teal-200' },
  { key: 'maismilionaria', name: '+Milionária', tag: 'Milionária', badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'rss' | 'loterias' | 'manual'>('rss');
  const [category, setCategory] = useState('Política');
  const [pautas, setPautas] = useState<PautaItem[]>([]);
  const [loadingPautas, setLoadingPautas] = useState(false);
  const [draftingMap, setDraftingMap] = useState<Record<number, boolean>>({});
  const [publishedPautas, setPublishedPautas] = useState<Record<number, string>>({});
  const [lotteryLoadingMap, setLotteryLoadingMap] = useState<Record<string, boolean>>({});
  const [lotteryPublishedMap, setLotteryPublishedMap] = useState<Record<string, string>>({});
  const [manualDrafting, setManualDrafting] = useState(false);
  const [manualPublished, setManualPublished] = useState<string | null>(null);

  const fetchPautas = async () => {
    setLoadingPautas(true);
    try {
      const res = await fetch(`/api/pautas?category=${category}`);
      const data = await res.json();
      setPautas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert('Erro ao buscar pautas nos feeds RSS.');
    } finally {
      setLoadingPautas(false);
    }
  };

  const generateDraft = async (pauta: PautaItem, index: number) => {
    setDraftingMap(prev => ({ ...prev, [index]: true }));
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pauta.title,
          description: pauta.description,
          category,
          link: pauta.link,
          source: pauta.source
        })
      });
      const data = await res.json();
      if (data.success) {
        setPublishedPautas(prev => ({ ...prev, [index]: data.post.title }));
      } else {
        alert(`Erro: ${data.error || 'Falha ao redigir notícia'}`);
      }
    } catch (e) {
      alert('Erro na conexão com a API de Redação.');
    } finally {
      setDraftingMap(prev => ({ ...prev, [index]: false }));
    }
  };

  const generateLottery = async (loteriaKey: string, loteriaName: string) => {
    setLotteryLoadingMap(prev => ({ ...prev, [loteriaKey]: true }));
    try {
      const res = await fetch(`/api/loterias?loteria=${loteriaKey}`);
      const data = await res.json();
      if (data.success) {
        setLotteryPublishedMap(prev => ({ ...prev, [loteriaKey]: data.post.title }));
      } else {
        alert(`Erro: ${data.error || 'Falha ao apurar loteria'}`);
      }
    } catch (e) {
      alert('Erro na conexão com a API de Loterias.');
    } finally {
      setLotteryLoadingMap(prev => ({ ...prev, [loteriaKey]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f8] p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="bg-[#003311] text-white px-6 sm:px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-[#d8561c]">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-serif-title text-2xl font-normal lowercase tracking-tight text-white hover:opacity-90">
              tagma
            </Link>
            <span className="h-5 w-px bg-white/20"></span>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold uppercase tracking-widest text-white leading-none">
                Painel do Editor & Curadoria IA
              </h1>
              <p className="text-[11px] text-white/70 mt-1 font-normal">
                Motor de Hard News RSS • Automação de Loterias • Publicação Manual
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded text-[10px] uppercase font-bold tracking-wider text-green-300">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              API Groq Conectada
            </span>
            <Link 
              href="/" 
              className="bg-[#d8561c] hover:bg-[#934b00] text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded transition-colors"
            >
              Ver Portal Home →
            </Link>
          </div>
        </header>

        {/* Dashboard Grid: Left Navigation / Right Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* PAINEL ESQUERDO: MENU DE MÓDULOS (3 colunas) */}
          <aside className="lg:col-span-3 bg-gray-50 border-r border-gray-200 p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-3 block mb-3">
                Módulos de Produção
              </span>

              <button
                onClick={() => setActiveTab('rss')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all text-left ${
                  activeTab === 'rss'
                    ? 'bg-[#003311] text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📡</span>
                  <span>Hard News (RSS)</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${activeTab === 'rss' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  Auto
                </span>
              </button>

              <button
                onClick={() => setActiveTab('loterias')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all text-left ${
                  activeTab === 'loterias'
                    ? 'bg-[#003311] text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🎰</span>
                  <span>Loterias da Caixa</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${activeTab === 'loterias' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  9 Tipos
                </span>
              </button>

              <button
                onClick={() => setActiveTab('manual')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all text-left ${
                  activeTab === 'manual'
                    ? 'bg-[#003311] text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">✍️</span>
                  <span>Redação Manual</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${activeTab === 'manual' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  Direto
                </span>
              </button>
            </div>

            {/* Informações da Redação */}
            <div className="mt-8 pt-5 border-t border-gray-200 text-xs text-gray-500 space-y-2">
              <div className="flex justify-between items-center">
                <span>Motor IA:</span>
                <strong className="text-gray-800 font-mono text-[11px]">llama3-70b-8192</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Fontes:</span>
                <strong className="text-gray-800 font-mono text-[11px]">Ag. Brasil • G1 • Reuters</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Status:</span>
                <span className="text-emerald-700 font-bold font-mono text-[11px]">Serverless Pronto</span>
              </div>
            </div>
          </aside>

          {/* ÁREA CENTRAL DE TRABALHO (9 colunas) */}
          <main className="lg:col-span-9 p-6 sm:p-8 bg-white overflow-y-auto">
            
            {/* TAB 1: HARD NEWS RSS */}
            {activeTab === 'rss' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#001c06] flex items-center gap-2">
                        <span>📡</span> Motor de Hard News (Feeds RSS)
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Varre as últimas notícias em tempo real de agências conceituadas e gera reportagens completas com IA.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filtro de Categoria e Ação */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row gap-3 items-center">
                  <div className="w-full sm:w-2/3">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Selecione a Editoria:
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2.5 bg-white text-sm font-semibold focus:outline-none focus:border-[#003311]"
                    >
                      <option>Política</option>
                      <option>Economia</option>
                      <option>Internacional</option>
                      <option>Esportes</option>
                      <option>Cultura</option>
                      <option>Tecnologia</option>
                      <option>Geral</option>
                    </select>
                  </div>

                  <div className="w-full sm:w-1/3 sm:self-end">
                    <button
                      onClick={fetchPautas}
                      disabled={loadingPautas}
                      className="w-full bg-[#d8561c] hover:bg-[#934b00] text-white text-xs font-bold uppercase tracking-widest py-3 px-4 rounded transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loadingPautas ? (
                        <>
                          <span className="inline-block animate-spin">⟳</span>
                          <span>Buscando RSS...</span>
                        </>
                      ) : (
                        '1. Buscar Fatos (RSS)'
                      )}
                    </button>
                  </div>
                </div>

                {/* Grid de Pautas Encontradas */}
                {pautas.length > 0 ? (
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#001c06]">
                        Notícias Capturadas ({pautas.length}):
                      </h3>
                      <span className="text-[11px] text-gray-400">Clique em Redigir para publicar</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pautas.map((p, idx) => {
                        const isDrafting = Boolean(draftingMap[idx]);
                        const publishedTitle = publishedPautas[idx];

                        return (
                          <div key={idx} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm flex flex-col justify-between hover:border-[#003311] transition-all">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200">
                                  {p.source || 'Agência Brasil'}
                                </span>
                                {publishedTitle && (
                                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                                    ✓ Publicado
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-[#001c06] leading-snug mb-2">
                                {p.title}
                              </h4>
                              <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
                                {p.description}
                              </p>
                            </div>

                            <div>
                              {publishedTitle ? (
                                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-800 font-medium">
                                  ✓ Matéria no ar: <strong className="font-bold">{publishedTitle}</strong>
                                </div>
                              ) : (
                                <button
                                  disabled={isDrafting}
                                  onClick={() => generateDraft(p, idx)}
                                  className="w-full bg-[#003311] hover:bg-[#001c06] text-white text-xs font-bold uppercase tracking-widest py-2.5 px-4 rounded transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                  {isDrafting ? (
                                    <>
                                      <span className="inline-block animate-spin text-orange-400 font-bold">⟳</span>
                                      <span className="text-orange-300 font-bold">Redigindo Matéria...</span>
                                    </>
                                  ) : (
                                    '2. Redigir e Publicar (IA)'
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <span className="text-3xl mb-2 block">📰</span>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Nenhum feed carregado ainda</h3>
                    <p className="text-xs text-gray-500 mt-1">Selecione uma categoria e clique em "1. Buscar Fatos (RSS)" acima.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: LOTERIAS DA CAIXA (9 MODALIDADES) */}
            {activeTab === 'loterias' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#001c06] flex items-center gap-2">
                    <span>🎰</span> Automação Total de Loterias da Caixa
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Extração direta com tolerância a falhas (API Caixa Oficial + API Pública Fallback) e redação jornalística imediata.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {LOTTERIES_LIST.map((lot) => {
                    const isProcessing = Boolean(lotteryLoadingMap[lot.key]);
                    const published = lotteryPublishedMap[lot.key];

                    return (
                      <div key={lot.key} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col justify-between hover:border-gray-400 transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${lot.badgeBg}`}>
                              {lot.tag}
                            </span>
                            {published && (
                              <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                ✓ No Ar
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-extrabold text-[#001c06] mb-1">
                            {lot.name}
                          </h3>
                          <p className="text-[11px] text-gray-500 mb-4">
                            Busca concurso recente, dezenas e valor acumulado.
                          </p>
                        </div>

                        <div>
                          {published ? (
                            <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                              ✓ Publicada com sucesso
                            </div>
                          ) : (
                            <button
                              disabled={isProcessing}
                              onClick={() => generateLottery(lot.key, lot.name)}
                              className="w-full bg-[#003311] hover:bg-[#001c06] text-white text-[11px] font-bold uppercase tracking-wider py-2.5 px-3 rounded transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                              {isProcessing ? (
                                <>
                                  <span className="inline-block animate-spin text-orange-400">⟳</span>
                                  <span className="text-orange-300 font-bold">Apurando...</span>
                                </>
                              ) : (
                                `Apurar ${lot.name} →`
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: REDAÇÃO MANUAL */}
            {activeTab === 'manual' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#001c06] flex items-center gap-2">
                    <span>✍️</span> Redação Manual (Publicação Direta)
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Escreva e publique diretamente no portal sem intervenção da Inteligência Artificial.
                  </p>
                </div>

                {manualPublished && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold">
                    ✓ Matéria publicada com sucesso: <strong>{manualPublished}</strong>
                  </div>
                )}

                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                    const excerpt = (form.elements.namedItem('excerpt') as HTMLInputElement).value;
                    const image = (form.elements.namedItem('image') as HTMLInputElement).value;
                    const content = (form.elements.namedItem('content') as HTMLTextAreaElement).value;
                    const cat = (form.elements.namedItem('category') as HTMLSelectElement).value;
                    
                    setManualDrafting(true);
                    try {
                      const res = await fetch('/api/draft/manual', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title, excerpt, image, content, category: cat })
                      });
                      const data = await res.json();
                      if (data.success) {
                        setManualPublished(title);
                        form.reset();
                      } else {
                        alert(`Erro: ${data.error}`);
                      }
                    } catch (err) {
                      alert('Erro ao publicar matéria');
                    } finally {
                      setManualDrafting(false);
                    }
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Título da Matéria</label>
                      <input required name="title" type="text" placeholder="Ex: Nova fábrica de semicondutores é inaugurada..." className="border border-gray-300 p-3 rounded w-full text-sm focus:border-[#003311] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Linha Fina / Subtítulo</label>
                      <input required name="excerpt" type="text" placeholder="Resumo do fato em até duas frases..." className="border border-gray-300 p-3 rounded w-full text-sm focus:border-[#003311] focus:outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">URL da Imagem (Opcional)</label>
                      <input name="image" type="url" placeholder="https://exemplo.com/foto.jpg" className="border border-gray-300 p-3 rounded w-full text-sm focus:border-[#003311] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Editoria</label>
                      <select name="category" className="border border-gray-300 p-3 rounded w-full bg-white text-sm font-semibold focus:border-[#003311] focus:outline-none">
                        <option>Política</option>
                        <option>Economia</option>
                        <option>Internacional</option>
                        <option>Cultura</option>
                        <option>Esportes</option>
                        <option>Tecnologia</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Corpo da Matéria (Markdown)</label>
                    <textarea required name="content" placeholder="Escreva o texto completo da reportagem. Use ## para subtítulos e **negrito** para termos importantes..." className="border border-gray-300 p-3 rounded w-full h-44 font-mono text-sm focus:border-[#003311] focus:outline-none"></textarea>
                  </div>

                  <button
                    disabled={manualDrafting}
                    type="submit"
                    className="w-full bg-[#001c06] hover:bg-[#003311] text-white font-bold uppercase text-xs tracking-widest py-3.5 px-6 rounded transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {manualDrafting ? (
                      <>
                        <span className="inline-block animate-spin">⟳</span>
                        <span>Publicando no Banco...</span>
                      </>
                    ) : (
                      'Publicar Matéria Imediatamente'
                    )}
                  </button>
                </form>
              </div>
            )}

          </main>
        </div>

      </div>
    </div>
  );
}


