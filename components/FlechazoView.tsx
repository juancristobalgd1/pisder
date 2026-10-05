"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bath, BedDouble, Heart, Info, MapPin, RotateCcw, Ruler, X } from "lucide-react";
import { allListings } from "@/lib/data";
import type { Listing, Operacion } from "@/lib/types";
import { useFavs } from "./useFavs";
import { useLocal } from "./useLocal";

const n0 = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const UMBRAL = 110;

// Barajado estable para que el mazo no cambie al recargar.
function barajar<T extends { id: string }>(xs: T[]) {
  const h = (s: string) => { let x = 2166136261; for (const c of s) x = Math.imul(x ^ c.charCodeAt(0), 16777619); return x >>> 0; };
  return [...xs].sort((a, b) => h(a.id) - h(b.id));
}

export default function FlechazoView() {
  const [op, setOp] = useLocal<Operacion>("pisoya:flechazo-op", "alquilar");
  const [ciudad, setCiudad] = useLocal<string>("pisoya:flechazo-ciudad", "");
  const [vistos, setVistos] = useLocal<string[]>("pisoya:flechazo-vistos", []);
  const [hist, setHist] = useState<{ id: string; like: boolean }[]>([]);
  const { isFav, toggle } = useFavs();
  const todos = useMemo(() => allListings(), []);
  const ciudades = useMemo(() => Array.from(new Set(todos.map((l) => l.ciudad))).sort(), [todos]);
  const mazo = useMemo(() => barajar(todos.filter((l) => l.operacion === op && (!ciudad || l.ciudad === ciudad) && !vistos.includes(l.id))), [todos, op, ciudad, vistos]);
  const top = mazo[0], next = mazo[1];
  const [dx, setDx] = useState(0), [dy, setDy] = useState(0), [saliendo, setSaliendo] = useState<0 | 1 | -1>(0), [foto, setFoto] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const movido = useRef(false);
  useEffect(() => { setFoto(0); setDx(0); setDy(0); setSaliendo(0); }, [top?.id]);

  const decidir = (like: boolean) => {
    if (!top || saliendo) return;
    setSaliendo(like ? 1 : -1);
    setTimeout(() => {
      if (like && !isFav(top.id)) toggle(top.id);
      setHist((h) => [{ id: top.id, like }, ...h].slice(0, 20));
      setVistos([...vistos, top.id]);
    }, 220);
  };
  const deshacer = () => {
    const u = hist[0]; if (!u) return;
    if (u.like && isFav(u.id)) toggle(u.id);
    setVistos(vistos.filter((x) => x !== u.id)); setHist((h) => h.slice(1));
  };
  const reiniciar = () => { setVistos([]); setHist([]); };
  const likes = hist.filter((h) => h.like).length;

  const onDown = (e: React.PointerEvent) => { start.current = { x: e.clientX, y: e.clientY }; movido.current = false; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); };
  const onMove = (e: React.PointerEvent) => { if (!start.current) return; const x = e.clientX - start.current.x, y = e.clientY - start.current.y; if (Math.abs(x) > 6) movido.current = true; setDx(x); setDy(y * 0.3); };
  const onUp = (e: React.PointerEvent) => {
    if (!start.current) return; start.current = null;
    if (dx > UMBRAL) return decidir(true);
    if (dx < -UMBRAL) return decidir(false);
    if (!movido.current && top) { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); const lado = e.clientX - r.left > r.width / 2 ? 1 : -1; setFoto((f) => (f + lado + top.fotos.length) % top.fotos.length); }
    setDx(0); setDy(0);
  };

  const tx = saliendo ? saliendo * 600 : dx;
  const rot = tx / 18;
  const like = Math.max(0, Math.min(1, tx / UMBRAL)), nope = Math.max(0, Math.min(1, -tx / UMBRAL));

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-4 pb-28 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-serif text-[26px] leading-none">Modo flechazo</h1>
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-soft"><Heart size={15} className="fill-[#ff4d8d] text-[#ff4d8d]" />{likes} hoy</span>
      </div>
      <div className="mb-4 flex gap-2">
        <div className="flex rounded-full border border-white/10 bg-white/5 p-1 text-sm">
          {(["alquilar", "comprar"] as Operacion[]).map((o) => (
            <button key={o} onClick={() => setOp(o)} className={`rounded-full px-3.5 py-1.5 capitalize ${op === o ? "pill-active font-semibold" : "text-soft"}`}>{o === "alquilar" ? "Alquilar" : "Comprar"}</button>
          ))}
        </div>
        <select value={ciudad} onChange={(e) => setCiudad(e.target.value)} aria-label="Ciudad" className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-3 text-sm text-white">
          <option value="">Toda España</option>
          {ciudades.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="relative flex-1" style={{ minHeight: 470 }}>
        {!top && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[28px] border border-white/10 bg-card p-8 text-center">
            <p className="mb-2 text-xl font-semibold">Has visto todos</p>
            <p className="mb-6 text-soft">Cambia de ciudad o vuelve a empezar el mazo.</p>
            <button onClick={reiniciar} className="rounded-full bg-brand-grad px-5 py-2.5 font-semibold">Empezar de nuevo</button>
          </div>
        )}
        {next && <Tarjeta l={next} foto={0} className="scale-[.95] opacity-70" />}
        {top && (
          <div className="absolute inset-0 touch-none select-none" style={{ transform: `translate(${tx}px, ${dy}px) rotate(${rot}deg)`, transition: start.current ? "none" : "transform .22s ease-out" }}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            <Tarjeta l={top} foto={foto} />
            <span className="pointer-events-none absolute left-5 top-6 -rotate-12 rounded-xl border-4 border-[#3ddc97] px-3 py-1 text-3xl font-black text-[#3ddc97]" style={{ opacity: like }}>ME GUSTA</span>
            <span className="pointer-events-none absolute right-5 top-6 rotate-12 rounded-xl border-4 border-[#ff5a6e] px-3 py-1 text-3xl font-black text-[#ff5a6e]" style={{ opacity: nope }}>PASO</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-center gap-5">
        <button onClick={deshacer} disabled={!hist.length} aria-label="Deshacer" className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-soft disabled:opacity-30"><RotateCcw size={20} /></button>
        <button onClick={() => decidir(false)} disabled={!top} aria-label="Paso" className="grid h-16 w-16 place-items-center rounded-full border-2 border-[#ff5a6e]/60 bg-[#ff5a6e]/10 text-[#ff5a6e] active:scale-95"><X size={30} strokeWidth={2.6} /></button>
        <button onClick={() => decidir(true)} disabled={!top} aria-label="Me gusta" className="grid h-16 w-16 place-items-center rounded-full border-2 border-[#3ddc97]/60 bg-[#3ddc97]/10 text-[#3ddc97] active:scale-95"><Heart size={28} strokeWidth={2.6} /></button>
        {top ? <Link href={`/inmueble/${top.id}/`} aria-label="Ver ficha" className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-soft"><Info size={20} /></Link> : <span className="h-12 w-12" />}
      </div>
      <p className="mt-3 text-center text-[13px] text-soft">Desliza a la derecha para guardar en <Link href="/favoritos/" className="underline">favoritos</Link>, a la izquierda para pasar.</p>
    </main>
  );
}

function Tarjeta({ l, foto, className = "" }: { l: Listing; foto: number; className?: string }) {
  const alq = l.operacion === "alquilar";
  return (
    <div className={`absolute inset-0 overflow-hidden rounded-[28px] bg-card shadow-[0_20px_60px_rgba(0,0,0,.55)] ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={l.fotos[foto]} alt={`Foto de ${l.titulo}`} draggable={false} className="h-full w-full object-cover" />
      <div className="absolute inset-x-3 top-3 flex gap-1">
        {l.fotos.slice(0, 6).map((_, i) => <span key={i} className={`h-1 flex-1 rounded-full ${i === foto ? "bg-white" : "bg-white/35"}`} />)}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5 pt-24">
        <div className="mb-1 flex items-baseline gap-1">
          <span className="text-[30px] font-bold leading-none tracking-tight">{n0(l.precio)}</span>
          <span className="text-base font-semibold">€{alq ? "/mes" : ""}</span>
        </div>
        <p className="mb-2 flex items-center gap-1 text-[15px] text-white/85"><MapPin size={15} />{l.barrio}, {l.ciudad}</p>
        <div className="flex gap-4 text-sm text-white/80">
          <span className="flex items-center gap-1"><BedDouble size={16} />{l.habitaciones} hab.</span>
          <span className="flex items-center gap-1"><Bath size={16} />{l.banos} baños</span>
          <span className="flex items-center gap-1"><Ruler size={16} />{l.m2} m²</span>
        </div>
      </div>
    </div>
  );
}
