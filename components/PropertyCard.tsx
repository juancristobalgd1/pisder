"use client";
import Link from "next/link";
import { useState } from "react";
import { Bath, BedDouble, ChevronLeft, ChevronRight, Heart, Images, Ruler } from "lucide-react";
import type { Listing } from "@/lib/types";
import { eur } from "@/lib/format";
import { useFavs } from "./useFavs";

export default function PropertyCard({ l, compact = false, onHover }: { l: Listing; compact?: boolean; onHover?: (id: string | null) => void }) {
  const [i, setI] = useState(0);
  const { isFav, toggle } = useFavs();
  const fav = isFav(l.id);
  const n = Math.min(l.fotos.length, 5);
  const go = (e: React.MouseEvent, d: number) => { e.preventDefault(); e.stopPropagation(); setI((v) => (v + d + n) % n); };
  const alquiler = l.operacion === "alquilar";
  return (
    <Link href={`/inmueble/${l.id}`} className="group block" onMouseEnter={() => onHover?.(l.id)} onMouseLeave={() => onHover?.(null)}>
      <div className={`relative overflow-hidden rounded-xl bg-card ${compact ? "aspect-[4/3]" : "aspect-[4/3]"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={l.fotos[i]} alt={`Foto de ${l.titulo}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
        <button aria-label={fav ? "Quitar de favoritos" : "Guardar en favoritos"} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(l.id); }}
          className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-black/45 backdrop-blur hover:bg-black/70">
          <Heart size={16} className={fav ? "fill-brand text-brand" : "text-white"} />
        </button>
        {l.destacada && <span className="absolute left-2.5 top-2.5 rounded-full bg-brand-grad px-2 py-0.5 text-[10px] font-semibold uppercase">Destacado</span>}
        {n > 1 && (<>
          <button onClick={(e) => go(e, -1)} aria-label="Foto anterior" className="absolute left-2 top-1/2 hidden h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-black group-hover:grid"><ChevronLeft size={16} /></button>
          <button onClick={(e) => go(e, 1)} aria-label="Foto siguiente" className="absolute right-2 top-1/2 hidden h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-black group-hover:grid"><ChevronRight size={16} /></button>
          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1">{Array.from({ length: n }).map((_, k) => <span key={k} className={`h-1.5 w-1.5 rounded-full ${k === i ? "bg-white" : "bg-white/45"}`} />)}</div>
        </>)}
        <span className="absolute bottom-2 right-2.5 grid h-7 w-7 place-items-center rounded-md bg-black/45 text-white" title={`${l.fotos.length} fotos`}><Images size={14} /></span>
      </div>
      <div className="mt-2.5 space-y-1">
        <h3 className="truncate text-[15px] font-medium text-white">{l.direccion}, {l.barrio}</h3>
        <p className="flex items-baseline gap-2">
          <span className="text-lg font-semibold">{eur(l.precio)}{alquiler && <span className="text-sm font-normal text-soft">/mes</span>}</span>
          {l.gastosComunidad && <span className="text-xs text-muted">+ {eur(l.gastosComunidad)} comunidad</span>}
        </p>
        <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-soft">
          {l.habitaciones > 0 ? <span className="flex items-center gap-1"><BedDouble size={14} />{l.habitaciones} hab</span> : <span className="capitalize">{l.tipo}</span>}
          {l.banos > 0 && <><span className="text-line">|</span><span className="flex items-center gap-1"><Bath size={14} />{l.banos} baño{l.banos > 1 ? "s" : ""}</span></>}
          <span className="text-line">|</span><span className="flex items-center gap-1"><Ruler size={14} />{l.m2} m²</span>
        </p>
        {!compact && l.fuentes.length > 1 && <p className="text-[11px] text-muted">En {l.fuentes.length} portales · mejor precio {eur(Math.min(...l.fuentes.map((f) => f.precio)))}</p>}
      </div>
    </Link>
  );
}
