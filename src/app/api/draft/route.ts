import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GROQ_API_KEY = process.env.GROQ_API_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: Request) {
  try {
    const { title, description, category } = await request.json()

    if (!title || !description) {
      return NextResponse.json({ error: 'Faltam dados da pauta' }, { status: 400 })
    }

    const prompt = `Atue como um jornalista sênior de um portal de alta credibilidade (G1, Folha).
Escreva uma reportagem HARD NEWS baseada na pauta abaixo.
NÃO USE TRAVESSÕES. Seja direto, neutro, sem opinião.

FATO BRUTO:
Título: ${title}
Descrição: ${description}
Categoria: ${category}

Você deve retornar ESTRITAMENTE um JSON válido:
{
    "title": "Manchete jornalística forte (máx 80 caracteres)",
    "excerpt": "Linha fina impactante",
    "content": "O texto completo da reportagem em Markdown (H2 para subtítulos, sem travessões, seja conciso).",
    "tags": ["hard news", "atualidades"]
}`

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    })

    const groqData = await groqResponse.json()
    let contentText = groqData.choices[0].message.content
    contentText = contentText.replace(/```json/g, '').replace(/```/g, '').trim()
    const articleData = JSON.parse(contentText)

    // Save to Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    
    // Get category ID
    const { data: catData } = await supabase.from('categories').select('id').ilike('name', category).single()
    const catId = catData?.id || null

    const postId = `post-${Date.now()}`

    const { error: insertError } = await supabase.from('posts').insert({
      id: postId,
      title: articleData.title,
      excerpt: articleData.excerpt,
      content: articleData.content,
      category_id: catId,
      author: 'Redação Tagma',
      published: true,
      tags: articleData.tags || [category.toLowerCase()]
    })

    if (insertError) throw insertError

    return NextResponse.json({ success: true, post: articleData })

  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Erro interno ao gerar matéria' }, { status: 500 })
  }
}
