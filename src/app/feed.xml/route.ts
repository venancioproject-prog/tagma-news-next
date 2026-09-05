import { NextResponse } from 'next/server';
import { getPublicSupabaseClient } from '@/lib/supabase/public';
import { MOCK_POSTS, ArticleItem } from '@/lib/posts-data';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tagmanews.vercel.app';

export async function GET() {
  let articles: ArticleItem[] = [];

  try {
    const supabase = getPublicSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          excerpt,
          content,
          image,
          author,
          created_at,
          categories (
            name
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(25);

      if (!error && data && data.length > 0) {
        articles = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt || '',
          content: p.content || '',
          image: p.image || null,
          author: p.author || 'Redação Tagma',
          created_at: p.created_at,
          category_name: p.categories?.name || 'Geral',
        }));
      }
    }
  } catch {
    // Fallback
  }

  if (articles.length === 0) {
    articles = MOCK_POSTS;
  }

  const rssItemsXml = articles
    .map((post) => {
      const postUrl = `${siteUrl}/materia/${post.id}`;
      const pubDate = new Date(post.created_at).toUTCString();
      const safeTitle = post.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeDesc = post.excerpt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${post.category_name}]]></category>
      <author><![CDATA[${post.author}]]></author>
      <description><![CDATA[${post.excerpt}]]></description>
      ${post.image ? `<enclosure url="${post.image}" type="image/jpeg" length="0" />` : ''}
    </item>`;
    })
    .join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tagma News • Portal de Notícias em Tempo Real</title>
    <link>${siteUrl}</link>
    <description>Jornalismo independente, cobertura de política, economia, tecnologia, internacional e resultados de loterias.</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssFeed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=600, stale-while-revalidate',
    },
  });
}
