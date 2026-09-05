import { NextResponse } from 'next/server'
import { getPublicSupabaseClient } from '@/lib/supabase/public'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''

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

    // 4. Format with Groq AI with Mega System Prompt
    const systemPrompt = `O SEU PAPEL
Você é o Redator Chefe do portal Tagma News, especializado em "Hard News" de Loterias e Economia Popular, e mestre em SEO Técnico. Seu trabalho é transformar os dados do sorteio em uma notícia profunda, magnética e de leitura agradável.

1. REGRAS DE ESTRUTURA JORNALÍSTICA
- Pirâmide Invertida: Dezenas sorteadas, concurso e estimativa de prêmio no Lide (primeiro parágrafo).
- Contexto e Premiação: Detalhar se acumulou, regras para resgate do prêmio na Caixa e prazos (90 dias).
- Desdobramentos: Data do próximo concurso e como apostar online ou nas lotéricas.
- Atribuição: Ao final: "Com informações oficiais da Caixa Econômica Federal".

2. REGRAS DE SEO ON-PAGE E WEBWRITING
- OBRIGATÓRIO: O campo 'content' DEVE ser gerado estritamente em Markdown válido. Todos os subtítulos de seções DEVEM obrigatoriamente começar com '## ' (duas hashs e um espaço) antes do texto do título. NUNCA escreva subtítulos como texto puro. Cada parágrafo deve ser separado por dupla quebra de linha.
- Palavra-chave foco no título, primeiro parágrafo e subtítulo ## (ex: "Resultado da ${nomeLoteria} Concurso ${concurso}").
- Use marcação Markdown rigorosa para subtítulos (##) e negritos (**palavra**).
- Parágrafos curtos (máximo 3 a 4 linhas).
- Bullet points destacando as dezenas e os valores.

3. O DNA ANTIDETECÇÃO
- Proibido o uso de travessões ou hífens (-, —, –) para separar orações.
- Sem clichês de IA ("Além disso", "Ademais", "Em suma").

4. FORMATO DE SAÍDA EXIGIDO (JSON ESTRITO):
{
  "title": "Manchete jornalística, curta, chamativa e com a palavra-chave",
  "seo_title": "Título otimizado para o Google com no máximo 60 caracteres",
  "slug": "resultado-${modality.caixaKey}-concurso-${concurso}",
  "meta_description": "Confira o resultado do concurso ${concurso} da ${nomeLoteria} de ${dataSorteio}. Dezenas sorteadas e valor do próximo prêmio.",
  "excerpt": "Lide jornalístico resumindo o resultado do sorteio e o valor acumulado",
  "content": "OBRIGATÓRIO: Texto completo em Markdown com subtítulos '## ', listas '-' e valores em **negrito**",
  "tags": ["${modality.caixaKey}", "loterias", "resultado", "sorteio", "economia"]
}`

    const userPrompt = `DADOS OFICIAIS DO SORTEIO:
Modalidade: ${nomeLoteria}
Concurso: ${concurso}
Data da Apuração: ${dataSorteio}
Dezenas Sorteadas: ${dezenas}
Status do Prêmio: ${acumulou}
Estimativa Próximo Concurso: ${premioEstimado}

Gere o artigo em JSON estrito seguindo todas as regras do Redator Chefe.`

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL_NAME || 'openai/gpt-oss-120b',
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

    // Higienização e fallback de Markdown para garantir subtítulos com ##
    let cleanContent = String(articleData.content || '').replace(/\\n/g, '\n').trim()
    const lines = cleanContent.split('\n')
    const hasHeadings = lines.some(l => l.trim().startsWith('## ') || l.trim().startsWith('### '))

    if (!hasHeadings) {
      const enhancedLines = lines.map((line, idx) => {
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

    // 5. Save to Supabase if configured
    const supabase = getPublicSupabaseClient()
    if (supabase) {
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', 'Economia')
        .maybeSingle()

      const catId = catData?.id || null
      const postId = `loteria-${modality.caixaKey}-${concurso}-${Date.now()}`

      const postPayload: Record<string, any> = {
        id: postId,
        title: articleData.title,
        seo_title: articleData.seo_title || articleData.title,
        slug: articleData.slug || `resultado-${modality.caixaKey}-${concurso}`,
        meta_description: articleData.meta_description || articleData.excerpt || articleData.title,
        excerpt: articleData.excerpt,
        content: cleanContent,
        author: 'Loterias Tagma',
        published: true,
        tags: articleData.tags || ['loterias', modality.caixaKey]
      }

      if (catId) {
        postPayload.category_id = catId
      }

      let insertResult = await supabase.from('posts').insert(postPayload)
      
      // Fallback se colunas extras não existirem
      if (insertResult.error && (insertResult.error.message.includes('column') || insertResult.error.details?.includes('column'))) {
        const safePayload = {
          id: postId,
          title: articleData.title,
          excerpt: articleData.excerpt,
          content: articleData.content,
          category_id: catId || undefined,
          author: 'Loterias Tagma',
          published: true,
          tags: articleData.tags || ['loterias', modality.caixaKey]
        }
        await supabase.from('posts').insert(safePayload)
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
