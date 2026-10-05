import Link from "next/link";
import { CIUDADES } from "@/lib/geo";
import { allListings } from "@/lib/data";
import { BRAND } from "@/lib/brand";
export const metadata = { title: "Índice de precios publicados por ciudad" };
const med = (a: number[]) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
export default function Indice() {
  const rows = CIUDADES.map((c) => {
    const ls = allListings().filter((l) => l.ciudad === c.nombre && ["piso", "atico", "duplex", "estudio"].includes(l.tipo));
    const alq = ls.filter((l) => l.operacion === "alquilar"), ven = ls.filter((l) => l.operacion === "comprar");
    return { c, alq: med(alq.map((l) => l.precio / l.m2)), ven: med(ven.map((l) => l.precio / l.m2)), n: ls.length };
  });
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 md:px-6">
      <p className="eyebrow">Precios y mercado</p><h1 className="mt-2 font-serif text-4xl md:text-5xl">Índice {BRAND.name}</h1>
      <p className="mt-3 text-soft">Mediana del precio publicado por m² en anuncios activos de vivienda. Refleja la oferta visible, no precios de cierre.</p>
      <div className="panel mt-8 overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-card text-left text-muted"><tr><th className="p-3">Ciudad</th><th className="p-3 text-right">Alquiler €/m²/mes</th><th className="p-3 text-right">Venta €/m²</th><th className="p-3 text-right">Anuncios</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.c.slug} id={r.c.slug} className="border-t border-line"><td className="p-3"><Link href={`/buscar/alquilar?ciudad=${r.c.slug}`} className="hover:text-brand-400">{r.c.nombre}</Link></td>
            <td className="p-3 text-right">{r.alq.toLocaleString("es-ES", { maximumFractionDigits: 1 })}</td><td className="p-3 text-right">{Math.round(r.ven).toLocaleString("es-ES")}</td><td className="p-3 text-right text-muted">{r.n}</td></tr>)}</tbody></table>
      </div>
      <p className="mt-3 text-xs text-muted">Calculado sobre los anuncios cargados en este entorno (datos demo).</p>
    </div>
  );
}
