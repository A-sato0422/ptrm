const CACHE_NAME = "ptrm-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/assets/icon-192.png",
  "/assets/icon-512.png",
  "/assets/yama01.png",
  "/assets/yama02.png",
  "/assets/yama03.png",
  "/assets/yama04.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Supabase API はキャッシュしない
  if (event.request.url.includes("supabase.co")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached ?? fetch(event.request);
    }),
  );
});
