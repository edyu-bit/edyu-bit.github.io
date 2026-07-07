const CACHE_NAME = 'roadmap-shell-v2';
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
  // HTML(画面本体)はネットワーク優先: 更新が即反映され、オフライン時のみキャッシュで表示
  // (v1のキャッシュ優先は「デプロイしても古い画面が出続ける」事故を起こしたため変更)
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // アイコン等の静的アセットはキャッシュ優先で十分
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
