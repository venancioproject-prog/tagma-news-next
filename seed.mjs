import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://twufjmziqvxlummzegwe.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_0kyAaayINLouuYkKvXeqhQ_zHK5XLrw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Lendo matérias antigas...');
  const jsonPath = 'c:/Users/leose/Downloads/tagmanews-main/posts.json';
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`Arquivo não encontrado: ${jsonPath}`);
    return;
  }

  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const posts = JSON.parse(rawData);

  console.log(`Encontradas ${posts.length} matérias. Sincronizando categorias...`);

  // Pega categorias existentes no banco
  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  if (catError) {
    console.error('Erro ao ler categorias do Supabase:', catError);
    return;
  }

  // Prepara matérias
  for (const post of posts) {
    let catId = null;
    if (post.category) {
      const match = categories.find(c => c.name.toLowerCase() === post.category.toLowerCase() || 
                                         (c.name === 'Política' && post.category === 'Politica'));
      if (match) {
        catId = match.id;
      }
    }

    const { error: insertError } = await supabase
      .from('posts')
      .upsert({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        image: post.image,
        category_id: catId,
        tags: post.tags || [],
        author: post.author,
        published: true, // publica todas antigas
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error(`Erro ao inserir post ${post.title}:`, insertError.message);
    } else {
      console.log(`✔ Inserido: ${post.title}`);
    }
  }
  
  console.log('Migração de dados concluída!');
}

seed();
