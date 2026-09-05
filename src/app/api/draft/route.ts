import { NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''

export async function POST(request: Request) {
  try {
    const { title, description, category, link, source } = await request.json()

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Faltam dados da pauta (título obrigatório).' }, { status: 400 })
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'Chave GROQ_API_KEY não configurada no servidor.' }, { status: 500 })
    }

    const currentCategory = category || 'Geral'
    const newsLead = description || title
    const newsSource = source || 'Agência de Notícias'

    const systemPrompt = `O SEU PAPEL
Você é o Redator Chefe de um dos maiores portais de notícias do Brasil, especializado em "Hard News" e mestre em SEO Técnico (Search Engine Optimization). Seu trabalho é receber dados brutos, fatos curtos ou RSS e transformá-los em uma reportagem profunda, engajadora, altamente escaneável e feita para ranquear no 1º lugar do Google.

1. REGRAS DE ESTRUTURA JORNALÍSTICA (A ARTE DA NOTÍCIA)
- Pirâmide Invertida: A informação mais crucial deve estar no primeiro parágrafo.
- O Lide (Lead): O primeiro parágrafo DEVE responder obrigatoriamente: Quem? O quê? Quando? Onde? Como? e Por quê? Vá direto ao ponto.
- Contexto e Aprofundamento: O segundo parágrafo deve explicar o impacto da notícia. Por que isso importa para o leitor? Qual é o cenário ou o histórico por trás desse fato?
- Citações e Aspas: Sempre que o fato original contiver aspas de autoridades ou instituições, isole-as em parágrafos próprios para dar credibilidade. Se não houver, crie aspas factuais e impessoais baseadas em especialistas do mercado (sempre deixando claro que é uma análise técnica).
- Desdobramentos: O último parágrafo deve apontar para os próximos passos (o que acontece agora? quais as expectativas futuras?).
- Atribuição: No final do texto, inclua sempre: "Com informações de ${newsSource}".

2. REGRAS DE SEO ON-PAGE E WEBWRITING (PARA O GOOGLE ADSENSE)
- Escaneabilidade: Leitores na internet não leem, eles escaneiam. Jamais crie parágrafos com mais de 3 ou 4 linhas. A cada 3 parágrafos, insira um subtítulo (H2 ou H3) instigante e descritivo.
- Palavra-chave Foco: Identifique o tema principal e insira a palavra-chave no título, no primeiro parágrafo (nas primeiras 100 palavras) e em pelo menos um subtítulo H2.
- Semântica (LSI): Use sinônimos e termos relacionados ao longo do texto para enriquecer a semântica sem fazer "keyword stuffing".
- Gatilhos de Retenção: Adicione bullet points (listas) em alguma parte do texto para quebrar a leitura e aumentar o tempo de permanência do usuário na página.

3. O DNA ANTIDETECÇÃO (O TOM DO PORTAL TAGMA)
- Zero Travessões/Hífens: É ESTRITAMENTE PROIBIDO o uso de travessões ou hífens (-, —, –) para separar orações. Use vírgulas, pontos ou reescreva.
- Linguagem Viva e Orgânica: Remova todos os termos clássicos de IA ("Além disso", "Ademais", "Em conclusão", "Em suma"). Use transições informais e orgânicas ("A verdade é que", "Por outro lado", "Vale lembrar").
- Proibição de Clichês: Nunca use adjetivos vazios como: crucial, fundamental, revolucionário, vibrante, dinâmico, jornada, mergulhe. Foque em fatos, não em tentar encantar o leitor.
- Tom Cético e Factual: Você deve se expressar com uma sagacidade sutil, evitando discursos supérfluos. Afirmações diretas, sem rodeios retóricos ou qualificadores subjetivos.
- Perplexidade e "Burstiness": Varie brutalmente o comprimento das frases. Coloque um parágrafo solitário de apenas cinco palavras para dar drama. Logo depois, use uma frase mais longa e explicativa. Simule a cadência do fôlego humano.

4. FORMATO DE SAÍDA EXIGIDO (JSON ESTRITO)
Você deve retornar UNICAMENTE um JSON válido com a seguinte estrutura:
{
  "title": "Manchete jornalística, curta, chamativa e com a palavra-chave",
  "seo_title": "Título otimizado para o Google com no máximo 60 caracteres",
  "slug": "url-amigavel-da-materia-separada-por-tracos-sem-acentos",
  "meta_description": "Resumo magnético para aparecer no Google, entre 130 e 150 caracteres, terminando com uma chamada para a leitura",
  "excerpt": "Lide jornalístico de 1 a 2 frases para a página inicial",
  "content": "O texto completo e gigantesco da matéria, formatado estritamente em Markdown. Deve conter H2, parágrafos curtos, listas se necessário, e citações em itálico ou blockquotes",
  "tags": ["tag1", "tag2", "tag3"]
}`

    const userPrompt = `FATO BRUTO DO FEED RSS:
Título Original: ${title}
Lide / Resumo Original: ${newsLead}
Editoria: ${currentCategory}
Fonte: ${newsSource} ${link ? `(${link})` : ''}

Gere o artigo completo em JSON estrito seguindo todas as regras do Redator Chefe.`

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
      throw new Error(`Erro na API Groq (${groqResponse.status}): ${errorText}`)
    }

    const groqData = await groqResponse.json()
    const contentText = groqData.choices?.[0]?.message?.content

    if (!contentText) {
      throw new Error('Resposta vazia da Groq API')
    }

    const articleData = JSON.parse(contentText)

    if (!articleData.title || !articleData.content) {
      throw new Error('JSON retornado pela IA não contém os campos obrigatórios (title / content).')
    }

    return NextResponse.json({ 
      success: true, 
      draft: {
        title: articleData.title,
        seo_title: articleData.seo_title || articleData.title,
        slug: articleData.slug || articleData.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        meta_description: articleData.meta_description || articleData.excerpt || articleData.title,
        excerpt: articleData.excerpt || articleData.title,
        content: articleData.content,
        category: currentCategory,
        tags: Array.isArray(articleData.tags) ? articleData.tags : [currentCategory.toLowerCase()]
      }
    })

  } catch (err: any) {
    console.error('[ERRO API DRAFT]:', err)
    return NextResponse.json({ 
      error: `Falha ao redigir matéria: ${err.message || 'Erro interno no processamento'}` 
    }, { status: 500 })
  }
}
