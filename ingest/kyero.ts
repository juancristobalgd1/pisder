// Importador de feeds XML en formato Kyero V3 (el estándar que exportan Inmovilla, Witei, Mobilia, Habitania y otros CRM inmobiliarios).
// Uso: npx tsx ingest/kyero.ts            -> lee ingest/feeds.json y escribe data/real.json
//      npx tsx ingest/kyero.ts fichero.xml "Nombre agencia"  -> prueba con un fichero local
// Solo se importan feeds que la inmobiliaria nos haya dado con su permiso.
import { XMLParser } from "fast-xml-parser";
import { readFileSync, writeFileSync } from "node:fs";
import type { Listing, Tipo } from "../lib/types";

type Feed = { agencia: string; url: string; telefono?: string; web?: string };
const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: false, isArray: (n) => ["property", "image", "feature"].includes(n) });

const TIPO: [RegExp, Tipo][] = [
  [/penthouse|atico|ático/i, "atico"], [/studio|estudio|loft/i, "estudio"], [/duplex|dúplex/i, "duplex"],
  [/villa|chalet|detached|bungalow|town ?house|terraced|adosad|pareado/i, "chalet"], [/finca|country|cortijo|caserio|caserío|house|casa/i, "casa"],
  [/garage|garaje|parking/i, "garaje"], [/plot|land|terreno|solar|parcela/i, "terreno"], [/office|oficina/i, "oficina"],
  [/commercial|local|shop|business|nave|warehouse/i, "local"], [/room|habitaci/i, "habitacion"], [/apartment|flat|piso|apartamento/i, "piso"],
];
const tipoDe = (t: string): Tipo => TIPO.find(([r]) => r.test(t))?.[1] ?? "piso";
const tc = (s: string) => String(s ?? "").toLowerCase().replace(/(^|[\s-])\p{L}/gu, (m) => m.toUpperCase());
const txt = (v: unknown, lang = "es"): string => (v && typeof v === "object" ? String((v as Record<string, unknown>)[lang] ?? (v as Record<string, unknown>).en ?? Object.values(v as object)[0] ?? "") : String(v ?? "")).trim();

export function parseKyero(xml: string, feed: Feed): Listing[] {
  const doc = parser.parse(xml);
  const props: any[] = doc?.root?.property ?? [];
  return props.flatMap((p): Listing[] => {
    const precio = Number(p.price); if (!precio) return [];
    const op = p.price_freq === "month" ? "alquilar" : p.price_freq === "sale" ? "comprar" : null; if (!op) return [];
    const tipo = tipoDe(String(p.type ?? ""));
    const lat = Number(p.location?.latitude) || 0, lng = Number(p.location?.longitude) || 0;
    const fotos = (p.images?.image ?? []).filter((i: any) => !String(i.tags?.tag ?? "").includes("floorplan")).sort((a: any, b: any) => Number(a["@_id"]) - Number(b["@_id"])).map((i: any) => String(i.url)).filter((u: string) => /^https?:\/\//.test(u));
    if (!fotos.length) return [];
    const feats: string[] = (p.features?.feature ?? []).map(String);
    const f = feats.join(" ").toLowerCase();
    const extras = [
      Number(p.pool) === 1 && "piscina", /terrace|terraza/.test(f) && "terraza", /lift|elevator|ascensor/.test(f) && "ascensor", /garage|garaje|parking/.test(f) && "garaje",
      /air.?con|aire/.test(f) && "aire", /pets|mascotas/.test(f) && "mascotas", /furnished|amueblad/.test(f) && "amueblado", /storage|trastero/.test(f) && "trastero",
      /garden|jardin|jardín/.test(f) && "jardin", /balcon/.test(f) && "balcon", /heating|calefacc/.test(f) && "calefaccion",
    ].filter(Boolean) as string[];
    const ciudad = tc(p.town), provincia = tc(p.province), zona = txt(p.location_detail) || ciudad;
    const url = txt(p.url) || feed.web || "#";
    const fecha = String(p.date ?? "").replace(" ", "T");
    const eRating = String(p.energy_rating?.consumption ?? "").toUpperCase();
    return [{
      id: `r-${feed.agencia.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 10)}-${String(p.id)}`.slice(0, 60),
      operacion: op, tipo, titulo: `${tc(String(p.type))} en ${zona}`, direccion: zona, barrio: zona, ciudad, provincia, lat, lng,
      precio, m2: Number(p.surface_area?.built) || Number(p.surface_area?.plot) || 0,
      habitaciones: Number(p.beds) || 0, banos: Number(p.baths) || 0, extras, fotos,
      descripcion: txt(p.desc) || feats.join(", "),
      fuente: "agencia", fuentes: [{ nombre: "agencia", url, precio }],
      anunciante: { tipo: "agencia", nombre: feed.agencia, telefono: String(p.contact_number ?? feed.telefono ?? "").replace(/^0034/, "+34 "), verificado: true },
      publicadoEn: isNaN(Date.parse(fecha)) ? new Date().toISOString() : new Date(fecha).toISOString(),
      eficiencia: /^[A-G]$/.test(eRating) ? (eRating as Listing["eficiencia"]) : undefined,
      real: true, ref: String(p.ref ?? ""),
    } as Listing];
  });
}

async function main() {
  const [file, nombre] = process.argv.slice(2);
  let out: Listing[] = [];
  if (file) out = parseKyero(readFileSync(file, "utf8"), { agencia: nombre ?? "Agencia de prueba", url: file });
  else {
    const feeds: Feed[] = JSON.parse(readFileSync("ingest/feeds.json", "utf8"));
    for (const f of feeds) {
      try { const r = await fetch(f.url); const l = parseKyero(await r.text(), f); console.log(`${f.agencia}: ${l.length} anuncios`); out.push(...l); }
      catch (e) { console.error(`${f.agencia}: error leyendo el feed`, (e as Error).message); }
    }
    writeFileSync("data/real.json", JSON.stringify(out));
  }
  console.log(`Total: ${out.length}`);
  if (file) console.log(JSON.stringify(out[0], null, 1).slice(0, 1200));
}
if (process.argv[1]?.endsWith("kyero.ts")) main();
