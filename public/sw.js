// Service worker de Pisder: alertas de pisos nuevos como notificación del móvil.
importScripts("alertas-match.js");

const DB = "pisder", STORE = "kv";
function idb() {
  return new Promise((ok, ko) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error);
  });
}
async function leer(k) { const db = await idb(); return new Promise((ok) => { const q = db.transaction(STORE).objectStore(STORE).get(k); q.onsuccess = () => ok(q.result); q.onerror = () => ok(undefined); }); }
async function escribir(k, v) { const db = await idb(); return new Promise((ok) => { const t = db.transaction(STORE, "readwrite"); t.objectStore(STORE).put(v, k); t.oncomplete = () => ok(); t.onerror = () => ok(); }); }

const base = () => self.registration.scope;
const eur = (n) => n.toLocaleString("es-ES") + " €";

async function comprobar() {
  const alertas = (await leer("alertas")) || [];
  const vivas = alertas.filter((a) => Date.parse(a.expira) > Date.now());
  if (!vivas.length) return 0;
  let res;
  try { res = await fetch(new URL("alertas-index.json", base()), { cache: "no-store" }); } catch (e) { return 0; }
  if (!res.ok) return 0;
  const { items } = await res.json();
  let avisos = 0;
  for (const a of vivas) {
    const n = self.pisderAlertas.nuevos(items, a);
    if (!n.length) continue;
    const p = n[0];
    const url = n.length === 1 ? new URL("inmueble/" + p.id + "/", base()).href : new URL("buscar/" + a.params, base()).href;
    await self.registration.showNotification(n.length === 1 ? "Piso nuevo para «" + a.query + "»" : n.length + " pisos nuevos para «" + a.query + "»", {
      body: p.titulo + " · " + eur(p.precio) + (p.op === "alquilar" ? "/mes" : "") + (p.barrioNombre ? " · " + p.barrioNombre : ""),
      icon: new URL("icon-192.png", base()).href, badge: new URL("badge-96.png", base()).href,
      tag: "alerta-" + a.id, renotify: true, data: { url },
    });
    a.visto = n[0].pub; avisos++;
  }
  if (avisos) {
    const porId = Object.fromEntries(vivas.map((a) => [a.id, a]));
    await escribir("alertas", alertas.map((a) => porId[a.id] || a));
  }
  return avisos;
}

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("periodicsync", (e) => { if (e.tag === "pisder-alertas") e.waitUntil(comprobar()); });
self.addEventListener("message", (e) => {
  const d = e.data || {};
  if (d.tipo === "alertas") e.waitUntil(escribir("alertas", d.alertas).then(() => d.comprobar && comprobar()));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || base();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    for (const c of cs) if ("focus" in c) { c.navigate(url); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
