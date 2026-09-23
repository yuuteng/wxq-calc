const VERSION = "v3";
const STATIC = `wxq-static-${VERSION}`;
const IMG = `wxq-img-${VERSION}`;
const DATA = `wxq-data-${VERSION}`;
const DATA_HOSTS = ["game.gtimg.cn/images/amside/ide_timer/", "vasd-cms.qq.com/cms/"];

self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith("wxq-") && ![STATIC, IMG, DATA].includes(k)).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});

const isData = url => DATA_HOSTS.some(h => url.href.includes(h)) || url.pathname.endsWith(".json");
const isFont = url => /\.(ttf|otf|woff2?)$/i.test(url.pathname);
const isImage = (url, req) => req.destination === "image" || /\.(png|jpe?g|gif|webp|svg)$/i.test(url.pathname);

async function cacheFirst(req, name){
  const cache = await caches.open(name);
  const hit = await cache.match(req, {ignoreVary: true});
  if (hit) return hit;
  const res = await fetch(req);
  if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
  return res;
}
async function networkFirst(req, name, timeoutMs){
  const cache = await caches.open(name);
  try{
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeoutMs);
    const res = await fetch(req, {signal: ctl.signal, cache: "no-cache"});
    clearTimeout(t);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }catch(e){
    const hit = await cache.match(req, {ignoreSearch: true, ignoreVary: true});
    if (hit) return hit;
    throw e;
  }
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (isData(url)) { e.respondWith(networkFirst(req, DATA, 8000)); return; }
  if (isFont(url) || isImage(url, req)) { e.respondWith(cacheFirst(req, IMG)); return; }
  if (url.origin === self.location.origin) { e.respondWith(networkFirst(req, STATIC, 6000)); return; }
});
