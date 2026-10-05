"use client";
import { useState } from "react";
import { X } from "lucide-react";
import type { Operacion, SearchFilters, Tipo } from "@/lib/types";
import { CIUDADES } from "@/lib/geo";
import { EXTRAS_ALL, extraLabel, tipoLabel } from "@/lib/data";

const TIPOS: Tipo[] = ["piso", "atico", "estudio", "duplex", "casa", "chalet", "habitacion", "local", "oficina", "garaje", "terreno"];

export default function FiltersDrawer({ base, op, onClose, onApply }: { base: Partial<SearchFilters>; op: Operacion; onClose: () => void; onApply: (f: Partial<SearchFilters>) => void }) {
  const [f, setF] = useState<Partial<SearchFilters>>(base);
  const set = (p: Partial<SearchFilters>) => setF((x) => ({ ...x, ...p }));
  const toggle = <T,>(arr: T[] | undefined, v: T) => (arr?.includes(v) ? arr.filter((x) => x !== v) : [...(arr ?? []), v]);
  const ciudad = CIUDADES.find((c) => c.slug === f.ciudad);
  const Num = ({ k, ph }: { k: keyof SearchFilters; ph: string }) => (
    <input inputMode="numeric" className="input" placeholder={ph} value={(f[k] as number | undefined) ?? ""} onChange={(e) => set({ [k]: e.target.value ? Number(e.target.value.replace(/\D/g, "")) : undefined } as Partial<SearchFilters>)} />
  );
  const Pills = ({ k, opts }: { k: "habMin" | "banosMin"; opts: number[] }) => (
    <div className="flex gap-2">{[undefined, ...opts].map((v) => <button key={String(v)} onClick={() => set({ [k]: v })} className={`chip ${f[k] === v ? "border-brand bg-brand/15 text-white" : ""}`}>{v ? `${v}+` : "Todas"}</button>)}</div>
  );
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <aside className="flex h-full w-full max-w-md flex-col bg-surface" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4"><p className="font-medium">Filtros</p><button onClick={onClose} aria-label="Cerrar"><X size={18} /></button></div>
        <div className="flex-1 space-y-7 overflow-y-auto px-5 py-5 text-sm">
          <section className="md:hidden"><p className="mb-2 text-soft">Ordenar por</p>
            <select className="input" value={f.orden ?? "recientes"} onChange={(e) => set({ orden: e.target.value as SearchFilters["orden"] })}>
              {[["recientes", "Más recientes"], ["relevancia", "Más relevantes"], ["precio_asc", "Más baratos"], ["precio_desc", "Más caros"], ["precio_m2", "Mejor €/m²"], ["m2_desc", "Más grandes"]].map(([k, t]) => <option key={k} value={k}>{t}</option>)}
            </select></section>
          <section><p className="mb-2 text-soft">Cerca de la playa</p>
            <div className="flex flex-wrap gap-2">{[undefined, 0.3, 0.5, 1, 2].map((v) => <button key={String(v)} onClick={() => set({ cercaPlayaKm: v })} className={`chip ${f.cercaPlayaKm === v ? "border-brand bg-brand/15 text-white" : ""}`}>{v === undefined ? "Indiferente" : v < 1 ? `≤ ${v * 1000} m` : `≤ ${v} km`}</button>)}</div></section>
          <section><p className="mb-2 text-soft">Ubicación</p>
            <select className="input" value={f.ciudad ?? ""} onChange={(e) => set({ ciudad: e.target.value || undefined, barrio: undefined })}>
              <option value="">Toda España</option>{CIUDADES.map((c) => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}</select>
            {ciudad && <select className="input mt-2" value={f.barrio ?? ""} onChange={(e) => set({ barrio: e.target.value || undefined })}>
              <option value="">Todos los barrios</option>{ciudad.barrios.map((b) => <option key={b.slug} value={b.nombre}>{b.nombre}</option>)}</select>}</section>
          <section><p className="mb-2 text-soft">Tipo de inmueble</p>
            <div className="flex flex-wrap gap-2">{TIPOS.map((t) => <button key={t} onClick={() => set({ tipos: toggle(f.tipos, t) })} className={`chip ${f.tipos?.includes(t) ? "border-brand bg-brand/15 text-white" : ""}`}>{tipoLabel(t)}</button>)}</div></section>
          <section><p className="mb-2 text-soft">Precio {op === "alquilar" ? "(€/mes)" : "(€)"}</p><div className="flex gap-2"><Num k="precioMin" ph="Mín." /><Num k="precioMax" ph="Máx." /></div></section>
          <section><p className="mb-2 text-soft">Superficie (m²)</p><div className="flex gap-2"><Num k="m2Min" ph="Mín." /><Num k="m2Max" ph="Máx." /></div></section>
          <section><p className="mb-2 text-soft">Habitaciones</p><Pills k="habMin" opts={[1, 2, 3, 4]} /></section>
          <section><p className="mb-2 text-soft">Baños</p><Pills k="banosMin" opts={[1, 2, 3]} /></section>
          <section><p className="mb-2 text-soft">Características</p>
            <div className="flex flex-wrap gap-2">{EXTRAS_ALL.map((e) => <button key={e} onClick={() => set({ extras: toggle(f.extras, e) })} className={`chip ${f.extras?.includes(e) ? "border-brand bg-brand/15 text-white" : ""}`}>{extraLabel(e)}</button>)}</div></section>
          <label className="flex items-center gap-3"><input type="checkbox" checked={!!f.soloParticulares} onChange={(e) => set({ soloParticulares: e.target.checked })} className="h-4 w-4 accent-[#b46ef0]" /> Solo particulares (sin agencia)</label>
        </div>
        <div className="flex gap-3 border-t border-line px-5 py-4">
          <button onClick={() => setF({ q: base.q })} className="btn-ghost flex-1">Limpiar</button>
          <button onClick={() => onApply(f)} className="btn-brand flex-1">Ver resultados</button>
        </div>
      </aside>
    </div>
  );
}
