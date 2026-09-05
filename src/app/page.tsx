import { getPublicSupabaseClient } from '@/lib/supabase/public'
import Link from 'next/link'
import Image from 'next/image'
import AdSlot from '@/components/AdSlot'
import { MOCK_POSTS, ArticleItem } from '@/lib/posts-data'

export const revalidate = 60

export default async function Home() {
  let dbArticles: ArticleItem[] = []

  try {
    const supabase = getPublicSupabaseClient()
    if (supabase) {
      const { data: posts, error } = await supabase
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

      if (error) {
        console.warn('Supabase fetch error, fallback to mock data:', error.message)
      } else if (posts && posts.length > 0) {
        dbArticles = posts.map((p: any) => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt || '',
          content: p.content || '',
          image: p.image || null,
          author: p.author || 'Redação Tagma',
          created_at: p.created_at,
          category_name: p.categories?.name || 'Geral',
          tags: []
        }))
      }
    }
  } catch (err) {
    console.warn('Could not connect to Supabase, injecting mock posts:', err)
  }

  // Complementa ou usa o mass mock data garantindo no mínimo 16 matérias para layout denso corporativo
  const finalArticles: ArticleItem[] = dbArticles.length >= 15 
    ? dbArticles 
    : [...dbArticles, ...MOCK_POSTS.filter(m => !dbArticles.some(d => d.id === m.id))].slice(0, 16)

  // Bloco 1: Bento Grid das Manchetes Principais
  const heroPost = finalArticles[0]
  const secondaryPost1 = finalArticles[1]
  const secondaryPost2 = finalArticles[2]

  // Bloco 3: Colunas por Editorias
  const economiaPosts = finalArticles.filter(p => p.category_name === 'Economia').slice(0, 3)
  const politicaPosts = finalArticles.filter(p => p.category_name === 'Política').slice(0, 3)
  const tecnologiaPosts = finalArticles.filter(p => p.category_name === 'Tecnologia').slice(0, 3)

  // Fallbacks de editorias se necessário
  const col1 = economiaPosts.length === 3 ? economiaPosts : finalArticles.slice(3, 6)
  const col2 = politicaPosts.length === 3 ? politicaPosts : finalArticles.slice(6, 9)
  const col3 = tecnologiaPosts.length === 3 ? tecnologiaPosts : finalArticles.slice(9, 12)
  const feedRestante = finalArticles.slice(12)

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
      
      {/* ESPAÇO PUBLICITÁRIO DO TOPO: SUPER BANNER (728x90) */}
      <AdSlot format="leaderboard" className="mt-2 mb-8" />

      {/* BLOCO 1: MANCHETES PRINCIPAIS (BENTO GRID - 60% / 40%) */}
      <section className="mb-12">
        <div className="border-b-2 border-[#003311] pb-2 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#d8561c] rounded-full animate-pulse"></span>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#001c06] font-sans">
              Manchetes do Dia • Cobertura Especial
            </h2>
          </div>
          <span className="text-[10px] uppercase font-bold text-gray-400 font-sans">
            Atualizado em Tempo Real
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* MATÉRIA DE CAPA GIGANTE (60% / lg:col-span-7) */}
          <article className="lg:col-span-7 bg-white border border-gray-200 rounded-lg p-6 sm:p-8 flex flex-col justify-between shadow-sm group hover:border-[#003311] transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center bg-[#f6f3f2] px-2.5 py-1 text-[10px] uppercase font-sans font-extrabold tracking-widest text-[#003311] rounded">
                  <span className="w-1.5 h-3 bg-[#003311] mr-1.5"></span>
                  {heroPost.category_name}
                </span>
                <span className="text-[11px] text-gray-400 font-sans">
                  {new Date(heroPost.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <Link href={`/materia/${heroPost.id}`}>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-black text-[#001c06] leading-tight group-hover:text-[#d8561c] transition-colors mb-4">
                  {heroPost.title}
                </h1>
              </Link>

              <p className="text-base sm:text-lg font-serif text-[#414940] leading-relaxed border-l-4 border-[#003311] pl-4 mb-6 italic">
                {heroPost.excerpt}
              </p>
            </div>

            {heroPost.image && (
              <Link href={`/materia/${heroPost.id}`} className="relative block w-full aspect-[16/9] overflow-hidden rounded-md bg-gray-100 mb-4 shadow-sm">
                <Image
                  src={heroPost.image}
                  alt={heroPost.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </Link>
            )}

            <div className="flex items-center justify-between text-xs font-sans text-gray-500 pt-3 border-t border-gray-100">
              <span>Por <strong>{heroPost.author}</strong></span>
              <Link href={`/materia/${heroPost.id}`} className="text-[#d8561c] font-bold uppercase tracking-wider text-[11px] hover:underline">
                Ler matéria completa →
              </Link>
            </div>
          </article>

          {/* DUAS MATÉRIAS SECUNDÁRIAS EMPILHADAS (40% / lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {secondaryPost1 && (
              <article className="flex-1 bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between shadow-sm group hover:border-[#003311] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block text-[9px] font-sans font-bold uppercase tracking-wider text-[#d8561c] bg-[#d8561c]/10 px-2 py-0.5 rounded">
                      {secondaryPost1.category_name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-sans">
                      {new Date(secondaryPost1.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <Link href={`/materia/${secondaryPost1.id}`}>
                    <h2 className="text-lg sm:text-xl font-sans font-bold text-[#001c06] leading-snug group-hover:text-[#d8561c] transition-colors mb-2">
                      {secondaryPost1.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
                    {secondaryPost1.excerpt}
                  </p>
                </div>

                {secondaryPost1.image && (
                  <Link href={`/materia/${secondaryPost1.id}`} className="relative block w-full aspect-[16/9] overflow-hidden rounded bg-gray-100 mb-3">
                    <Image
                      src={secondaryPost1.image}
                      alt={secondaryPost1.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                )}
              </article>
            )}

            {secondaryPost2 && (
              <article className="flex-1 bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between shadow-sm group hover:border-[#003311] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block text-[9px] font-sans font-bold uppercase tracking-wider text-[#003311] bg-gray-100 px-2 py-0.5 rounded">
                      {secondaryPost2.category_name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-sans">
                      {new Date(secondaryPost2.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <Link href={`/materia/${secondaryPost2.id}`}>
                    <h2 className="text-lg sm:text-xl font-sans font-bold text-[#001c06] leading-snug group-hover:text-[#d8561c] transition-colors mb-2">
                      {secondaryPost2.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
                    {secondaryPost2.excerpt}
                  </p>
                </div>

                {secondaryPost2.image && (
                  <Link href={`/materia/${secondaryPost2.id}`} className="relative block w-full aspect-[16/9] overflow-hidden rounded bg-gray-100 mb-3">
                    <Image
                      src={secondaryPost2.image}
                      alt={secondaryPost2.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                )}
              </article>
            )}

          </div>

        </div>
      </section>

      {/* BLOCO 2: INTERRUPÇÃO PUBLICITÁRIA / BANNER HORIZONTAL */}
      <AdSlot format="in-feed" className="my-10" />

      {/* BLOCO 3: EDITORIAS EM COLUNAS + SIDEBAR COM AD 300X250 */}
      <section className="mb-14">
        <div className="border-b-2 border-[#003311] pb-2 mb-8 flex items-center justify-between">
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#001c06] flex items-center gap-2 font-sans">
            <span className="w-2 h-5 bg-[#003311]"></span>
            Cadernos Temáticos & Cobertura Setorial
          </h2>
          <span className="text-xs font-bold uppercase tracking-wider text-[#d8561c] font-sans hidden sm:inline">
            Tagma Especial
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUNA 1: ECONOMIA (lg:col-span-3) */}
          <div className="lg:col-span-3 bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
            <div className="border-b-2 border-emerald-700 pb-2 mb-4 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-900 font-sans">
                Economia & Negócios
              </h3>
              <Link href="/economia" className="text-[10px] text-emerald-700 font-bold uppercase hover:underline font-sans">
                Ver mais →
              </Link>
            </div>

            <div className="divide-y divide-gray-100 flex-1 space-y-4">
              {col1.map((post, idx) => (
                <article key={post.id} className={`${idx > 0 ? 'pt-4' : ''} group`}>
                  <Link href={`/materia/${post.id}`}>
                    <h4 className="text-sm font-sans font-bold leading-snug text-gray-900 group-hover:text-[#d8561c] transition-colors mb-1.5">
                      {post.title}
                    </h4>
                  </Link>
                  <p className="text-xs text-gray-500 font-serif line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* COLUNA 2: POLÍTICA (lg:col-span-3) */}
          <div className="lg:col-span-3 bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
            <div className="border-b-2 border-blue-800 pb-2 mb-4 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-950 font-sans">
                Poder & Política
              </h3>
              <Link href="/politica" className="text-[10px] text-blue-800 font-bold uppercase hover:underline font-sans">
                Ver mais →
              </Link>
            </div>

            <div className="divide-y divide-gray-100 flex-1 space-y-4">
              {col2.map((post, idx) => (
                <article key={post.id} className={`${idx > 0 ? 'pt-4' : ''} group`}>
                  <Link href={`/materia/${post.id}`}>
                    <h4 className="text-sm font-sans font-bold leading-snug text-gray-900 group-hover:text-[#d8561c] transition-colors mb-1.5">
                      {post.title}
                    </h4>
                  </Link>
                  <p className="text-xs text-gray-500 font-serif line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* COLUNA 3: TECNOLOGIA (lg:col-span-3) */}
          <div className="lg:col-span-3 bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
            <div className="border-b-2 border-purple-800 pb-2 mb-4 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-purple-950 font-sans">
                Tech & Inovação
              </h3>
              <Link href="/tecnologia" className="text-[10px] text-purple-800 font-bold uppercase hover:underline font-sans">
                Ver mais →
              </Link>
            </div>

            <div className="divide-y divide-gray-100 flex-1 space-y-4">
              {col3.map((post, idx) => (
                <article key={post.id} className={`${idx > 0 ? 'pt-4' : ''} group`}>
                  <Link href={`/materia/${post.id}`}>
                    <h4 className="text-sm font-sans font-bold leading-snug text-gray-900 group-hover:text-[#d8561c] transition-colors mb-1.5">
                      {post.title}
                    </h4>
                  </Link>
                  <p className="text-xs text-gray-500 font-serif line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* COLUNA 4: SIDEBAR DE PUBLICIDADE RETÂNGULO MÉDIO 300x250 (lg:col-span-3) */}
          <aside className="lg:col-span-3 bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="border-b-2 border-stone-800 pb-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 font-sans block">
                  Publicidade & Parcerias
                </span>
              </div>
              <AdSlot format="medium-rectangle" className="!my-2" />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link 
                href="/admin"
                className="block text-center py-2.5 px-3 bg-[#003311] hover:bg-[#001c06] text-white text-[11px] font-sans font-bold uppercase tracking-wider rounded transition-colors"
              >
                Central Editorial →
              </Link>
            </div>
          </aside>

        </div>
      </section>

      {/* FEED ADICIONAL INFERIOR: PANORAMA GERAL */}
      {feedRestante.length > 0 && (
        <section className="pt-8 border-t-2 border-gray-200">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-800 font-sans">
              Outros Destaques da Redação
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {feedRestante.map((post) => (
              <article key={post.id} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between group hover:shadow-md transition-all">
                <div>
                  {post.image && (
                    <Link href={`/materia/${post.id}`} className="relative aspect-[16/10] overflow-hidden rounded bg-gray-100 mb-3 block">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                  )}
                  <span className="inline-block text-[9px] font-sans font-bold uppercase tracking-wider text-[#003311] bg-gray-100 px-2 py-0.5 rounded mb-2">
                    {post.category_name}
                  </span>
                  <Link href={`/materia/${post.id}`}>
                    <h4 className="font-sans text-sm font-bold leading-snug text-[#1c1b1b] group-hover:text-[#d8561c] transition-colors">
                      {post.title}
                    </h4>
                  </Link>
                </div>
                <p className="text-xs text-gray-500 mt-2 line-clamp-2 font-serif">
                  {post.excerpt}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
