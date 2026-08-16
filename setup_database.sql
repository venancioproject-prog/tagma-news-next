-- 1. Cria a tabela de Categorias
CREATE TABLE categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Cria a tabela de Posts
CREATE TABLE posts (
  id text PRIMARY KEY,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  image text,
  category_id uuid REFERENCES categories(id),
  tags text[] DEFAULT '{}'::text[],
  author text DEFAULT 'Redação',
  published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Inserir Categorias Padrão
INSERT INTO categories (name) VALUES 
('Política'), 
('Economia'), 
('Internacional'), 
('Esportes'), 
('Cultura'), 
('Tecnologia'), 
('Geral');

-- 4. Criar Políticas de Segurança (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Permite que qualquer um (anônimo) leia as matérias publicadas
CREATE POLICY "Public profiles are viewable by everyone." 
ON posts FOR SELECT USING (published = true);

CREATE POLICY "Categories are viewable by everyone." 
ON categories FOR SELECT USING (true);
