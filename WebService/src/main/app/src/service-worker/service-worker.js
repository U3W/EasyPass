importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');


/**
 * Service Worker configuration for EasyPass.
 *
 * TODO donwload workbox script and import it locally
 */


// Change routes for specific files
for (let i = 0; i < self.__precacheManifest.length; i++) {
    if (self.__precacheManifest[i].url === "/index.html") {
        self.__precacheManifest[i].url = "/"
    }
    else if (self.__precacheManifest[i].url === "/backendtest.html") {
        self.__precacheManifest[i].url = "/backendtest"
    }
}
// Apply precaches and routes
workbox.precaching.precacheAndRoute(self.__precacheManifest);

// Navigation Routing is required for usage in a single page app
workbox.routing.registerNavigationRoute(
    // Blacklist is needed for testing in development
    workbox.precaching.getCacheKeyForURL('/'), {
        blacklist: [
            new RegExp('/backendtest.html'),
            new RegExp('/database')
        ]
    }
);