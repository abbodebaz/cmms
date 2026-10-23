/* eslint-disable no-restricted-globals */
/*
 * Minimal hand-written service worker.
 * - Navigations: network-first, offline fallback to the cached /index.html.
 * - /static/ assets: cache-first (CRA emits content-hashed js/css/media).
 * - /api/ requests, non-GET requests and cross-origin requests are never
 *   intercepted or cached.
 * Bump CACHE_VERSION to invalidate every cache on the next activation.
 */
const CACHE_VERSION = 'v1';
const CACHE_PREFIX = 'cmms-';
const SHELL_CACHE = `${CACHE_PREFIX}shell-${CACHE_VERSION}`;
const STATIC_CACHE = `${CACHE_PREFIX}static-${CACHE_VERSION}`;
const OFFLINE_URL = '/index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: 'reload' })))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith(CACHE_PREFIX) &&
                key !== SHELL_CACHE &&
                key !== STATIC_CACHE
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

const isCacheable = (response) =>
  response && response.status === 200 && response.type === 'basic';

const networkFirstNavigation = async (request) => {
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      const copy = response.clone();
      caches
        .open(SHELL_CACHE)
        .then((cache) => cache.put(OFFLINE_URL, copy))
        .catch(() => undefined);
    }
    return response;
  } catch (err) {
    const cached = await caches.match(OFFLINE_URL, { cacheName: SHELL_CACHE });
    if (cached) return cached;
    throw err;
  }
};

const cacheFirst = async (request) => {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (isCacheable(response)) {
    cache.put(request, response.clone()).catch(() => undefined);
  }
  return response;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname === '/api') return;
  if (url.pathname === '/sw.js') return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (url.pathname.startsWith('/static/')) {
    event.respondWith(cacheFirst(request));
  }
  // Everything else (runtime-env.js, manifest.json, ...) goes to the network.
});
