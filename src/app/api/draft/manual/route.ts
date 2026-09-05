import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, excerpt, image, content, category, tags } = body

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Título, conteúdo e categoria são obrigatórios.' }, { status: 400 })
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ error: 'Chaves de conexão do Supabase não configuradas no servidor.' }, { status: 500 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    
    // 1. Tentar buscar category_id existente ou criar se não existir
    let category_id: string | null = null
    const { data: catData, error: catError } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', category.trim())
      .maybeSingle()

    if (catData?.id) {
      category_id = catData.id
    } else {
      // Se não existir, tenta criar a categoria para evitar violação de FK
      const newCatSlug = category.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
      const { data: newCat, error: insertCatError } = await supabase
        .from('categories')
        .insert({
          name: category.trim(),
          slug: newCatSlug
        })
        .select('id')
        .maybeSingle()

      if (newCat?.id) {
        category_id = newCat.id
      }
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

    // Apenas vincula category_id se obtido com sucesso
    if (category_id) {
      postPayload.category_id = category_id
    }

    if (tags && Array.isArray(tags)) {
      postPayload.tags = tags
    }

    const { data, error } = await supabase
      .from('posts')
      .insert(postPayload)
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error details:', error)
      return NextResponse.json({ 
        error: `Falha no banco Supabase: ${error.message || error.details || 'Erro desconhecido'}` 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, post: data })

  } catch (err: any) {
    console.error('Manual publish fatal error:', err)
    return NextResponse.json({ 
      error: `Erro ao processar publicação: ${err.message || 'Erro interno no servidor'}` 
    }, { status: 500 })
  }
}
