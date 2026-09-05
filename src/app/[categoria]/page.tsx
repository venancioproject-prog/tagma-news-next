import { getPublicSupabaseClient } from '@/lib/supabase/public'
import Link from 'next/link'
import Image from 'next/image'
import { MOCK_POSTS, ArticleItem } from '@/lib/posts-data'

export const revalidate = 60

export default async function CategoriaPage({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params

  const normalizeSlug = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')

  const slugToName: Record<string, string> = {
    'politica': 'Política',
    'economia': 'Economia',
    'internacional': 'Internacional',
    'esportes': 'Esportes',
    'cultura': 'Cultura',
    'tecnologia': 'Tecnologia',
    'geral': 'Geral'
  }

  const decodedCat = decodeURIComponent(categoria)
  const normalizedKey = normalizeSlug(decodedCat)
  const categoryDisplayName = slugToName[normalizedKey] || decodedCat.charAt(0).toUpperCase() + decodedCat.slice(1)

  let articles: ArticleItem[] = []

  try {
    const supabase = getPublicSupabaseClient()
    if (supabase) {
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .ilike('name', categoryDisplayName)
        .maybeSingle()

      if (catData?.id) {
        const { data: posts } = await supabase
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
          .eq('category_id', catData.id)
          .eq('published', true)
          .order('created_at', { ascending: false })

        if (posts && posts.length > 0) {
          articles = posts.map((p: any) => ({
            id: p.id,
            title: p.title,
            excerpt: p.excerpt || '',
            content: p.content || '',
            image: p.image || null,
            author: p.author || 'Redação Tagma',
            created_at: p.created_at,
            category_name: p.categories?.name || categoryDisplayName
          }))
        }
      }
    }
  } catch (err) {
    console.error('Erro ao buscar categoria do Supabase, usando fallback:', err)
  }

  // Fallback para os dados locais se o banco estiver vazio ou sem notícias nessa editoria
  if (articles.length === 0) {
    articles = MOCK_POSTS.filter(post => 
      normalizeSlug(post.category_name) === normalizedKey ||
      (normalizedKey === 'politica' && post.category_name.toLowerCase().includes('pol')) ||
      (normalizedKey === 'economia' && post.category_name.toLowerCase().includes('econ')) ||
      (normalizedKey === 'internacional' && post.category_name.toLowerCase().includes('inter')) ||
      (normalizedKey === 'esportes' && post.category_name.toLowerCase().includes('esport')) ||
      (normalizedKey === 'cultura' && post.category_name.toLowerCase().includes('cult')) ||
      (normalizedKey === 'tecnologia' && post.category_name.toLowerCase().includes('tec'))
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 min-h-screen">
      <div className="mb-8 border-b-4 border-[#003311] inline-block">
        <h1 className="text-3xl font-extrabold uppercase tracking-widest text-[#001c06] pb-2 font-sans">
          {categoryDisplayName}
        </h1>
      </div>

      {articles.length === 0 ? (
        <p className="text-xl italic text-gray-500">Nenhuma matéria publicada nesta editoria ainda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((post, idx) => (
            <article key={post.id} className="group cursor-pointer flex flex-col justify-between border-b border-gray-100 pb-6 lg:border-none lg:pb-0">
              <div>
                <Link href={`/materia/${post.id}`} className="relative aspect-[16/10] overflow-hidden bg-gray-100 mb-4 block rounded">
                  {post.image ? (
                    <Image 
                      src={post.image} 
                      alt={post.title} 
                      fill
                      priority={idx < 3}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400 font-sans text-xs uppercase font-bold tracking-widest">
                      Tagma News
                    </div>
                  )}
                </Link>
                <div className="flex items-center mb-2">
                  <span className="inline-flex items-center border border-[#e0e0e0] bg-[#f6f3f2] pr-2 py-0.5 text-[9px] uppercase font-sans font-bold tracking-wider text-[#414940]">
                    <span className="w-1 h-3 bg-[#003311] mr-1.5"></span>
                    {post.category_name}
                  </span>
                </div>
                <Link href={`/materia/${post.id}`}>
                  <h3 className="text-xl font-sans font-bold leading-snug group-hover:text-[#d8561c] transition-colors text-[#001c06]">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-sm mt-2 text-gray-600 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
              <div className="mt-4 text-[11px] text-gray-400 font-sans">
                {post.author} • {new Date(post.created_at).toLocaleDateString('pt-BR')}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
