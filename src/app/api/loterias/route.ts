import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GROQ_API_KEY = process.env.GROQ_API_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const loteria = searchParams.get('loteria') || 'megasena'
  const nomeLoteria = loteria === 'megasena' ? 'Mega-Sena' : loteria

  try {
    // 1. Fetch official CAIXA data
    const caixaUrl = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${loteria}`
    const responseCaixa = await fetch(caixaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      }
    })
    
    if (!responseCaixa.ok) {
      return NextResponse.json({ error: 'Falha ao ler Caixa API' }, { status: 500 })
    }
    const dataCaixa = await responseCaixa.json()

    const concurso = dataCaixa.numero
    const dataSorteio = dataCaixa.dataApuracao
    const dezenas = (dataCaixa.listaDezenas || []).join(', ')
    const acumulou = dataCaixa.acumulado ? "SIM (Acumulou)" : "NÃO (Houve ganhadores)"
    const premioEstimado = dataCaixa.valorEstimadoProximoConcurso

    // 2. Format with Groq AI
    const prompt = `Atue como um jornalista de portal de alto padrão (ex: G1, Folha).
Sua tarefa é escrever uma reportagem HARD NEWS sobre o último sorteio da ${nomeLoteria}. SEM TRAVESSÕES. Seja direto, neutro e cite a Caixa Econômica Federal como fonte no final.

DADOS DA CAIXA:
Loteria: ${nomeLoteria}
Concurso: ${concurso}
Data do Sorteio: ${dataSorteio}
Dezenas Sorteadas: ${dezenas}
Acumulou? ${acumulou}
Prêmio Estimado Próximo Concurso: R$ ${premioEstimado}

Você deve retornar ESTRITAMENTE um JSON válido:
{
    "title": "Manchete jornalística (ex: Mega-Sena acumula e prêmio vai a X milhões)",
    "excerpt": "Linha fina resumindo os números e a situação",
    "content": "O texto da reportagem em Markdown (máximo 250 palavras, seja conciso, cite a Caixa no final como fonte oficial)."
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
    
    // Limpa possíveis marcações de markdown ```json do retorno da IA
    contentText = contentText.replace(/```json/g, '').replace(/```/g, '').trim()
    const articleData = JSON.parse(contentText)

    // 3. Save to Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    
    // Get Economia category ID
    const { data: catData } = await supabase.from('categories').select('id').eq('name', 'Economia').single()
    const catId = catData?.id || null

    // Generate unique ID
    const postId = `${loteria}-${concurso}-${Date.now()}`

    const { error: insertError } = await supabase.from('posts').insert({
      id: postId,
      title: articleData.title,
      excerpt: articleData.excerpt,
      content: articleData.content,
      category_id: catId,
      author: 'Redação Tagma',
      published: true,
      tags: ['loterias', loteria]
    })

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({ success: true, post: articleData })

  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
