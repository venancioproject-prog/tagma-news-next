import { NextResponse } from 'next/server'

interface RssItem {
  title: string
  description: string
  link?: string
  source?: string
}

const CATEGORY_FEEDS: Record<string, { url: string; source: string }[]> = {
  'Política': [
    { url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', source: 'Agência Brasil' },
    { url: 'https://g1.globo.com/rss/g1/politica/', source: 'G1 Política' },
    { url: 'https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com+politica+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Reuters' },
    { url: 'https://news.google.com/rss/search?q=when:24h+Politica+Brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Google News Brasil' }
  ],
  'Economia': [
    { url: 'https://agenciabrasil.ebc.com.br/rss/economia/feed.xml', source: 'Agência Brasil' },
    { url: 'https://g1.globo.com/rss/g1/economia/', source: 'G1 Economia' },
    { url: 'https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com+economia+mercado&hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Reuters' },
    { url: 'https://news.google.com/rss/search?q=when:24h+Economia+Negocios+Brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Google News Economia' }
  ],
  'Internacional': [
    { url: 'https://agenciabrasil.ebc.com.br/rss/internacional/feed.xml', source: 'Agência Brasil' },
    { url: 'https://g1.globo.com/rss/g1/mundo/', source: 'G1 Mundo' },
    { url: 'https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com+mundo+internacional&hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Reuters' },
    { url: 'https://news.google.com/rss/search?q=when:24h+Noticias+Internacionais&hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Google News Internacional' }
  ],
  'Esportes': [
    { url: 'https://agenciabrasil.ebc.com.br/rss/esportes/feed.xml', source: 'Agência Brasil' },
    { url: 'https://g1.globo.com/rss/g1/carros/', source: 'G1' },
    { url: 'https://news.google.com/rss/search?q=when:24h+Esportes+Futebol+Brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Google News Esportes' }
  ],
  'Tecnologia': [
    { url: 'https://g1.globo.com/rss/g1/tecnologia/', source: 'G1 Tecnologia' },
    { url: 'https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com+technology&hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Reuters' },
    { url: 'https://news.google.com/rss/search?q=when:24h+Tecnologia+Inovacao+Brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Google News Tech' }
  ],
  'Cultura': [
    { url: 'https://g1.globo.com/rss/g1/pop-arte/', source: 'G1 Pop & Arte' },
    { url: 'https://agenciabrasil.ebc.com.br/rss/geral/feed.xml', source: 'Agência Brasil' },
    { url: 'https://news.google.com/rss/search?q=when:24h+Cultura+Cinema+Musica+Brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Google News Cultura' }
  ],
  'Geral': [
    { url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', source: 'Agência Brasil' },
    { url: 'https://g1.globo.com/rss/g1/', source: 'G1' },
    { url: 'https://news.google.com/rss/search?q=when:24h+Brasil+Noticias&hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Google News' }
  ]
}

function cleanHtml(rawHtml: string): string {
  if (!rawHtml) return ''
  return rawHtml
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseRssFeed(xmlText: string, defaultSource: string): RssItem[] {
  const items: RssItem[] = []
  const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/gi) || []

  for (const itemBlock of itemMatches) {
    const titleMatch = itemBlock.match(/<title>([\s\S]*?)<\/title>/i)
    const descMatch = itemBlock.match(/<description>([\s\S]*?)<\/description>/i)
    const linkMatch = itemBlock.match(/<link>([\s\S]*?)<\/link>/i)

    const rawTitle = titleMatch ? titleMatch[1] : ''
    const rawDesc = descMatch ? descMatch[1] : ''
    const rawLink = linkMatch ? cleanHtml(linkMatch[1]) : ''

    const title = cleanHtml(rawTitle)
    const description = cleanHtml(rawDesc)

    if (title && title.length > 5) {
      items.push({
        title,
        description: description || title,
        link: rawLink,
        source: defaultSource
      })
    }
  }

  return items
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'Geral'
  const feeds = CATEGORY_FEEDS[category] || CATEGORY_FEEDS['Geral']

  const allItems: RssItem[] = []

  for (const feed of feeds) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        signal: controller.signal,
        next: { revalidate: 300 }
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const text = await response.text()
        const parsed = parseRssFeed(text, feed.source)
        allItems.push(...parsed)
      }
    } catch (err) {
      console.warn(`Feed fetch failed for ${feed.url}:`, err)
    }

    if (allItems.length >= 12) break
  }

  // Deduplicate by title
  const uniqueItems: RssItem[] = []
  const seenTitles = new Set<string>()

  for (const item of allItems) {
    const normalized = item.title.toLowerCase().trim()
    if (!seenTitles.has(normalized)) {
      seenTitles.add(normalized)
      uniqueItems.push(item)
    }
  }

  // Take top 6 items
  const result = uniqueItems.slice(0, 6)

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  })
}

