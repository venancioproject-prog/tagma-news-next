import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { MOCK_POSTS, ArticleItem } from '@/lib/posts-data'

export default async function MateriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let post: ArticleItem | null = null

  try {
    const supabase = await createClient()
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
  } catch (err) {
    console.error('Erro ao buscar matéria no Supabase:', err)
  }

  // Se não encontrou no Supabase, procura no MOCK_POSTS (ex: mock-1, mock-2, etc.)
  if (!post) {
    const foundMock = MOCK_POSTS.find(p => p.id === id)
    if (foundMock) {
      post = foundMock
    }
  }

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-[#1c1b1b] font-serif">
      <header className="bg-[#003311] text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="text-3xl font-normal lowercase tracking-tight">
            tagma
          </Link>
          <Link href="/" className="text-xs font-sans uppercase tracking-widest hover:text-[#d8561c]">
            Voltar para Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <span className="inline-flex items-center bg-[#f6f3f2] pr-3 py-1 text-[10px] uppercase font-sans font-bold tracking-widest text-[#003311] mb-6">
            <span className="w-1.5 h-4 bg-[#003311] mr-2"></span>
            {post.category_name}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight font-sans text-[#001c06] leading-tight">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-xl mb-6 italic text-[#414940] border-l-4 border-[#003311] pl-4">
              {post.excerpt}
            </p>
          )}
          <div className="text-xs font-sans uppercase tracking-widest text-[#727970] pb-6 border-b border-[#e0e0e0]">
            Por <strong>{post.author}</strong> • {new Date(post.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>

        {post.image && (
          <div className="w-full aspect-video overflow-hidden bg-gray-100 mb-12 rounded">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <article className="prose prose-lg prose-stone max-w-none text-[#1c1b1b] leading-relaxed">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>
      </main>
    </div>
  )
}
