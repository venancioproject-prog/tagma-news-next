import { NextResponse } from 'next/server';

interface TrendingTopic {
  id: string;
  topic: string;
  category: string;
  editorial_angle: string;
  keywords: string[];
  urgency: 'ALTA' | 'MÉDIA' | 'URGENTE';
}

const FALLBACK_TOPICS: TrendingTopic[] = [
  {
    id: 'trend-1',
    topic: 'Decisão do Copom sobre a taxa Selic e impactos no crédito imobiliário',
    category: 'Economia',
    editorial_angle: 'Impacto direto no bolso do consumidor e parcelas de financiamento bancário.',
    keywords: ['Copom', 'Selic', 'Banco Central', 'Crédito Imobiliário', 'Juros'],
    urgency: 'ALTA',
  },
  {
    id: 'trend-2',
    topic: 'Votação do projeto de transição energética e regulação de crédito de carbono no Congresso',
    category: 'Política',
    editorial_angle: 'Disputa entre bancadas e metas sustentáveis do Brasil para a COP.',
    keywords: ['Congresso', 'Transição Energética', 'Crédito de Carbono', 'Câmara', 'Senado'],
    urgency: 'MÉDIA',
  },
  {
    id: 'trend-3',
    topic: 'Avanços e nova regulação da Inteligência Artificial em serviços públicos no Brasil',
    category: 'Tecnologia',
    editorial_angle: 'Privacidade de dados cidadãos e automação de serviços essenciais.',
    keywords: ['Inteligência Artificial', 'LGPD', 'Governo Digital', 'Inovação'],
    urgency: 'ALTA',
  },
  {
    id: 'trend-4',
    topic: 'Flutuação do preço dos combustíveis e nova política de paridade internacional',
    category: 'Economia',
    editorial_angle: 'Reflexo nas bombas e na inflação dos alimentos transportados por rodovias.',
    keywords: ['Petrobras', 'Combustíveis', 'Gasolina', 'Diesel', 'Inflação'],
    urgency: 'URGENTE',
  },
  {
    id: 'trend-5',
    topic: 'Cúpula internacional do G20 e acordos bilaterais de comércio exterior',
    category: 'Internacional',
    editorial_angle: 'Posicionamento diplomático brasileiro e atração de investimentos produtivos.',
    keywords: ['G20', 'Diplomacia', 'Comércio Exterior', 'Exportações'],
    urgency: 'MÉDIA',
  },
];

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      success: true,
      topics: FALLBACK_TOPICS,
      source: 'fallback_no_api_key',
    });
  }

  try {
    const prompt = 'Você é o Editor Executivo de Pautas do Tagma News, portal hard news brasileiro de alta relevância.\n' +
      'Gere uma lista de 5 sugestões de pautas quentes e urgentes para o dia de hoje no Brasil, cobrindo Economia, Política, Tecnologia e Internacional.\n\n' +
      'Retorne APENAS um array JSON puro (sem markdown, sem blocos de codigo) contendo 5 objetos com a estrutura:\n' +
      '[\n' +
      '  {\n' +
      '    "id": "trend-1",\n' +
      '    "topic": "Manchete objetiva e atrativa da pauta",\n' +
      '    "category": "Economia | Política | Tecnologia | Internacional | Geral",\n' +
      '    "editorial_angle": "Resumo em 1 frase do ângulo jornalístico investigativo a ser abordado",\n' +
      '    "keywords": ["tag1", "tag2", "tag3"],\n' +
      '    "urgency": "ALTA"\n' +
      '  }\n' +
      ']';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        temperature: 0.7,
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: 'Você é um editor de pautas experiente. Retorne apenas JSON estritamente válido em português do Brasil.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    clearTimeout(timeoutId);

    if (!groqResponse.ok) {
      return NextResponse.json({
        success: true,
        topics: FALLBACK_TOPICS,
        source: 'fallback_groq_api_error',
      });
    }

    const data = await groqResponse.json();
    let text = data.choices?.[0]?.message?.content || '';

    text = text.replace(/^```json/m, '').replace(/^```/m, '').replace(/```$/m, '').trim();

    try {
      const parsedTopics: TrendingTopic[] = JSON.parse(text);
      if (Array.isArray(parsedTopics) && parsedTopics.length > 0) {
        return NextResponse.json({
          success: true,
          topics: parsedTopics.map((t, idx) => ({
            ...t,
            id: t.id || `trend-${Date.now()}-${idx}`,
          })),
          source: 'groq_ai',
        });
      }
    } catch {
      // Fallback if json parsing failed
    }

    return NextResponse.json({
      success: true,
      topics: FALLBACK_TOPICS,
      source: 'fallback_parse_error',
    });
  } catch {
    return NextResponse.json({
      success: true,
      topics: FALLBACK_TOPICS,
      source: 'fallback_exception',
    });
  }
}
