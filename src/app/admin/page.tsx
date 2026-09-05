'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export interface RadarItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  description: string;
}

interface TrendingTopic {
  title: string;
  category: string;
  angle: string;
  keywords: string;
}

interface ManagedPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string | null;
  author: string;
  created_at: string;
  published: boolean;
  category_name: string;
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
  const [activeTab, setActiveTab] = useState<'radar' | 'trends' | 'manual' | 'loterias' | 'posts'>('radar');
  
  // Radar de Concorrência (RSS)
  const [radarItems, setRadarItems] = useState<RadarItem[]>([]);
  const [loadingRadar, setLoadingRadar] = useState(false);
  const [radarCategory, setRadarCategory] = useState('');
  const [draftingRadarMap, setDraftingRadarMap] = useState<Record<number, boolean>>({});
  const [publishedRadarMap, setPublishedRadarMap] = useState<Record<number, string>>({});

  // Sugestões de Pautas (IA Trends)
  const [trends, setTrends] = useState<TrendingTopic[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [trendsCategory, setTrendsCategory] = useState('Geral');
  const [draftingTrendMap, setDraftingTrendMap] = useState<Record<number, boolean>>({});

  // Redação Manual
  const [manualTitle, setManualTitle] = useState('');
  const [manualExcerpt, setManualExcerpt] = useState('');
  const [manualImage, setManualImage] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [manualCategory, setManualCategory] = useState('Política');
  const [manualDrafting, setManualDrafting] = useState(false);
  const [manualPublished, setManualPublished] = useState<string | null>(null);

  // Loterias
  const [lotteryLoadingMap, setLotteryLoadingMap] = useState<Record<string, boolean>>({});
  const [lotteryPublishedMap, setLotteryPublishedMap] = useState<Record<string, string>>({});

  // Gerenciar Posts
  const [managedPosts, setManagedPosts] = useState<ManagedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Modal de Apuração / Revisão da IA
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<{
    title: string;
    seo_title?: string;
    slug?: string;
    meta_description?: string;
    excerpt: string;
    content: string;
    category: string;
    image?: string;
    tags?: string[];
    sourceIndex?: number;
    sourceType?: 'radar' | 'trend';
  } | null>(null);
  const [publishingDraft, setPublishingDraft] = useState(false);

  useEffect(() => {
    fetchRadar();
    fetchTrends();
  }, []);

  const fetchRadar = async (cat = radarCategory) => {
    setLoadingRadar(true);
    try {
      const url = cat ? `/api/admin/rss-radar?category=${encodeURIComponent(cat)}` : '/api/admin/rss-radar';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setRadarItems(data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRadar(false);
    }
  };

  const fetchTrends = async (cat = trendsCategory) => {
    setLoadingTrends(true);
    try {
      const res = await fetch(`/api/admin/trending-topics?category=${encodeURIComponent(cat)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.topics)) {
        setTrends(data.topics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTrends(false);
    }
  };

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch('/api/admin/posts');
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        setManagedPosts(data.posts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Deseja realmente remover esta matéria do portal?')) return;
    setDeletingPostId(id);
    try {
      const res = await fetch(`/api/admin/posts?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setManagedPosts(prev => prev.filter(p => p.id !== id));
      } else {
        alert(`Erro ao remover: ${data.error}`);
      }
    } catch (err) {
      alert('Erro de conexão ao remover matéria.');
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleRewriteRadar = async (item: RadarItem, index: number) => {
    setDraftingRadarMap(prev => ({ ...prev, [index]: true }));
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          description: item.description,
          category: item.category || 'Geral',
          link: item.link,
          source: item.source
        })
      });
      const data = await res.json();
      if (data.success && data.draft) {
        setCurrentDraft({
          title: data.draft.title,
          seo_title: data.draft.seo_title,
          slug: data.draft.slug,
          meta_description: data.draft.meta_description,
          excerpt: data.draft.excerpt,
          content: data.draft.content,
          category: data.draft.category || item.category || 'Geral',
          image: data.draft.suggested_image,
          tags: data.draft.tags || [item.category.toLowerCase()],
          sourceIndex: index,
          sourceType: 'radar'
        });
        setReviewModalOpen(true);
      } else {
        alert(`Erro na apuração IA: ${data.error || 'Falha ao processar fato'}`);
      }
    } catch (e) {
      alert('Erro de conexão com o motor de IA.');
    } finally {
      setDraftingRadarMap(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleCreateFromTrend = async (trend: TrendingTopic, index: number) => {
    setDraftingTrendMap(prev => ({ ...prev, [index]: true }));
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trend.title,
          description: `${trend.angle}. Palavras-chave: ${trend.keywords}`,
          category: trend.category || 'Geral',
          source: 'Sugestões do Editor (IA)'
        })
      });
      const data = await res.json();
      if (data.success && data.draft) {
        setCurrentDraft({
          title: data.draft.title,
          seo_title: data.draft.seo_title,
          slug: data.draft.slug,
          meta_description: data.draft.meta_description,
          excerpt: data.draft.excerpt,
          content: data.draft.content,
          category: data.draft.category || trend.category || 'Geral',
          image: data.draft.suggested_image,
          tags: data.draft.tags || [trend.category.toLowerCase()],
          sourceIndex: index,
          sourceType: 'trend'
        });
        setReviewModalOpen(true);
      } else {
        setManualTitle(trend.title);
        setManualExcerpt(trend.angle);
        setManualCategory(trend.category || 'Geral');
        setActiveTab('manual');
      }
    } catch (e) {
      setManualTitle(trend.title);
      setManualExcerpt(trend.angle);
      setManualCategory(trend.category || 'Geral');
      setActiveTab('manual');
    } finally {
      setDraftingTrendMap(prev => ({ ...prev, [index]: false }));
    }
  };

  const handlePublishReviewedDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDraft) return;

    setPublishingDraft(true);
    try {
      const res = await fetch('/api/draft/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentDraft.title,
          seo_title: currentDraft.seo_title,
          slug: currentDraft.slug,
          meta_description: currentDraft.meta_description,
          excerpt: currentDraft.excerpt,
          image: currentDraft.image,
          content: currentDraft.content,
          category: currentDraft.category,
          tags: currentDraft.tags
        })
      });

      const data = await res.json();
      if (data.success) {
        if (currentDraft.sourceType === 'radar' && currentDraft.sourceIndex !== undefined) {
          setPublishedRadarMap(prev => ({ ...prev, [currentDraft.sourceIndex!]: currentDraft.title }));
        }
        setReviewModalOpen(false);
        setCurrentDraft(null);
        alert('✓ Matéria apurada com SEO e publicada com sucesso no portal Tagma News!');
      } else {
        alert(`Erro ao publicar: ${data.error}`);
      }
    } catch (err) {
      alert('Erro ao enviar matéria para publicação.');
    } finally {
      setPublishingDraft(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualDrafting(true);
    try {
      const res = await fetch('/api/draft/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: manualTitle,
          excerpt: manualExcerpt,
          image: manualImage,
          content: manualContent,
          category: manualCategory
        })
      });
      const data = await res.json();
      if (data.success) {
        setManualPublished(manualTitle);
        setManualTitle('');
        setManualExcerpt('');
        setManualImage('');
        setManualContent('');
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (err) {
      alert('Erro ao publicar matéria');
    } finally {
      setManualDrafting(false);
    }
  };

  const generateLottery = async (loteriaKey: string, loteriaName: string) => {
    setLotteryLoadingMap(prev => ({ ...prev, [loteriaKey]: true }));
    try {
      const res = await fetch(`/api/loterias?loteria=${loteriaKey}`);
      const data = await res.json();
      if (data.success) {
        setLotteryPublishedMap(prev => ({ ...prev, [loteriaKey]: data.post?.title || 'Publicada' }));
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

        {/* Barra de Navegação por Abas Limpas */}
        <div className="bg-[#f6f3f2] px-6 sm:px-8 py-3 border-b border-gray-200 flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'radar'
                ? 'bg-[#001c06] text-white shadow'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>📡</span>
            <span>Radar da Concorrência (RSS)</span>
            {radarItems.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeTab === 'radar' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {radarItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'trends'
                ? 'bg-[#001c06] text-white shadow'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>💡</span>
            <span>Sugestões do Editor (IA Trends)</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'manual'
                ? 'bg-[#001c06] text-white shadow'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>✍️</span>
            <span>Publicação Manual</span>
          </button>

          <button
            onClick={() => setActiveTab('loterias')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'loterias'
                ? 'bg-[#001c06] text-white shadow'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>🎰</span>
            <span>Loterias Caixa</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('posts');
              fetchPosts();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'posts'
                ? 'bg-[#001c06] text-white shadow'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>📁</span>
            <span>Gerenciar Posts</span>
          </button>
        </div>

        {/* Conteúdo Principal do Painel */}
        <main className="p-6 sm:p-8 bg-white min-h-[580px]">
          
          {/* ABA 1: RADAR DE CONCORRÊNCIA (RSS) */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#001c06] flex items-center gap-2">
                    <span>📡</span> Radar de Concorrência em Tempo Real
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Monitoramento automático dos maiores portais de notícias. Clique em &quot;Reescrever com IA&quot; para gerar uma matéria exclusiva e otimizada.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={radarCategory}
                    onChange={(e) => {
                      setRadarCategory(e.target.value);
                      fetchRadar(e.target.value);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold bg-white text-gray-800 focus:outline-none focus:border-[#003311]"
                  >
                    <option value="">Todas as Editorias</option>
                    <option value="Política">Política</option>
                    <option value="Economia">Economia</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Internacional">Internacional</option>
                  </select>

                  <button
                    onClick={() => fetchRadar()}
                    disabled={loadingRadar}
                    className="bg-[#003311] hover:bg-[#001c06] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                  >
                    {loadingRadar ? (
                      <>
                        <span className="inline-block animate-spin">⟳</span>
                        <span>Varrendo RSS...</span>
                      </>
                    ) : (
                      <>
                        <span>⟳</span>
                        <span>Atualizar Radar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {loadingRadar && radarItems.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <span className="text-3xl inline-block animate-spin mb-3">📡</span>
                  <p className="text-xs font-bold uppercase tracking-widest">Varrendo feeds da concorrência...</p>
                </div>
              ) : radarItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {radarItems.map((item, idx) => {
                    const isDrafting = Boolean(draftingRadarMap[idx]);
                    const publishedTitle = publishedRadarMap[idx];

                    return (
                      <div 
                        key={idx} 
                        className="border border-gray-200 rounded-lg p-4 bg-[#fcfcfc] hover:border-[#003311] transition-all flex flex-col justify-between shadow-sm"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200 font-mono">
                              {item.source}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {item.pubDate}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-[#001c06] leading-snug mb-2 hover:text-[#003311]">
                            {item.title}
                          </h3>

                          {item.description && item.description !== item.title && (
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                          {publishedTitle ? (
                            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-800 font-semibold text-center">
                              ✓ Matéria Publicada
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-gray-500 hover:text-gray-900 underline px-2 py-1.5"
                                >
                                  Fonte ↗
                                </a>
                              )}
                              <button
                                disabled={isDrafting}
                                onClick={() => handleRewriteRadar(item, idx)}
                                className="flex-1 bg-[#003311] hover:bg-[#001c06] text-white text-xs font-bold uppercase tracking-wider py-2 px-3 rounded transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                              >
                                {isDrafting ? (
                                  <>
                                    <span className="inline-block animate-spin text-emerald-300">⟳</span>
                                    <span className="text-emerald-200 text-[11px]">Redigindo IA...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>⚡</span>
                                    <span>Reescrever com IA</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <span className="text-3xl mb-2 block">📰</span>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Nenhum feed capturado</h3>
                  <p className="text-xs text-gray-500 mt-1">Clique no botão &quot;Atualizar Radar&quot; para varrer os portais.</p>
                </div>
              )}
            </div>
          )}

          {/* ABA 2: SUGESTÕES DO EDITOR (IA TRENDS) */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#001c06] flex items-center gap-2">
                    <span>💡</span> Sugestões de Pautas do Editor (IA Trends)
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Ideias e pautas de alta repercussão geradas por IA (Mixtral) com palavras-chave de SEO e ganchos jornalísticos.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={trendsCategory}
                    onChange={(e) => {
                      setTrendsCategory(e.target.value);
                      fetchTrends(e.target.value);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold bg-white text-gray-800 focus:outline-none focus:border-[#003311]"
                  >
                    <option value="Geral">Temas Gerais (Brasil)</option>
                    <option value="Política">Política & Congresso</option>
                    <option value="Economia">Economia & Mercado</option>
                    <option value="Tecnologia">Tecnologia & IA</option>
                  </select>

                  <button
                    onClick={() => fetchTrends()}
                    disabled={loadingTrends}
                    className="bg-[#003311] hover:bg-[#001c06] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                  >
                    {loadingTrends ? (
                      <>
                        <span className="inline-block animate-spin">⟳</span>
                        <span>Pensando Pautas...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Gerar Novas Sugestões</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {loadingTrends && trends.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <span className="text-3xl inline-block animate-spin mb-3">💡</span>
                  <p className="text-xs font-bold uppercase tracking-widest">O Chefe de Redação IA está formulando 5 pautas quentes...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {trends.map((trend, idx) => {
                    const isDrafting = Boolean(draftingTrendMap[idx]);

                    return (
                      <div 
                        key={idx}
                        className="border border-gray-200 rounded-xl p-5 bg-[#fcfcfc] hover:border-[#003311] transition-all flex flex-col justify-between shadow-sm"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 bg-[#003311]/10 text-[#003311] rounded-full border border-[#003311]/20">
                              {trend.category}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">Pauta #{idx + 1}</span>
                          </div>

                          <h3 className="text-base font-extrabold text-[#001c06] leading-tight mb-3">
                            {trend.title}
                          </h3>

                          <div className="bg-white p-3 rounded-lg border border-gray-100 text-xs text-gray-600 leading-relaxed mb-4">
                            <strong className="text-gray-800 block text-[11px] uppercase tracking-wider font-bold mb-1">
                              Ângulo Editorial:
                            </strong>
                            {trend.angle}
                          </div>

                          {trend.keywords && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {trend.keywords.split(',').map((kw, kIdx) => (
                                <span key={kIdx} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">
                                  #{kw.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          disabled={isDrafting}
                          onClick={() => handleCreateFromTrend(trend, idx)}
                          className="w-full bg-[#003311] hover:bg-[#001c06] text-white text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {isDrafting ? (
                            <>
                              <span className="inline-block animate-spin text-emerald-300">⟳</span>
                              <span className="text-emerald-200">Redigindo Matéria...</span>
                            </>
                          ) : (
                            <>
                              <span>✍️</span>
                              <span>Criar Matéria com IA</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ABA 3: PUBLICAÇÃO MANUAL */}
          {activeTab === 'manual' && (
            <div className="max-w-4xl space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#001c06] flex items-center gap-2">
                  <span>✍️</span> Publicação Manual (Sem IA)
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Redija e publique diretamente no banco de dados com total controle de texto, imagem e formatação Markdown.
                </p>
              </div>

              {manualPublished && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center justify-between">
                  <span>✓ Matéria publicada com sucesso: <strong>{manualPublished}</strong></span>
                  <button onClick={() => setManualPublished(null)} className="text-emerald-900 font-bold hover:underline text-[11px]">✕</button>
                </div>
              )}

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Título da Matéria</label>
                    <input 
                      required 
                      type="text" 
                      value={manualTitle}
                      onChange={e => setManualTitle(e.target.value)}
                      placeholder="Ex: Nova regulamentação fiscal entra em vigor no país..." 
                      className="border border-gray-300 p-3 rounded-lg w-full text-sm text-gray-900 font-bold focus:border-[#003311] focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Editoria</label>
                    <select 
                      value={manualCategory}
                      onChange={e => setManualCategory(e.target.value)}
                      className="border border-gray-300 p-3 rounded-lg w-full bg-white text-sm font-semibold focus:border-[#003311] focus:outline-none" 
                    >
                      <option>Política</option>
                      <option>Economia</option>
                      <option>Tecnologia</option>
                      <option>Internacional</option>
                      <option>Cultura</option>
                      <option>Esportes</option>
                      <option>Geral</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Linha Fina / Resumo (SEO Excerpt)</label>
                  <input 
                    required 
                    type="text" 
                    value={manualExcerpt}
                    onChange={e => setManualExcerpt(e.target.value)}
                    placeholder="Resumo objetivo do fato em 1 a 2 frases para a Home e o Google..." 
                    className="border border-gray-300 p-3 rounded-lg w-full text-sm focus:border-[#003311] focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">URL da Imagem de Capa (Opcional)</label>
                  <input 
                    type="url" 
                    value={manualImage}
                    onChange={e => setManualImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-exemplo.jpg" 
                    className="border border-gray-300 p-3 rounded-lg w-full text-sm focus:border-[#003311] focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Corpo da Matéria (Markdown com ## para Subtítulos e **negrito**)
                  </label>
                  <textarea 
                    required 
                    rows={12}
                    value={manualContent}
                    onChange={e => setManualContent(e.target.value)}
                    placeholder="Escreva a reportagem aqui. Use ## para subtítulos e quebre linhas duplas entre parágrafos..." 
                    className="border border-gray-300 p-3.5 rounded-lg w-full font-mono text-sm leading-relaxed focus:border-[#003311] focus:outline-none"
                  ></textarea>
                </div>

                <button
                  disabled={manualDrafting}
                  type="submit"
                  className="w-full bg-[#001c06] hover:bg-[#003311] text-white font-bold uppercase text-xs tracking-widest py-4 px-6 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {manualDrafting ? (
                    <>
                      <span className="inline-block animate-spin">⟳</span>
                      <span>Gravando no Banco de Dados...</span>
                    </>
                  ) : (
                    '✓ Publicar Matéria Imediatamente no Portal'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ABA 4: LOTERIAS DA CAIXA */}
          {activeTab === 'loterias' && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#001c06] flex items-center gap-2">
                  <span>🎰</span> Automação de Loterias da Caixa
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Extrai o último sorteio das 9 modalidades oficiais da Caixa e redige matérias otimizadas com IA.
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
                          Apurar concurso recente, dezenas e estimativa de prêmio.
                        </p>
                      </div>

                      <div>
                        {published ? (
                          <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 text-center font-bold">
                            ✓ Publicada no Portal
                          </div>
                        ) : (
                          <button
                            disabled={isProcessing}
                            onClick={() => generateLottery(lot.key, lot.name)}
                            className="w-full bg-[#003311] hover:bg-[#001c06] text-white text-[11px] font-bold uppercase tracking-wider py-2.5 px-3 rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
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

          {/* ABA 5: GERENCIAR POSTS */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#001c06] flex items-center gap-2">
                    <span>📁</span> Gerenciamento de Matérias
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Visualize, acesse no portal ou remova matérias publicadas no Supabase.
                  </p>
                </div>

                <button
                  onClick={fetchPosts}
                  disabled={loadingPosts}
                  className="bg-[#003311] hover:bg-[#001c06] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loadingPosts ? 'Recarregando...' : '⟳ Recarregar Lista'}
                </button>
              </div>

              {loadingPosts ? (
                <div className="text-center py-16 text-gray-400">
                  <span className="text-3xl inline-block animate-spin mb-3">📁</span>
                  <p className="text-xs font-bold uppercase tracking-widest">Carregando matérias do banco...</p>
                </div>
              ) : managedPosts.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f6f3f2] text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="p-3.5">Título / Manchete</th>
                        <th className="p-3.5 hidden sm:table-cell">Editoria</th>
                        <th className="p-3.5 hidden md:table-cell">Data</th>
                        <th className="p-3.5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {managedPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3.5 font-bold text-[#001c06]">
                            <Link href={`/materia/${post.id}`} target="_blank" className="hover:text-[#003311] hover:underline line-clamp-1">
                              {post.title}
                            </Link>
                          </td>
                          <td className="p-3.5 hidden sm:table-cell">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-mono text-[10px]">
                              {post.category_name}
                            </span>
                          </td>
                          <td className="p-3.5 hidden md:table-cell text-gray-500 font-mono text-[11px]">
                            {new Date(post.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                            <Link
                              href={`/materia/${post.id}`}
                              target="_blank"
                              className="text-gray-700 hover:text-[#003311] font-bold underline text-[11px]"
                            >
                              Ver ↗
                            </Link>
                            <button
                              disabled={deletingPostId === post.id}
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600 hover:text-red-800 font-bold text-[11px] disabled:opacity-50 ml-2"
                            >
                              {deletingPostId === post.id ? 'Excluindo...' : 'Excluir'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500">Nenhuma matéria encontrada no momento.</p>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* MODAL DE APURAÇÃO E REVISÃO EDITORIAL DA IA */}
      {reviewModalOpen && currentDraft && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
            
            {/* Modal Header */}
            <div className="bg-[#003311] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#d8561c]">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔍</span>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider">
                    Apuração & Revisão Editorial
                  </h3>
                  <p className="text-[11px] text-white/70">
                    Verifique os fatos apurados pela IA, faça edições e valide o texto antes de publicar.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setReviewModalOpen(false)}
                className="text-white/70 hover:text-white text-xl font-bold p-1 leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePublishReviewedDraft} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Título / Manchete
                  </label>
                  <input
                    required
                    type="text"
                    value={currentDraft.title}
                    onChange={e => setCurrentDraft({ ...currentDraft, title: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#003311]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Editoria
                  </label>
                  <select
                    value={currentDraft.category}
                    onChange={e => setCurrentDraft({ ...currentDraft, category: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm font-semibold bg-white focus:outline-none focus:border-[#003311]"
                  >
                    <option>Política</option>
                    <option>Economia</option>
                    <option>Internacional</option>
                    <option>Cultura</option>
                    <option>Esportes</option>
                    <option>Tecnologia</option>
                    <option>Geral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3 rounded border border-gray-200">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
                    Título SEO (Google - Máx 60 caracteres)
                  </label>
                  <input
                    type="text"
                    value={currentDraft.seo_title || ''}
                    onChange={e => setCurrentDraft({ ...currentDraft, seo_title: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#003311]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
                    Slug da URL Amigável
                  </label>
                  <input
                    type="text"
                    value={currentDraft.slug || ''}
                    onChange={e => setCurrentDraft({ ...currentDraft, slug: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono text-gray-800 bg-white focus:outline-none focus:border-[#003311]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
                    Meta Description (Snippet do Google - 130 a 150 caracteres)
                  </label>
                  <input
                    type="text"
                    value={currentDraft.meta_description || ''}
                    onChange={e => setCurrentDraft({ ...currentDraft, meta_description: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#003311]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Linha Fina / Resumo da Matéria
                </label>
                <input
                  required
                  type="text"
                  value={currentDraft.excerpt}
                  onChange={e => setCurrentDraft({ ...currentDraft, excerpt: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#003311]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Imagem de Capa (Sugerida pela IA / Editável)
                  </label>
                  {currentDraft.image && (
                    <button
                      type="button"
                      onClick={() => setCurrentDraft({ ...currentDraft, image: '' })}
                      className="text-[10px] text-red-600 font-bold hover:underline"
                    >
                      Limpar Link
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="https://exemplo.com/foto.jpg"
                  value={currentDraft.image || ''}
                  onChange={e => setCurrentDraft({ ...currentDraft, image: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#003311]"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  A IA preenche uma sugestão automaticamente. Você pode manter, alterar para qualquer URL ou apagar.
                </p>
                {currentDraft.image && (
                  <div className="mt-2 relative w-32 h-20 bg-gray-100 rounded overflow-hidden border border-gray-200">
                    <img
                      src={currentDraft.image}
                      alt="Preview da Capa"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Texto Completo da Matéria (Markdown com Tipografia)
                </label>
                <textarea
                  required
                  rows={10}
                  value={currentDraft.content}
                  onChange={e => setCurrentDraft({ ...currentDraft, content: e.target.value })}
                  className="w-full border border-gray-300 rounded p-3 font-mono text-sm leading-relaxed text-gray-800 focus:outline-none focus:border-[#003311]"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-5 py-2.5 rounded border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Descartar / Cancelar
                </button>
                <button
                  type="submit"
                  disabled={publishingDraft}
                  className="px-6 py-2.5 rounded bg-[#003311] hover:bg-[#001c06] text-white text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {publishingDraft ? (
                    <>
                      <span className="inline-block animate-spin">⟳</span>
                      <span>Publicando Matéria...</span>
                    </>
                  ) : (
                    '✓ Confirmar Apuração & Publicar no Portal'
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}


