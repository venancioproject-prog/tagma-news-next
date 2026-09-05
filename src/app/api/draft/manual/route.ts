import { NextResponse } from 'next/server'
import { getPublicSupabaseClient } from '@/lib/supabase/public'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      title, 
      seo_title, 
      slug, 
      meta_description, 
      excerpt, 
      image, 
      content, 
      category, 
      tags 
    } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'O título da matéria é obrigatório.' }, { status: 400 })
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'O conteúdo em texto da matéria é obrigatório.' }, { status: 400 })
    }

    const currentCategory = (category && category.trim()) ? category.trim() : 'Geral'

    // Obtenção do cliente Supabase validado estritamente
    const supabase = getPublicSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Erro de infraestrutura: Credenciais do Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) não estão configuradas no servidor.' 
      }, { status: 500 })
    }
    
    // 1. Tentar buscar category_id existente ou criar se não existir
    let category_id: string | null = null
    try {
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', currentCategory)
        .maybeSingle()

      if (catData?.id) {
        category_id = catData.id
      } else {
        const newCatSlug = currentCategory.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
        const { data: newCat } = await supabase
          .from('categories')
          .insert({
            name: currentCategory,
            slug: newCatSlug
          })
          .select('id')
          .maybeSingle()

        if (newCat?.id) {
          category_id = newCat.id
        }
      }
    } catch (catErr: any) {
      console.warn('[AVISO CATEGORIA SUPABASE]:', catErr.message || catErr)
    }

    const postId = `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const finalSlug = (slug && slug.trim())
      ? slug.trim()
      : title.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    // Higienização e garantia de subtítulos Markdown (##) antes de salvar no Supabase
    let cleanContent = String(content || '').replace(/\\n/g, '\n').trim()
    const contentLines = cleanContent.split('\n')
    const hasHeadings = contentLines.some(l => l.trim().startsWith('## ') || l.trim().startsWith('### '))

    if (!hasHeadings) {
      const enhancedLines = contentLines.map((line, idx) => {
        const trimmed = line.trim()
        if (
          idx > 0 &&
          trimmed.length >= 4 &&
          trimmed.length <= 80 &&
          !trimmed.endsWith('.') &&
          !trimmed.endsWith(',') &&
          !trimmed.endsWith(':') &&
          !trimmed.startsWith('-') &&
          !trimmed.startsWith('*') &&
          !trimmed.startsWith('#')
        ) {
          return `\n## ${trimmed}\n`
        }
        return line
      })
      cleanContent = enhancedLines.join('\n')
    }
    cleanContent = cleanContent.replace(/\n{3,}/g, '\n\n')

    const postPayload: Record<string, any> = {
      id: postId,
      title: title.trim(),
      seo_title: seo_title?.trim() || title.trim(),
      slug: finalSlug,
      meta_description: meta_description?.trim() || excerpt?.trim() || title.trim(),
      excerpt: excerpt?.trim() || title.trim(),
      content: cleanContent,
      image: image?.trim() || null,
      author: 'Redação Tagma',
      published: true
    }

    if (category_id) {
      postPayload.category_id = category_id
    }

    if (tags && Array.isArray(tags)) {
      postPayload.tags = tags
    }

    // 2. Executar INSERT com fallback caso as colunas extras de SEO ainda não existam no schema
    let insertResult = await supabase
      .from('posts')
      .insert(postPayload)
      .select()
      .single()

    // Se o banco rejeitar por falta das colunas seo_title/slug/meta_description, faz o fallback seguro
    if (insertResult.error && (insertResult.error.message.includes('column') || insertResult.error.details?.includes('column'))) {
      console.warn('[SUPABASE SCHEMA FALLBACK] Tentando insert com campos padrão...')
      const safePayload = {
        id: postId,
        title: title.trim(),
        excerpt: excerpt?.trim() || title.trim(),
        content: content.trim(),
        image: image?.trim() || null,
        category_id: category_id || undefined,
        author: 'Redação Tagma',
        published: true,
        tags: Array.isArray(tags) ? tags : undefined
      }
      insertResult = await supabase
        .from('posts')
        .insert(safePayload)
        .select()
        .single()
    }

    if (insertResult.error) {
      console.error('[ERRO INSERT SUPABASE]:', insertResult.error)
      return NextResponse.json({ 
        error: `Rejeição do banco Supabase: ${insertResult.error.message || insertResult.error.details || 'Falha ao gravar registro'}` 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, post: insertResult.data })

  } catch (err: any) {
    console.error('[ERRO FATAL API MANUAL DRAFT]:', err)
    return NextResponse.json({ 
      error: `Falha na requisição de publicação: ${err.message || 'Erro de rede ou conexão no servidor'}` 
    }, { status: 500 })
  }
}
