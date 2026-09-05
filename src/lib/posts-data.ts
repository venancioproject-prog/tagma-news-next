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
    content: '## Panorama Macroeconômico e Decisões Monetárias\n\nO Comitê de Política Monetária do Banco Central divulgou nota técnica destacando a consolidação das metas fiscais e o comportamento favorável dos principais núcleos de inflação ao consumidor.\n\nSegundo analistas do mercado financeiro, a redução gradual nas projeções do IPCA para os próximos doze meses abre espaço operacional para novos estímulos ao crédito produtivo e ao financiamento de infraestrutura.\n\n## Impacto no Setor Produtivo\n\nRepresentantes da indústria e do comércio varejista comemoraram o sinal de alívio nas taxas futuras de juros. A expectativa é de expansão nos investimentos em bens de capital e maior liquidez para pequenas e médias empresas.\n\nEspecialistas alertam, contudo, que a manutenção do equilíbrio fiscal continua sendo o pilar indispensável para sustentar a valorização cambial e a atratividade do país frente ao capital estrangeiro.\n\nFonte: Agência de Notícias Financeiras',
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
    content: '## Diretrizes Éticas e Governança Digital\n\nO plenário da Câmara dos Deputados avançou na discussão do projeto de lei que institui o marco civil e regulatório da Inteligência Artificial no Brasil. A proposta define salvaguardas contra discriminação algorítmica e estabelece critérios de responsabilidade civil para desenvolvedores.\n\n## Equilíbrio entre Inovação e Proteção\n\nO relator do texto enfatizou a importância de criar um ambiente jurídico seguro que estimule investimentos em tecnologia sem comprometer os direitos fundamentais e a privacidade dos cidadãos.\n\nO projeto segue agora para as comissões temáticas antes da votação final em regime de urgência.\n\nFonte: Agência Brasil / Congresso Nacional',
    image: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?q=80&w=800&auto=format&fit=crop',
    author: 'Equipe de Política',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    category_name: 'Política',
    tags: ['política', 'tecnologia']
  },
  {
    id: 'mock-3',
    title: 'Mega-Sena sorteia prêmio acumulado estimado em R$ 48 milhões neste concurso',
    excerpt: 'Apostas podem ser feitas até as 19h em casas lotéricas ou pelo canal eletrônico da Caixa Econômica Federal.',
    content: '## Expectativa para o Concurso Oficial\n\nO concurso especial da Mega-Sena promete movimentar casas lotéricas em todo o território nacional. Sem ganhadores na faixa principal no último sorteio, o prêmio acumulou e atinge uma das maiores marcas do trimestre.\n\n## Como Participar e Regras de Premiação\n\nOs jogos podem ser registrados presencialmente ou por meio do aplicativo de loterias da Caixa até as 19h (horário de Brasília). Para levar o prêmio máximo, o apostador deve acertar as seis dezenas sorteadas no Espaço da Sorte em São Paulo.\n\nFonte: Caixa Econômica Federal',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=800&auto=format&fit=crop',
    author: 'Loterias Tagma',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    category_name: 'Economia',
    tags: ['loterias', 'sorteio']
  },
  {
    id: 'mock-4',
    title: 'Cúpula Internacional debate transição energética e financiamento para descarbonização',
    excerpt: 'Líderes de mais de 40 nações se reúnem para acelerar metas climáticas e debater investimentos em hidrogênio verde.',
    content: '## Diálogo Multilateral e Metas Globais\n\nRepresentantes diplomáticos e ministros do meio ambiente reuniram-se em sessão plenária para pactuar novos mecanismos de financiamento destinados a países em desenvolvimento.\n\nO foco central dos debates recai sobre a expansão da matriz solar, eólica e as cadeias de produção de hidrogênio de baixo carbono.\n\nFonte: Reuters Internacional',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    author: 'Correspondente Internacional',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    category_name: 'Internacional',
    tags: ['internacional', 'clima', 'energia']
  },
  {
    id: 'mock-5',
    title: 'Nova geração de semicondutores promete revolucionar processamento de IA em dispositivos locais',
    excerpt: 'Arquitetura inovadora reduz consumo energético em 60% e possibilita execução de modelos de ponta em smartphones e notebooks.',
    content: '## Salto Tecnológico em Eficiência\n\nFabricantes de circuitos integrados apresentaram uma nova litografia voltada para processamento neural de alto desempenho com eficiência energética sem precedentes.\n\nA tecnologia permite que operações de inferência em linguagem natural sejam processadas diretamente no hardware sem depender de conectividade contínua com a nuvem.\n\nFonte: Tagma Tech News',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
    author: 'Redação Tecnologia',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    category_name: 'Tecnologia',
    tags: ['tecnologia', 'ia', 'chips']
  },
  {
    id: 'mock-6',
    title: 'Final do Campeonato Nacional bate recorde de audiência nas transmissões digitais',
    excerpt: 'Partida decisiva movimentou milhões de torcedores com cobertura imersiva em múltiplas plataformas.',
    content: '## Espetáculo Esportivo e Engajamento\n\nA grande final da temporada consagrou o campeão em um confronto equilibrado até os acréscimos. A transmissão digital multiplataforma quebrou recordes históricos de espectadores simultâneos.\n\nClubes e federações ressaltaram o avanço tecnológico na distribuição de sinal e nas análises táticas em tempo real para os fãs do esporte.\n\nFonte: Agência de Esportes',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
    author: 'Redação Esportes',
    created_at: new Date(Date.now() - 18000000).toISOString(),
    category_name: 'Esportes',
    tags: ['esportes', 'futebol']
  },
  {
    id: 'mock-7',
    title: 'Bienal de Arte e Cultura abre temporada com mostras imersivas e homenagens a artistas brasileiros',
    excerpt: 'Exposição reúne mais de 300 obras com foco em preservação da memória e integração entre arte tradicional e digital.',
    content: '## Celebração Artística e Diálogo Cultural\n\nA abertura da nova edição da Bienal movimentou a cena cultural com pavilhões dedicados a instalações sensoriais e homenagens a grandes nomes das artes plásticas nacionais.\n\nA programação inclui oficinas abertas ao público, debates com curadores internacionais e apresentações musicais gratuitas durante todo o mês.\n\nFonte: Redação Cultural Tagma',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800&auto=format&fit=crop',
    author: 'Redação Cultura',
    created_at: new Date(Date.now() - 21600000).toISOString(),
    category_name: 'Cultura',
    tags: ['cultura', 'arte', 'bienal']
  }
];
