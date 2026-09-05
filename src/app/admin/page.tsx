'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  slug?: string;
  excerpt: string;
  content?: string;
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'editor' | 'radar' | 'trends' | 'posts' | 'loterias' | 'media' | 'checklist'>('dashboard');

  // --- ESTADOS DO ESTÚDIO DE REDAÇÃO (WRITER STUDIO) ---
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Política');
  const [author, setAuthor] = useState('Redação Tagma News');
  
  // Imagem & Mídia
  const [image, setImage] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageCredit, setImageCredit] = useState('Agência / Divulgação');

  // SEO & Metadados
  const [seoTitle, setSeoTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [tags, setTags] = useState('');
  const [sources, setSources] = useState('');

  // Modo de visualização do editor (write | preview | split)
  const [editorMode, setEditorMode] = useState<'write' | 'preview' | 'split'>('write');
  const [publishing, setPublishing] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Assistente IA no Editor
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  // --- RADAR RSS ---
  const [radarItems, setRadarItems] = useState<RadarItem[]>([]);
  const [loadingRadar, setLoadingRadar] = useState(false);
  const [radarCategory, setRadarCategory] = useState('');
  const [draftingRadarMap, setDraftingRadarMap] = useState<Record<number, boolean>>({});

  // --- TRENDS ---
  const [trends, setTrends] = useState<TrendingTopic[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [draftingTrendMap, setDraftingTrendMap] = useState<Record<number, boolean>>({});

  // --- LOTERIAS ---
  const [lotteryLoadingMap, setLotteryLoadingMap] = useState<Record<string, boolean>>({});
  const [lotteryPublishedMap, setLotteryPublishedMap] = useState<Record<string, string>>({});

  // --- GERENCIAMENTO DE POSTS ---
  const [managedPosts, setManagedPosts] = useState<ManagedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [postsSearch, setPostsSearch] = useState('');

  // Contagens e Métricas
  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const readingTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  // Auditoria em Tempo Real (Pré-Publicação)
  const validationIssues = useMemo(() => {
    const issues: { field: string; message: string; critical: boolean }[] = [];
    if (!title.trim()) issues.push({ field: 'Título', message: 'Manchete obrigatória não preenchida', critical: true });
    else if (title.length < 20) issues.push({ field: 'Título', message: 'Título curto (recomendado 30+ caracteres)', critical: false });
    
    if (!excerpt.trim()) issues.push({ field: 'Linha Fina', message: 'Lide/Linha fina obrigatória para a Home e Google', critical: true });
    if (!content.trim() || wordCount < 40) issues.push({ field: 'Corpo', message: 'Texto muito curto para padrão Hard News (mín. 40 palavras)', critical: true });
    if (!image.trim()) issues.push({ field: 'Imagem', message: 'Imagem de capa recomendada para Open Graph e Google News', critical: false });
    if (image.trim() && !imageAlt.trim()) issues.push({ field: 'Acessibilidade', message: 'Texto alternativo (Alt) da imagem é obrigatório para WCAG 2.2', critical: true });
    if (!author.trim()) issues.push({ field: 'Autor', message: 'Autoria individual ou institucional obrigatória', critical: true });

    return issues;
  }, [title, excerpt, content, wordCount, image, imageAlt, author]);

  const isReadyToPublish = validationIssues.filter(i => i.critical).length === 0;

  useEffect(() => {
    fetchRadar();
    fetchTrends();
    fetchPosts();
  }, []);

  // Gerador automático de slug
  const generateSlugFromTitle = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

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

  const fetchTrends = async () => {
    setLoadingTrends(true);
    try {
      const res = await fetch('/api/admin/trending-topics');
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

  // Carregar notícia do Radar no Estúdio de Redação
  const handleLoadRadarToStudio = async (item: RadarItem, index: number) => {
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
        setTitle(data.draft.title || item.title);
        setExcerpt(data.draft.excerpt || item.description);
        setContent(data.draft.content || '');
        setCategory(data.draft.category || item.category || 'Geral');
        setSeoTitle(data.draft.seo_title || data.draft.title);
        setSlug(data.draft.slug || generateSlugFromTitle(data.draft.title));
        setMetaDescription(data.draft.meta_description || data.draft.excerpt);
        setImage(data.draft.suggested_image || '');
        setImageAlt(`Foto referente à reportagem sobre ${data.draft.title}`);
        setSources(`Com informações de ${item.source} (${item.link})`);
        setActiveTab('editor');
      } else {
        setTitle(item.title);
        setExcerpt(item.description);
        setCategory(item.category || 'Geral');
        setSources(`Fonte original: ${item.source} - ${item.link}`);
        setActiveTab('editor');
      }
    } catch (e) {
      setTitle(item.title);
      setExcerpt(item.description);
      setCategory(item.category || 'Geral');
      setSources(`Fonte original: ${item.source}`);
      setActiveTab('editor');
    } finally {
      setDraftingRadarMap(prev => ({ ...prev, [index]: false }));
    }
  };

  // Carregar Trend no Estúdio
  const handleLoadTrendToStudio = async (trend: TrendingTopic, index: number) => {
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
        setTitle(data.draft.title);
        setExcerpt(data.draft.excerpt);
        setContent(data.draft.content);
        setCategory(data.draft.category || trend.category || 'Geral');
        setSeoTitle(data.draft.seo_title || data.draft.title);
        setSlug(data.draft.slug || generateSlugFromTitle(data.draft.title));
        setMetaDescription(data.draft.meta_description || data.draft.excerpt);
        setImage(data.draft.suggested_image || '');
        setImageAlt(`Reportagem sobre ${trend.title}`);
        setTags(trend.keywords);
        setActiveTab('editor');
      } else {
        setTitle(trend.title);
        setExcerpt(trend.angle);
        setCategory(trend.category || 'Geral');
        setTags(trend.keywords);
        setActiveTab('editor');
      }
    } catch (e) {
      setTitle(trend.title);
      setExcerpt(trend.angle);
      setCategory(trend.category || 'Geral');
      setTags(trend.keywords);
      setActiveTab('editor');
    } finally {
      setDraftingTrendMap(prev => ({ ...prev, [index]: false }));
    }
  };

  // Assistência Editorial IA
  const handleCallAiAssist = async (action: string) => {
    setAiLoading(true);
    setAiSuggestions(null);
    try {
      const res = await fetch('/api/admin/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          title,
          excerpt,
          content,
          category,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiSuggestions(data.data);
      } else {
        alert(`Erro na assistência IA: ${data.error || 'Falha ao consultar modelo'}`);
      }
    } catch (e) {
      alert('Erro de conexão ao acionar a IA.');
    } finally {
      setAiLoading(false);
    }
  };

  // Publicar Matéria Oficial
  const handlePublishArticle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isReadyToPublish) {
      alert('Por favor, corrija as pendências críticas antes de publicar.');
      return;
    }

    setPublishing(true);
    setSaveSuccessMessage(null);
    try {
      const finalSlug = slug.trim() || generateSlugFromTitle(title);
      const res = await fetch('/api/draft/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          seo_title: seoTitle || title,
          slug: finalSlug,
          meta_description: metaDescription || excerpt,
          excerpt,
          image,
          content,
          category,
          tags: tags ? tags.split(',').map(t => t.trim()) : [category.toLowerCase()],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMessage('✓ Matéria publicada com sucesso no portal!');
        fetchPosts();
      } else {
        alert(`Erro ao publicar: ${data.error}`);
      }
    } catch (err) {
      alert('Erro de rede ao publicar matéria.');
    } finally {
      setPublishing(false);
    }
  };

  // Apuração de Loterias Caixa
  const generateLottery = async (loteriaKey: string, loteriaName: string) => {
    setLotteryLoadingMap(prev => ({ ...prev, [loteriaKey]: true }));
    try {
      const res = await fetch(`/api/loterias?loteria=${loteriaKey}`);
      const data = await res.json();
      if (data.success) {
        setLotteryPublishedMap(prev => ({ ...prev, [loteriaKey]: data.post?.title || 'Publicada' }));
        fetchPosts();
      } else {
        alert(`Erro: ${data.error || 'Falha ao apurar loteria'}`);
      }
    } catch (e) {
      alert('Erro na conexão com a API de Loterias.');
    } finally {
      setLotteryLoadingMap(prev => ({ ...prev, [loteriaKey]: false }));
    }
  };

  // Excluir Post
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

  // Inserção rápida no editor Markdown
  const insertMarkdown = (syntax: string, placeholder = '') => {
    setContent(prev => `${prev}\n${syntax}${placeholder}`);
  };

  return (
    <div className="min-h-screen bg-[#f4f2f0] flex flex-col font-sans text-gray-900">
      
      {/* TOP NEWSROOM HEADER */}
      <header className="bg-[#001c06] text-white border-b-4 border-[#d8561c] px-4 lg:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-serif-title text-2xl font-normal lowercase tracking-tight text-white hover:opacity-90">
            tagma
          </Link>
          <span className="h-5 w-px bg-white/20"></span>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-white leading-none">
                Newsroom & Central de Produção Editorial
              </h1>
            </div>
            <p className="text-[10px] text-white/60 mt-0.5 font-normal">
              Estúdio de Redação • Radar RSS • Curadoria IA • Loterias Caixa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => {
              setTitle('');
              setExcerpt('');
              setContent('');
              setSaveSuccessMessage(null);
              setActiveTab('editor');
            }}
            className="bg-[#d8561c] hover:bg-[#b04313] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>✍️</span> Nova Matéria
          </button>
          <Link
            href="/"
            target="_blank"
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-colors"
          >
            Ver Portal ↗
          </Link>
        </div>
      </header>

      {/* SUB-NAV TABS */}
      <nav aria-label="Abas de Produção Editorial" className="bg-[#003311] text-white px-4 lg:px-8 border-b border-white/10 overflow-x-auto scrollbar-none flex items-center gap-1 py-1">
        {[
          { key: 'dashboard', label: '📊 Visão Geral' },
          { key: 'editor', label: '✍️ Estúdio de Redação' },
          { key: 'radar', label: `📡 Radar RSS (${radarItems.length})` },
          { key: 'trends', label: '💡 IA Trends' },
          { key: 'posts', label: `📁 Matérias (${managedPosts.length})` },
          { key: 'loterias', label: '🎰 Loterias Caixa' },
          { key: 'media', label: '🖼️ Biblioteca de Mídia' },
          { key: 'checklist', label: '📋 Manual & Checklist' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap rounded-t transition-all ${
              activeTab === tab.key
                ? 'bg-[#f4f2f0] text-[#001c06] shadow-sm font-extrabold'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* MAIN CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">

        {/* 1. ABA DASHBOARD / VISÃO GERAL */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total de Matérias</span>
                  <p className="text-2xl font-black text-[#001c06] mt-1">{managedPosts.length}</p>
                </div>
                <span className="text-2xl p-3 bg-emerald-50 rounded-lg text-[#003311]">📰</span>
              </div>

              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Radar Concorrentes</span>
                  <p className="text-2xl font-black text-[#001c06] mt-1">{radarItems.length} feeds</p>
                </div>
                <span className="text-2xl p-3 bg-blue-50 rounded-lg text-blue-800">📡</span>
              </div>

              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pautas Sugeridas</span>
                  <p className="text-2xl font-black text-[#001c06] mt-1">{trends.length} pautas</p>
                </div>
                <span className="text-2xl p-3 bg-orange-50 rounded-lg text-[#d8561c]">💡</span>
              </div>

              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loterias Caixa</span>
                  <p className="text-2xl font-black text-[#001c06] mt-1">9 modalidades</p>
                </div>
                <span className="text-2xl p-3 bg-purple-50 rounded-lg text-purple-800">🎰</span>
              </div>
            </div>

            {/* Quick Actions & Recent Posts Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#001c06]">
                    Últimas Publicações no Portal
                  </h2>
                  <button onClick={fetchPosts} className="text-xs text-[#003311] font-bold hover:underline">
                    ⟳ Recarregar
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {managedPosts.slice(0, 5).map(post => (
                    <div key={post.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#003311] bg-gray-100 px-2 py-0.5 rounded">
                          {post.category_name}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                          <Link href={`/materia/${post.id}`} target="_blank" className="hover:text-[#d8561c] hover:underline line-clamp-1">
                            {post.title}
                          </Link>
                        </h3>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(post.created_at).toLocaleDateString('pt-BR')} • Por {post.author}
                        </span>
                      </div>
                      <Link
                        href={`/materia/${post.id}`}
                        target="_blank"
                        className="px-2.5 py-1 bg-gray-100 hover:bg-[#003311] hover:text-white rounded text-[10px] font-bold uppercase transition-colors"
                      >
                        Ver ↗
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#001c06] border-b border-gray-100 pb-3">
                  Atalhos da Redação
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('editor')}
                    className="w-full text-left p-3 bg-[#f4f2f0] hover:bg-[#003311] hover:text-white rounded-lg transition-colors flex items-center justify-between text-xs font-bold"
                  >
                    <span>✍️ Abrir Estúdio de Escrita</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('radar')}
                    className="w-full text-left p-3 bg-[#f4f2f0] hover:bg-[#003311] hover:text-white rounded-lg transition-colors flex items-center justify-between text-xs font-bold"
                  >
                    <span>📡 Monitorar Radar RSS</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('trends')}
                    className="w-full text-left p-3 bg-[#f4f2f0] hover:bg-[#003311] hover:text-white rounded-lg transition-colors flex items-center justify-between text-xs font-bold"
                  >
                    <span>💡 Explorar Pautas IA</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('loterias')}
                    className="w-full text-left p-3 bg-[#f4f2f0] hover:bg-[#003311] hover:text-white rounded-lg transition-colors flex items-center justify-between text-xs font-bold"
                  >
                    <span>🎰 Apurar Loterias Caixa</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ABA ESTÚDIO DE REDAÇÃO (WRITER STUDIO) */}
        {activeTab === 'editor' && (
          <div className="space-y-4">
            
            {/* Top Action Bar */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                <span>Palavras: <strong className="text-gray-900">{wordCount}</strong></span>
                <span>•</span>
                <span>Tempo de Leitura: <strong className="text-gray-900">{readingTime} min</strong></span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded font-bold ${isReadyToPublish ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                  {isReadyToPublish ? '✓ Pronto para Publicação' : `⚠️ ${validationIssues.filter(i => i.critical).length} Pendências`}
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="bg-gray-100 p-1 rounded flex text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setEditorMode('write')}
                    className={`px-2.5 py-1 rounded ${editorMode === 'write' ? 'bg-white shadow-sm text-[#001c06]' : 'text-gray-600'}`}
                  >
                    Escrita
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('split')}
                    className={`px-2.5 py-1 rounded hidden md:inline-block ${editorMode === 'split' ? 'bg-white shadow-sm text-[#001c06]' : 'text-gray-600'}`}
                  >
                    Dividido
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('preview')}
                    className={`px-2.5 py-1 rounded ${editorMode === 'preview' ? 'bg-white shadow-sm text-[#001c06]' : 'text-gray-600'}`}
                  >
                    Preview
                  </button>
                </div>

                <button
                  type="button"
                  disabled={publishing}
                  onClick={handlePublishArticle}
                  className="bg-[#001c06] hover:bg-[#003311] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all shadow disabled:opacity-50 flex items-center gap-2"
                >
                  {publishing ? 'Gravando no Banco...' : '✓ Publicar no Portal'}
                </button>
              </div>
            </div>

            {saveSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex justify-between items-center">
                <span>{saveSuccessMessage}</span>
                <Link href="/" target="_blank" className="underline font-mono">
                  Visualizar no Portal →
                </Link>
              </div>
            )}

            {/* Main Studio Grid: Canvas (70%) + Metadata & AI Assistant (30%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* CANVAS DE ESCRITA (lg:col-span-8) */}
              <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm space-y-6">
                
                {/* Título & Linha Fina */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700">
                      Manchete / Título Principal
                    </label>
                    <span className={`text-[10px] font-mono ${title.length > 65 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                      {title.length}/65 caracteres
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => {
                      setTitle(e.target.value);
                      if (!slug) setSlug(generateSlugFromTitle(e.target.value));
                    }}
                    placeholder="Escreva a manchete jornalística de impacto..."
                    className="w-full text-xl sm:text-2xl font-bold font-sans text-gray-900 border-b-2 border-gray-300 focus:border-[#003311] focus:outline-none pb-2 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                    Lide / Linha Fina (Resumo da Notícia para Home & Google)
                  </label>
                  <textarea
                    rows={2}
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    placeholder="Resumo do fato em 1 a 2 frases objetivas. Responda: Quem, O quê, Onde e Por quê..."
                    className="w-full text-sm font-serif italic text-gray-700 border border-gray-200 rounded p-3 focus:border-[#003311] focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Toolbar de Formatação Markdown */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                  <button type="button" onClick={() => insertMarkdown('## ', 'Subtítulo da Seção')} className="px-2 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded font-bold" title="Subtítulo H2">
                    H2
                  </button>
                  <button type="button" onClick={() => insertMarkdown('### ', 'Intertítulo')} className="px-2 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded font-bold" title="Subtítulo H3">
                    H3
                  </button>
                  <button type="button" onClick={() => insertMarkdown('**', 'texto em negrito**')} className="px-2 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded font-bold" title="Negrito">
                    B
                  </button>
                  <button type="button" onClick={() => insertMarkdown('*', 'texto em itálico*')} className="px-2 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded italic font-bold" title="Itálico">
                    I
                  </button>
                  <button type="button" onClick={() => insertMarkdown('> ', 'Citação ou aspas de autoridade')} className="px-2 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded font-mono" title="Citação">
                    &quot; Quote
                  </button>
                  <button type="button" onClick={() => insertMarkdown('- ', 'Item da lista')} className="px-2 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded" title="Lista de marcadores">
                    • Lista
                  </button>
                  <button type="button" onClick={() => insertMarkdown('[Texto do link](https://exemplo.com)')} className="px-2 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded" title="Inserir Link">
                    🔗 Link
                  </button>
                  <button type="button" onClick={() => insertMarkdown('\n---\n')} className="px-2 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded font-mono" title="Divisor horizontal">
                    --- Linha
                  </button>
                </div>

                {/* Editor Textarea / Split / Preview */}
                {editorMode === 'write' && (
                  <div>
                    <textarea
                      rows={16}
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Redija a reportagem aqui. Use ## para subtítulos e separe parágrafos com duas quebras de linha..."
                      className="w-full font-mono text-sm leading-relaxed p-4 border border-gray-300 rounded-lg focus:border-[#003311] focus:outline-none"
                    />
                  </div>
                )}

                {editorMode === 'split' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <textarea
                      rows={16}
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Markdown..."
                      className="w-full font-mono text-xs leading-relaxed p-3 border border-gray-300 rounded-lg focus:border-[#003311] focus:outline-none"
                    />
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-y-auto max-h-[400px] prose prose-sm prose-green font-serif">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content || '*O preview da matéria aparecerá aqui em tempo real...*'}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {editorMode === 'preview' && (
                  <div className="border border-gray-200 rounded-lg p-6 bg-[#fcf9f8] min-h-[350px] prose prose-lg prose-green max-w-none font-serif">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content || '*Nenhum conteúdo digitado para visualização.*'}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* PAINEL LATERAL: METADADOS & ASSISTENTE IA (lg:col-span-4) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Accordion 1: Editoria & Autoria */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#001c06] border-b border-gray-100 pb-2">
                    Estrutura Editorial
                  </h3>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                      Editoria / Seção
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-xs font-bold bg-white focus:outline-none focus:border-[#003311]"
                    >
                      <option>Política</option>
                      <option>Economia</option>
                      <option>Internacional</option>
                      <option>Tecnologia</option>
                      <option>Esportes</option>
                      <option>Cultura</option>
                      <option>Geral</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                      Assinatura / Autor
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={e => setAuthor(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-xs focus:outline-none focus:border-[#003311]"
                    />
                  </div>
                </div>

                {/* Accordion 2: Imagem & Mídia (com Acessibilidade) */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#001c06] border-b border-gray-100 pb-2">
                    Capa & Acessibilidade
                  </h3>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                      URL da Imagem (Unsplash / CDN)
                    </label>
                    <input
                      type="url"
                      value={image}
                      onChange={e => setImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full border border-gray-300 rounded p-2 text-xs focus:outline-none focus:border-[#003311]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                      Texto Alternativo (Alt - Obrigatório WCAG)
                    </label>
                    <input
                      type="text"
                      value={imageAlt}
                      onChange={e => setImageAlt(e.target.value)}
                      placeholder="Descrição clara do conteúdo visual da foto..."
                      className="w-full border border-gray-300 rounded p-2 text-xs focus:outline-none focus:border-[#003311]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                      Crédito Fotográfico
                    </label>
                    <input
                      type="text"
                      value={imageCredit}
                      onChange={e => setImageCredit(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-xs focus:outline-none focus:border-[#003311]"
                    />
                  </div>
                </div>

                {/* Accordion 3: Assistente Editorial IA */}
                <div className="bg-[#001c06] text-white p-4 rounded-lg shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#d8561c] flex items-center gap-1.5">
                      <span>🤖</span> Assistente Editorial IA
                    </h3>
                    <span className="text-[9px] uppercase font-mono text-green-300 bg-white/10 px-1.5 py-0.5 rounded">
                      Mixtral Ativo
                    </span>
                  </div>

                  <p className="text-[11px] text-white/70 leading-relaxed">
                    Ferramentas contextuais para enriquecer o texto antes de publicar.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase">
                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={() => handleCallAiAssist('suggest_titles')}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors text-left"
                    >
                      💡 3 Títulos SEO
                    </button>
                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={() => handleCallAiAssist('generate_excerpt')}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors text-left"
                    >
                      ✍️ Gerar Linha Fina
                    </button>
                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={() => handleCallAiAssist('generate_seo')}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors text-left"
                    >
                      🚀 Otimizar SEO
                    </button>
                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={() => handleCallAiAssist('editorial_audit')}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors text-left"
                    >
                      🔍 Auditar Apuração
                    </button>
                  </div>

                  {aiLoading && (
                    <div className="text-center py-4 text-xs text-orange-400 font-bold animate-pulse">
                      Consultando modelo editorial da IA...
                    </div>
                  )}

                  {aiSuggestions && (
                    <div className="bg-white/10 p-3 rounded text-xs space-y-2 text-white">
                      <span className="text-[10px] uppercase font-bold text-orange-300 block">
                        Sugestões Retornadas:
                      </span>

                      {aiSuggestions.suggestions && (
                        <div className="space-y-1.5">
                          {aiSuggestions.suggestions.map((sug: string, idx: number) => (
                            <div key={idx} className="p-2 bg-white/5 rounded flex justify-between items-center gap-2">
                              <span className="text-xs line-clamp-2">{sug}</span>
                              <button
                                type="button"
                                onClick={() => setTitle(sug)}
                                className="text-[10px] bg-[#d8561c] px-2 py-1 rounded font-bold uppercase hover:opacity-90 flex-shrink-0"
                              >
                                Usar
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {aiSuggestions.excerpt && (
                        <div className="p-2 bg-white/5 rounded space-y-2">
                          <p className="text-xs italic">{aiSuggestions.excerpt}</p>
                          <button
                            type="button"
                            onClick={() => setExcerpt(aiSuggestions.excerpt)}
                            className="text-[10px] bg-[#d8561c] px-2 py-1 rounded font-bold uppercase hover:opacity-90"
                          >
                            Aplicar Linha Fina
                          </button>
                        </div>
                      )}

                      {aiSuggestions.seo_title && (
                        <div className="p-2 bg-white/5 rounded space-y-2">
                          <p className="text-[11px]"><strong>SEO Title:</strong> {aiSuggestions.seo_title}</p>
                          <p className="text-[11px]"><strong>Meta:</strong> {aiSuggestions.meta_description}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setSeoTitle(aiSuggestions.seo_title);
                              setSlug(aiSuggestions.slug);
                              setMetaDescription(aiSuggestions.meta_description);
                            }}
                            className="text-[10px] bg-[#d8561c] px-2 py-1 rounded font-bold uppercase hover:opacity-90"
                          >
                            Aplicar Metadados SEO
                          </button>
                        </div>
                      )}

                      {aiSuggestions.score !== undefined && (
                        <div className="p-2 bg-white/5 rounded space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">Pontuação Editorial:</span>
                            <span className="text-sm font-black text-green-400">{aiSuggestions.score}/100</span>
                          </div>
                          <p className="text-[11px] text-white/80">{aiSuggestions.lead_check}</p>
                          {aiSuggestions.unanswered_questions?.length > 0 && (
                            <div>
                              <span className="text-[10px] font-bold text-amber-300 block">Dúvidas a apurar:</span>
                              <ul className="list-disc pl-4 text-[10px] text-white/70">
                                {aiSuggestions.unanswered_questions.map((q: string, i: number) => (
                                  <li key={i}>{q}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Accordion 4: SEO & Snippet do Google */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#001c06] border-b border-gray-100 pb-2">
                    SEO & Google Search
                  </h3>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                      Título SEO (Google - máx 60 caracteres)
                    </label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={e => setSeoTitle(e.target.value)}
                      placeholder={title || 'Título otimizado para o buscador...'}
                      className="w-full border border-gray-300 rounded p-2 text-xs focus:outline-none focus:border-[#003311]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                      Slug da URL
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      placeholder="url-amigavel-da-materia"
                      className="w-full border border-gray-300 rounded p-2 text-xs font-mono focus:outline-none focus:border-[#003311]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                      Meta Description (130-150 caracteres)
                    </label>
                    <textarea
                      rows={2}
                      value={metaDescription}
                      onChange={e => setMetaDescription(e.target.value)}
                      placeholder="Texto exibido abaixo do título nos resultados de busca..."
                      className="w-full border border-gray-300 rounded p-2 text-xs focus:outline-none focus:border-[#003311]"
                    />
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* 3. ABA RADAR DA CONCORRÊNCIA (RSS) */}
        {activeTab === 'radar' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#001c06] flex items-center gap-2">
                  <span>📡</span> Radar de Concorrência em Tempo Real
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Monitoramento contínuo dos maiores portais (G1, Agência Brasil, Reuters, Google News).
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
                  className="bg-[#003311] hover:bg-[#001c06] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loadingRadar ? 'Varrendo feeds...' : '⟳ Atualizar Radar'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {radarItems.map((item, idx) => {
                const isDrafting = draftingRadarMap[idx];
                return (
                  <div key={item.id || idx} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between hover:border-[#003311] transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] uppercase font-bold text-[#003311] bg-gray-100 px-2 py-0.5 rounded">
                          {item.source} • {item.category}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {item.pubDate ? new Date(item.pubDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#001c06] leading-snug mb-2">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 font-serif leading-relaxed mb-4">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-gray-500 hover:text-[#003311] font-bold underline"
                      >
                        Abrir Fonte ↗
                      </a>
                      <button
                        disabled={isDrafting}
                        onClick={() => handleLoadRadarToStudio(item, idx)}
                        className="px-3 py-1.5 bg-[#001c06] hover:bg-[#003311] text-white text-[10px] font-bold uppercase rounded tracking-wider transition-colors disabled:opacity-50"
                      >
                        {isDrafting ? 'Carregando...' : '⚡ Criar Pauta no Estúdio'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. ABA TRENDS / SUGESTÕES DE PAUTAS */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#001c06] flex items-center gap-2">
                  <span>💡</span> Sugestões de Pautas & Tendências IA
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Pautas estruturadas com ângulo editorial investigativo e termos para ranqueamento orgânico.
                </p>
              </div>

              <button
                onClick={fetchTrends}
                disabled={loadingTrends}
                className="bg-[#003311] hover:bg-[#001c06] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                {loadingTrends ? 'Gerando novas pautas...' : '⟳ Novas Sugestões'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trends.map((trend, idx) => {
                const isDrafting = draftingTrendMap[idx];
                return (
                  <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between hover:border-[#003311] transition-all space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] uppercase font-bold text-[#d8561c] bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                          {trend.category}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          Alta Relevância
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-[#001c06]">
                        {trend.title}
                      </h3>
                      <p className="text-xs text-gray-600 font-serif leading-relaxed mt-2">
                        <strong>Ângulo Jornalístico:</strong> {trend.angle}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-gray-400 font-mono">
                        Tags: {trend.keywords}
                      </span>
                      <button
                        disabled={isDrafting}
                        onClick={() => handleLoadTrendToStudio(trend, idx)}
                        className="px-4 py-2 bg-[#d8561c] hover:bg-[#b04313] text-white text-xs font-bold uppercase rounded tracking-wider transition-colors disabled:opacity-50"
                      >
                        {isDrafting ? 'Carregando...' : 'Carregar no Estúdio →'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. ABA GERENCIAR MATÉRIAS */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#001c06] flex items-center gap-2">
                  <span>📁</span> Matérias Publicadas & Arquivo
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Gerencie todas as reportagens cadastradas no banco de dados.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="search"
                  value={postsSearch}
                  onChange={e => setPostsSearch(e.target.value)}
                  placeholder="Filtrar por título..."
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-[#003311]"
                />
                <button
                  onClick={fetchPosts}
                  disabled={loadingPosts}
                  className="bg-[#003311] hover:bg-[#001c06] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
                >
                  {loadingPosts ? '...' : '⟳'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
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
                  {managedPosts
                    .filter(p => !postsSearch || p.title.toLowerCase().includes(postsSearch.toLowerCase()))
                    .map(post => (
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
                          <button
                            type="button"
                            onClick={() => {
                              setTitle(post.title);
                              setExcerpt(post.excerpt);
                              setContent(post.content || '');
                              setCategory(post.category_name);
                              setImage(post.image || '');
                              setActiveTab('editor');
                            }}
                            className="text-[#003311] hover:underline font-bold text-[11px]"
                          >
                            Editar no Estúdio
                          </button>
                          <Link
                            href={`/materia/${post.id}`}
                            target="_blank"
                            className="text-gray-700 hover:text-[#003311] font-bold underline text-[11px] ml-2"
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
          </div>
        )}

        {/* 6. ABA LOTERIAS CAIXA */}
        {activeTab === 'loterias' && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#001c06] flex items-center gap-2">
                <span>🎰</span> Automação de Loterias da Caixa
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Extrai o último sorteio das 9 modalidades oficiais da Caixa e redige matérias otimizadas para SEO.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {LOTTERIES_LIST.map((lot) => {
                const isProcessing = Boolean(lotteryLoadingMap[lot.key]);
                const published = lotteryPublishedMap[lot.key];

                return (
                  <div key={lot.key} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm flex flex-col justify-between hover:border-gray-400 transition-all">
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
                        Apurar concurso recente, dezenas sorteadas e estimativa de prêmio.
                      </p>
                    </div>

                    <div>
                      <button
                        disabled={isProcessing}
                        onClick={() => generateLottery(lot.key, lot.name)}
                        className="w-full bg-[#003311] hover:bg-[#001c06] text-white text-[11px] font-bold uppercase tracking-wider py-2.5 px-3 rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                      >
                        {isProcessing ? 'Apurando...' : `Apurar ${lot.name} →`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. ABA BIBLIOTECA DE MÍDIA */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#001c06] flex items-center gap-2">
                <span>🖼️</span> Biblioteca de Mídia & Validador de Imagens
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Guia de licenciamento, proporções (16:9 / 1200x630) e conformidade de acessibilidade (Alt obrigatório).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#001c06]">
                  Testar e Validar URL de Imagem
                </h3>
                <input
                  type="url"
                  placeholder="Cole aqui o link direto da imagem (jpg, png, webp)..."
                  className="w-full border border-gray-300 rounded p-2.5 text-xs focus:outline-none focus:border-[#003311]"
                  onChange={e => setImage(e.target.value)}
                  value={image}
                />
                {image && (
                  <div className="relative aspect-video bg-gray-100 rounded overflow-hidden border border-gray-200">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('editor');
                  }}
                  className="px-4 py-2 bg-[#001c06] text-white text-xs font-bold uppercase rounded"
                >
                  Usar esta imagem no Estúdio de Redação →
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#001c06]">
                  Diretrizes de Qualidade Fotográfica
                </h3>
                <ul className="list-disc pl-5 text-xs text-gray-600 space-y-2 leading-relaxed font-serif">
                  <li><strong>Proporção Padrão:</strong> 16:9 horizontal (1200 × 675 px mínimo) para Open Graph e Google Discover.</li>
                  <li><strong>Texto Alternativo (Alt):</strong> Obrigatório. Descreva a cena factual sem adjetivos subjetivos.</li>
                  <li><strong>Licenciamento:</strong> Use apenas acervos autorizados (Unsplash, Agência Brasil, Pexels ou fotos próprias).</li>
                  <li><strong>Créditos:</strong> Sempre registre o nome do fotógrafo ou agência responsável.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 8. ABA MANUAL & CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm space-y-6 max-w-4xl">
            <div className="border-b-2 border-[#003311] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#d8561c]">
                Governança Editorial
              </span>
              <h2 className="text-2xl font-black text-[#001c06] mt-1">
                Manual de Redação & Leis de Ouro Hard News
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed font-serif">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-bold font-sans text-sm text-[#001c06] mb-1">1. Regra da Pirâmide Invertida</h3>
                <p>O primeiro parágrafo (Lide) DEVE responder: Quem, O quê, Onde, Quando, Como e Por quê. A informação mais importante nunca deve ser escondida no meio do texto.</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-bold font-sans text-sm text-[#001c06] mb-1">2. Zero Travessões & Clichês de IA</h3>
                <p>É estritamente proibido o uso de travessões (—) para separar orações. Evite termos robóticos como &quot;Além disso&quot;, &quot;Crucial&quot;, &quot;Em suma&quot; e &quot;Mergulhe&quot;.</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-bold font-sans text-sm text-[#001c06] mb-1">3. Escaneabilidade Obrigatória</h3>
                <p>Nenhum parágrafo deve ter mais de 4 linhas. A cada 3 parágrafos, insira um subtítulo com marcação markdown (## ) e use listas (-) para destacar dados numéricos.</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-bold font-sans text-sm text-[#001c06] mb-1">4. Atribuição de Fontes</h3>
                <p>Toda notícia deve citar a fonte primária dos fatos no corpo e conter a frase final &quot;Com informações de [Fonte]&quot;.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
