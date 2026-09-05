import { getPublicSupabaseClient } from '@/lib/supabase/public';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import AdSlot from '@/components/AdSlot';
import { MOCK_POSTS, ArticleItem } from '@/lib/posts-data';

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tagmanews.vercel.app';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  let post: ArticleItem | null = null;

  if (id.includes('mock')) {
    post = MOCK_POSTS.find((p) => p.id === id) || null;
  } else {
    try {
      const supabase = getPublicSupabaseClient();
      if (supabase) {
        const { data } = await supabase
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
          .eq('id', id)
          .single();

        if (data) {
          post = {
            id: data.id,
            title: data.title,
            excerpt: data.excerpt || '',
            content: data.content || '',
            image: data.image || null,
            author: data.author || 'Redação Tagma News',
            created_at: data.created_at,
            category_name: (data as any).categories?.name || 'Geral',
          };
        }
      }
    } catch {
      // Fallback
    }
  }

  if (!post) {
    post = MOCK_POSTS.find((p) => p.id === id) || null;
  }

  if (!post) {
    return {
      title: 'Matéria não encontrada | Tagma News',
      description: 'A notícia solicitada não foi encontrada.',
    };
  }

  const cleanExcerpt = post.excerpt || post.title;
  const postUrl = `${siteUrl}/materia/${post.id}`;
  const postImage = post.image || `${siteUrl}/og-image.png`;

  return {
    title: `${post.title} | Tagma News`,
    description: cleanExcerpt,
    authors: [{ name: post.author }],
    category: post.category_name,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: cleanExcerpt,
      url: postUrl,
      siteName: 'Tagma News',
      type: 'article',
      publishedTime: post.created_at,
      authors: [post.author],
      section: post.category_name,
      images: [
        {
          url: postImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: cleanExcerpt,
      images: [postImage],
      creator: '@tagmanews',
    },
  };
}

