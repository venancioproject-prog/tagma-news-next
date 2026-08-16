import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, excerpt, image, content, category } = body

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Título, conteúdo e categoria são obrigatórios' }, { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    
    // Get category ID
    const { data: catData } = await supabase.from('categories').select('id').ilike('name', category).single()
    const category_id = catData?.id

    const postId = `manual-${Date.now()}`

    const { data, error } = await supabase
      .from('posts')
      .insert({
        id: postId,
        title: title.trim(),
        excerpt: excerpt?.trim() || title.trim(),
        content: content.trim(),
        image: image?.trim() || null,
        category_id,
        author: 'Redação',
        published: true
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, post: data })

  } catch (err: any) {
    console.error('Manual publish error:', err)
    return NextResponse.json({ error: 'Erro ao publicar no banco de dados' }, { status: 500 })
  }
}
