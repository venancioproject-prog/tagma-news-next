import { NextResponse } from 'next/server';

interface RSSItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  description: string;
}

const RSS_FEEDS = [
  { source: 'G1 Brasil', category: 'Geral', url: 'https://g1.globo.com/rss/g1/' },
  { source: 'G1 Política', category: 'Política', url: 'https://g1.globo.com/rss/g1/politica/' },
  { source: 'G1 Economia', category: 'Economia', url: 'https://g1.globo.com/rss/g1/economia/' },
  { source: 'G1 Tecnologia', category: 'Tecnologia', url: 'https://g1.globo.com/rss/g1/tecnologia/' },
  { source: 'Agência Brasil', category: 'Geral', url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml' },
  { source: 'Google News Brasil', category: 'Geral', url: 'https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419' },
];

function cleanXmlText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function parseFeedXml(xml: string, source: string, defaultCategory: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const itemXml of itemMatches.slice(0, 10)) {
    const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i) || itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i);
    const categoryMatch = itemXml.match(/<category>([\s\S]*?)<\/category>/i);

    const title = cleanXmlText(titleMatch ? titleMatch[1] : '');
    const link = (linkMatch ? linkMatch[1] : '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
    const pubDate = pubDateMatch ? cleanXmlText(pubDateMatch[1]) : new Date().toISOString();
    const description = cleanXmlText(descMatch ? descMatch[1] : '');
    const category = categoryMatch ? cleanXmlText(categoryMatch[1]) : defaultCategory;

    if (title && title.length > 10) {
      items.push({
        id: `${source}-${Buffer.from(title).toString('base64').substring(0, 16)}`,
        title,
        link: link || '#',
        pubDate,
        source,
        category,
        description: description.substring(0, 200),
      });
    }
  }

  return items;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filterCategory = searchParams.get('category');

  try {
    const feedsToFetch = filterCategory
      ? RSS_FEEDS.filter((f) => f.category.toLowerCase() === filterCategory.toLowerCase() || f.category === 'Geral')
      : RSS_FEEDS;

    const fetchPromises = feedsToFetch.map(async (feed) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(feed.url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TagmaNewsBot/1.0',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          },
          next: { revalidate: 300 },
        });

        clearTimeout(timeoutId);

        if (!res.ok) return [];
        const xml = await res.text();
        return parseFeedXml(xml, feed.source, feed.category);
      } catch {
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    const allItems = results.flat();

    const uniqueItems: RSSItem[] = [];
    const seenTitles = new Set<string>();

    for (const item of allItems) {
      const normalized = item.title.toLowerCase().substring(0, 30);
      if (!seenTitles.has(normalized)) {
        seenTitles.add(normalized);
        uniqueItems.push(item);
      }
    }

    uniqueItems.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime() || 0;
      const dateB = new Date(b.pubDate).getTime() || 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      count: uniqueItems.length,
      items: uniqueItems.slice(0, 25),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao processar RSS';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
