import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function CategoriaPage({ params }: { params: Promise<{ categoria: string }> }) {
  const supabase = await createClient()
  const { categoria } = await params

  // Match the category slug with the category name in the DB
  const slugToName: Record<string, string> = {
    'politica': 'Política',
    'economia': 'Economia',
    'internacional': 'Internacional',
    'esportes': 'Esportes',
    'cultura': 'Cultura',
    'tecnologia': 'Tecnologia'
  };
  
  const catParam = categoria.toLowerCase();
  const categoryName = slugToName[catParam] || catParam;
  
  // Buscar a ID da categoria no banco
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('name', categoryName)
    .single()

  if (catError || !catData) {
    // Se a categoria não existir no banco, 404
    notFound()
  }

  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories (
        name
      )
    `)
    .eq('category_id', catData.id)
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts by category:', error)
  }

  const articles = posts || []

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 min-h-screen">
      <div className="mb-8 border-b-4 border-[#003311] inline-block">
        <h1 className="text-3xl font-extrabold uppercase tracking-widest text-[#001c06] pb-2">
          {catData.name}
        </h1>
      </div>

      {articles.length === 0 ? (
        <p className="text-xl italic text-gray-500">Nenhuma matéria publicada nesta editoria ainda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(post => (
            <article key={post.id} className="group cursor-pointer flex flex-col">
              <Link href={`/materia/${post.id}`} className="aspect-[16/10] overflow-hidden bg-gray-100 mb-4 block">
                {post.image && (
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
              </Link>
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center border border-[#e0e0e0] bg-[#f6f3f2] pr-2 py-0.5 text-[9px] uppercase font-sans font-bold tracking-wider text-[#414940]">
                  <span className="w-1 h-3 bg-[#003311] mr-1.5"></span>
                  {post.categories?.name}
                </span>
              </div>
              <Link href={`/materia/${post.id}`}>
                <h3 className="text-xl font-sans leading-snug group-hover:underline text-[#001c06]">
                  {post.title}
                </h3>
              </Link>
              <p className="text-sm mt-2 text-gray-600 line-clamp-3">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
