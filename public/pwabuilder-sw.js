importScripts("/dist/js/cache-polyfill.js");
const CACHE_NAME = "artific";

//Install stage sets up the offline page in the cache and opens a new cache
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll([
        "offline.html",
        "dist/img/logo_weiss.png",
        "static/src/bg.jpg",
        "static/css/style.css"
      ]);
    })
  );
});

//If any fetch fails, it will show the offline page.
//Maybe this should be limited to HTML documents?
self.addEventListener("fetch", function(event) {
  event.respondWith(
    fetch(event.request).catch(function(error) {
      return caches
        .open(CACHE_NAME)
        .then(function(cache) {
          if (/.*\.(png|jpg|css|js)$/.test(event.requets.url)) {
            return cache.match(event.request);
          } else {
            return cache.match("offline.html");
          }
        })
        .catch(function() {
          // If both fail, show a generic fallback:
          return cache.match("offline.html");
        });
    })
  );
});

//This is a event that can be fired from your page to tell the SW to update the offline page
self.addEventListener("refreshOffline", function(response) {
  return caches.open("pwabuilder-offline").then(function(cache) {
    console.log(
      "[PWA Builder] Offline page updated from refreshOffline event: " +
        response.url
    );
    return cache.put(offlinePage, response);
  });
});
