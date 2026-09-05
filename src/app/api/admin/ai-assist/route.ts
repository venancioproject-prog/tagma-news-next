import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export async function POST(request: Request) {
  try {
    const { action, title, content, excerpt, category } = await request.json();

    if (!GROQ_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Chave GROQ_API_KEY não configurada no ambiente.',
      }, { status: 500 });
    }

    let prompt = '';
    const systemRole = 'Você é o Assistente Editorial Sênior do Tagma News, um portal hard news rigoroso, factual e focado em SEO técnico. Retorne SEMPRE JSON estritamente válido em português do Brasil, sem formatação markdown em torno do JSON.';

    if (action === 'suggest_titles') {
      prompt = `Com base no texto e tema a seguir, gere 3 opções de títulos/manchetes jornalísticas de alto impacto para o leitor e para o Google News.
Tema/Título Atual: ${title || ''}
Trecho do Conteúdo: ${(content || '').substring(0, 1000)}
Editoria: ${category || 'Geral'}

Regras:
1. Sem travessões ou clichês de IA.
2. Seja objetivo, direto e use a palavra-chave no início.
3. Máximo de 65 caracteres por título.

Retorne JSON no formato:
{
  "suggestions": [
    "Título Opção 1",
    "Título Opção 2",
    "Título Opção 3"
  ]
}`;
    } else if (action === 'generate_excerpt') {
      prompt = `Com base no título e texto a seguir, gere um lide/linha fina conciso e factual de 1 a 2 frases para a capa e para o Google.
Título: ${title || ''}
Conteúdo: ${(content || '').substring(0, 1000)}

Retorne JSON no formato:
{
  "excerpt": "Texto da linha fina objetiva sem clichês"
}`;
    } else if (action === 'generate_seo') {
      prompt = `Gere os metadados técnicos de SEO perfeitos para a matéria a seguir.
Título: ${title || ''}
Linha Fina: ${excerpt || ''}
Conteúdo: ${(content || '').substring(0, 1000)}

Regras:
- seo_title: Máximo 60 caracteres, focado na intenção de busca.
- slug: url amigável com hífens, sem acentos e minúsculo.
- meta_description: Entre 130 e 150 caracteres, atrativa e informativa para o snippet de busca.

Retorne JSON no formato:
{
  "seo_title": "Título SEO Google",
  "slug": "slug-amigavel-da-materia",
  "meta_description": "Meta description concisa e objetiva de 130 a 150 caracteres."
}`;
    } else if (action === 'suggest_subheadings') {
      prompt = `Analise o conteúdo abaixo e sugira 3 subtítulos (##) e melhorias de escaneabilidade para estruturar a matéria.
Título: ${title || ''}
Conteúdo: ${(content || '').substring(0, 1500)}

Retorne JSON no formato:
{
  "subheadings": [
    "## Primeiro Subtítulo Factual",
    "## Segundo Subtítulo de Impacto",
    "## Desdobramentos e Próximos Passos"
  ],
  "tips": "Dica de escaneabilidade para a redação"
}`;
    } else if (action === 'editorial_audit') {
      prompt = `Faça uma auditoria crítica e rigorosa do texto jornalístico abaixo para garantir qualidade Hard News.
Título: ${title || ''}
Linha Fina: ${excerpt || ''}
Conteúdo: ${(content || '').substring(0, 2000)}

Avalie:
1. Responde o Lide (Quem, O quê, Quando, Onde, Por quê)?
2. As fontes ou documentos estão citados?
3. O tom é factual e sem adjetivos vazios?
4. Quais perguntas importantes ainda ficaram sem resposta para o leitor?

Retorne JSON no formato:
{
  "score": 85,
  "lead_check": "Avaliação do lide",
  "sources_check": "Avaliação das fontes citadas",
  "unanswered_questions": [
    "Pergunta 1 que o leitor pode ter",
    "Pergunta 2 que precisa de apuração adicional"
  ],
  "recommendations": "Recomendação final para o editor antes de publicar"
}`;
    } else if (action === 'suggest_tags') {
      prompt = `Gere 5 tags e entidades semânticas relevantes para indexação desta matéria.
Título: ${title || ''}
Conteúdo: ${(content || '').substring(0, 800)}

Retorne JSON no formato:
{
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;
    } else {
      return NextResponse.json({ success: false, error: 'Ação de IA desconhecida.' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        temperature: 0.3,
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemRole },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    clearTimeout(timeoutId);

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      return NextResponse.json({ success: false, error: `Erro na Groq API: ${errText}` }, { status: 500 });
    }

    const groqData = await groqResponse.json();
    const text = groqData.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(text);

    return NextResponse.json({
      success: true,
      action,
      data: parsed,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao processar assistência editorial da IA.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
