// Alertas de pisos nuevos como notificación del móvil (sin WhatsApp ni servidor).
import { asset } from "./asset";
import { ciudadPorSlug, norm } from "./geo";
import { filtersFromParams, search } from "./search";

export interface FiltrosAlerta {
  op: "alquilar" | "comprar"; provincia?: string; ciudad?: string; barrio?: string; tipos?: string[];
  precioMin?: number; precioMax?: number; m2Min?: number; m2Max?: number; habMin?: number; banosMin?: number;
  extras?: string[]; part?: boolean; playa?: number; bbox?: [number, number, number, number];
}
export interface Alerta { id: string; query: string; params: string; canal: "notificacion"; expira: string; visto: string; filtros: FiltrosAlerta }

export const ALERTAS_KEY = "pisoya:alertas";
const DIAS = 10;

// "alquilar?q=...&provincia=..." -> filtros ya interpretados (lo mismo que ve la búsqueda)
export function filtrosDeParams(params: string): FiltrosAlerta {
  const [op, qs = ""] = params.split("?");
  const f = search(filtersFromParams(new URLSearchParams(qs), op)).filtros;
  return {
    op: f.operacion, provincia: f.provincia, ciudad: f.ciudad ? ciudadPorSlug(f.ciudad)?.nombre : undefined,
    barrio: f.barrio ? norm(f.barrio) : undefined, tipos: f.tipos, precioMin: f.precioMin, precioMax: f.precioMax,
    m2Min: f.m2Min, m2Max: f.m2Max, habMin: f.habMin, banosMin: f.banosMin, extras: f.extras,
    part: f.soloParticulares || undefined, playa: f.cercaPlayaKm, bbox: f.bbox,
  };
}

export function nuevaAlerta(query: string, params: string): Alerta {
  return {
    id: Math.random().toString(36).slice(2, 10), query, params, canal: "notificacion",
    expira: new Date(Date.now() + DIAS * 86400000).toISOString(), visto: new Date().toISOString(), filtros: filtrosDeParams(params),
  };
}

export const soportaNotificaciones = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "Notification" in window;

// En iPhone/iPad las notificaciones web solo funcionan con Pisder añadida a la pantalla de inicio
export const esIOSsinInstalar = () =>
  typeof window !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent) &&
  !(window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone);

async function registro() {
  return navigator.serviceWorker.register(asset("/sw.js"), { scope: asset("/") });
}

export function leerAlertas(): Alerta[] {
  try { return (JSON.parse(localStorage.getItem(ALERTAS_KEY) || "[]") as Alerta[]).filter((a) => a && a.canal === "notificacion" && a.filtros); } catch { return []; }
}

// Pasa las alertas al service worker y, si se pide, revisa ya si hay pisos nuevos
export async function sincronizar(comprobar = false) {
  if (!soportaNotificaciones() || Notification.permission !== "granted") return;
  const reg = await registro();
  const sw = reg.active || (await navigator.serviceWorker.ready).active;
  sw?.postMessage({ tipo: "alertas", alertas: leerAlertas(), comprobar });
  const ps = (reg as unknown as { periodicSync?: { register: (t: string, o: { minInterval: number }) => Promise<void> } }).periodicSync;
  if (ps) { try { await ps.register("pisder-alertas", { minInterval: 6 * 3600000 }); } catch { /* el navegador decide */ } }
}

export async function activar(query: string, params: string): Promise<{ ok: boolean; msg: string }> {
  if (esIOSsinInstalar()) return { ok: false, msg: "En iPhone, primero toca Compartir › «Añadir a pantalla de inicio» y abre Pisder desde ese icono." };
  if (!soportaNotificaciones()) return { ok: false, msg: "Este navegador no permite notificaciones. Prueba con Chrome." };
  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") return { ok: false, msg: "Sin permiso de notificaciones no podemos avisarte. Actívalo en los ajustes del navegador." };
  const a = nuevaAlerta(query, params);
  localStorage.setItem(ALERTAS_KEY, JSON.stringify([a, ...leerAlertas()]));
  await sincronizar(false);
  return { ok: true, msg: `Listo. Te avisaremos en este móvil cuando entren pisos nuevos. Caduca el ${new Date(a.expira).toLocaleDateString("es-ES")}; podrás renovarla.` };
}
