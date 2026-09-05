export interface ArticleItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string | null;
  author: string;
  created_at: string;
  category_name: string;
  tags?: string[];
}

export const MOCK_POSTS: ArticleItem[] = [
  {
    id: 'mock-1',
    title: 'Banco Central projeta estabilidade fiscal e sinaliza novo ritmo para taxa de juros',
    excerpt: 'Relatório de mercado aponta desaceleração de índices inflacionários e reforça confiança de investidores em títulos públicos de longo prazo.',
    content: '## Panorama Macroeconômico e Decisões Monetárias\n\nO Comitê de Política Monetária do Banco Central divulgou nota técnica destacando a consolidação das metas fiscais e o comportamento favorável dos principais núcleos de inflação ao consumidor.\n\nSegundo analistas do mercado financeiro, a redução gradual nas projeções do IPCA para os próximos doze meses abre espaço operacional para novos estímulos ao crédito produtivo e ao financiamento de infraestrutura.\n\nFonte: Agência de Notícias Financeiras',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1400&auto=format&fit=crop',
    author: 'Redação Economia',
    created_at: new Date().toISOString(),
    category_name: 'Economia',
    tags: ['capa', 'mercado', 'economia']
  },
  {
    id: 'mock-2',
    title: 'Congresso avança na votação do marco regulatório da Inteligência Artificial',
    excerpt: 'Texto de consenso estabelece diretrizes éticas para grandes modelos e cria regras de transparência para o setor corporativo.',
    content: '## Diretrizes Éticas e Governança Digital\n\nO plenário da Câmara dos Deputados avançou na discussão do projeto de lei que institui o marco civil e regulatório da Inteligência Artificial no Brasil. A proposta define salvaguardas contra discriminação algorítmica e estabelece critérios de responsabilidade civil para desenvolvedores.\n\nFonte: Agência Brasil / Congresso Nacional',
    image: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?q=80&w=800&auto=format&fit=crop',
    author: 'Equipe de Política',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    category_name: 'Política',
    tags: ['política', 'tecnologia']
  },
  {
    id: 'mock-3',
    title: 'Mercado de capitais registra entrada recorde de investidores estrangeiros no país',
    excerpt: 'Fluxo cambial positivo e estabilização de commodities impulsionam negociações na bolsa de valores brasileira.',
    content: '## Liquidez e Atração de Capital Externo\n\nO volume de investimentos externos direcionados a ativos de renda variável e fundos de infraestrutura atingiu o maior patamar do semestre, impulsionado pela atratividade de títulos soberanos.\n\nFonte: B3 & Economia Global',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop',
    author: 'Equipe de Finanças',
    created_at: new Date(Date.now() - 5400000).toISOString(),
    category_name: 'Economia',
    tags: ['economia', 'investimentos']
  },
  {
    id: 'mock-4',
    title: 'Nova geração de semicondutores promete revolucionar processamento de IA em dispositivos locais',
    excerpt: 'Arquitetura inovadora reduz consumo energético em 60% e possibilita execução de modelos de ponta em smartphones.',
    content: '## Salto Tecnológico em Eficiência\n\nFabricantes de circuitos integrados apresentaram litografia voltada para processamento neural de alto desempenho com eficiência energética sem precedentes.\n\nFonte: Tagma Tech News',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
    author: 'Redação Tecnologia',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    category_name: 'Tecnologia',
    tags: ['tecnologia', 'hardware']
  },
  {
    id: 'mock-5',
    title: 'Governo anuncia pacote de R$ 30 bilhões para modernização de rodovias e ferrovias',
    excerpt: 'Plano integrado de logística prevê concessões à iniciativa privada e obras prioritárias de escoamento agrícola.',
    content: '## Infraestrutura e Logística Nacional\n\nO Ministério dos Transportes apresentou o novo cronograma de leilões e concessões que visa ampliar a malha ferroviária e duplicar eixos rodoviários estratégicos.\n\nFonte: Ministério dos Transportes',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
    author: 'Correspondente Brasília',
    created_at: new Date(Date.now() - 9000000).toISOString(),
    category_name: 'Política',
    tags: ['política', 'infraestrutura']
  },
  {
    id: 'mock-6',
    title: 'Cúpula Internacional debate transição energética e financiamento para descarbonização',
    excerpt: 'Líderes de mais de 40 nações se reúnem para acelerar metas climáticas e debater investimentos em hidrogênio verde.',
    content: '## Diálogo Multilateral e Metas Globais\n\nRepresentantes diplomáticos e ministros do meio ambiente reuniram-se em sessão plenária para pactuar novos mecanismos de financiamento.\n\nFonte: Reuters Internacional',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    author: 'Correspondente Internacional',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    category_name: 'Internacional',
    tags: ['internacional', 'clima']
  },
  {
    id: 'mock-7',
    title: 'Final do Campeonato Nacional bate recorde histórico de audiência nas transmissões digitais',
    excerpt: 'Partida decisiva movimentou milhões de torcedores com cobertura imersiva e estatísticas em tempo real.',
    content: '## Espetáculo Esportivo e Engajamento\n\nA grande final consagrou o campeão em um confronto equilibrado até os acréscimos, estabelecendo novo marco para o streaming esportivo.\n\nFonte: Agência de Esportes',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
    author: 'Redação Esportes',
    created_at: new Date(Date.now() - 12600000).toISOString(),
    category_name: 'Esportes',
    tags: ['esportes', 'futebol']
  },
  {
    id: 'mock-8',
    title: 'Bienal de Arte e Cultura abre temporada com mostras imersivas e homenagens a mestres brasileiros',
    excerpt: 'Exposição reúne mais de 300 obras com foco em preservação da memória e integração entre arte física e novas mídias.',
    content: '## Celebração Artística e Diálogo Cultural\n\nA nova edição da Bienal movimentou a cena cultural com pavilhões dedicados a instalações sensoriais e curadorias internacionais.\n\nFonte: Redação Cultural Tagma',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800&auto=format&fit=crop',
    author: 'Redação Cultura',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    category_name: 'Cultura',
    tags: ['cultura', 'arte']
  },
  {
    id: 'mock-9',
    title: 'Safra de grãos atinge produtividade recorde impulsionada por biotecnologia e clima favorável',
    excerpt: 'Colheita supera projeções iniciais e fortalece balança comercial com exportações de soja e milho.',
    content: '## Desempenho do Agronegócio Brasileiro\n\nO setor agrícola confirmou novo recorde de produção por hectare graças ao uso intensivo de bioinsumos e monitoramento por satélite das lavouras.\n\nFonte: Conab / Notícias Agrícolas',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop',
    author: 'Redação Agro & Economia',
    created_at: new Date(Date.now() - 16200000).toISOString(),
    category_name: 'Economia',
    tags: ['economia', 'agro']
  },
  {
    id: 'mock-10',
    title: 'STF encerra julgamento e fixa tese sobre proteção de dados e responsabilidade em plataformas',
    excerpt: 'Decisão unânime define balizas jurídicas para moderação de conteúdo e direito de resposta digital.',
    content: '## Jurisprudência e Direitos Fundamentais\n\nOs ministros da Suprema Corte concluíram a análise de recursos com repercussão geral, estabelecendo diretrizes para a aplicação do Marco Civil da Internet.\n\nFonte: Supremo Tribunal Federal',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop',
    author: 'Equipe de Política',
    created_at: new Date(Date.now() - 18000000).toISOString(),
    category_name: 'Política',
    tags: ['política', 'justiça']
  },
  {
    id: 'mock-11',
    title: 'Startup brasileira capta US$ 50 milhões para expandir soluções de cibersegurança quântica',
    excerpt: 'Rodada liderada por fundos globais visa acelerar desenvolvimento de criptografia pós-quântica na América Latina.',
    content: '## Inovação e Segurança Digital\n\nA rodada de investimento aportará recursos em pesquisa e desenvolvimento de algoritmos resistentes a ataques de computação quântica.\n\nFonte: Venture Capital Brasil',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop',
    author: 'Redação Tecnologia',
    created_at: new Date(Date.now() - 19800000).toISOString(),
    category_name: 'Tecnologia',
    tags: ['tecnologia', 'startups']
  },
  {
    id: 'mock-12',
    title: 'Festival Internacional de Cinema premia produções latino-americanas com recorde de público',
    excerpt: 'Mostra exibiu mais de 80 longas-metragens e premiou documentários que abordam sustentabilidade e direitos humanos.',
    content: '## Reconhecimento Audiovisual\n\nO festival celebrou a cinematografia independente com sessões lotadas e debates entre diretores consagrados e novos talentos.\n\nFonte: Cinema & Arte',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
    author: 'Redação Cultura',
    created_at: new Date(Date.now() - 21600000).toISOString(),
    category_name: 'Cultura',
    tags: ['cultura', 'cinema']
  },
  {
    id: 'mock-13',
    title: 'Comitê Olímpico detalha preparação de atletas e infraestrutura para próximos Jogos',
    excerpt: 'Delegação brasileira intensifica ciclo de treinamentos e adota tecnologia de ponta para prevenção de lesões.',
    content: '## Preparação de Alto Rendimento\n\nAtletas de diversas modalidades olímpicas contam com suporte multidisciplinar e centros de treinamento equipados com inteligência biomecânica.\n\nFonte: Comitê Olímpico',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop',
    author: 'Redação Esportes',
    created_at: new Date(Date.now() - 23400000).toISOString(),
    category_name: 'Esportes',
    tags: ['esportes', 'olimpiadas']
  },
  {
    id: 'mock-14',
    title: 'Inflação nos Estados Unidos recua e reforça expectativas de corte nas taxas de juros do Fed',
    excerpt: 'Índice de preços ao consumidor desacelera pelo terceiro mês consecutivo e anima mercados globais.',
    content: '## Cenário Econômico Global\n\nOs novos dados de inflação divulgados pelo Departamento de Trabalho norte-americano apontam arrefecimento nos custos de serviços e energia.\n\nFonte: Federal Reserve / Wall Street News',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800&auto=format&fit=crop',
    author: 'Correspondente Internacional',
    created_at: new Date(Date.now() - 25200000).toISOString(),
    category_name: 'Internacional',
    tags: ['internacional', 'economia']
  },
  {
    id: 'mock-15',
    title: 'Robótica cirúrgica e IA reduzem tempo de internação em hospitais de excelência',
    excerpt: 'Procedimentos minimamente invasivos auxiliados por braços robóticos aumentam precisão médica em 40%.',
    content: '## Saúde Digital e Avanço Médico\n\nHospitais de referência têm adotado sistemas robóticos integrados a modelos de visão computacional para cirurgias de alta complexidade.\n\nFonte: Medicina & Saúde Tagma',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop',
    author: 'Redação Ciência & Saúde',
    created_at: new Date(Date.now() - 27000000).toISOString(),
    category_name: 'Tecnologia',
    tags: ['tecnologia', 'saude']
  },
  {
    id: 'mock-16',
    title: 'Reforma Tributária entra em nova fase de regulamentação com foco no setor de serviços',
    excerpt: 'Grupos técnicos do Ministério da Fazenda concluem minutas de leis complementares para transição tributária.',
    content: '## Sistema Tributário Nacional\n\nA equipe econômica reuniu lideranças setoriais para detalhar o modelo de creditamento e a não-cumulatividade do novo imposto sobre valor agregado.\n\nFonte: Ministério da Fazenda',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop',
    author: 'Equipe de Política',
    created_at: new Date(Date.now() - 28800000).toISOString(),
    category_name: 'Política',
    tags: ['política', 'reforma']
  }
];
