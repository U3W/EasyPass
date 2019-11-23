importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);
} else {
    console.log(`Boo! Workbox didn't load 😬`);
}

console.log(self.__precacheManifest);

for (let i = 0; i < self.__precacheManifest.length; i++) {
    if (self.__precacheManifest[i].url === "/index.html") {
        self.__precacheManifest[i].url = "/"
    }
    else if (self.__precacheManifest[i].url === "/backendtest.html") {
        self.__precacheManifest[i].url = "/bachendtest"
    }
}

console.log(self.__precacheManifest);

workbox.precaching.precacheAndRoute(self.__precacheManifest);
