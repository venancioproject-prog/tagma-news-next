import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export const revalidate = 60

interface ArticleItem {
  id: string
  title: string
  excerpt: string
  content?: string
  image: string | null
  author: string
  created_at: string
  category_name: string
  tags?: string[]
}

const MOCK_POSTS: ArticleItem[] = [
  {
    id: 'mock-1',
    title: 'Banco Central projeta estabilidade fiscal e sinaliza novo ritmo para taxa de juros',
    excerpt: 'Relatório de mercado aponta desaceleração de índices inflacionários e reforça confiança de investidores em títulos públicos de longo prazo.',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1400&auto=format&fit=crop',
    author: 'Redação Economia',
    created_at: new Date().toISOString(),
    category_name: 'Economia',
    tags: ['capa', 'mercado', 'economia']
  },
  {
    id: 'mock-2',
    title: 'Congresso avança na votação do marco regulatório da Inteligência Artificial',
    excerpt: 'Texto de consenso estabelece diretrizes éticas para grandes modelos e cria regras de transparência para o setor corporativo.',
    image: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?q=80&w=800&auto=format&fit=crop',
    author: 'Equipe de Política',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    category_name: 'Política',
    tags: ['política', 'tecnologia']
  },
  {
    id: 'mock-3',
    title: 'Mega-Sena sorteia prêmio acumulado estimado em R$ 48 milhões neste concurso',
    excerpt: 'Apostas podem ser feitas até as 19h em casas lotéricas ou pelo canal eletrônico da Caixa Econômica Federal.',
    image: 'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?q=80&w=800&auto=format&fit=crop',
    author: 'Redação Tagma',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    category_name: 'Economia',
    tags: ['loterias', 'megasena']
  },
  {
    id: 'mock-4',
    title: 'Missão espacial internacional revela detalhes inéditos sobre atmosfera de exoplaneta',
    excerpt: 'Dados de telescópios de nova geração detectam vapor de água e compostos orgânicos em sistema estelar vizinho.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    author: 'Ciência & Tecnologia',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    category_name: 'Tecnologia',
    tags: ['tecnologia', 'ciência']
  },
  {
    id: 'mock-5',
    title: 'Cúpula de líderes globais debate transição energética e financiamento sustentável',
    excerpt: 'Representantes de mais de 40 países assinam acordo preliminar para expansão de matrizes renováveis na próxima década.',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop',
    author: 'Redação Internacional',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    category_name: 'Internacional',
    tags: ['internacional', 'sustentabilidade']
  }
]

