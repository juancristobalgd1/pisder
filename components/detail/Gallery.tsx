"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
export default function Gallery({ fotos, titulo }: { fotos: string[]; titulo: string }) {
  const [open, setOpen] = useState<number | null>(null);
  return (<>
    <div className="grid h-[300px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl md:h-[440px]">
      {fotos.slice(0, 5).map((f, i) => (
        <button key={f} onClick={() => setOpen(i)} className={`relative overflow-hidden bg-card ${i === 0 ? "col-span-4 row-span-2 md:col-span-2" : "hidden md:block"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f} alt={`${titulo}, foto ${i + 1}`} className="h-full w-full object-cover transition hover:brightness-110" />
          {i === 4 && fotos.length > 5 && <span className="absolute inset-0 grid place-items-center bg-black/55 text-sm">+{fotos.length - 5} fotos</span>}
        </button>))}
    </div>
    <button onClick={() => setOpen(0)} className="btn-ghost mt-3 inline-flex items-center gap-2 text-xs"><Images size={14} />Ver las {fotos.length} fotos</button>
    {open !== null && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95" onClick={() => setOpen(null)}>
        <button className="absolute right-4 top-4 text-white" aria-label="Cerrar"><X /></button>
        <button className="absolute left-4 text-white" aria-label="Anterior" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + fotos.length) % fotos.length); }}><ChevronLeft size={32} /></button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fotos[open]} alt="" className="max-h-[85vh] max-w-[90vw] rounded-lg" onClick={(e) => e.stopPropagation()} />
        <button className="absolute right-4 text-white" aria-label="Siguiente" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % fotos.length); }}><ChevronRight size={32} /></button>
        <span className="absolute bottom-4 text-sm text-soft">{open + 1} / {fotos.length}</span>
      </div>)}
  </>);
}
