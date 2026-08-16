import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const revalidate = 60 // Revalidate every minute

export default async function Home() {
  const supabase = await createClient()

  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories (
        name
      )
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
  }

  // Identifica a Capa (primeira matéria com a tag "capa")
  const heroPost = posts?.find(p => p.tags?.includes('capa')) || posts?.[0]
  const otherPosts = posts?.filter(p => p.id !== heroPost?.id) || []

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      {/* Container Principal: Esquerda (Capa) / Direita (Destaques) */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-16">
        
        {/* COLUNA ESQUERDA: CAPA PRINCIPAL (70% da tela) */}
        {heroPost && (
          <section className="lg:w-2/3">
            <div className="flex justify-start mb-4">
              <span className="inline-flex items-center bg-[#f6f3f2] pr-3 py-1 text-[10px] uppercase font-sans font-bold tracking-widest text-[#003311]">
                <span className="w-1.5 h-4 bg-[#003311] mr-2"></span>
                {heroPost.categories?.name || 'Geral'}
              </span>
            </div>
            
            <Link href={`/materia/${heroPost.id}`}>
              <h1 className="text-left text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight font-sans text-[#001c06] hover:underline cursor-pointer leading-tight">
                {heroPost.title}
              </h1>
            </Link>

            <p className="text-xl mb-6 leading-relaxed italic border-l-4 border-[#003311] pl-4 text-[#414940]">
              {heroPost.excerpt}
            </p>
            
            {heroPost.image && (
              <Link href={`/materia/${heroPost.id}`} className="block w-full aspect-[16/9] overflow-hidden bg-gray-100 mb-4 cursor-pointer group">
                <img src={heroPost.image} alt={heroPost.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </Link>
            )}
            
            <div className="flex justify-between text-[10px] font-sans uppercase tracking-widest text-[#727970] pt-2">
              <span>Por <strong>{heroPost.author}</strong></span>
              <span>{new Date(heroPost.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </section>
        )}

        {/* COLUNA DIREITA: PILHA DE NOTÍCIAS (30% da tela) */}
        <section className="lg:w-1/3 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-[#e0e0e0] pt-8 lg:pt-0 lg:pl-8">
          <h2 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#001c06] border-b border-[#001c06] pb-2 mb-2">
            Últimas Notícias
          </h2>
          
          <div className="flex flex-col divide-y divide-[#e0e0e0]">
            {otherPosts.slice(0, 5).map(post => (
              <article key={post.id} className="py-5 group cursor-pointer flex flex-col gap-2">
                <div className="flex items-center">
                  <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#d8561c]">
                    {post.categories?.name}
                  </span>
                </div>
                <Link href={`/materia/${post.id}`}>
                  <h3 className="text-lg md:text-xl font-sans font-bold leading-snug group-hover:underline text-[#001c06]">
                    {post.title}
                  </h3>
                </Link>
                {post.image && (
                  <Link href={`/materia/${post.id}`} className="mt-2 aspect-[21/9] overflow-hidden bg-gray-100 block">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

      </div>

      {/* GRID DE EDITORIAS (Abaixo da dobra) */}
      <section className="pt-8 border-t-[3px] border-[#003311]">
        <h2 className="text-xl font-sans font-extrabold uppercase tracking-widest text-[#001c06] mb-8">
          Mais Destaques
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {otherPosts.slice(5).map(post => (
            <article key={post.id} className="group cursor-pointer flex flex-col">
              <Link href={`/materia/${post.id}`} className="aspect-[4/3] overflow-hidden bg-gray-100 mb-3 block">
                {post.image && (
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
              </Link>
              <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#003311] mb-1">
                {post.categories?.name}
              </span>
              <Link href={`/materia/${post.id}`}>
                <h3 className="text-md font-sans font-bold leading-snug group-hover:underline text-[#1c1b1b]">
                  {post.title}
                </h3>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
