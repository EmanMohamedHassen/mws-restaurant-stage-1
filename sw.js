
const cache = "rest-v1";
self.addEventListener('fetch', function(event) {
  event.respondWith(
      caches.match(event.request).then(function(response) {
        if (response) {
             return response;
           
        }

        return fetch(event.request).then(function(response) {
          var shouldCache = response.ok;

          if (event.request.method == 'POST') {
            shouldCache = false;
          }

        if (shouldCache) {
            return caches.open(cache).then(function(cache) {
              cache.put(event.request, response.clone());
              return response;
               
            });
          } else {
            return response;
          
          }
        });
      })
  );
});
