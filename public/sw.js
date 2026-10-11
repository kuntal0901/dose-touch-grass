// Minimal offline support so DOSE keeps working on the trail with no signal.
// - Built assets (/_next/static) are immutable → cache-first.
// - Pages → network-first, falling back to the cached copy.
// The Gemma model weights are cached separately by WebLLM (Cache API).

const CACHE = "dose-shell-v1";
const PAGES = ["/", "/challenges", "/timer", "/complete", "/journal"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PAGES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return res;
          }),
      ),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(url.pathname, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(url.pathname)
            .then((hit) => hit || caches.match("/"))
            .then((hit) => hit || Response.error()),
        ),
    );
  }
});
