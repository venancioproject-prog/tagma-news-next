import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const LOTTERY_MODALITIES: Record<string, { name: string; caixaKey: string; fallbackKey: string }> = {
  'megasena': { name: 'Mega-Sena', caixaKey: 'megasena', fallbackKey: 'megasena' },
  'lotofacil': { name: 'Lotofácil', caixaKey: 'lotofacil', fallbackKey: 'lotofacil' },
  'quina': { name: 'Quina', caixaKey: 'quina', fallbackKey: 'quina' },
  'lotomania': { name: 'Lotomania', caixaKey: 'lotomania', fallbackKey: 'lotomania' },
  'timemania': { name: 'Timemania', caixaKey: 'timemania', fallbackKey: 'timemania' },
  'duplasena': { name: 'Dupla Sena', caixaKey: 'duplasena', fallbackKey: 'duplasena' },
  'diadesorte': { name: 'Dia de Sorte', caixaKey: 'diadesorte', fallbackKey: 'diadesorte' },
  'supersete': { name: 'Super Sete', caixaKey: 'supersete', fallbackKey: 'supersete' },
  'maismilionaria': { name: '+Milionária', caixaKey: 'maismilionaria', fallbackKey: 'maismilionaria' }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const loteriaKey = (searchParams.get('loteria') || 'megasena').toLowerCase().replace(/[^a-z0-9]/g, '')
  const modality = LOTTERY_MODALITIES[loteriaKey] || LOTTERY_MODALITIES['megasena']
  const nomeLoteria = modality.name

  try {
    let dataCaixa: any = null
    let fetchedVia = 'none'

    // 1. Primary: Caixa Econômica Federal API
    try {
      const caixaUrl = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${modality.caixaKey}`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const responseCaixa = await fetch(caixaUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        },
        signal: controller.signal,
        cache: 'no-store'
      })
      clearTimeout(timeoutId)

      if (responseCaixa.ok) {
        const rawJson = await responseCaixa.json()
        if (rawJson && (rawJson.numero || rawJson.listaDezenas)) {
          dataCaixa = {
            numero: rawJson.numero,
            dataApuracao: rawJson.dataApuracao || rawJson.dataApuracaoFormatada,
            listaDezenas: rawJson.listaDezenas || rawJson.dezenasSorteadasOrdemSorteio || [],
            acumulado: Boolean(rawJson.acumulado),
            valorEstimadoProximoConcurso: rawJson.valorEstimadoProximoConcurso || rawJson.valorAcumuladoProximoConcurso || 0
          }
          fetchedVia = 'caixa-oficial'
        }
      }
    } catch (caixaErr) {
      console.warn(`Caixa primary API error for ${nomeLoteria}:`, caixaErr)
    }

    // 2. Secondary: Public Lotteries API Fallback (loteriascaixa-api)
    if (!dataCaixa) {
      try {
        const fallbackUrl = `https://loteriascaixa-api.herokuapp.com/api/${modality.fallbackKey}/latest`
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 6000)

        const resFb = await fetch(fallbackUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'application/json'
          },
          signal: controller.signal,
          cache: 'no-store'
        })
        clearTimeout(timeoutId)

        if (resFb.ok) {
          const fbData = await resFb.json()
          if (fbData && fbData.concurso) {
            dataCaixa = {
              numero: fbData.concurso,
              dataApuracao: fbData.data,
              listaDezenas: fbData.dezenas || [],
              acumulado: Boolean(fbData.acumulou),
              valorEstimadoProximoConcurso: fbData.valorEstimadoProximoConcurso || fbData.valorAcumuladoProximoConcurso || 0
            }
            fetchedVia = 'public-fallback'
          }
        }
      } catch (fallbackErr) {
        console.warn(`Public fallback API error for ${nomeLoteria}:`, fallbackErr)
      }
    }

    // 3. Fallback 3: Safe Structure to never crash
    if (!dataCaixa) {
      dataCaixa = {
        numero: "Último",
        dataApuracao: new Date().toLocaleDateString('pt-BR'),
        listaDezenas: ["Confira no portal oficial"],
        acumulado: true,
        valorEstimadoProximoConcurso: "Consulte o próximo sorteio"
      }
      fetchedVia = 'safe-mock'
    }

    const concurso = dataCaixa.numero
    const dataSorteio = dataCaixa.dataApuracao
    const dezenas = Array.isArray(dataCaixa.listaDezenas) ? dataCaixa.listaDezenas.join(' - ') : String(dataCaixa.listaDezenas)
    const acumulou = dataCaixa.acumulado ? "SIM (Acumulou)" : "NÃO (Houve ganhadores)"
    const premioEstimado = typeof dataCaixa.valorEstimadoProximoConcurso === 'number'
      ? `R$ ${dataCaixa.valorEstimadoProximoConcurso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      : `R$ ${dataCaixa.valorEstimadoProximoConcurso}`

    // 4. Format with Groq AI with strict response_format json_object
    const systemPrompt = `Você é um jornalista econômico e investigativo especializado em loterias da Caixa Econômica Federal.
Escreva uma reportagem HARD NEWS sobre o resultado oficial.

REGRAS RÍGIDAS:
1. NÃO USE TRAVESSÕES (— ou -) para separar frases.
2. Seja objetivo, factual e direto.
3. Cite os números sorteados com clareza.
4. Finalize citando a Caixa Econômica Federal como fonte oficial.
5. Retorne ESTRITAMENTE um JSON válido.`

    const userPrompt = `DADOS OFICIAIS DO SORTEIO:
Modalidade: ${nomeLoteria}
Concurso: ${concurso}
Data da Apuração: ${dataSorteio}
Dezenas Sorteadas: ${dezenas}
Status do Prêmio: ${acumulou}
Estimativa Próximo Concurso: ${premioEstimado}

Retorne estritamente um JSON no formato:
{
  "title": "Manchete jornalística (máx 90 caracteres)",
  "excerpt": "Linha fina resumindo as dezenas e o prêmio (máx 160 caracteres)",
  "content": "Reportagem completa em Markdown com subtítulos H2 e sem travessões (máximo 250 palavras).",
  "tags": ["${modality.caixaKey}", "loterias", "resultado", "economia"]
}`

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
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

    // 5. Save to Supabase if configured
    if (SUPABASE_URL && SUPABASE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
      
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', 'Economia')
        .single()

      const catId = catData?.id || null
      const postId = `loteria-${modality.caixaKey}-${concurso}-${Date.now()}`

      const { error: insertError } = await supabase.from('posts').insert({
        id: postId,
        title: articleData.title,
        excerpt: articleData.excerpt,
        content: articleData.content,
        category_id: catId,
        author: 'Redação Tagma',
        published: true,
        tags: articleData.tags || ['loterias', modality.caixaKey]
      })

      if (insertError) {
        console.warn('Supabase insert warning:', insertError)
      }
    }

    return NextResponse.json({
      success: true,
      modality: nomeLoteria,
      sourceUsed: fetchedVia,
      post: articleData
    })

  } catch (err: any) {
    console.error('Lottery API Error:', err)
    return NextResponse.json({ error: err.message || 'Erro interno ao apurar loteria' }, { status: 500 })
  }
}

