// Exporta los anuncios (reales + demo) a JSON para calcular los vectores de IA en Python.
import { writeFileSync } from "node:fs";
import { allListings } from "../../lib/data";
const out = allListings().map((l) => ({
  id: l.id, operacion: l.operacion, tipo: l.tipo, titulo: l.titulo, descripcion: l.descripcion,
  extras: l.extras, fotos: l.fotos, lat: l.lat, lng: l.lng, m2: l.m2, hab: l.habitaciones, banos: l.banos,
  precio: l.precio, ciudad: l.ciudad, anunciante: l.anunciante.nombre, fuente: l.fuente,
}));
writeFileSync(process.argv[2] ?? "ingest/ia/anuncios.json", JSON.stringify(out));
console.log(out.length, "anuncios exportados");
