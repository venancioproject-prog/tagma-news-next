import { MetadataRoute } from 'next';
import { getPublicSupabaseClient } from '@/lib/supabase/public';
import { MOCK_POSTS } from '@/lib/posts-data';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tagmanews.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    '',
    '/politica',
    '/economia',
    '/internacional',
    '/esportes',
    '/cultura',
    '/tecnologia',
    '/ultimas',
    '/ao-vivo',
    '/videos',
    '/audios',
    '/newsletter',
    '/sobre',
    '/privacidade',
    '/termos',
    '/contato',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: (route === '' || route === '/ultimas' || route === '/ao-vivo') ? ('hourly' as const) : ('daily' as const),
    priority: route === '' ? 1.0 : 0.8,
  }));

  let postsUrls: MetadataRoute.Sitemap = [];

  try {
    const supabase = getPublicSupabaseClient();
    if (supabase) {
      const { data: posts } = await supabase
        .from('posts')
        .select('id, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (posts && posts.length > 0) {
        postsUrls = posts.map((post: any) => ({
          url: `${siteUrl}/materia/${post.id}`,
          lastModified: post.created_at || new Date().toISOString(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));
      }
    }
  } catch {
    // Fallback
  }

  if (postsUrls.length === 0) {
    postsUrls = MOCK_POSTS.map((post) => ({
      url: `${siteUrl}/materia/${post.id}`,
      lastModified: post.created_at,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  }

  return [...routes, ...postsUrls];
}
