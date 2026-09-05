import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getPublicSupabaseClient } from '@/lib/supabase/public';
import { MOCK_POSTS, ArticleItem } from '@/lib/posts-data';

export const metadata: Metadata = {
  title: 'Busca de Notícias',
  description: 'Pesquise matérias, reportagens, análises e coberturas especiais no Tagma News.',
  robots: {
    index: false,
    follow: true,
  },
};

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; ordenar?: string }>;
}) {
  const { q = '', categoria = '', ordenar = 'recente' } = await searchParams;
  const query = q.trim();

  let results: ArticleItem[] = [];

  if (query) {
    try {
      const supabase = getPublicSupabaseClient();
      if (supabase) {
        let dbQuery = supabase
          .from('posts')
          .select(`
            id,
            title,
            excerpt,
            content,
            image,
            author,
            created_at,
            categories (
              name
            )
          `)
          .eq('published', true)
          .ilike('title', `%${query}%`);

        if (ordenar === 'antigo') {
          dbQuery = dbQuery.order('created_at', { ascending: true });
        } else {
          dbQuery = dbQuery.order('created_at', { ascending: false });
        }

        const { data, error } = await dbQuery.limit(20);

        if (!error && data && data.length > 0) {
          results = data.map((p: any) => ({
            id: p.id,
            title: p.title,
            excerpt: p.excerpt || '',
            content: p.content || '',
            image: p.image || null,
            author: p.author || 'Redação Tagma',
            created_at: p.created_at,
            category_name: p.categories?.name || 'Geral',
          }));
        }
      }
    } catch {
      // Fallback
    }

    if (results.length === 0) {
      const lowerQuery = query.toLowerCase();
      results = MOCK_POSTS.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerQuery) ||
          p.excerpt.toLowerCase().includes(lowerQuery) ||
          p.category_name.toLowerCase().includes(lowerQuery)
      );
    }
  }

  if (categoria) {
    results = results.filter((r) => r.category_name.toLowerCase() === categoria.toLowerCase());
  }

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 min-h-[70vh]">
      <Breadcrumbs items={[{ label: 'Busca de Notícias' }]} />

      <div className="border-b-2 border-[#003311] pb-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#001c06] font-sans">
          Busca de Notícias
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Encontre reportagens, análises e coberturas especiais por palavra-chave e editoria.
        </p>
      </div>

      {/* Search Form */}
      <form method="GET" action="/busca" className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Digite o termo ou frase desejada..."
            className="flex-1 border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#003311]"
          />
          <button
            type="submit"
            className="bg-[#003311] hover:bg-[#001c06] text-white px-6 py-2.5 rounded font-bold uppercase text-xs tracking-wider transition-colors"
          >
            Buscar Notícias
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-3 border-t border-gray-100">
          <span className="font-bold text-gray-700">Filtrar por Editoria:</span>
          {['', 'Política', 'Economia', 'Internacional', 'Tecnologia', 'Esportes', 'Cultura'].map((cat) => (
            <Link
              key={cat}
              href={`/busca?q=${encodeURIComponent(query)}&categoria=${encodeURIComponent(cat)}&ordenar=${ordenar}`}
              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                (categoria === cat || (!categoria && cat === ''))
                  ? 'bg-[#003311] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat || 'Todas'}
            </Link>
          ))}
        </div>
      </form>

      {/* Search Summary */}
      {query && (
        <div className="mb-6 flex justify-between items-center text-xs text-gray-600">
          <span>
            Exibindo <strong>{results.length}</strong> resultados para &quot;<strong>{query}</strong>&quot;
          </span>
          {results.length > 0 && (
            <span className="text-gray-400">Ordenado por mais recentes</span>
          )}
        </div>
      )}

      {/* Results List */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((post) => (
            <article key={post.id} className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between hover:border-[#003311] transition-all group">
              <div>
                {post.image && (
                  <Link href={`/materia/${post.id}`} className="relative block aspect-[16/10] overflow-hidden rounded bg-gray-100 mb-3">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                )}
                <span className="inline-block text-[9px] font-sans font-bold uppercase tracking-wider text-[#003311] bg-gray-100 px-2 py-0.5 rounded mb-2">
                  {post.category_name}
                </span>
                <Link href={`/materia/${post.id}`}>
                  <h2 className="font-sans text-base font-bold leading-snug text-[#001c06] group-hover:text-[#d8561c] transition-colors mb-2">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed font-serif">
                  {post.excerpt}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>{post.author}</span>
                <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </article>
          ))}
        </div>
      ) : query ? (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center space-y-4">
          <span className="text-4xl">🔍</span>
          <h3 className="text-lg font-bold text-gray-800">Nenhum resultado encontrado</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Não encontramos matérias para o termo &quot;{query}&quot;. Tente utilizar palavras-chave mais genéricas ou navegue pelas editorias do portal.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link href="/ultimas" className="px-4 py-2 bg-[#003311] text-white text-xs font-bold uppercase rounded">
              Ver Últimas Notícias
            </Link>
            <Link href="/" className="px-4 py-2 bg-gray-100 text-gray-800 text-xs font-bold uppercase rounded">
              Ir para a Home
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <span className="text-3xl block mb-2">📰</span>
          <p className="text-xs font-bold uppercase tracking-widest">Digite um termo acima para iniciar a busca</p>
        </div>
      )}
    </main>
  );
}
