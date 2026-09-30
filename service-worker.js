/* Service Worker — agar aplikasi bisa di-Install & tetap membuka cepat.
   Strategi: cache "cangkang" aplikasi (HTML/manifest/ikon).
   Data belanja TIDAK di-cache — selalu diambil baru dari API. */

var CACHE = 'belanja-rumah-v4';
var ASET = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASET); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;
  // Panggilan ke Apps Script: selalu ambil dari jaringan (jangan cache data)
  if (url.indexOf('script.google.com') !== -1) return;
  // Selain itu (cangkang aplikasi): pakai cache dulu, baru jaringan
  e.respondWith(
    caches.match(e.request).then(function(hit){ return hit || fetch(e.request); })
  );
});
