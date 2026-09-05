import { getPublicSupabaseClient } from '@/lib/supabase/public';
import Link from 'next/link';
import Image from 'next/image';
import AdSlot from '@/components/AdSlot';
import { MOCK_POSTS, ArticleItem } from '@/lib/posts-data';

export const revalidate = 60;

export default async function Home() {
  let dbArticles: ArticleItem[] = [];

  try {
    const supabase = getPublicSupabaseClient();
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
        .limit(20);

      if (!error && posts && posts.length > 0) {
        dbArticles = posts.map((p: any) => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt || '',
          content: p.content || '',
          image: p.image || null,
          author: p.author || 'Redação Tagma News',
          created_at: p.created_at,
          category_name: p.categories?.name || 'Geral',
          tags: [],
        }));
      }
    }
  } catch (err) {
    console.warn('Could not connect to Supabase, using mock fallback:', err);
  }

  // Garante preenchimento editorial robusto com fallback mock de qualidade
  const finalArticles: ArticleItem[] = dbArticles.length >= 15
    ? dbArticles
    : [...dbArticles, ...MOCK_POSTS.filter(m => !dbArticles.some(d => d.id === m.id))].slice(0, 18);

  const heroPost = finalArticles[0];
  const secondaryPost1 = finalArticles[1];
  const secondaryPost2 = finalArticles[2];

  // Editorias Temáticas
  const economiaPosts = finalArticles.filter(p => p.category_name === 'Economia').slice(0, 3);
  const politicaPosts = finalArticles.filter(p => p.category_name === 'Política').slice(0, 3);
  const tecnologiaPosts = finalArticles.filter(p => p.category_name === 'Tecnologia').slice(0, 3);
  const internacionalPosts = finalArticles.filter(p => p.category_name === 'Internacional').slice(0, 3);

  const colEconomia = economiaPosts.length >= 2 ? economiaPosts : finalArticles.slice(4, 7);
  const colPolitica = politicaPosts.length >= 2 ? politicaPosts : finalArticles.slice(7, 10);
  const colTecnologia = tecnologiaPosts.length >= 2 ? tecnologiaPosts : finalArticles.slice(10, 13);
  const colInternacional = internacionalPosts.length >= 2 ? internacionalPosts : finalArticles.slice(13, 16);

  const feedRestante = finalArticles.slice(6);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 space-y-10">
      
      {/* 1. FAIXA DE COBERTURA URGENTE / AO VIVO */}
      <div className="bg-[#001c06] text-white p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border-l-4 border-[#d8561c]">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#d8561c]">
            Cobertura em Tempo Real
          </span>
          <span className="text-white/40 hidden md:inline">|</span>
          <p className="text-xs font-bold text-white line-clamp-1">
            Mercados operam atentos a decisões fiscais em Brasília e indicadores de inflação
          </p>
        </div>
        <Link
          href="/ao-vivo"
          className="text-xs font-extrabold uppercase tracking-wider text-[#d8561c] hover:text-white flex items-center gap-1 self-end sm:self-auto flex-shrink-0"
        >
          Acompanhar Ao Vivo →
        </Link>
      </div>

      {/* 2. ESPAÇO PUBLICITÁRIO DO TOPO (728x90) */}
      <AdSlot format="leaderboard" className="!my-2" />

      {/* 3. BENTO GRID DE MANCHETES PRINCIPAIS */}
      <section aria-label="Manchetes Principais do Dia">
        <div className="border-b-2 border-[#003311] pb-2 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#d8561c] rounded-full"></span>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#001c06] font-sans">
              Manchetes do Dia • Destaques da Redação
            </h2>
          </div>
          <span className="text-[10px] uppercase font-bold text-gray-400 font-sans">
            Atualizado minuto a minuto
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* MANCHETE HERO (60% / lg:col-span-7) */}
          <article className="lg:col-span-7 bg-white border border-gray-200 rounded-lg p-6 sm:p-8 flex flex-col justify-between shadow-sm group hover:border-[#003311] transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center bg-[#f6f3f2] px-2.5 py-1 text-[10px] uppercase font-sans font-extrabold tracking-widest text-[#003311] rounded">
                  <span className="w-1.5 h-3 bg-[#003311] mr-1.5"></span>
                  {heroPost.category_name}
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
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

          {/* MATÉRIAS SECUNDÁRIAS EMPILHADAS (40% / lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {secondaryPost1 && (
              <article className="flex-1 bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between shadow-sm group hover:border-[#003311] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block text-[9px] font-sans font-bold uppercase tracking-wider text-[#d8561c] bg-[#d8561c]/10 px-2 py-0.5 rounded">
                      {secondaryPost1.category_name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(secondaryPost1.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <Link href={`/materia/${secondaryPost1.id}`}>
                    <h2 className="text-lg sm:text-xl font-sans font-bold text-[#001c06] leading-snug group-hover:text-[#d8561c] transition-colors mb-2">
                      {secondaryPost1.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4 font-serif">
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
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(secondaryPost2.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <Link href={`/materia/${secondaryPost2.id}`}>
                    <h2 className="text-lg sm:text-xl font-sans font-bold text-[#001c06] leading-snug group-hover:text-[#d8561c] transition-colors mb-2">
                      {secondaryPost2.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4 font-serif">
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

      {/* 4. INTERRUPÇÃO PUBLICITÁRIA IN-FEED */}
      <AdSlot format="in-feed" className="!my-6" />

      {/* 5. CADERNOS SETORIAIS (4 COLUNAS EM GRID) */}
      <section aria-label="Cadernos Setoriais">
        <div className="border-b-2 border-[#003311] pb-2 mb-8 flex items-center justify-between">
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#001c06] flex items-center gap-2 font-sans">
            <span className="w-2 h-5 bg-[#003311]"></span>
            Cadernos Temáticos & Cobertura Setorial
          </h2>
          <span className="text-xs font-bold uppercase tracking-wider text-[#d8561c] font-sans hidden sm:inline">
            Tagma Especial
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          
          {/* COLUNA ECONOMIA */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
            <div className="border-b-2 border-emerald-700 pb-2 mb-4 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-900 font-sans">
                Economia & Negócios
              </h3>
              <Link href="/economia" className="text-[10px] text-emerald-700 font-bold uppercase hover:underline">
                Ver mais →
              </Link>
            </div>
            <div className="divide-y divide-gray-100 space-y-4">
              {colEconomia.map((post, idx) => (
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

          {/* COLUNA POLÍTICA */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
            <div className="border-b-2 border-blue-800 pb-2 mb-4 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-950 font-sans">
                Poder & Política
              </h3>
              <Link href="/politica" className="text-[10px] text-blue-800 font-bold uppercase hover:underline">
                Ver mais →
              </Link>
            </div>
            <div className="divide-y divide-gray-100 space-y-4">
              {colPolitica.map((post, idx) => (
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

          {/* COLUNA TECNOLOGIA */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
            <div className="border-b-2 border-purple-800 pb-2 mb-4 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-purple-950 font-sans">
                Tech & Inovação
              </h3>
              <Link href="/tecnologia" className="text-[10px] text-purple-800 font-bold uppercase hover:underline">
                Ver mais →
              </Link>
            </div>
            <div className="divide-y divide-gray-100 space-y-4">
              {colTecnologia.map((post, idx) => (
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

          {/* COLUNA INTERNACIONAL */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
            <div className="border-b-2 border-amber-800 pb-2 mb-4 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-950 font-sans">
                Mundo & Geopolítica
              </h3>
              <Link href="/internacional" className="text-[10px] text-amber-800 font-bold uppercase hover:underline">
                Ver mais →
              </Link>
            </div>
            <div className="divide-y divide-gray-100 space-y-4">
              {colInternacional.map((post, idx) => (
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

        </div>
      </section>

      {/* 6. VITRINE MULTIMÍDIA (VÍDEOS & PODCASTS) */}
      <section className="bg-[#001c06] text-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎙️</span>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider text-white">
                Multimídia & Boletins Sonoros
              </h2>
              <p className="text-xs text-white/60">Análises em vídeo, podcasts e explicadores de pautas complexas.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/videos" className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold uppercase transition-colors">
              Vídeos →
            </Link>
            <Link href="/audios" className="px-3 py-1.5 bg-[#d8561c] hover:bg-[#b04313] text-white rounded text-xs font-bold uppercase transition-colors">
              Podcasts →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-[#d8561c] transition-colors">
            <span className="text-[9px] uppercase font-bold text-orange-400 bg-white/10 px-2 py-0.5 rounded">
              Vídeo Explicador
            </span>
            <h3 className="text-sm font-bold text-white mt-2 mb-1">
              Entenda o impacto das decisões de juros no crédito imobiliário
            </h3>
            <p className="text-xs text-white/70 font-serif">Análise didática para o bolso do consumidor.</p>
          </div>

          <div className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-[#d8561c] transition-colors">
            <span className="text-[9px] uppercase font-bold text-emerald-400 bg-white/10 px-2 py-0.5 rounded">
              Boletim em Áudio
            </span>
            <h3 className="text-sm font-bold text-white mt-2 mb-1">
              Giro Econômico da Manhã: Índices do mercado e câmbio
            </h3>
            <p className="text-xs text-white/70 font-serif">Resumo em 8 minutos dos principais fatos.</p>
          </div>

          <div className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-[#d8561c] transition-colors">
            <span className="text-[9px] uppercase font-bold text-purple-400 bg-white/10 px-2 py-0.5 rounded">
              Podcast Especial
            </span>
            <h3 className="text-sm font-bold text-white mt-2 mb-1">
              Marco Regulatório de IA e os novos desafios de privacidade
            </h3>
            <p className="text-xs text-white/70 font-serif">Debate aprofundado com especialistas.</p>
          </div>
        </div>
      </section>

      {/* 7. INSCRIÇÃO RÁPIDA DE NEWSLETTER */}
      <section className="bg-white border border-gray-200 p-6 sm:p-8 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#d8561c]">
            Newsletter Gratuita
          </span>
          <h2 className="text-xl font-extrabold text-[#001c06]">
            Receba o Resumo Diário do Tagma News no seu E-mail
          </h2>
          <p className="text-xs text-gray-500 font-serif">
            Apurações objetivas, sem ruído, entregues todas as manhãs às 07h00.
          </p>
        </div>

        <form className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <input
            type="email"
            placeholder="Digite seu e-mail..."
            className="border border-gray-300 rounded px-4 py-2.5 text-xs focus:outline-none focus:border-[#003311] min-w-[240px]"
            required
          />
          <button
            type="submit"
            className="bg-[#001c06] hover:bg-[#003311] text-white px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Inscrever-se
          </button>
        </form>
      </section>

      {/* 8. PANORAMA GERAL / FEED INFERIOR */}
      {feedRestante.length > 0 && (
        <section className="pt-8 border-t-2 border-gray-200">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-800 font-sans">
              Outros Destaques da Redação
            </h3>
            <Link href="/ultimas" className="text-xs font-bold uppercase text-[#003311] hover:underline">
              Ver Feed Completo →
            </Link>
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
                        sizes="(max-width: 768px) 100vw, 25vw"
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
  );
}
