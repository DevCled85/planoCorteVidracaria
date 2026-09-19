/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "9959d10c8d775e0f2ed7b7444dfc8476"
  }, {
    "url": "pwa-512x512.png",
    "revision": "ff290cf6fb15966a3363043991562461"
  }, {
    "url": "pwa-192x192.png",
    "revision": "ae7f452ad0da58e9a6e6d3658605462e"
  }, {
    "url": "index.html",
    "revision": "01e38e49eb17e18a4a4a6d261a6cce5e"
  }, {
    "url": "icon.svg",
    "revision": "736660a03fa9442f8a0398508b8e849d"
  }, {
    "url": "favicon.ico",
    "revision": "fc21f8e8c68e93ad46614c2d09ea6933"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "8bbc4d3a301d30eb5eefddfd93c15f7e"
  }, {
    "url": "assets/index-CRsMEH_s.css",
    "revision": null
  }, {
    "url": "assets/index-CPfBa8KC.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "8bbc4d3a301d30eb5eefddfd93c15f7e"
  }, {
    "url": "favicon.ico",
    "revision": "fc21f8e8c68e93ad46614c2d09ea6933"
  }, {
    "url": "icon.svg",
    "revision": "736660a03fa9442f8a0398508b8e849d"
  }, {
    "url": "pwa-192x192.png",
    "revision": "ae7f452ad0da58e9a6e6d3658605462e"
  }, {
    "url": "pwa-512x512.png",
    "revision": "ff290cf6fb15966a3363043991562461"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "9959d10c8d775e0f2ed7b7444dfc8476"
  }, {
    "url": "manifest.webmanifest",
    "revision": "7317a854f1ca61051fa64444941ae832"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
