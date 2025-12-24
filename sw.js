const CACHE_NAME = "maison-tai-jitsu-v1";

// Pages & assets essentiels
const CORE_ASSETS = [
  "/maison/",
  "/maison/index.html",
  "/maison/offline.html",
  "/maison/manifest.json"
];

// Installation
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

// Activation
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

// Fetch = offline first
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request)
          .then(fetchResponse => {
            // Cache auto des vidéos + images + pages
            if (
              event.request.url.includes("/maison/videos/") ||
              event.request.destination === "image" ||
              event.request.destination === "document"
            ) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, fetchResponse.clone());
              });
            }
            return fetchResponse;
          })
          .catch(() => caches.match("/maison/offline.html"))
      );
    })
  );
});
