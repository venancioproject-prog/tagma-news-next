import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getPublicSupabaseClient } from '@/lib/supabase/public';
import { MOCK_POSTS, ArticleItem } from '@/lib/posts-data';

export const metadata: Metadata = {
  title: 'Últimas Notícias em Tempo Real',
  description: 'Acompanhe a cobertura minuto a minuto das principais notícias do Brasil e do mundo no Tagma News.',
};

export default async function UltimasPage() {
  let articles: ArticleItem[] = [];

  try {
    const supabase = getPublicSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
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
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        articles = data.map((p: any) => ({
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

  if (articles.length === 0) {
    articles = MOCK_POSTS;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 min-h-screen">
      <Breadcrumbs items={[{ label: 'Últimas Notícias' }]} />

      <div className="border-b-2 border-[#003311] pb-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#d8561c] rounded-full animate-ping"></span>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#001c06] font-sans">
              Últimas Notícias
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Feed contínuo em ordem cronológica de publicação.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-gray-400 bg-white px-3 py-1.5 rounded border border-gray-200 self-start sm:self-auto">
          {articles.length} matérias apuradas
        </span>
      </div>

      <div className="space-y-6">
        {articles.map((item, idx) => (
          <article
            key={item.id}
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:border-[#003311] transition-all flex flex-col sm:flex-row gap-6 items-start group"
          >
            {item.image && (
              <Link href={`/materia/${item.id}`} className="relative w-full sm:w-60 aspect-[16/10] flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 240px"
                  priority={idx < 2}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-[#003311] bg-gray-100 px-2 py-0.5 rounded">
                  {item.category_name}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {new Date(item.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <Link href={`/materia/${item.id}`}>
                <h2 className="text-lg sm:text-xl font-sans font-bold leading-snug text-[#001c06] group-hover:text-[#d8561c] transition-colors mb-2">
                  {item.title}
                </h2>
              </Link>
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed font-serif mb-4">
                {item.excerpt}
              </p>
              <div className="text-xs font-sans text-gray-400 flex items-center justify-between pt-2 border-t border-gray-100">
                <span>Por <strong>{item.author}</strong></span>
                <Link href={`/materia/${item.id}`} className="text-[#d8561c] font-bold text-[11px] hover:underline uppercase">
                  Ler Reportagem →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
