// Índice ligero de anuncios recientes para las alertas (lo lee el service worker).
import { allListings } from "@/lib/data";
import { slugProvincia } from "@/lib/provincias";
import { norm } from "@/lib/geo";

export const dynamic = "force-static";

export function GET() {
  const desde = Date.now() - 20 * 86400000;
  const items = allListings()
    .filter((l) => Date.parse(l.publicadoEn) >= desde)
    .map((l) => ({
      id: l.id, op: l.operacion, prov: slugProvincia(l.provincia) ?? "", ciudad: l.ciudad, barrio: norm(l.barrio),
      tipo: l.tipo, precio: l.precio, m2: l.m2, hab: l.habitaciones, banos: l.banos, extras: l.extras,
      part: l.anunciante.tipo === "particular" ? 1 : 0, playa: l.distPlaya ?? null, lat: l.lat, lng: l.lng,
      pub: l.publicadoEn, titulo: l.titulo, barrioNombre: l.barrio,
    }));
  return Response.json({ generado: new Date().toISOString(), items });
}
