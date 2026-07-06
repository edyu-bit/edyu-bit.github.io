const CACHE_NAME = 'roadmap-shell-v1';
const SHELL = ['./roadmap.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // GitHub API等の外部オリジンはキャッシュせず常に最新を取得(残高・警告が古くなるため)
  if (url.origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
