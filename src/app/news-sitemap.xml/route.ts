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
          created_at,
          categories (
            name
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        articles = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          excerpt: '',
          content: '',
          image: null,
          author: 'Redação Tagma',
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

  const newsItemsXml = articles
    .map((post) => {
      const postUrl = `${siteUrl}/materia/${post.id}`;
      const pubDate = new Date(post.created_at).toISOString();
      const safeTitle = post.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      return `
  <url>
    <loc>${postUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>Tagma News</news:name>
        <news:language>pt</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${safeTitle}</news:title>
    </news:news>
  </url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${newsItemsXml}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=600, stale-while-revalidate',
    },
  });
}
