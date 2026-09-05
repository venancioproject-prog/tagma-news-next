import { getPublicSupabaseClient } from '@/lib/supabase/public'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Metadata } from 'next'
import { MOCK_POSTS, ArticleItem } from '@/lib/posts-data'

export const revalidate = 60

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tagmanews.vercel.app';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  let post: ArticleItem | null = null

  // Short-Circuit imediato se for mock para eliminar TTFB
  if (id.includes('mock')) {
    post = MOCK_POSTS.find(p => p.id === id) || null
  } else {
    try {
      const supabase = getPublicSupabaseClient()
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
          .single()

        if (data) {
          post = {
            id: data.id,
            title: data.title,
            excerpt: data.excerpt || '',
            content: data.content || '',
            image: data.image || null,
            author: data.author || 'Redação Tagma',
            created_at: data.created_at,
            category_name: (data as any).categories?.name || 'Geral'
          }
        }
      }
    } catch (e) {
      console.error('Error generating metadata:', e)
    }
  }

  if (!post) {
    post = MOCK_POSTS.find(p => p.id === id) || null
  }

  if (!post) {
    return {
      title: 'Matéria não encontrada | Tagma News',
      description: 'A notícia solicitada não foi encontrada.'
    }
  }

  const cleanExcerpt = post.excerpt || post.title
  const postUrl = `${siteUrl}/materia/${post.id}`
  const postImage = post.image || `${siteUrl}/og-image.png`

  return {
    title: post.title,
    description: cleanExcerpt,
    authors: [{ name: post.author }],
    category: post.category_name,
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
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: cleanExcerpt,
      images: [postImage],
      creator: '@tagmanews'
    }
  }
}

export default async function MateriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let post: ArticleItem | null = null
  let latestPosts: ArticleItem[] = []

  // 1. SHORT-CIRCUIT IMEDIATO PARA MOCK DATA (Zero latência de rede/banco)
  if (id.includes('mock')) {
    post = MOCK_POSTS.find(p => p.id === id) || null
    latestPosts = MOCK_POSTS.filter(p => p.id !== id).slice(0, 5)
  } else {
    // 2. BUSCA NO SUPABASE COM .single() (Fail Fast)
    try {
      const supabase = getPublicSupabaseClient()
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
          .single()

        if (data && !error) {
          post = {
            id: data.id,
            title: data.title,
            excerpt: data.excerpt || '',
            content: data.content || '',
            image: data.image || null,
            author: data.author || 'Redação Tagma',
            created_at: data.created_at,
            category_name: (data as any).categories?.name || 'Geral'
          }
        }

        // Busca as últimas matérias para a Sidebar (excluindo a atual)
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
          .limit(5)

        if (recentData && recentData.length > 0) {
          latestPosts = recentData.map((p: any) => ({
            id: p.id,
            title: p.title,
            excerpt: p.excerpt || '',
            content: p.content || '',
            image: p.image || null,
            author: p.author || 'Redação Tagma',
            created_at: p.created_at,
            category_name: p.categories?.name || 'Geral'
          }))
        }
      }
    } catch (err) {
      console.error('Erro ao buscar dados da matéria no Supabase:', err)
    }

    // Fallback de segurança caso não encontre no banco
    if (!post) {
      post = MOCK_POSTS.find(p => p.id === id) || null
    }

    if (latestPosts.length < 4) {
      const mockRecents = MOCK_POSTS.filter(p => p.id !== post?.id && !latestPosts.some(lp => lp.id === p.id))
      latestPosts = [...latestPosts, ...mockRecents].slice(0, 5)
    }
  }

  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 md:py-12">
      {/* Layout de 2 colunas com CSS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Coluna Principal (Esquerda - 70% / lg:col-span-8) */}
        <main className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-lg border border-gray-100 shadow-sm font-serif">
          <div className="mb-6">
            <span className="inline-flex items-center bg-[#f6f3f2] pr-3 py-1 text-[10px] uppercase font-sans font-bold tracking-widest text-[#003311] mb-4">
              <span className="w-1.5 h-4 bg-[#003311] mr-2"></span>
              {post.category_name}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 tracking-tight font-sans text-[#001c06] leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-lg sm:text-xl mb-6 italic text-[#414940] border-l-4 border-[#003311] pl-4 font-sans leading-relaxed">
                {post.excerpt}
              </p>
            )}
            <div className="text-xs font-sans uppercase tracking-widest text-[#727970] pb-4 border-b border-[#e0e0e0] flex items-center justify-between">
              <span>Por <strong>{post.author}</strong></span>
              <span>{new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {post.image && (
            <div className="relative w-full aspect-video overflow-hidden bg-gray-100 mb-8 rounded">
              <Image 
                src={post.image} 
                alt={post.title} 
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover" 
              />
            </div>
          )}

          {/* Renderizador com react-markdown, remarkGfm e @tailwindcss/typography */}
          <div className="prose prose-lg prose-green max-w-none text-[#1c1b1b] leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </main>

        {/* Coluna Lateral de Retenção (Direita - 30% / lg:col-span-4) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b-2 border-[#003311] pb-2 mb-4 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#001c06] font-sans flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d8561c]"></span>
                Últimas Notícias
              </h2>
              <span className="text-[10px] uppercase font-bold text-gray-400 font-sans">
                Tempo Real
              </span>
            </div>

            <div className="divide-y divide-gray-100 space-y-4">
              {latestPosts.map((item, index) => (
                <article key={item.id} className={`${index > 0 ? 'pt-4' : ''} group cursor-pointer`}>
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
                      <span className="text-[10px] text-gray-400 font-sans mt-1 block">
                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <Link 
                href="/" 
                className="inline-block w-full py-2.5 px-4 bg-[#f6f3f2] hover:bg-[#003311] hover:text-white text-gray-800 text-[11px] font-sans font-bold uppercase tracking-wider rounded transition-colors text-center"
              >
                Ver Todas as Notícias →
              </Link>
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
