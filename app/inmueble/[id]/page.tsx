import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bath, BedDouble, Building2, ChevronLeft, ExternalLink, Leaf, MapPin, Phone, Ruler, ShieldCheck } from "lucide-react";
import { extraLabel, getListing, tipoLabel } from "@/lib/data";
import { search } from "@/lib/search";
import { CIUDADES } from "@/lib/geo";
import { eur, hace } from "@/lib/format";
import { riesgoEstafa } from "@/lib/scam";
import Gallery from "@/components/detail/Gallery";
import FavButton from "@/components/detail/FavButton";
import ContactBox from "@/components/detail/ContactBox";
import PropertyCard from "@/components/PropertyCard";

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const l = getListing(params.id);
  return { title: l ? `${l.titulo} · ${eur(l.precio)}` : "Inmueble no encontrado" };
}

export default function Inmueble({ params }: { params: { id: string } }) {
  const l = getListing(params.id);
  if (!l) notFound();
  const c = CIUDADES.find((x) => x.nombre === l.ciudad)!;
  const ref = l.operacion === "alquilar" ? c.alquilerM2 : c.ventaM2;
  const pm2 = l.precio / l.m2;
  const diff = Math.round((pm2 / (ref * (c.barrios.find((b) => b.nombre === l.barrio)?.factor ?? 1)) - 1) * 100);
  const risk = riesgoEstafa(l);
  const similares = search({ operacion: l.operacion, ciudad: c.slug, tipos: [l.tipo], perPage: 9 }).items.filter((x) => x.id !== l.id).slice(0, 8);
  const osm = `https://www.openstreetmap.org/export/embed.html?bbox=${l.lng - 0.008},${l.lat - 0.005},${l.lng + 0.008},${l.lat + 0.005}&layer=mapnik&marker=${l.lat},${l.lng}`;
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-4 md:px-6">
      <Link href={`/buscar/${l.operacion}?ciudad=${c.slug}`} className="mb-4 inline-flex items-center gap-1 text-sm text-soft hover:text-white"><ChevronLeft size={16} /> Volver a resultados</Link>
      <Gallery fotos={l.fotos} titulo={l.titulo} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-sm text-muted">{tipoLabel(l.tipo)} · {l.operacion === "alquilar" ? "Alquiler" : "Venta"} · publicado {hace(l.publicadoEn)}</p>
              <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{l.direccion}, {l.barrio}</h1>
              <p className="mt-1 flex items-center gap-1 text-soft"><MapPin size={15} />{l.ciudad}, {l.provincia}</p></div>
            <FavButton id={l.id} />
          </div>
          <p className="mt-5 flex flex-wrap items-baseline gap-3"><span className="text-3xl font-semibold">{eur(l.precio)}</span>{l.operacion === "alquilar" && <span className="text-soft">/mes</span>}
            {l.gastosComunidad && <span className="text-sm text-muted">+ {eur(l.gastosComunidad)} de comunidad</span>}
            <span className="text-sm text-muted">· {eur(Math.round(pm2 * (l.operacion === "alquilar" ? 10 : 1)) / (l.operacion === "alquilar" ? 10 : 1)).replace(" €", "")} €/m²</span></p>
          <p className={`mt-2 inline-block rounded-full px-3 py-1 text-xs ${diff <= -5 ? "bg-green-500/15 text-green-400" : diff >= 10 ? "bg-orange-500/15 text-orange-300" : "bg-card text-soft"}`}>
            {diff <= -5 ? `${Math.abs(diff)}% por debajo` : diff >= 5 ? `${diff}% por encima` : "En línea con"} del €/m² habitual en {l.barrio}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[[BedDouble, l.habitaciones ? `${l.habitaciones} hab.` : tipoLabel(l.tipo)], [Bath, `${l.banos} baño${l.banos !== 1 ? "s" : ""}`], [Ruler, `${l.m2} m²`], [Building2, l.planta ? `Planta ${l.planta}` : "—"]].map(([I, t], i) => {
              const Icon = I as typeof Ruler; return <div key={i} className="panel flex items-center gap-2 p-3 text-sm"><Icon size={16} className="text-muted" />{t as string}</div>; })}
          </div>
          <h2 className="mt-8 text-lg font-medium">Descripción</h2><p className="mt-2 leading-relaxed text-soft">{l.descripcion}</p>
          {l.extras.length > 0 && <><h2 className="mt-8 text-lg font-medium">Características</h2>
            <div className="mt-3 flex flex-wrap gap-2">{l.extras.map((e) => <span key={e} className="chip">{extraLabel(e)}</span>)}{l.eficiencia && <span className="chip"><Leaf size={12} />Certificado {l.eficiencia}</span>}</div></>}
          <h2 className="mt-8 text-lg font-medium">Dónde está</h2>
          <iframe title="Mapa" src={osm} className="mt-3 h-72 w-full rounded-xl border border-line" loading="lazy" />
          <p className="mt-2 text-xs text-muted">Ubicación aproximada. Confirma la dirección exacta con el anunciante.</p>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <ContactBox anunciante={l.anunciante} titulo={l.titulo} />
          <div className="panel p-5"><p className="text-sm font-medium">Dónde está publicado</p>
            <ul className="mt-3 space-y-2 text-sm">{l.fuentes.map((f) => <li key={f.nombre} className="flex items-center justify-between"><span className="flex items-center gap-1.5 capitalize text-soft"><ExternalLink size={13} />{f.nombre}</span><span>{eur(f.precio)}</span></li>)}</ul>
            {l.fuentes.length > 1 && <p className="mt-3 text-xs text-muted">Mismo inmueble en {l.fuentes.length} portales: te mostramos dónde está más barato.</p>}</div>
          <div className="panel p-5"><p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck size={16} className={risk.nivel === "bajo" ? "text-green-400" : risk.nivel === "medio" ? "text-yellow-300" : "text-red-400"} />Riesgo de estafa: {risk.nivel}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-soft">{risk.motivos.map((m) => <li key={m}>{m}</li>)}</ul></div>
        </aside>
      </div>
      {similares.length > 0 && <section className="mt-16"><h2 className="h-section mb-5">Similares en {l.ciudad.split(" /")[0]}</h2>
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">{similares.map((s) => <PropertyCard key={s.id} l={s} compact />)}</div></section>}
    </div>
  );
}
