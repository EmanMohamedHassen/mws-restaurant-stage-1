/**
 * Common database helper functions.
 */





//window.addEventListener('load', (event) => {
//    app.get('/sw.js', (req, res) => {
//        res.sendFile(path.resolve(__dirname, '..', 'build', 'sw.js'));
//        });
//        if ('serviceWorker' in navigator) {
//      navigator.serviceWorker.register('/sw.js')
//      .then(function(registration) {
//        console.log('Registration successful, scope is:', registration.scope);
//      })
//      .catch(function(error) {
//        console.log('Service worker registration failed, error:', error);
//      });
//    }
//});             

window.addEventListener('load', (event) => {
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function (reg) {
            // registration worked
            console.log('Registration succeeded. Scope is ' + reg.scope);
        }).catch(function (error) {
            // registration failed
            console.log('Registration failed with ' + error);
        });
    }
}); 

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337
    return `http://localhost:${port}/restaurants`;
  }


    static get Reviews_Database() {
        const port = 1337
        return  `http://localhost:${port}/reviews`;
    }
  /**
   * Fetch all restaurants.
   */
    static fetchRestaurants(callback) {
      fetch(DBHelper.DATABASE_URL, {
          method: 'GET'
      }).then(response => response.json().then(function (restaurants) {
          callback(null, restaurants);

          var request = indexedDB.open('RestaurantDB', 1);
          //request.onerror = function (event) {
          //    alert("Database error: " + event.target.errorCode);
          //};
          request.onupgradeneeded = function (event) {
              var db = event.target.result;
              var objectStore = db.createObjectStore("restaurants", { keyPath: "id" });
              objectStore.transaction.oncomplete = function (event) {
                  var restaurantObjectStore = db.transaction("restaurants", "readwrite").objectStore("restaurants");
                  restaurants.forEach(function (restaurant) {
                      restaurantObjectStore.add(restaurant);
                  });
              };
          };


     }));
  }



  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
    }



    static addReview(review) {
        debugger;
        const offlineReview = {
            name: 'addReview',
            data: review,
            object_type: 'review'
        }
        if (!navigator.onLine) {
            DBHelper.sendOnline(offlineReview);
            return Promise.reject(offlineReview);
        }
        return DBHelper.sendReview(review)
    }

    static sendReview(review) {
        debugger;
        const Review = {
            "name": review.name,
            "rating": review.rating,
            "comments": review.comments,
            "restaurant_id": review.restaurant_id
        }
        const Options = {
            method: 'POST',
            body: JSON.stringify(Review),
        };

        return fetch(`${DBHelper.Reviews_Database}`, Options)
    }

    static sendOnline(offReview) {
        debugger;
        localStorage.setItem('reviews', JSON.stringify(offReview.data));
        window.addEventListener('online', (event) => {
            const review = JSON.parse(localStorage.getItem('reviews'));
            let offlineReviewUI = document.querySelectorAll('.offline');
            offlineReviewUI.forEach(elem => {
                elem.classList.remove("offline");
                elem.removeChild(document.getElementById('offlineLbl'));
            });
            if (review) {
                DBHelper.addReview(review);
            }
            localStorage.removeItem('reviews');
        })
    }




    static fetchRestuarantReviews(id) {
        return fetch(`${DBHelper.Reviews_Database}/?restaurant_id=${id}`)
            .then(res => res.json()).then(reviews => {
                var request = indexedDB.open('ReviewsDB', 1);
                request.onerror = function (event) {
                    alert("Database error: " + event.target.errorCode);
                };
                request.onupgradeneeded = function (event) {
                    var db = event.target.result;
                    var objectStore = db.createObjectStore("reviews", { keyPath: "id" });
                    objectStore.transaction.oncomplete = function (event) {
                        var reviewObjectStore = db.transaction("reviews", "readwrite").objectStore("reviews");
                        reviews.forEach(function (review) {
                            reviewObjectStore.add(review);
                        });
                    };
                };
                return reviews;
            })
    }


    static changeStatus(restaurantId, status) {
       // debugger;
        fetch(`${DBHelper.DATABASE_URL}/${restaurantId}/?is_favorite=${status}`, {
            method: 'PUT'
        }).then(() => {
          //  debugger;
            var request = indexedDB.open('RestaurantDB', 1);
            //request.onerror = function (event) {
            //    alert("Database error: " + event.target.errorCode);
            //};
            request.onupgradeneeded = function (e) {
                debugger;
                var db = e.target.result;
               // console.log(e);
               // var objectStore = db.createObjectStore("restaurants", { keyPath: "id" });
              //  objectStore.onsuccess = function (event) {
                   // var idb = event.target.result;
                    var restaurantObjectStore = db.transaction("restaurants", "readwrite").objectStore("restaurants");
                    const dbGetRequest = restaurantObjectStore.get(restaurantId);
                   // console.log(dbGetRequest);
                    dbGetRequest.onsuccess = event => {
                        const restaurant = event.target.result;
                        console.log(restaurant);
                        restaurant.is_favorite = status;
                        restaurantObjectStore.put(restaurant);
                    }
               // };
            };
           
        })
    }
}
