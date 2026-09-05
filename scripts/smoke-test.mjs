// Automated Smoke Test for Tagma News Deployment & Public Routes
import http from 'http';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

const ROUTES_TO_TEST = [
  { path: '/', expectedStatus: 200, name: 'Home' },
  { path: '/politica', expectedStatus: 200, name: 'Categoria Política' },
  { path: '/economia', expectedStatus: 200, name: 'Categoria Economia' },
  { path: '/ultimas', expectedStatus: 200, name: 'Últimas Notícias' },
  { path: '/ao-vivo', expectedStatus: 200, name: 'Central Ao Vivo' },
  { path: '/busca?q=brasil', expectedStatus: 200, name: 'Busca de Notícias' },
  { path: '/videos', expectedStatus: 200, name: 'Vídeos' },
  { path: '/audios', expectedStatus: 200, name: 'Áudios' },
  { path: '/newsletter', expectedStatus: 200, name: 'Newsletters' },
  { path: '/sobre', expectedStatus: 200, name: 'Quem Somos' },
  { path: '/contato', expectedStatus: 200, name: 'Contato' },
  { path: '/privacidade', expectedStatus: 200, name: 'Privacidade' },
  { path: '/termos', expectedStatus: 200, name: 'Termos de Uso' },
  { path: '/robots.txt', expectedStatus: 200, name: 'Robots.txt' },
  { path: '/sitemap.xml', expectedStatus: 200, name: 'Sitemap.xml' },
  { path: '/news-sitemap.xml', expectedStatus: 200, name: 'News Sitemap.xml' },
  { path: '/feed.xml', expectedStatus: 200, name: 'RSS 2.0 Feed' },
];

async function runSmokeTests() {
  console.log('--- INICIANDO SMOKE TESTS TAGMA NEWS ---');
  console.log(`Testando contra base: ${BASE_URL}`);

  let failures = 0;

  for (const route of ROUTES_TO_TEST) {
    try {
      const url = `${BASE_URL}${route.path}`;
      const res = await fetch(url, { redirect: 'manual' });

      // Verificação 1: Status Code
      if (res.status === 302 || res.status === 301) {
        const location = res.headers.get('location') || '';
        if (location.includes('vercel.com') || location.includes('login')) {
          console.error(`❌ [FALHA P0] ${route.name} (${route.path}) redirecionou para autenticação Vercel: ${location}`);
          failures++;
          continue;
        }
      }

      if (res.status !== route.expectedStatus) {
        console.error(`❌ [FALHA] ${route.name} (${route.path}) esperava ${route.expectedStatus}, obteve ${res.status}`);
        failures++;
        continue;
      }

      // Verificação 2: Body text e Noindex indevido
      const text = await res.text();
      const xRobots = res.headers.get('x-robots-tag') || '';

      if (xRobots.includes('noindex') && route.path === '/') {
        console.warn(`⚠️ [ALERTA] ${route.name} retornou x-robots-tag: noindex`);
      }

      if (text.includes('Protected Deployment – Vercel') || text.includes('Login – Vercel')) {
        console.error(`❌ [FALHA P0] ${route.name} retornou tela de bloqueio da Vercel`);
        failures++;
        continue;
      }

      console.log(`✅ [OK] ${route.name} (${route.path}) -> HTTP ${res.status}`);
    } catch (err) {
      console.error(`❌ [ERRO DE REDE] ${route.name} (${route.path}):`, err.message);
      failures++;
    }
  }

  console.log('----------------------------------------');
  if (failures === 0) {
    console.log('🎉 TODOS OS SMOKE TESTS PASSARAM COM SUCESSO!');
    process.exit(0);
  } else {
    console.error(`💥 ${failures} SMOKE TESTS FALHARAM.`);
    process.exit(1);
  }
}

runSmokeTests();
