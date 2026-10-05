import Link from "next/link";
import { ArrowRight, Bell, Calculator, CheckCircle2, FolderHeart, Landmark, Search, ShieldCheck } from "lucide-react";
import HeroSearch from "@/components/HeroSearch";
import SectionHeader from "@/components/SectionHeader";
import Carousel from "@/components/Carousel";
import CityCard from "@/components/CityCard";
import PropertyCard from "@/components/PropertyCard";
import Faq from "@/components/Faq";
import { CIUDADES } from "@/lib/geo";
import { latestIn, search } from "@/lib/search";
import { allListings } from "@/lib/data";
import { BRAND } from "@/lib/brand";
import { eur } from "@/lib/format";

const foto = (s: string) => `https://picsum.photos/seed/city-${s}/640/480`;

export default function Home() {
  const total = allListings().length;
  const madrid = latestIn("madrid", undefined, 10);
  const vistas = search({ operacion: "comprar", extras: ["terraza"], perPage: 10, orden: "precio_desc" }).items;
  const barrios = [["madrid", "Malasaña"], ["barcelona", "Gràcia"], ["valencia", "Ruzafa"], ["donostia", "Gros"]] as const;
  const indice = CIUDADES.slice(0, 6).map((c) => {
    const ls = allListings().filter((l) => l.ciudad === c.nombre && l.operacion === "alquilar" && l.tipo === "piso");
    const m2 = ls.reduce((s, l) => s + l.precio / l.m2, 0) / Math.max(1, ls.length);
    return { c: c.nombre.split(" /")[0], m2 };
  });
  const faq = [
    { q: `¿Qué es ${BRAND.name}?`, a: `${BRAND.name} es un buscador de vivienda con inteligencia artificial para España. Reúne anuncios de distintas fuentes y te deja buscar pisos, áticos, casas, locales y garajes en alquiler o venta escribiendo lo que quieres, como se lo dirías a una persona.` },
    { q: "¿Cómo agrupa los anuncios repetidos?", a: "Si el mismo piso aparece en varios portales, lo mostramos una sola vez y te enseñamos en qué portales está y a qué precio en cada uno. Pisos distintos en el mismo edificio se mantienen separados." },
    { q: "¿Cómo funciona la búsqueda con IA?", a: "Escribe por ejemplo «piso de 2 habitaciones en Chamberí con ascensor hasta 1.400 €». Interpretamos la zona, el presupuesto, el tipo de vivienda, las habitaciones y extras como terraza o mascotas, y lo convertimos en filtros que puedes ajustar." },
    { q: `¿${BRAND.name} es gratis?`, a: "Sí. Buscar, ver los datos de contacto, guardar favoritos, crear colecciones y usar las herramientas es gratis y no necesitas registrarte." },
    { q: "¿Qué herramientas gratuitas hay?", a: "Actualización del alquiler por IPC o por el índice de referencia (IRAV), simulador de hipoteca con Euríbor y diferencial, detector de estafas e índice de precios publicados por ciudad." },
  ];
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden px-4 pb-16 pt-14 md:pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,.18),transparent_60%)]" />
        <h1 className="relative mx-auto max-w-3xl text-center font-serif text-5xl leading-[1.05] text-white md:text-7xl">
          Busca <em className="italic">pisos</em><br />como te los imaginas
        </h1>
        <p className="relative mx-auto mt-5 max-w-xl text-center text-soft">Todos los portales de España en una sola búsqueda. {total.toLocaleString("es-ES")} anuncios de demo listos para probar.</p>
        <div className="relative mt-10"><HeroSearch /></div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 md:px-6">
        {/* FEATURES */}
        <section className="text-center">
          <h2 className="h-section">Tu búsqueda, reinventada</h2>
          <p className="mx-auto mt-3 max-w-2xl text-soft">Busca escribiendo con tus palabras, organiza tus favoritos en colecciones y recibe alertas al instante cuando aparece lo que quieres.</p>
          <div className="mt-10 grid gap-4 text-left md:grid-cols-3">
            <div className="panel p-5"><div className="flex items-center justify-between"><p className="font-medium">Búsqueda con IA</p><Search size={16} className="text-muted" /></div>
              <p className="mt-1 text-sm text-muted">Escribe lo que buscas con tus palabras.</p>
              <div className="mt-4 rounded-xl border border-line bg-card p-3 text-sm text-soft">Ático en Gràcia con terraza<span className="animate-pulse">|</span></div></div>
            <div className="panel p-5"><div className="flex items-center justify-between"><p className="font-medium">Colecciones</p><FolderHeart size={16} className="text-muted" /></div>
              <p className="mt-1 text-sm text-muted">Guarda y comparte tus favoritos.</p>
              <div className="mt-4 grid grid-cols-3 gap-2">{madrid.slice(0, 3).map((l) => /* eslint-disable-next-line @next/next/no-img-element */ <img key={l.id} src={l.fotos[0]} alt="" className="aspect-square rounded-lg object-cover" />)}</div></div>
            <div className="panel p-5"><div className="flex items-center justify-between"><p className="font-medium">Alertas instantáneas</p><span className="grid h-7 w-7 place-items-center rounded-full bg-wa"><Bell size={14} /></span></div>
              <p className="mt-1 text-sm text-muted">Avisos por WhatsApp o email.</p>
              <div className="mt-4 rounded-xl border border-line bg-card p-3 text-sm"><p className="text-xs text-muted">{BRAND.name} · ahora</p><p className="mt-1 text-white">Nuevo piso en Malasaña</p><p className="text-xs text-muted">2 hab · 1.250 €/mes · con balcón</p></div></div>
          </div>
        </section>

        {/* CIUDADES */}
        <section>
          <SectionHeader eyebrow="Búsquedas populares" title="Explora por ciudad" href="/buscar/alquilar" />
          <Carousel>{CIUDADES.map((c) => (
            <CityCard key={c.slug} nombre={c.nombre.split(" /")[0]} href={`/buscar/alquilar?ciudad=${c.slug}`} foto={foto(c.slug)}
              links={[{ t: "Alquiler", href: `/buscar/alquilar?ciudad=${c.slug}` }, { t: "Venta", href: `/buscar/comprar?ciudad=${c.slug}` }, { t: "Estudios", href: `/buscar/alquilar?ciudad=${c.slug}&tipo=estudio` }, { t: "Con terraza", href: `/buscar/alquilar?ciudad=${c.slug}&extras=terraza` }]} />
          ))}</Carousel>
        </section>

        <section>
          <SectionHeader eyebrow="Nuevos y destacados" title="Lo último en Madrid" href="/buscar/alquilar?ciudad=madrid" />
          <Carousel>{madrid.map((l) => <div key={l.id} className="w-[260px] shrink-0 snap-start md:w-[290px]"><PropertyCard l={l} compact /></div>)}</Carousel>
        </section>

        <section>
          <SectionHeader eyebrow="Selección" title="Terrazas que inspiran" href="/buscar/comprar?extras=terraza" />
          <Carousel>{vistas.map((l) => <div key={l.id} className="w-[260px] shrink-0 snap-start md:w-[290px]"><PropertyCard l={l} compact /></div>)}</Carousel>
        </section>

        {barrios.map(([c, b]) => {
          const items = latestIn(c, b, 10);
          return (
            <section key={b}>
              <SectionHeader eyebrow={`${items.length} anuncios recientes`} title={`Lo último en ${b}`} href={`/buscar/alquilar?ciudad=${c}&barrio=${encodeURIComponent(b)}`} />
              <Carousel>{items.map((l) => <div key={l.id} className="w-[260px] shrink-0 snap-start md:w-[290px]"><PropertyCard l={l} compact /></div>)}</Carousel>
            </section>
          );
        })}

        {/* INMOBILIARIAS */}
        <section className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="h-section">Impulsa tu<br />negocio inmobiliario</h2>
            <p className="mt-4 text-soft">Únete a {BRAND.name} para dar más visibilidad a tus anuncios y conseguir más contactos.</p>
            <ul className="mt-6 space-y-3 text-sm text-soft">{["Publicación gratuita para agencias verificadas", "Métricas detalladas de cada anuncio", "Herramientas de captación", "Contactos directos por WhatsApp"].map((t) => <li key={t} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-400" />{t}</li>)}</ul>
            <Link href="/inmobiliarias" className="btn-brand mt-8 inline-flex items-center gap-2">Reclama tu agencia <ArrowRight size={16} /></Link>
          </div>
          <div className="panel p-6">
            <div className="grid grid-cols-3 gap-3 text-center">{[["247", "Publicaciones"], ["12,4k", "Visualizaciones"], ["89", "Contactos"]].map(([n, t], i) => (
              <div key={t} className="rounded-xl border border-line bg-card p-4"><p className={`text-2xl font-semibold ${i === 1 ? "text-brand-400" : ""}`}>{n}</p><p className="mt-1 text-[11px] uppercase tracking-wider text-muted">{t}</p></div>))}</div>
            <p className="eyebrow mt-6">Actividad reciente (ejemplo)</p>
            {[["Nuevo contacto", "Piso en Chamberí"], ["Visita solicitada", "Ático en Gràcia"]].map(([a, b]) => (
              <div key={a} className="mt-3 flex items-center justify-between rounded-xl border border-line bg-card p-3"><div><p className="text-sm">{a}</p><p className="text-xs text-muted">{b}</p></div><span className="h-2 w-2 rounded-full bg-brand" /></div>))}
          </div>
        </section>

        {/* HERRAMIENTAS */}
        <section>
          <h2 className="h-section text-center">Herramientas útiles</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[{ h: "/herramientas/actualizar-alquiler", t: "Actualizar alquiler", d: "Por IPC o índice de referencia (IRAV)", i: Calculator },
              { h: "/herramientas/hipoteca", t: "Simulador de hipoteca", d: "Cuota mensual con Euríbor + diferencial", i: Landmark },
              { h: "/herramientas/detector-estafas", t: "Detector de estafas", d: "Revisa un anuncio antes de pagar nada", i: ShieldCheck }].map(({ h, t, d, i: I }) => (
              <Link key={h} href={h} className="panel flex items-center gap-4 p-5 transition hover:border-neutral-500"><span className="grid h-10 w-10 place-items-center rounded-xl bg-card"><I size={18} /></span>
                <span className="flex-1"><span className="block text-sm font-medium">{t}</span><span className="text-xs text-muted">{d}</span></span><ArrowRight size={16} className="text-muted" /></Link>))}
          </div>
        </section>

        {/* BARRIOS */}
        <section>
          <SectionHeader eyebrow="Barrios y zonas" title="Explora por barrio" href="/indice" more="Guías de barrios" />
          <Carousel>{CIUDADES.slice(0, 3).flatMap((c) => c.barrios.slice(0, 3).map((b) => (
            <CityCard key={c.slug + b.slug} nombre={`${b.nombre}`} href={`/buscar/alquilar?ciudad=${c.slug}&barrio=${encodeURIComponent(b.nombre)}`} foto={foto(c.slug + b.slug)}
              links={[{ t: "Alquiler", href: `/buscar/alquilar?ciudad=${c.slug}&barrio=${encodeURIComponent(b.nombre)}` }, { t: "Venta", href: `/buscar/comprar?ciudad=${c.slug}&barrio=${encodeURIComponent(b.nombre)}` }]} />)))}</Carousel>
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
            <span className="text-soft">Más barrios:</span>{CIUDADES.flatMap((c) => c.barrios.slice(3).map((b) => (
              <Link key={c.slug + b.slug} href={`/buscar/alquilar?ciudad=${c.slug}&barrio=${encodeURIComponent(b.nombre)}`} className="hover:text-white">{b.nombre}</Link>)))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="grid gap-10 md:grid-cols-2">
          <div><p className="eyebrow">Preguntas frecuentes</p><h2 className="h-section mt-2">¿Qué es {BRAND.name}?</h2>
            <p className="mt-4 text-soft">{BRAND.name} es un buscador inmobiliario con inteligencia artificial. Reúne los anuncios de toda España para que encuentres piso, casa o local en alquiler o venta sin abrir diez pestañas.</p></div>
          <Faq items={faq} />
        </section>

        {/* TICKER */}
        <section className="no-scrollbar flex gap-6 overflow-x-auto rounded-2xl border border-line px-5 py-3 text-xs text-muted">
          <span className="shrink-0 text-soft">Índice {BRAND.name} (alquiler, €/m² publicado):</span>
          {indice.map((i) => <span key={i.c} className="shrink-0">{i.c} <span className="text-white">{eur(i.m2).replace(" €", "")} €/m²</span></span>)}
          <Link href="/indice" className="ml-auto shrink-0 text-soft hover:text-white">Ver el índice completo →</Link>
        </section>
      </div>
    </>
  );
}
