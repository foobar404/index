"use strict";

const CACHE_NAME = "index-shell-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./public/favicon.png",
  "./public/logo.png",
  "./public/pwa-icon.svg"
];
const INDEX_URL = new URL("./index.html", self.registration.scope).href;

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter((name) => name.startsWith("index-shell-") && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);
  if (request.method !== "GET" || requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      let response;
      try {
        response = await fetch(request);
      } catch (error) {
        const cachedPage = await caches.match(INDEX_URL);
        if (cachedPage) {
          return cachedPage;
        }
        throw error;
      }

      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(INDEX_URL, response.clone());
      }
      return response;
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    let response;
    try {
      response = await fetch(request);
    } catch (error) {
      const cachedResponse = await cache.match(request, { ignoreSearch: true });
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }

    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
