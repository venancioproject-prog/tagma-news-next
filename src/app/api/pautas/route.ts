import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GROQ_API_KEY = process.env.GROQ_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'Geral'

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente que retorna APENAS JSON. Crie 3 sugestões de pautas.'
          },
          {
            role: 'user',
            content: `Gere 3 pautas quentes sobre ${category}. Formato: [{"title": "...", "description": "..."}]`
          }
        ],
        temperature: 0.7
      })
    })

    const data = await response.json()
    const content = data.choices[0].message.content
    
    let pautas = []
    try {
      const parsed = JSON.parse(content)
      pautas = Array.isArray(parsed) ? parsed : (parsed.pautas || [])
    } catch {
      pautas = []
    }

    return NextResponse.json(pautas)
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao gerar pautas' }, { status: 500 })
  }
}
