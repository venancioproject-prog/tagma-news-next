import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function POST(request: Request) {
  try {
    const { title, description, category, link, source } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Faltam dados da pauta (título obrigatório)' }, { status: 400 })
    }

    const currentCategory = category || 'Geral'
    const newsLead = description || title
    const newsSource = source || 'Agência de Notícias'

    const systemPrompt = `Você é um jornalista sênior de um portal de notícias hard news de altíssimo padrão e credibilidade (G1, Reuters, Agência Brasil).
Sua missão é transformar fatos brutos em matérias jornalísticas concisas, profissionais e objetivas.

REGRAS RÍGIDAS DE ESTILO E QUALIDADE:
1. SEM ALUCINAÇÕES: Atenha-se estritamente aos fatos fornecidos pelo título e lide do RSS.
2. SEM TRAVESSÕES: Jamais utilize travessão (— ou -) para separar orações. Use vírgulas, pontos ou reformule a frase.
3. SEM INTRODUÇÃO OU TEXTO EXTRA: Retorne estritamente um JSON limpo e parseável.
4. ESTRUTURA JORNALÍSTICA:
   - Título informativo, claro e de forte impacto editorial (máximo 90 caracteres).
   - Linha fina (resumo) explicando os pontos-chave em até 160 caracteres.
   - Conteúdo em Markdown com subtítulos H2 objetivos e citação da fonte original ao final.
   - Tags relevantes (3 a 5 tags curtas em minúsculas).`

    const userPrompt = `FATO BRUTO DO FEED RSS:
Título Original: ${title}
Lide / Resumo Original: ${newsLead}
Categoria: ${currentCategory}
Fonte: ${newsSource} ${link ? `(${link})` : ''}

Gere o artigo em JSON com o formato estrito:
{
  "title": "Manchete jornalística",
  "excerpt": "Linha fina resumindo o fato",
  "content": "Texto completo em Markdown (com H2 e sem travessões)",
  "tags": ["tag1", "tag2", "tag3"]
}`

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      })
    })

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      throw new Error(`Groq API Error (${groqResponse.status}): ${errorText}`)
    }

    const groqData = await groqResponse.json()
    const contentText = groqData.choices?.[0]?.message?.content

    if (!contentText) {
      throw new Error('Resposta vazia da Groq API')
    }

    const articleData = JSON.parse(contentText)

    if (!articleData.title || !articleData.content) {
      throw new Error('JSON retornado pela IA não contém os campos obrigatórios')
    }

    // Save to Supabase if configured
    if (SUPABASE_URL && SUPABASE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
      
      // Get category ID
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', currentCategory)
        .single()

      const catId = catData?.id || null
      const postId = `post-${Date.now()}`

      const { error: insertError } = await supabase.from('posts').insert({
        id: postId,
        title: articleData.title,
        excerpt: articleData.excerpt || articleData.title,
        content: articleData.content,
        category_id: catId,
        author: 'Redação Tagma',
        published: true,
        tags: Array.isArray(articleData.tags) ? articleData.tags : [currentCategory.toLowerCase()]
      })

      if (insertError) {
        console.warn('Supabase insert warning:', insertError)
      }
    }

    return NextResponse.json({ success: true, post: articleData })

  } catch (err: any) {
    console.error('Draft API Error:', err)
    return NextResponse.json({ error: err.message || 'Erro interno ao gerar matéria' }, { status: 500 })
  }
}

