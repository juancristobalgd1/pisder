import { CIUDADES, norm } from "./geo";
import type { SearchFilters, Tipo, Operacion } from "./types";

// Intérprete de búsqueda en lenguaje natural (español de España).
// Determinista y sin coste. Si existe LLM_API_URL, /api/search puede enriquecerlo (ver lib/llm.ts).
const TIPO_WORDS: [RegExp, Tipo][] = [
  [/\b(atico|aticos)\b/, "atico"], [/\b(estudio|estudios|loft)\b/, "estudio"], [/\b(duplex)\b/, "duplex"],
  [/\b(chalet|chalets|adosado|pareado|unifamiliar)\b/, "chalet"], [/\b(casa|casas|caserio|villa)\b/, "casa"],
  [/\b(local|locales|bajo comercial)\b/, "local"], [/\b(garaje|garajes|parking|plaza de garaje)\b/, "garaje"],
  [/\b(terreno|terrenos|solar|parcela)\b/, "terreno"], [/\b(habitacion|habitaciones en piso compartido|piso compartido|compartir)\b/, "habitacion"],
  [/\b(oficina|oficinas|despacho)\b/, "oficina"], [/\b(piso|pisos|apartamento|apartamentos|vivienda|viviendas)\b/, "piso"],
];
const EXTRA_WORDS: [RegExp, string][] = [
  [/terraza/, "terraza"], [/ascensor/, "ascensor"], [/(garaje|parking|plaza de aparcamiento)/, "garaje"], [/piscina/, "piscina"],
  [/(mascota|perro|gato|pet ?friendly)/, "mascotas"], [/(amueblado|con muebles)/, "amueblado"], [/(aire acondicionado|\baire\b|climatizado)/, "aire"],
  [/exterior/, "exterior"], [/trastero/, "trastero"], [/calefaccion/, "calefaccion"], [/balcon/, "balcon"], [/jardin/, "jardin"],
];

function num(raw: string): number {
  let s = raw.replace(/\s/g, "").replace(/€|eur(os)?/g, "");
  let mult = 1;
  if (/(k|mil)$/.test(s)) { mult = 1000; s = s.replace(/(k|mil)$/, ""); }
  else if (/(m|millon|millones)$/.test(s)) { mult = 1_000_000; s = s.replace(/(m|millon|millones)$/, ""); }
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  s = s.replace(",", ".");
  return Math.round(parseFloat(s) * mult);
}
const NUM = "(\\d[\\d.,]*\\s*(?:k|mil|m|millon(?:es)?)?)";

