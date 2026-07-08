const CACHE = 'votoraty-v8';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/data.js',
  '/auth.js',
  '/professor.js',
  '/diretor.js',
  '/financeiro.js',
  '/atleta.js',
  '/utils.js',
  '/financeiro-desktop.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.2.0/dist/tabler-icons.min.css',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, {mode:'no-cors'})))).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isLocal = url.origin === self.location.origin;

  // Arquivos do app: rede primeiro (sempre pega a versão nova), cache como fallback offline
  if(isLocal){
    e.respondWith(
      fetch(e.request).then(res => {
        if(res && res.status === 200){
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() =>
        caches.match(e.request).then(cached =>
          cached || caches.match('/index.html').then(f => f || new Response('Offline', {status:503, headers:{'Content-Type':'text/plain'}}))
        )
      )
    );
    return;
  }

  // CDNs (fontes, Chart.js, ícones): cache primeiro (não mudam)
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if(res && res.status === 200 && res.type !== 'opaque'){
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(()=> cached || new Response('', {status:503}));
      return cached || network;
    })
  );
});
