import { NextResponse } from 'next/server';
import { getPublicSupabaseClient } from '@/lib/supabase/public';
import { MOCK_POSTS } from '@/lib/posts-data';

export async function GET() {
  try {
    const supabase = getPublicSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt, image, category_name, created_at')
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        return NextResponse.json({
          success: true,
          posts: data,
          source: 'supabase',
        });
      }
    }

    const formattedMockPosts = MOCK_POSTS.map((p) => ({
      id: p.id,
      title: p.title,
      slug: (p as { slug?: string }).slug || p.id,
      excerpt: p.excerpt,
      image: p.image,
      category_name: p.category_name,
      created_at: p.created_at,
    }));

    return NextResponse.json({
      success: true,
      posts: formattedMockPosts,
      source: 'mock',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar posts';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do post é obrigatório' }, { status: 400 });
    }

    if (id.startsWith('mock-')) {
      return NextResponse.json({
        success: true,
        message: 'Post de demonstração removido da visualização.',
        deletedId: id,
      });
    }

    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase não inicializado para exclusão permanente.',
      }, { status: 500 });
    }

    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Matéria excluída com sucesso.',
      deletedId: id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao excluir post';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
