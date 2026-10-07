import { norm } from "./geo";

export interface Provincia { slug: string; nombre: string; lat: number; lng: number }

// Las 50 provincias + Ceuta y Melilla. Coordenadas de la capital (para elegir la más cercana a tu ubicación).
export const PROVINCIAS: Provincia[] = [
  ["a-coruna", "A Coruña", 43.362, -8.411], ["alava", "Álava", 42.847, -2.672], ["albacete", "Albacete", 38.994, -1.858],
  ["alicante", "Alicante", 38.345, -0.481], ["almeria", "Almería", 36.834, -2.464], ["asturias", "Asturias", 43.362, -5.849],
  ["avila", "Ávila", 40.656, -4.700], ["badajoz", "Badajoz", 38.879, -6.970], ["barcelona", "Barcelona", 41.387, 2.169],
  ["bizkaia", "Bizkaia", 43.263, -2.935], ["burgos", "Burgos", 42.344, -3.697], ["caceres", "Cáceres", 39.475, -6.372],
  ["cadiz", "Cádiz", 36.527, -6.289], ["cantabria", "Cantabria", 43.462, -3.810], ["castellon", "Castellón", 39.986, -0.051],
  ["ceuta", "Ceuta", 35.889, -5.321], ["ciudad-real", "Ciudad Real", 38.985, -3.927], ["cordoba", "Córdoba", 37.888, -4.779],
  ["cuenca", "Cuenca", 40.070, -2.137], ["gipuzkoa", "Gipuzkoa", 43.318, -1.981], ["girona", "Girona", 41.979, 2.821],
  ["granada", "Granada", 37.177, -3.599], ["guadalajara", "Guadalajara", 40.633, -3.167], ["huelva", "Huelva", 37.261, -6.945],
  ["huesca", "Huesca", 42.140, -0.408], ["illes-balears", "Illes Balears", 39.570, 2.650], ["jaen", "Jaén", 37.779, -3.785],
  ["la-rioja", "La Rioja", 42.465, -2.445], ["las-palmas", "Las Palmas", 28.124, -15.430], ["leon", "León", 42.599, -5.567],
  ["lleida", "Lleida", 41.618, 0.620], ["lugo", "Lugo", 43.012, -7.556], ["madrid", "Madrid", 40.417, -3.704],
  ["malaga", "Málaga", 36.721, -4.421], ["melilla", "Melilla", 35.292, -2.938], ["murcia", "Murcia", 37.992, -1.131],
  ["navarra", "Navarra", 42.812, -1.646], ["ourense", "Ourense", 42.336, -7.864], ["palencia", "Palencia", 42.010, -4.528],
  ["pontevedra", "Pontevedra", 42.431, -8.644], ["salamanca", "Salamanca", 40.970, -5.663], ["santa-cruz-de-tenerife", "Santa Cruz de Tenerife", 28.464, -16.251],
  ["segovia", "Segovia", 40.948, -4.118], ["sevilla", "Sevilla", 37.389, -5.984], ["soria", "Soria", 41.764, -2.464],
  ["tarragona", "Tarragona", 41.119, 1.245], ["teruel", "Teruel", 40.344, -1.106], ["toledo", "Toledo", 39.863, -4.027],
  ["valencia", "Valencia", 39.470, -0.376], ["valladolid", "Valladolid", 41.652, -4.724], ["zamora", "Zamora", 41.503, -5.745],
  ["zaragoza", "Zaragoza", 41.649, -0.889],
].map(([slug, nombre, lat, lng]) => ({ slug, nombre, lat, lng }) as Provincia);

// Nombres alternativos que pueden venir en los feeds de las inmobiliarias
const ALIAS: Record<string, string> = {
  "la coruna": "a-coruna", coruna: "a-coruna", araba: "alava", "araba/alava": "alava", alacant: "alicante",
  vizcaya: "bizkaia", guipuzcoa: "gipuzkoa", gerona: "girona", lerida: "lleida", orense: "ourense", nafarroa: "navarra",
  baleares: "illes-balears", "islas baleares": "illes-balears", "balears": "illes-balears", castello: "castellon",
  "castellon de la plana": "castellon", "santa cruz de tenerife": "santa-cruz-de-tenerife", tenerife: "santa-cruz-de-tenerife",
  "las palmas de gran canaria": "las-palmas", "gran canaria": "las-palmas", rioja: "la-rioja", "principado de asturias": "asturias",
  "region de murcia": "murcia", "comunidad de madrid": "madrid", "valencia/valencia": "valencia",
};

export const slugProvincia = (nombre?: string): string | undefined => {
  if (!nombre) return undefined;
  const n = norm(nombre);
  if (ALIAS[n]) return ALIAS[n];
  const s = n.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return PROVINCIAS.find((p) => p.slug === s)?.slug;
};
export const provinciaPorSlug = (s?: string) => PROVINCIAS.find((p) => p.slug === s);

// Provincia más cercana a un punto (por la capital). Fuera de España devuelve undefined.
export function provinciaCercana(lat: number, lng: number): Provincia | undefined {
  const enEspana = (lat > 35.9 && lat < 43.9 && lng > -9.4 && lng < 4.4) || (lat > 27.5 && lat < 29.5 && lng > -18.3 && lng < -13.3) || (lat > 35.2 && lat < 35.95 && lng > -5.4 && lng < -2.9);
  if (!enEspana) return undefined;
  const k = Math.cos((lat * Math.PI) / 180);
  let mejor: Provincia | undefined, d = Infinity;
  for (const p of PROVINCIAS) { const dd = (p.lat - lat) ** 2 + ((p.lng - lng) * k) ** 2; if (dd < d) { d = dd; mejor = p; } }
  return mejor;
}

export const PROV_KEY = "pisoya:provincia"; // "" = toda España; slug = provincia elegida
