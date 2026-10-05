"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { BedDouble, ChevronLeft, ChevronRight, Eye, Heart, Map as MapIcon, Ruler, Bath } from "lucide-react";
import type { Listing } from "@/lib/types";
import { useFavs } from "./useFavs";
import { useLocal } from "./useLocal";

const n0 = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function PropertyCard({ l, compact = false, onHover, onMap }: { l: Listing; compact?: boolean; onHover?: (id: string | null) => void; onMap?: (l: Listing) => void }) {
  const [i, setI] = useState(0);
  const { isFav, toggle } = useFavs();
  const [visitadas] = useLocal<string[]>("pisoya:visitadas", []);
  const fav = isFav(l.id);
  const n = Math.min(l.fotos.length, 6);
  const touch = useRef<number | null>(null);
  const go = (e: React.MouseEvent | null, d: number) => { e?.preventDefault(); e?.stopPropagation(); setI((v) => (v + d + n) % n); };
  const alquiler = l.operacion === "alquilar";
  const visitada = visitadas.includes(l.id);
  if (compact) return (
    <Link href={`/inmueble/${l.id}/`} className="group block min-w-0" onMouseEnter={() => onHover?.(l.id)} onMouseLeave={() => onHover?.(null)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-card"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 40) go(null, dx < 0 ? 1 : -1); touch.current = null; }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={l.fotos[i]} alt={`Foto de ${l.titulo}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        {visitada && <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm"><Eye size={12} />Visitada</span>}
        {!visitada && l.destacada && <span className="absolute left-2.5 top-2.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#ecd5a3] backdrop-blur-sm">Destacado</span>}
        <button aria-label={fav ? "Quitar de favoritos" : "Guardar en favoritos"} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(l.id); }}
          className="glass-btn absolute right-2.5 top-2.5 h-8 w-8"><Heart size={16} className={fav ? "fill-[#34d399] text-[#34d399]" : ""} /></button>
        {n > 1 && <button onClick={(e) => go(e, 1)} aria-label="Foto siguiente" className="glass-btn absolute right-2.5 top-1/2 h-8 w-8 -translate-y-1/2 md:opacity-0 md:group-hover:opacity-100"><ChevronRight size={16} /></button>}
        <p className="absolute bottom-2.5 left-3 flex items-baseline gap-1 text-white">
          <span className="text-[15px] font-semibold tracking-tight">{n0(l.precio)} €</span>{alquiler && <span className="text-[11px] text-white/80">/mes</span>}
        </p>
        {n > 1 && <div className="absolute bottom-3.5 right-3 flex items-center gap-1">{Array.from({ length: n }).map((_, k) => <span key={k} className={`h-1 rounded-full ${k === i ? "w-3 bg-white" : "w-1 bg-white/55"}`} />)}</div>}
      </div>
      <div className="mt-2 space-y-0.5">
        <h3 className="truncate text-[13px] text-soft">{l.direccion}, {l.barrio}</h3>
        <p className="flex items-center gap-2.5 text-[12px] text-muted">
          {l.habitaciones > 0 ? <span className="flex items-center gap-1"><BedDouble size={13} />{l.habitaciones} hab</span> : <span className="capitalize">{l.tipo}</span>}
          {l.banos > 0 && <span className="flex items-center gap-1"><Bath size={13} />{l.banos}</span>}
          <span className="flex items-center gap-1"><Ruler size={13} />{l.m2} m²</span>
        </p>
      </div>
    </Link>
  );
  return (
    <Link href={`/inmueble/${l.id}/`} className="group block min-w-0" onMouseEnter={() => onHover?.(l.id)} onMouseLeave={() => onHover?.(null)}>
      <div className="relative aspect-[16/11] overflow-hidden rounded-[22px] bg-card md:aspect-[4/3] md:rounded-xl"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 40) go(null, dx < 0 ? 1 : -1); touch.current = null; }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={l.fotos[i]} alt={`Foto de ${l.titulo}`} loading="lazy" className="h-full w-full object-cover" />
        {visitada && <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-[#3b6cff] bg-[#0f1a3d]/85 px-3 py-1 text-[13px] font-medium text-[#8fb0ff]"><Eye size={15} />Visitada</span>}
        {!visitada && l.destacada && <span className="absolute left-3 top-3 rounded-full bg-brand-grad px-2.5 py-1 text-[11px] font-semibold uppercase">Destacado</span>}
        <button aria-label={fav ? "Quitar de favoritos" : "Guardar en favoritos"} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(l.id); }}
          className="glass-btn absolute right-3 top-3 h-11 w-11 md:h-9 md:w-9"><Heart size={20} className={fav ? "fill-[#34d399] text-[#34d399]" : ""} /></button>
        {n > 1 && (<>
          <button onClick={(e) => go(e, -1)} aria-label="Foto anterior" className="glass-btn absolute left-2.5 top-1/2 h-10 w-10 -translate-y-1/2 md:hidden md:group-hover:grid"><ChevronLeft size={20} /></button>
          <button onClick={(e) => go(e, 1)} aria-label="Foto siguiente" className="glass-btn absolute right-2.5 top-1/2 h-10 w-10 -translate-y-1/2 md:hidden md:group-hover:grid"><ChevronRight size={20} /></button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">{Array.from({ length: n }).map((_, k) => <span key={k} className={`rounded-full ${k === i ? "h-2 w-2 bg-white" : "h-1.5 w-1.5 bg-white/55"}`} />)}</div>
        </>)}
        {onMap && <button aria-label="Ver en el mapa" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMap(l); }} className="glass-btn absolute bottom-3 right-3 h-11 w-11 md:h-9 md:w-9"><MapIcon size={19} /></button>}
      </div>
      <div className={`${compact ? "mt-2.5" : "mt-3"} space-y-1.5`}>
        <h3 className="truncate text-[17px] font-semibold text-white md:text-[15px]">{l.direccion}, {l.barrio}, {l.ciudad.split(" /")[0]}</h3>
        <p className="flex items-baseline gap-1.5">
          <span className="text-[26px] font-bold leading-none tracking-tight md:text-[22px]">{n0(l.precio)}</span>
          <span className="text-base font-semibold text-soft">€{alquiler && <span className="text-sm font-normal">/mes</span>}</span>
          {l.gastosComunidad && !compact && <span className="ml-1 text-xs text-muted">+ {n0(l.gastosComunidad)} € comunidad</span>}
        </p>
        <p className="flex flex-wrap items-center gap-x-3 text-[16px] text-soft md:text-[13px]">
          {l.habitaciones > 0 ? <span className="flex items-center gap-1.5"><BedDouble size={18} className="md:h-[14px] md:w-[14px]" />{l.habitaciones} hab</span> : <span className="capitalize">{l.tipo}</span>}
          {l.banos > 0 && <><span className="h-5 w-px bg-white/30 md:h-3.5" /><span className="flex items-center gap-1.5"><Bath size={18} className="md:h-[14px] md:w-[14px]" />{l.banos} {l.banos > 1 ? "baños" : "baño"}</span></>}
          <span className="h-5 w-px bg-white/30 md:h-3.5" /><span className="flex items-center gap-1.5"><Ruler size={18} className="md:h-[14px] md:w-[14px]" />{l.m2} m²</span>
        </p>
      </div>
    </Link>
  );
}
