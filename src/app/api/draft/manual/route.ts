import { NextResponse } from 'next/server'
import { getPublicSupabaseClient } from '@/lib/supabase/public'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, excerpt, image, content, category, tags } = body

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

    const postPayload: Record<string, any> = {
      id: postId,
      title: title.trim(),
      excerpt: excerpt?.trim() || title.trim(),
      content: content.trim(),
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

    // 2. Executar INSERT com tratamento de erro e status 500 estruturado
    const { data, error } = await supabase
      .from('posts')
      .insert(postPayload)
      .select()
      .single()

    if (error) {
      console.error('[ERRO INSERT SUPABASE]:', error)
      return NextResponse.json({ 
        error: `Rejeição do banco Supabase: ${error.message || error.details || 'Falha ao gravar registro'}` 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, post: data })

  } catch (err: any) {
    console.error('[ERRO FATAL API MANUAL DRAFT]:', err)
    return NextResponse.json({ 
      error: `Falha na requisição de publicação: ${err.message || 'Erro de rede ou conexão no servidor'}` 
    }, { status: 500 })
  }
}
