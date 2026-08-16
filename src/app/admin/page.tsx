'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [category, setCategory] = useState('Política');
  const [pautas, setPautas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lotteryLoading, setLotteryLoading] = useState(false);
  const [drafting, setDrafting] = useState(false);

  const fetchPautas = async () => {
    setLoading(true);
    const res = await fetch(`/api/pautas?category=${category}`);
    const data = await res.json();
    setPautas(data);
    setLoading(false);
  };

  const generateDraft = async (title: string, desc: string) => {
    setDrafting(true);
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc, category })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Matéria gerada e publicada com sucesso!\n\nTítulo: ${data.post.title}`);
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (e) {
      alert('Erro na conexão com a API de Redação');
    }
    setDrafting(false);
  };

  const generateLottery = async (loteria: string) => {
    setLotteryLoading(true);
    try {
      const res = await fetch(`/api/loterias?loteria=${loteria}`);
      const data = await res.json();
      if (data.success) {
        alert(`Matéria gerada e publicada com sucesso!\n\nTítulo: ${data.post.title}`);
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (e) {
      alert('Erro na conexão');
    }
    setLotteryLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fcf9f8] p-8 font-serif">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded shadow-lg border-t-4 border-[#003311]">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-[#001c06] font-sans tracking-tight">Redação Tagma (IA)</h1>
          <Link href="/" className="text-sm font-sans font-bold uppercase text-[#d8561c] hover:underline">Ir para a Home</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* PAUTAS RSS / HARD NEWS */}
          <div className="p-6 bg-gray-50 border border-gray-200 rounded">
            <h2 className="text-lg font-sans font-bold uppercase tracking-widest text-[#001c06] mb-2">
              Gerador de Pautas (Hard News)
            </h2>
            <p className="text-sm text-gray-600 mb-6 font-sans">
              Busca fatos quentes das principais agências (Folha, Reuters, Agência Pública) e redige sem emitir opinião, citando a fonte.
            </p>
            
            <div className="flex flex-col gap-4">
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="border p-3 rounded font-sans w-full bg-white"
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
                disabled={loading}
                className="bg-[#d8561c] text-white font-sans font-bold uppercase tracking-widest px-6 py-3 rounded hover:bg-[#934b00] disabled:opacity-50 w-full"
              >
                {loading ? 'Varrendo Agências...' : '1. Buscar Fatos (IA)'}
              </button>
            </div>

            {pautas.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h3 className="font-bold text-sm uppercase tracking-widest font-sans mb-4">Fatos Encontrados:</h3>
                <div className="flex flex-col gap-4">
                  {pautas.map((p, i) => (
                    <div key={i} className="border p-4 bg-white rounded">
                      <h4 className="font-bold font-sans text-sm mb-1">{p.title}</h4>
                      <p className="text-xs text-gray-600 mb-3">{p.description}</p>
                      <button 
                        disabled={drafting}
                        onClick={() => generateDraft(p.title, p.description)}
                        className="w-full bg-[#003311] text-white text-xs font-sans font-bold uppercase tracking-widest py-2 rounded hover:bg-[#001c06] disabled:opacity-50"
                      >
                        {drafting ? 'Escrevendo...' : '2. Redigir e Publicar (Hard News)'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* LOTERIAS (AUTOMAÇÃO) */}
          <div className="p-6 bg-[#003311] text-white rounded shadow-inner">
            <h2 className="text-lg font-sans font-bold uppercase tracking-widest text-white mb-2">
              Automação de Loterias
            </h2>
            <p className="text-sm text-gray-300 mb-6 font-sans">
              O Cron Vercel chamará esta rotina automaticamente. Use os botões abaixo para forçar uma verificação na API oficial da Caixa agora mesmo.
            </p>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => generateLottery('megasena')}
                disabled={lotteryLoading}
                className="bg-[#f6f3f2] text-[#003311] border-2 border-transparent hover:border-[#d8561c] font-sans font-bold uppercase tracking-widest px-6 py-3 rounded disabled:opacity-50 w-full transition-all"
              >
                {lotteryLoading ? 'Processando...' : 'Forçar: Mega-Sena'}
              </button>

              <button 
                onClick={() => generateLottery('lotofacil')}
                disabled={lotteryLoading}
                className="bg-[#f6f3f2] text-[#003311] border-2 border-transparent hover:border-[#d8561c] font-sans font-bold uppercase tracking-widest px-6 py-3 rounded disabled:opacity-50 w-full transition-all"
              >
                {lotteryLoading ? 'Processando...' : 'Forçar: Lotofácil'}
              </button>

              <button 
                onClick={() => generateLottery('quina')}
                disabled={lotteryLoading}
                className="bg-[#f6f3f2] text-[#003311] border-2 border-transparent hover:border-[#d8561c] font-sans font-bold uppercase tracking-widest px-6 py-3 rounded disabled:opacity-50 w-full transition-all"
              >
                {lotteryLoading ? 'Processando...' : 'Forçar: Quina'}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-[#004d1a] text-xs text-gray-400 font-sans">
              Status do Cron: <span className="text-green-400 font-bold">Aguardando Deploy na Vercel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