export function parseQuery(q: string, base: Partial<SearchFilters> = {}): { filtros: SearchFilters; chips: string[] } {
  const t = norm(q);
  const f: SearchFilters = { operacion: (base.operacion ?? "alquilar") as Operacion, ...base, q };
  const chips: string[] = [];

  if (/\b(comprar|compra|venta|en venta|vender)\b/.test(t)) f.operacion = "comprar";
  if (/\b(alquilar|alquiler|alquilo|renta|arrendar)\b/.test(t)) f.operacion = "alquilar";

  const tipos = new Set<Tipo>();
  for (const [re, tipo] of TIPO_WORDS) if (re.test(t)) tipos.add(tipo);
  // "3 habitaciones" no implica tipo habitación
  if (tipos.has("habitacion") && /\d+\s*habitaciones/.test(t) && !/compartid|compartir/.test(t)) tipos.delete("habitacion");
  if (tipos.size) { f.tipos = [...tipos]; chips.push(...[...tipos].map((x) => x)); }

  let m = t.match(/(\d+)\s*(habitaciones|habitacion|hab|dormitorios|dormitorio|dorm|cuartos)\b/);
  if (m) { f.habMin = +m[1]; chips.push(`${m[1]}+ hab`); }
  else if (/\b(una|un) (habitacion|dormitorio)\b/.test(t)) { f.habMin = 1; chips.push("1+ hab"); }
  else if (/\bdos (habitaciones|dormitorios)\b/.test(t)) { f.habMin = 2; chips.push("2+ hab"); }
  else if (/\btres (habitaciones|dormitorios)\b/.test(t)) { f.habMin = 3; chips.push("3+ hab"); }
  m = t.match(/(\d+)\s*(banos|bano)\b/); if (m) { f.banosMin = +m[1]; chips.push(`${m[1]}+ baños`); }

  m = t.match(new RegExp(`(?:hasta|maximo|max|menos de|por debajo de|no mas de|<)\\s*${NUM}`));
  if (m) { f.precioMax = num(m[1]); chips.push(`≤ ${f.precioMax.toLocaleString("es-ES")} €`); }
  m = t.match(new RegExp(`(?:desde|minimo|min|mas de|a partir de|>)\\s*${NUM}\\s*(?!m2|metros)`));
  if (m && !/metros|m2/.test(t.slice(t.indexOf(m[0]), t.indexOf(m[0]) + m[0].length + 8))) { f.precioMin = num(m[1]); chips.push(`≥ ${f.precioMin.toLocaleString("es-ES")} €`); }
  m = t.match(new RegExp(`entre\\s*${NUM}\\s*y\\s*${NUM}\\s*(€|euros|eur)?`));
  if (m && !/m2|metros/.test(m[0])) { f.precioMin = num(m[1]); f.precioMax = num(m[2]); chips.push(`${f.precioMin.toLocaleString("es-ES")}–${f.precioMax.toLocaleString("es-ES")} €`); }
  if (!f.precioMax) { m = t.match(new RegExp(`${NUM}\\s*(€|euros|eur)`)); if (m) { f.precioMax = num(m[1]); chips.push(`≤ ${f.precioMax.toLocaleString("es-ES")} €`); } }

  m = t.match(/(?:mas de|minimo|al menos|desde)?\s*(\d+)\s*(m2|m²|metros)/);
  if (m) { f.m2Min = +m[1]; chips.push(`${m[1]}+ m²`); }

  const extras = EXTRA_WORDS.filter(([re]) => re.test(t)).map(([, e]) => e);
  if (extras.includes("garaje") && f.tipos?.includes("garaje")) extras.splice(extras.indexOf("garaje"), 1);
  if (extras.length) { f.extras = extras; chips.push(...extras); }

  if (/(particular|dueno directo|sin agencia|sin comision)/.test(t)) { f.soloParticulares = true; chips.push("particular"); }
  if (/(barato|economico|low cost)/.test(t)) f.orden = "precio_asc";

  // Ubicación: barrio > ciudad (primero el texto más largo)
  outer: for (const c of CIUDADES) {
    for (const bb of [...c.barrios].sort((a, z) => z.nombre.length - a.nombre.length)) {
      const nb = norm(bb.nombre);
      if (nb.length > 4 && new RegExp(`\\b${nb}\\b`).test(t) && !["centro", "casco antiguo", "eixample"].includes(nb)) { f.ciudad = c.slug; f.barrio = bb.nombre; chips.unshift(`${bb.nombre}, ${c.nombre}`); break outer; }
    }
  }
  if (!f.ciudad) for (const c of CIUDADES) {
    const names = [c.nombre, ...c.nombre.split("/").map((s) => s.trim()), c.slug];
    if (names.some((n) => new RegExp(`\\b${norm(n)}\\b`).test(t))) {
      f.ciudad = c.slug;
      const centro = c.barrios.find((bb) => new RegExp(`\\b${norm(bb.nombre)}\\b`).test(t));
      if (centro) { f.barrio = centro.nombre; chips.unshift(`${centro.nombre}, ${c.nombre}`); } else chips.unshift(c.nombre);
      break;
    }
  }
  if (q.trim()) f.orden ??= "relevancia";
  return { filtros: f, chips: [...new Set(chips)] };
}
