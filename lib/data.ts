import { CALLES, CIUDADES, PLAYAS, km } from "./geo";
import { asset } from "./asset";
import type { Listing, Tipo, Fuente, Operacion } from "./types";

// Generador determinista de anuncios DEMO. En producción lo sustituye la tabla `listings` (ver /ingest).
function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];
const shuffle = <T,>(r: () => number, a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const AGENCIAS = ["Tecnocasa", "Engel & Völkers", "Century 21", "RE/MAX", "Solvia", "Donpiso", "Inmobiliaria Urbana", "Gestión Norte", "Habitat Home", "Keller Williams"];
const EXTRAS = ["terraza", "ascensor", "garaje", "piscina", "mascotas", "amueblado", "aire", "exterior", "trastero", "calefaccion", "balcon", "jardin"];
const TIPOS_ALQ: Tipo[] = ["piso", "piso", "piso", "estudio", "atico", "duplex", "habitacion", "casa", "chalet", "local", "garaje", "oficina"];
const TIPOS_VEN: Tipo[] = ["piso", "piso", "piso", "atico", "duplex", "chalet", "chalet", "casa", "estudio", "local", "garaje", "terreno"];
const FUENTES: Fuente[] = ["idealista", "fotocasa", "habitaclia", "pisos.com"];
const ETIQUETA: Record<Tipo, string> = { piso: "Piso", atico: "Ático", estudio: "Estudio", duplex: "Dúplex", chalet: "Chalet", casa: "Casa", local: "Local", garaje: "Plaza de garaje", terreno: "Terreno", habitacion: "Habitación", oficina: "Oficina" };
export const tipoLabel = (t: Tipo) => ETIQUETA[t];

const F = (n: string) => asset(`/fotos/${n}.webp`);
function fotosPara(t: Tipo, r: () => number, o: { costa: boolean; cercaPlaya: boolean; piscina: boolean; terraza: boolean; ciudad: string }) {
  const interior = shuffle(r, ["salon", "cocina", "dormitorio", "bano", "comedor"]);
  const fachada = r() < 0.5 ? "fachada-clasica" : "fachada-moderna";
  const salon = o.ciudad === "barcelona" && r() < 0.6 ? "salon-modernista" : o.cercaPlaya ? "salon-mar" : "salon";
  let f: string[];
  switch (t) {
    case "garaje": return [F("garaje")];
    case "terreno": return [F("terreno")];
    case "local": case "oficina": return [F("oficina")];
    case "estudio": f = ["estudio", "bano", "cocina", fachada]; break;
    case "habitacion": f = ["dormitorio", "cocina", "bano", salon]; break;
    case "chalet": case "casa": f = [o.piscina || o.costa ? pick(r, ["chalet-piscina", "chalet-piscina", "piscina-comunitaria", "terraza", ...(o.cercaPlaya ? ["salon-mar"] : [])]) : fachada, "chalet-piscina", salon, ...interior.filter((x) => x !== "salon"), ...(o.piscina ? ["piscina-comunitaria"] : [])]; break;
    case "atico": f = ["terraza", salon, ...interior.filter((x) => x !== "salon")]; break;
    default: f = [r() < 0.35 ? fachada : salon, ...interior.filter((x) => x !== "salon"), ...(o.terraza ? ["terraza"] : []), ...(o.piscina ? ["piscina-comunitaria"] : [])];
  }
  return [...new Set(f)].map(F);
}

function m2For(t: Tipo, r: () => number) {
  switch (t) {
    case "estudio": return 25 + Math.round(r() * 20);
    case "habitacion": return 9 + Math.round(r() * 8);
    case "garaje": return 10 + Math.round(r() * 6);
    case "terreno": return 300 + Math.round(r() * 1500);
    case "chalet": case "casa": return 120 + Math.round(r() * 220);
    case "local": case "oficina": return 40 + Math.round(r() * 200);
    case "atico": case "duplex": return 70 + Math.round(r() * 90);
    default: return 45 + Math.round(r() * 95);
  }
}
function habFor(t: Tipo, m2: number, r: () => number) {
  if (["estudio", "local", "garaje", "terreno", "oficina"].includes(t)) return 0;
  if (t === "habitacion") return 1;
  return Math.max(1, Math.min(6, Math.round(m2 / 32 + (r() - 0.5))));
}

function generar(): Listing[] {
  const out: Listing[] = [];
  const r = rng(20261005);
  const now = Date.parse("2026-10-05T06:00:00Z");
  let n = 0;
  for (const c of CIUDADES) {
    const count = c.slug === "madrid" || c.slug === "barcelona" ? 220 : c.slug === "elgoibar" || c.slug === "eibar" ? 40 : 110;
    const playas = PLAYAS[c.slug];
    for (let i = 0; i < count; i++) {
      const op: Operacion = r() < 0.55 ? "alquilar" : "comprar";
      const tipo = pick(r, op === "alquilar" ? TIPOS_ALQ : TIPOS_VEN);
      const barrio = pick(r, c.barrios);
      const m2 = m2For(tipo, r);
      const hab = habFor(tipo, m2, r);
      const banos = hab === 0 ? (tipo === "garaje" || tipo === "terreno" ? 0 : 1) : Math.max(1, Math.round(hab / 2 + r() * 0.6));
      const tipoF = tipo === "chalet" || tipo === "casa" ? 0.9 : tipo === "atico" ? 1.2 : tipo === "garaje" ? 0.5 : tipo === "terreno" ? 0.05 : tipo === "habitacion" ? 2.6 : 1;
      const noise = 0.82 + r() * 0.36;
      let precio = op === "alquilar" ? c.alquilerM2 * m2 * barrio.factor * tipoF * noise : c.ventaM2 * m2 * barrio.factor * tipoF * noise;
      if (tipo === "garaje") precio = op === "alquilar" ? 60 + r() * 120 : 12000 + r() * 30000;
      precio = op === "alquilar" ? Math.round(precio / 10) * 10 : Math.round(precio / 1000) * 1000;
      const lat = barrio.lat + (r() - 0.5) * 0.012, lng = barrio.lng + (r() - 0.5) * 0.016;
      const distPlaya = playas ? Math.round(Math.min(...playas.map((p) => km([lat, lng], p))) * 10) / 10 : undefined;
      const esCasa = tipo === "chalet" || tipo === "casa";
      const extras = EXTRAS.filter((e) => r() < (e === "piscina" && esCasa ? 0.6 : e === "jardin" && esCasa ? 0.7 : 0.26));
      const particular = r() < 0.22;
      const fuente: Fuente = particular ? "particular" : pick(r, FUENTES);
      const nFuentes = particular ? 1 : 1 + Math.floor(r() * 3);
      const fuentes = Array.from(new Set([fuente, ...Array.from({ length: nFuentes - 1 }, () => pick(r, FUENTES))])).map((f, k) => ({
        nombre: f as Fuente, url: "#", precio: k === 0 ? precio : Math.round((precio * (0.97 + r() * 0.06)) / 10) * 10,
      }));
      const calle = pick(r, CALLES[c.slug] ?? ["Calle Mayor"]);
      const num = 1 + Math.floor(r() * 120);
      const id = `${c.slug.slice(0, 3)}-${(++n).toString(36)}${Math.floor(r() * 1e4).toString(36)}`;
      const fotos = fotosPara(tipo, r, { costa: !!playas, cercaPlaya: distPlaya !== undefined && distPlaya < 1.2, piscina: extras.includes("piscina"), terraza: extras.includes("terraza"), ciudad: c.slug });
      const dias = Math.floor(Math.pow(r(), 2) * 60);
      const planta = ["Bajo", "1ª", "2ª", "3ª", "4ª", "5ª", "6ª", "Ático"][Math.floor(r() * 8)];
      const etiqueta = ETIQUETA[tipo];
      const playaTxt = distPlaya !== undefined && distPlaya <= 1 ? ` A ${distPlaya < 0.3 ? "pocos pasos" : `${Math.round(distPlaya * 1000 / 50) * 50} m`} de la playa.` : "";
      out.push({
        id, operacion: op, tipo,
        titulo: `${etiqueta} en ${calle}, ${barrio.nombre}`,
        direccion: `${calle} ${num}`,
        barrio: barrio.nombre, ciudad: c.nombre, provincia: c.provincia, lat, lng,
        precio, gastosComunidad: ["piso", "atico", "duplex", "estudio"].includes(tipo) && r() < 0.7 ? Math.round((25 + r() * 120) / 5) * 5 : undefined,
        m2, habitaciones: hab, banos, planta: ["piso", "atico", "duplex", "estudio", "habitacion"].includes(tipo) ? planta : undefined,
        extras, fotos, distPlaya,
        descripcion: `${etiqueta} de ${m2} m² en ${barrio.nombre} (${c.nombre.split(" /")[0]}). ${hab ? `${hab} habitaciones y ${banos} baño${banos > 1 ? "s" : ""}. ` : ""}${extras.length ? "Cuenta con " + extras.map(extraLabel).join(", ").toLowerCase() + ". " : ""}Bien comunicado, cerca de comercios y transporte público.${playaTxt}`,
        fuente, fuentes,
        anunciante: particular ? { tipo: "particular", nombre: "Particular", telefono: `+34 6${Math.floor(10000000 + r() * 89999999)}`, verificado: r() < 0.5 }
          : { tipo: "agencia", nombre: pick(r, AGENCIAS), telefono: `+34 9${Math.floor(10000000 + r() * 89999999)}`, verificado: true },
        publicadoEn: new Date(now - dias * 86400000 - Math.floor(r() * 86400000)).toISOString(),
        eficiencia: (["A", "B", "C", "D", "E", "E", "F", "G"] as const)[Math.floor(r() * 8)],
        destacada: r() < 0.06,
      });
    }
  }
  return out;
}

const EXTRA_LABEL: Record<string, string> = { terraza: "Terraza", ascensor: "Ascensor", garaje: "Garaje", piscina: "Piscina", mascotas: "Admite mascotas", amueblado: "Amueblado", aire: "Aire acondicionado", exterior: "Exterior", trastero: "Trastero", calefaccion: "Calefacción", balcon: "Balcón", jardin: "Jardín" };
export const extraLabel = (e: string) => EXTRA_LABEL[e] ?? e;
export const EXTRAS_ALL = Object.keys(EXTRA_LABEL);

let cache: Listing[] | null = null;
export function allListings(): Listing[] { return (cache ??= generar()); }
export function getListing(id: string) { return allListings().find((l) => l.id === id); }
