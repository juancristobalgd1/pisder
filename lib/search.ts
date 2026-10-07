import { allListings } from "./data";
import { parseQuery } from "./nlparse";
import { ciudadPorSlug, norm } from "./geo";
import { slugProvincia } from "./provincias";
import type { Listing, SearchFilters, SearchResult } from "./types";

export function filtersFromParams(sp: URLSearchParams | Record<string, string | string[] | undefined>, operacion?: string): SearchFilters {
  const get = (k: string) => (sp instanceof URLSearchParams ? sp.get(k) ?? undefined : (Array.isArray(sp[k]) ? (sp[k] as string[])[0] : (sp[k] as string | undefined)));
  const n = (k: string) => { const v = get(k); return v ? Number(v) : undefined; };
  const list = (k: string) => get(k)?.split(",").filter(Boolean);
  const bbox = list("bbox")?.map(Number);
  return {
    q: get("q") ?? "",
    operacion: (operacion ?? get("op") ?? "alquilar") === "comprar" ? "comprar" : "alquilar",
    provincia: get("provincia"), ciudad: get("ciudad"), barrio: get("barrio"),
    tipos: list("tipo") as SearchFilters["tipos"],
    precioMin: n("pmin"), precioMax: n("pmax"), m2Min: n("m2min"), m2Max: n("m2max"),
    habMin: n("hab"), banosMin: n("banos"), extras: list("extras"),
    soloParticulares: get("part") === "1",
    cercaPlayaKm: n("playa"),
    orden: (get("orden") as SearchFilters["orden"]) ?? undefined,
    bbox: bbox && bbox.length === 4 ? (bbox as [number, number, number, number]) : undefined,
    page: n("page") ?? 1, perPage: n("pp") ?? 24,
  };
}

export function filtersToParams(f: Partial<SearchFilters>): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.provincia) p.set("provincia", f.provincia);
  if (f.ciudad) p.set("ciudad", f.ciudad);
  if (f.barrio) p.set("barrio", f.barrio);
  if (f.tipos?.length) p.set("tipo", f.tipos.join(","));
  if (f.precioMin) p.set("pmin", String(f.precioMin));
  if (f.precioMax) p.set("pmax", String(f.precioMax));
  if (f.m2Min) p.set("m2min", String(f.m2Min));
  if (f.habMin) p.set("hab", String(f.habMin));
  if (f.banosMin) p.set("banos", String(f.banosMin));
  if (f.extras?.length) p.set("extras", f.extras.join(","));
  if (f.soloParticulares) p.set("part", "1");
  if (f.cercaPlayaKm) p.set("playa", String(f.cercaPlayaKm));
  if (f.orden && f.orden !== "recientes") p.set("orden", f.orden);
  return p.toString();
}

function score(l: Listing, f: SearchFilters, terms: string[]) {
  let s = 0;
  const hay = norm(`${l.titulo} ${l.descripcion} ${l.barrio} ${l.ciudad} ${l.extras.join(" ")}`);
  for (const t of terms) if (t.length > 3 && hay.includes(t)) s += 1;
  if (f.extras) s += f.extras.filter((e) => l.extras.includes(e)).length * 2;
  s += Math.max(0, 30 - (Date.now() - Date.parse(l.publicadoEn)) / 86400000) / 30;
  if (l.anunciante.verificado) s += 0.3;
  return s;
}

export function search(input: SearchFilters): SearchResult {
  let f = { ...input };
  let chips: string[] = [];
  if (f.q && f.q.trim()) {
    const parsed = parseQuery(f.q, { operacion: f.operacion });
    // los filtros explícitos de la UI mandan sobre lo interpretado
    const explicit = Object.fromEntries(Object.entries(input).filter(([k, v]) => v !== undefined && v !== "" && k !== "q" && !(Array.isArray(v) && !v.length)));
    f = { ...parsed.filtros, ...explicit, q: f.q };
    chips = parsed.chips;
  }
  // Si la búsqueda nombra un pueblo o ciudad de otra provincia, manda el sitio concreto
  if (f.ciudad && f.provincia && slugProvincia(ciudadPorSlug(f.ciudad)?.provincia) !== f.provincia) f = { ...f, provincia: undefined };
  const terms = norm(f.q ?? "").split(/\s+/);
  let items = allListings().filter((l) => {
    if (l.operacion !== f.operacion) return false;
    if (f.provincia && slugProvincia(l.provincia) !== f.provincia) return false;
    if (f.ciudad && ciudadPorSlug(f.ciudad)?.nombre !== l.ciudad) return false;
    if (f.barrio && norm(f.barrio) !== norm(l.barrio)) return false;
    if (f.tipos?.length && !f.tipos.includes(l.tipo)) return false;
    if (f.precioMin && l.precio < f.precioMin) return false;
    if (f.precioMax && l.precio > f.precioMax) return false;
    if (f.m2Min && l.m2 < f.m2Min) return false;
    if (f.m2Max && l.m2 > f.m2Max) return false;
    if (f.habMin && l.habitaciones < f.habMin) return false;
    if (f.banosMin && l.banos < f.banosMin) return false;
    if (f.extras?.length && !f.extras.every((e) => l.extras.includes(e))) return false;
    if (f.soloParticulares && l.anunciante.tipo !== "particular") return false;
    if (f.cercaPlayaKm && (l.distPlaya === undefined || l.distPlaya > f.cercaPlayaKm)) return false;
    if (f.bbox) { const [s, w, n, e] = f.bbox; if (l.lat < s || l.lat > n || l.lng < w || l.lng > e) return false; }
    return true;
  });
  const orden = f.orden ?? "recientes";
  const by: Record<string, (a: Listing, b: Listing) => number> = {
    recientes: (a, b) => Date.parse(b.publicadoEn) - Date.parse(a.publicadoEn),
    precio_asc: (a, b) => a.precio - b.precio,
    precio_desc: (a, b) => b.precio - a.precio,
    m2_desc: (a, b) => b.m2 - a.m2,
    precio_m2: (a, b) => a.precio / a.m2 - b.precio / b.m2,
    relevancia: (a, b) => score(b, f, terms) - score(a, f, terms),
  };
  items = items.sort(by[orden] ?? by.recientes);
  const perPage = f.perPage ?? 24;
  const page = Math.max(1, f.page ?? 1);
  const total = items.length;
  return { total, items: items.slice((page - 1) * perPage, page * perPage), filtros: f, interpretacion: chips, page, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export function latestIn(ciudad?: string, barrio?: string, n = 8) {
  return search({ operacion: "alquilar", ciudad, barrio, perPage: n, orden: "recientes" }).items;
}

// Nº de anuncios por provincia (para el selector)
export function conteoProvincias(op: SearchFilters["operacion"]) {
  const m: Record<string, number> = {};
  for (const l of allListings()) if (l.operacion === op) { const k = slugProvincia(l.provincia); if (k) m[k] = (m[k] ?? 0) + 1; }
  return m;
}
