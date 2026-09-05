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
  { key: 'megasena', name: 'Mega-Sena', color: 'border-emerald-600' },
  { key: 'lotofacil', name: 'Lotofácil', color: 'border-purple-600' },
  { key: 'quina', name: 'Quina', color: 'border-blue-600' },
  { key: 'lotomania', name: 'Lotomania', color: 'border-amber-600' },
  { key: 'timemania', name: 'Timemania', color: 'border-yellow-500' },
  { key: 'duplasena', name: 'Dupla Sena', color: 'border-red-600' },
  { key: 'diadesorte', name: 'Dia de Sorte', color: 'border-orange-500' },
  { key: 'supersete', name: 'Super Sete', color: 'border-teal-600' },
  { key: 'maismilionaria', name: '+Milionária', color: 'border-indigo-600' },
];

export default function AdminPage() {
  const [category, setCategory] = useState('Política');
  const [pautas, setPautas] = useState<PautaItem[]>([]);
  const [loadingPautas, setLoadingPautas] = useState(false);
  const [draftingMap, setDraftingMap] = useState<Record<number, boolean>>({});
  const [lotteryLoadingMap, setLotteryLoadingMap] = useState<Record<string, boolean>>({});
  const [manualDrafting, setManualDrafting] = useState(false);

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
        alert(`Matéria gerada e publicada com sucesso!\n\nTítulo: ${data.post.title}`);
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
        alert(`Matéria da ${loteriaName} gerada e publicada com sucesso!\n\nTítulo: ${data.post.title}`);
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
    <div className="min-h-screen bg-[#fcf9f8] p-4 md:p-8 font-serif">
      <div className="max-w-6xl mx-auto bg-white p-6 md:p-8 rounded shadow-lg border-t-4 border-[#003311]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#001c06] font-sans tracking-tight">Redação Tagma (IA)</h1>
            <p className="text-xs text-gray-500 font-sans mt-1">Motor de Hard News RSS e Automação de Loterias</p>
          </div>
          <Link href="/" className="text-sm font-sans font-bold uppercase text-[#d8561c] hover:underline">
            Ir para a Home
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PAUTAS RSS / HARD NEWS (7 colunas) */}
          <div className="lg:col-span-7 p-6 bg-gray-50 border border-gray-200 rounded">
            <h2 className="text-lg font-sans font-bold uppercase tracking-widest text-[#001c06] mb-2">
              Motor de Hard News (Feeds RSS)
            </h2>
            <p className="text-xs text-gray-600 mb-6 font-sans leading-relaxed">
              Varre feeds RSS em tempo real (Agência Brasil, G1, Reuters) e extrai fatos brutos para a IA redigir com rigor factual.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="border p-3 rounded font-sans w-full sm:w-1/2 bg-white text-sm"
              >
                <option>Política</option>
                <option>Economia</option>
                <option>Internacional</option>
                <option>Cultura</option>
                <option>Esportes</option>
                <option>Tecnologia</option>
              </select>
              <button 
                onClick={fetchPautas}
                disabled={loadingPautas}
                className="bg-[#d8561c] text-white font-sans font-bold uppercase text-xs tracking-widest px-6 py-3 rounded hover:bg-[#934b00] disabled:opacity-50 w-full sm:w-1/2 transition-colors flex items-center justify-center gap-2"
              >
                {loadingPautas ? (
                  <>
                    <span className="inline-block animate-spin">⟳</span>
                    <span>Varrendo RSS...</span>
                  </>
                ) : (
                  '1. Buscar Fatos (RSS)'
                )}
              </button>
            </div>

            {pautas.length > 0 && (
              <div className="mt-6 border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-xs uppercase tracking-widest font-sans text-gray-700">
                    Fatos Encontrados ({pautas.length}):
                  </h3>
                  <span className="text-[10px] uppercase font-sans text-gray-400">Feeds Verificados</span>
                </div>

                <div className="flex flex-col gap-4">
                  {pautas.map((p, i) => {
                    const isDraftingThis = Boolean(draftingMap[i]);
                    return (
                      <div key={i} className="border p-4 bg-white rounded shadow-sm hover:border-[#003311] transition-colors">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[9px] uppercase font-sans font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                            {p.source || 'RSS Feed'}
                          </span>
                        </div>
                        <h4 className="font-bold font-sans text-sm mb-2 text-[#001c06] leading-snug">{p.title}</h4>
                        <p className="text-xs text-gray-600 mb-4 line-clamp-3 leading-relaxed">{p.description}</p>
                        <button 
                          disabled={isDraftingThis}
                          onClick={() => generateDraft(p, i)}
                          className="w-full bg-[#003311] text-white text-xs font-sans font-bold uppercase tracking-widest py-2.5 rounded hover:bg-[#001c06] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                          {isDraftingThis ? (
                            <>
                              <span className="inline-block animate-spin">⟳</span>
                              <span>Redigindo Matéria...</span>
                            </>
                          ) : (
                            '2. Redigir e Publicar (Hard News)'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* LOTERIAS (AUTOMAÇÃO TOTAL - 9 MODALIDADES) (5 colunas) */}
          <div className="lg:col-span-5 p-6 bg-[#003311] text-white rounded shadow-inner flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-sans font-bold uppercase tracking-widest text-white mb-2">
                Loterias da Caixa
              </h2>
              <p className="text-xs text-gray-300 mb-6 font-sans leading-relaxed">
                Extração direta com tolerância a falhas (API Caixa + API Pública Fallback). Clique para apurar e publicar individualmente:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                {LOTTERIES_LIST.map((lot) => {
                  const isProcessing = Boolean(lotteryLoadingMap[lot.key]);
                  return (
                    <button 
                      key={lot.key}
                      onClick={() => generateLottery(lot.key, lot.name)}
                      disabled={isProcessing}
                      className="bg-[#f6f3f2] text-[#003311] border-2 border-transparent hover:border-[#d8561c] font-sans font-bold uppercase text-xs tracking-wider px-4 py-2.5 rounded disabled:opacity-60 disabled:cursor-not-allowed w-full transition-all text-left flex justify-between items-center"
                    >
                      <span>{lot.name}</span>
                      <span className="text-[10px] font-mono font-normal">
                        {isProcessing ? (
                          <span className="text-[#d8561c] font-bold animate-pulse">Apurando...</span>
                        ) : (
                          'Publicar →'
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#004d1a] text-[11px] text-gray-400 font-sans">
              Segurança: <span className="text-green-400 font-bold">Fallback Ativo & SSL Resiliente</span>
            </div>
          </div>

          {/* REDAÇÃO MANUAL (12 colunas) */}
          <div className="lg:col-span-12 p-6 bg-white border border-gray-200 rounded mt-2 shadow-sm">
            <h2 className="text-lg font-sans font-bold uppercase tracking-widest text-[#001c06] mb-2 border-b pb-2">
              Redação Manual (Publicação Direta)
            </h2>
            <p className="text-xs text-gray-600 mb-6 font-sans">
              Publique diretamente no portal sem usar a Inteligência Artificial.
            </p>
            
            <form className="flex flex-col gap-4 font-sans" onSubmit={async (e) => {
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
                  alert('Matéria publicada com sucesso!');
                  form.reset();
                } else {
                  alert(`Erro: ${data.error}`);
                }
              } catch (err) {
                alert('Erro ao publicar matéria');
              } finally {
                setManualDrafting(false);
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required name="title" type="text" placeholder="Título da Matéria" className="border p-3 rounded w-full text-sm" />
                <input required name="excerpt" type="text" placeholder="Resumo (Linha Fina)" className="border p-3 rounded w-full text-sm" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="image" type="url" placeholder="URL da Imagem (Opcional)" className="border p-3 rounded w-full text-sm" />
                <select name="category" className="border p-3 rounded w-full bg-white text-sm">
                  <option>Política</option>
                  <option>Economia</option>
                  <option>Internacional</option>
                  <option>Cultura</option>
                  <option>Esportes</option>
                  <option>Tecnologia</option>
                </select>
              </div>
              <textarea required name="content" placeholder="Texto da Matéria (Use Markdown para Formatar, ex: ## Subtítulo, **Negrito**)" className="border p-3 rounded w-full h-40 font-mono text-sm"></textarea>
              
              <button 
                disabled={manualDrafting}
                type="submit"
                className="bg-[#001c06] text-white font-sans font-bold uppercase text-xs tracking-widest px-6 py-4 rounded hover:bg-[#003311] disabled:opacity-50 w-full transition-all flex items-center justify-center gap-2"
              >
                {manualDrafting ? (
                  <>
                    <span className="inline-block animate-spin">⟳</span>
                    <span>Publicando...</span>
                  </>
                ) : (
                  'Publicar Matéria Agora'
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

