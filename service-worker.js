/* Service Worker v5
   - Cangkang aplikasi (HTML/ikon) tampil seketika dari cache,
     lalu diperbarui diam-diam di belakang (update terpakai saat dibuka berikutnya).
   - /api (data) TIDAK pernah lewat cache. */

var CACHE = 'belanja-rumah-v5';
var ASET = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-180.png'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASET); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ if (k !== CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;          // foto & lainnya: biarkan browser
  if (url.pathname.indexOf('/api') === 0) return;       // data: selalu dari jaringan

  e.respondWith(
    caches.open(CACHE).then(function(c){
      var kunci = (req.mode === 'navigate') ? './index.html' : req;
      return c.match(kunci).then(function(hit){
        var baru = fetch(req).then(function(r){
          if (r && r.ok) c.put(kunci, r.clone());
          return r;
        }).catch(function(){ return hit; });
        return hit || baru;
      });
    })
  );
});
