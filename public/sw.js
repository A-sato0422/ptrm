// デプロイのたびにバージョンを上げることで古いキャッシュを確実に破棄する
const CACHE_NAME = "ptrm-v2";
const STATIC_ASSETS = [
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

  // HTML（ナビゲーションリクエスト）はネットワークファースト
  // → 常に最新の index.html を取得し、新しい JS バンドルを正しく参照させる
  // → オフライン時のみキャッシュにフォールバック
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request)),
    );
    return;
  }

  // 画像等の静的アセットはキャッシュファースト
  event.respondWith(
    caches.match(event.request).then((cached) => cached ?? fetch(event.request)),
  );
});
