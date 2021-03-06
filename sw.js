const SW_VERSION = 7;
const CACHE_NAME = `OFFLINE_VERSION_${SW_VERSION}`;
const OFFLINE_URL = "offline.html";

self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] install event");
  //self.skipWaiting();

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
      console.log("Offline page cached");
    })()
  );
});

self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] activate event");
  //self.skipWaiting();

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            caches.delete(cacheName);
          } else {
            return null;
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log("[ServiceWorker] fetch event" + event.request.url);

  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage(
        `Hi ${client.id} you are loading the path ${event.request.url}`
      );
    });
  });

  event.respondWith(
    (async () => {
      try {
        const networkRequest = await fetch(event.request);
        return networkRequest;
      } catch (error) {
        console.log(
          "[ServiceWorker] Fetch failed; returning offline page instead."
        );

        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse;
      }
    })()
  );
  //self.skipWaiting();
});

self.addEventListener('message', event => {
  // console.log(`[Message] event: `, event);
  clients.matchAll().then(clients => {
      clients.forEach(client => {
          client.postMessage({
              joke: event.data.joke,
              value: event.data.value,
              counter: event.data.counter
          });
      })
  })
});

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = 'Dad Jokes';
  const options = {
    body: 'Yay you should check out our new jokes.',
    icon: 'images/icon.png',
    badge: 'images/thumb-up.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});