const CACHE_NAME = "voltshorts-xp-v2";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./questions.json",
  "./manifest.json",
  "https://cdn.tailwindcss.com",
  "https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.11.2/math.js",
  "https://cdn.jsdelivr.net/npm/nerdamer@1.1.13/nerdamer.core.js",
  "https://cdn.jsdelivr.net/npm/nerdamer@1.1.13/Algebra.js",
  "https://cdn.jsdelivr.net/npm/nerdamer@1.1.13/Calculus.js",
  "https://cdn.jsdelivr.net/npm/nerdamer@1.1.13/Solve.js"
];

// 1. Install & Cache Core Engine + Math Libraries
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// 2. Activate & Remove Old Caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

// 3. Fetch Strategy: Network-First for questions.json, Cache-First for App Assets
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("questions.json")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