export default async function Home() {
  let dbArticles: ArticleItem[] = []

  try {
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
      console.warn('Supabase fetch error, fallback to mock data:', error.message)
    } else if (posts && posts.length > 0) {
      dbArticles = posts.map(p => ({
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        image: p.image,
        author: p.author || 'Redação Tagma',
        created_at: p.created_at,
        category_name: p.categories?.name || 'Geral',
        tags: p.tags || []
      }))
    }
  } catch (err) {
    console.warn('Could not connect to Supabase, injecting mock posts:', err)
  }

  // Inject mock posts if database is empty to ensure high visual quality
  const finalArticles = dbArticles.length > 0 ? dbArticles : MOCK_POSTS

  const heroPost = finalArticles.find(p => p.tags?.includes('capa')) || finalArticles[0]
  const sidebarPosts = finalArticles.filter(p => p.id !== heroPost.id).slice(0, 4)
  const bottomPosts = finalArticles.slice(5)

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 md:py-10">
      
      {/* SEÇÃO PRINCIPAL: GRID 70% / 30% ESTILO G1 / CNN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-14">
        
        {/* COLUNA ESQUERDA: MANCHETE DE CAPA (8 de 12 colunas = ~67-70%) */}
        <section className="lg:col-span-8 flex flex-col justify-start">
          <div className="border-b-2 border-[#003311] pb-2 mb-4 flex items-center justify-between">
            <span className="inline-flex items-center text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#003311]">
              <span className="w-2 h-2 bg-[#d8561c] rounded-full mr-2"></span>
              Em Destaque • {heroPost.category_name}
            </span>
            <span className="text-[10px] font-sans text-gray-500 uppercase tracking-wider">
              {new Date(heroPost.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>

          <Link href={`/materia/${heroPost.id}`} className="group block mb-4">
            <h1 className="text-left font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-black text-[#001c06] group-hover:text-[#934b00] transition-colors leading-[1.15] tracking-tight mb-4">
              {heroPost.title}
            </h1>
          </Link>

          <p className="text-lg md:text-xl font-serif text-[#414940] leading-relaxed border-l-4 border-[#003311] pl-4 mb-6 italic">
            {heroPost.excerpt}
          </p>

          {heroPost.image && (
            <Link href={`/materia/${heroPost.id}`} className="relative block w-full aspect-[16/9] overflow-hidden rounded-sm bg-gray-100 mb-4 shadow-sm group">
              <Image 
                src={heroPost.image} 
                alt={heroPost.title} 
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            </Link>
          )}

          <div className="flex items-center justify-between text-[11px] font-sans uppercase tracking-wider text-gray-500 pt-2 border-t border-gray-200">
            <span>Reportagem: <strong className="text-[#001c06]">{heroPost.author}</strong></span>
            <Link href={`/materia/${heroPost.id}`} className="text-[#d8561c] font-bold hover:underline">
              Ler reportagem completa →
            </Link>
          </div>
        </section>

        {/* COLUNA DIREITA: ÚLTIMAS NOTÍCIAS (4 de 12 colunas = ~30%) */}
        <aside className="lg:col-span-4 flex flex-col bg-white border border-gray-200 rounded-sm p-5 shadow-sm">
          <div className="flex items-center justify-between border-b-2 border-[#001c06] pb-2 mb-4">
            <h2 className="text-xs font-sans font-black uppercase tracking-[0.2em] text-[#001c06] flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-[#003311]"></span>
              Últimas Notícias
            </h2>
            <span className="text-[9px] font-sans font-bold uppercase bg-[#d8561c]/10 text-[#d8561c] px-1.5 py-0.5 rounded">
              Tempo Real
            </span>
          </div>

          <div className="flex flex-col divide-y divide-gray-100">
            {sidebarPosts.map((post) => (
              <article key={post.id} className="py-4 first:pt-0 last:pb-0 group">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#d8561c]">
                    {post.category_name}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-[9px] font-sans text-gray-400">
                    {new Date(post.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <Link href={`/materia/${post.id}`}>
                  <h3 className="font-sans text-[15px] font-bold leading-snug text-[#001c06] group-hover:text-[#934b00] transition-colors">
                    {post.title}
                  </h3>
                </Link>

                {post.image && (
                  <Link href={`/materia/${post.id}`} className="relative mt-2.5 block aspect-[16/9] overflow-hidden rounded bg-gray-100">
                    <Image 
                      src={post.image} 
                      alt={post.title} 
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  </Link>
                )}
              </article>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link 
              href="/admin" 
              className="inline-block w-full py-2.5 px-4 bg-[#f6f3f2] hover:bg-[#003311] text-[#003311] hover:text-white font-sans text-xs font-bold uppercase tracking-widest rounded transition-all"
            >
              Central do Jornalista
            </Link>
          </div>
        </aside>

      </div>

      {/* SEÇÃO INFERIOR: GRADE MULTI-EDITORIAS (G1 / CNN STYLE) */}
      <section className="pt-8 border-t-4 border-[#003311]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-sans font-extrabold uppercase tracking-tight text-[#001c06] flex items-center gap-2">
            <span className="w-2 h-5 bg-[#003311]"></span>
            Panorama Geral & Editorias
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(bottomPosts.length > 0 ? bottomPosts : finalArticles.slice(1)).map((post) => (
            <article key={post.id} className="bg-white border border-gray-200 rounded p-4 flex flex-col justify-between group hover:shadow-md transition-shadow">
              <div>
                {post.image && (
                  <Link href={`/materia/${post.id}`} className="relative aspect-[16/10] overflow-hidden rounded bg-gray-100 mb-3 block">
                    <Image 
                      src={post.image} 
                      alt={post.title} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  </Link>
                )}
                <span className="inline-block text-[9px] font-sans font-bold uppercase tracking-wider text-[#003311] bg-gray-100 px-2 py-0.5 rounded mb-2">
                  {post.category_name}
                </span>
                <Link href={`/materia/${post.id}`}>
                  <h3 className="font-sans text-sm font-bold leading-snug text-[#1c1b1b] group-hover:text-[#934b00] transition-colors">
                    {post.title}
                  </h3>
                </Link>
              </div>

              <p className="text-xs text-gray-500 mt-2 line-clamp-2 font-serif">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      </section>

    </main>
  )
}