export default async function MateriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let post: ArticleItem | null = null;
  let relatedPosts: ArticleItem[] = [];

  if (id.includes('mock')) {
    post = MOCK_POSTS.find((p) => p.id === id) || null;
    relatedPosts = MOCK_POSTS.filter((p) => p.id !== id).slice(0, 5);
  } else {
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
          .eq('id', id)
          .single();

        if (data && !error) {
          post = {
            id: data.id,
            title: data.title,
            excerpt: data.excerpt || '',
            content: data.content || '',
            image: data.image || null,
            author: data.author || 'Redação Tagma News',
            created_at: data.created_at,
            category_name: (data as any).categories?.name || 'Geral',
          };
        }

        const { data: recentData } = await supabase
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
          .neq('id', id)
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentData && recentData.length > 0) {
          relatedPosts = recentData.map((p: any) => ({
            id: p.id,
            title: p.title,
            excerpt: p.excerpt || '',
            content: p.content || '',
            image: p.image || null,
            author: p.author || 'Redação Tagma News',
            created_at: p.created_at,
            category_name: p.categories?.name || 'Geral',
          }));
        }
      }
    } catch {
      // Fallback
    }

    if (!post) {
      post = MOCK_POSTS.find((p) => p.id === id) || null;
    }

    if (relatedPosts.length < 3) {
      const mockRecents = MOCK_POSTS.filter((p) => p.id !== post?.id && !relatedPosts.some((lp) => lp.id === p.id));
      relatedPosts = [...relatedPosts, ...mockRecents].slice(0, 5);
    }
  }

  if (!post) {
    notFound();
  }

  const postUrl = `${siteUrl}/materia/${post.id}`;
  const postImage = post.image || `${siteUrl}/og-image.png`;

  // JSON-LD NewsArticle
  const newsArticleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    headline: post.title,
    description: post.excerpt,
    image: [postImage],
    datePublished: post.created_at,
    dateModified: post.created_at,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'Tagma News',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/og-image.png`,
      },
    },
    articleSection: post.category_name,
  };

  const formattedContent = post.content ? post.content.replace(/\\n/g, '\n') : '';

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: post.category_name, href: `/${post.category_name.toLowerCase()}` },
          { label: post.title },
        ]}
      />

      {/* Main Grid: Article Content (8 cols) + Contextual Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mt-4">
        
        {/* Main Article Body */}
        <main className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-xl border border-gray-200 shadow-sm">
          
          {/* Header & Meta */}
          <header className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center bg-[#f6f3f2] px-2.5 py-1 text-[10px] uppercase font-sans font-extrabold tracking-widest text-[#003311] rounded">
                <span className="w-1.5 h-3 bg-[#003311] mr-1.5"></span>
                {post.category_name}
              </span>
              <span className="text-[9px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ✓ Apuração Verificada
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 tracking-tight font-sans text-[#001c06] leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg sm:text-xl mb-6 font-serif text-[#414940] border-l-4 border-[#003311] pl-4 italic leading-relaxed">
                {post.excerpt}
              </p>
            )}

            <div className="text-xs font-sans uppercase tracking-wider text-gray-500 py-3 border-y border-gray-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#003311] text-white flex items-center justify-center font-bold text-[10px]">
                  TN
                </span>
                <span>Por <strong>{post.author}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                <span>Publicado em: {new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </header>

          {/* Featured Image with Caption & Credit */}
          {post.image && (
            <figure className="mb-8">
              <div className="relative w-full aspect-video overflow-hidden bg-gray-100 rounded-lg shadow-sm border border-gray-200">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="text-[11px] text-gray-500 font-sans mt-2 italic flex justify-between">
                <span>Registro referente aos fatos apurados pela redação.</span>
                <span className="font-bold text-gray-400">Crédito: Agência / Divulgação</span>
              </figcaption>
            </figure>
          )}

          {/* Rendered Markdown Body */}
          <div className="prose prose-lg prose-green max-w-none text-[#1c1b1b] leading-relaxed font-serif">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ node, ...props }) => (
                  <h2 className="text-2xl font-bold mt-8 mb-4 text-[#001c06] font-sans border-b border-gray-100 pb-2" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-xl font-bold mt-6 mb-3 text-[#001c06] font-sans" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-6 leading-relaxed" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside space-y-2 my-4 pl-2 font-sans text-base" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside space-y-2 my-4 pl-2 font-sans text-base" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="leading-relaxed" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-[#003311] pl-4 italic my-6 text-[#414940] bg-[#f6f3f2] p-4 rounded-r font-serif" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold text-[#001c06]" {...props} />
                ),
              }}
            >
              {formattedContent}
            </ReactMarkdown>
          </div>

          {/* Transparência & Fontes */}
          <section className="mt-10 pt-6 border-t border-gray-200 bg-gray-50 p-5 rounded-lg font-sans text-xs text-gray-600 space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-[#001c06] flex items-center gap-1.5">
              <span>🔍</span> Transparência Editorial & Fontes Primárias
            </h3>
            <p className="leading-relaxed">
              Esta reportagem foi elaborada de acordo com as normas do Manual de Redação do Tagma News. A equipe baseou-se em notas institucionais, fontes primárias e dados de domínio público checados.
            </p>
            <div className="pt-2 border-t border-gray-200 flex flex-wrap items-center justify-between text-[11px] text-gray-400">
              <span>Status: Versão Canônica Homologada</span>
              <Link href="/sobre" className="text-[#003311] font-bold hover:underline">
                Nossos Princípios Editoriais →
              </Link>
            </div>
          </section>

          {/* Compartilhamento Social Acessível */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 font-sans text-xs">
            <span className="font-bold text-gray-700 uppercase tracking-wider">Compartilhe esta matéria:</span>
            <div className="flex gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} - ${postUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition-colors flex items-center gap-1.5"
                aria-label="Compartilhar no WhatsApp"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded font-bold transition-colors flex items-center gap-1.5"
                aria-label="Compartilhar no Twitter"
              >
                X (Twitter)
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded font-bold transition-colors flex items-center gap-1.5"
                aria-label="Compartilhar no LinkedIn"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </main>

        {/* Sidebar de Recirculação & Anúncio */}
        <aside className="lg:col-span-4 space-y-6">
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="border-b-2 border-[#003311] pb-2 mb-4 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#001c06] font-sans flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d8561c]"></span>
                Mais Lidas da Editoria
              </h2>
            </div>

            <div className="divide-y divide-gray-100 space-y-4">
              {relatedPosts.map((item, index) => (
                <article key={item.id} className={`${index > 0 ? 'pt-4' : ''} group`}>
                  <Link href={`/materia/${item.id}`} className="flex gap-3 items-start">
                    {item.image && (
                      <div className="relative w-20 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] uppercase font-bold text-[#003311] font-sans block mb-1">
                        {item.category_name}
                      </span>
                      <h3 className="text-xs sm:text-sm font-sans font-bold leading-snug text-gray-900 group-hover:text-[#d8561c] transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <Link
                href="/ultimas"
                className="inline-block w-full py-2.5 px-4 bg-[#f6f3f2] hover:bg-[#003311] hover:text-white text-gray-800 text-[11px] font-sans font-bold uppercase tracking-wider rounded transition-colors text-center"
              >
                Ver Todas as Notícias →
              </Link>
            </div>
          </div>

          <AdSlot format="medium-rectangle" />

        </aside>

      </div>
    </div>
  );
}
