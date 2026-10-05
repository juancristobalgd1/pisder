"use client";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowDownUp, Bell, Camera, ChevronDown, Columns2, EyeOff, LayoutList, Map as MapIcon, SlidersHorizontal, Sparkles, X } from "lucide-react";
import type { Operacion, SearchFilters, SearchResult } from "@/lib/types";
import { filtersToParams } from "@/lib/search";
import { ciudadPorSlug } from "@/lib/geo";
import PropertyCard from "../PropertyCard";
import FiltersDrawer from "./FiltersDrawer";
import AlertModal from "./AlertModal";

const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-card" /> });
type Vista = "lista" | "dividida" | "mapa";
const ORDENES: [NonNullable<SearchFilters["orden"]>, string][] = [["recientes", "Más recientes"], ["relevancia", "Más relevantes"], ["precio_asc", "Más baratos"], ["precio_desc", "Más caros"], ["precio_m2", "Mejor €/m²"], ["m2_desc", "Más grandes"]];

export default function SearchView({ initial, op }: { initial: SearchResult; op: Operacion }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [res, setRes] = useState(initial);
  const [items, setItems] = useState(initial.items);
  const [q, setQ] = useState(initial.filtros.q ?? "");
  const [vista, setVista] = useState<Vista>("lista");
  const [hideAI, setHideAI] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [alerta, setAlerta] = useState(false);
  const [ordenOpen, setOrdenOpen] = useState(false);
  const [opOpen, setOpOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => { setRes(initial); setItems(initial.items); setQ(initial.filtros.q ?? ""); }, [initial]);

  const push = (f: Partial<SearchFilters>, o: Operacion = op) => start(() => router.push(`/buscar/${o}?${filtersToParams(f)}`, { scroll: false }));
  // Base = lo que hay en la URL (no lo interpretado), para no "congelar" la interpretación
  const urlBase = (): Partial<SearchFilters> => {
    const o: Partial<SearchFilters> = { q: sp.get("q") ?? "" };
    const n = (k: string) => (sp.get(k) ? Number(sp.get(k)) : undefined);
    o.ciudad = sp.get("ciudad") ?? undefined; o.barrio = sp.get("barrio") ?? undefined;
    o.tipos = sp.get("tipo")?.split(",") as SearchFilters["tipos"]; o.extras = sp.get("extras")?.split(",");
    o.precioMin = n("pmin"); o.precioMax = n("pmax"); o.m2Min = n("m2min"); o.habMin = n("hab"); o.banosMin = n("banos");
    o.soloParticulares = sp.get("part") === "1"; o.orden = (sp.get("orden") as SearchFilters["orden"]) ?? undefined;
    return o;
  };
  const nActivos = useMemo(() => { const b = urlBase(); return [b.tipos?.length, b.precioMin, b.precioMax, b.m2Min, b.habMin, b.banosMin, b.extras?.length, b.soloParticulares].filter(Boolean).length; }, [sp]); // eslint-disable-line

  const loadMore = async () => {
    const p = new URLSearchParams(sp.toString()); p.set("op", op); p.set("page", String(res.page + 1));
    const r: SearchResult = await fetch(`/api/search?${p}`).then((x) => x.json());
    setRes(r); setItems((prev) => [...prev, ...r.items]);
  };
  const onBounds = async (bbox: [number, number, number, number]) => {
    const p = new URLSearchParams(sp.toString()); p.set("op", op); p.set("bbox", bbox.map((x) => x.toFixed(4)).join(",")); p.set("pp", "60");
    const r: SearchResult = await fetch(`/api/search?${p}`).then((x) => x.json());
    setRes(r); setItems(r.items);
  };
  const ciudad = ciudadPorSlug(res.filtros.ciudad)?.nombre;
  const orden = res.filtros.orden ?? "recientes";

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-10 md:px-6">
      {/* Barra de búsqueda */}
      <div className="sticky top-16 z-30 -mx-4 bg-bg/95 px-4 pb-3 pt-2 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex gap-2">
          <form className="flex flex-1 items-center rounded-full border border-line bg-surface pl-4 pr-1.5" onSubmit={(e) => { e.preventDefault(); push({ ...urlBase(), q, tipos: undefined, extras: undefined, precioMax: undefined, precioMin: undefined, habMin: undefined, ciudad: undefined, barrio: undefined, m2Min: undefined }); }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Refina esta búsqueda..." className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
            {q && <button type="button" onClick={() => { setQ(""); push({}); }} className="p-2 text-muted hover:text-white" aria-label="Borrar"><X size={16} /></button>}
            <button type="button" className="p-2 text-soft hover:text-white" aria-label="Buscar por foto"><Camera size={17} /></button>
          </form>
          <button onClick={() => setDrawer(true)} className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm text-soft hover:text-white">
            <SlidersHorizontal size={16} /> <span className="hidden sm:inline">Filtros</span>{nActivos > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-[11px] text-white">{nActivos}</span>}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={() => setAlerta(true)} className="inline-flex items-center gap-1.5 rounded-full bg-brand-grad px-3 py-1.5 text-xs font-medium"><Bell size={13} /> Crear alerta</button>
          <div className="relative">
            <button onClick={() => setOpOpen((v) => !v)} className="chip"><Sparkles size={12} />{op === "alquilar" ? "Alquiler" : "Venta"}<ChevronDown size={12} /></button>
            {opOpen && <div className="panel absolute left-0 top-full z-20 mt-1 w-36 p-1 text-sm">{(["alquilar", "comprar"] as const).map((o) => <button key={o} onClick={() => { setOpOpen(false); push(urlBase(), o); }} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-card">{o === "alquilar" ? "Alquiler" : "Venta"}</button>)}</div>}
          </div>
          {!hideAI && res.interpretacion.map((c) => <span key={c} className="chip border-brand/40 text-brand-400">{c}</span>)}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 mt-1 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-4 text-soft">
          <span><b className="text-white">{res.total.toLocaleString("es-ES")}</b> {res.total === 1 ? "inmueble" : "inmuebles"} en {op === "alquilar" ? "alquiler" : "venta"}{ciudad ? ` en ${res.filtros.barrio ? res.filtros.barrio + ", " : ""}${ciudad}` : ""}</span>
          <button onClick={() => setHideAI((v) => !v)} className="flex items-center gap-1.5 hover:text-white"><EyeOff size={15} /> {hideAI ? "Mostrar IA" : "Ocultar IA"}</button>
          {pending && <span className="text-xs text-muted">Actualizando…</span>}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3">
            {([["lista", "Lista", LayoutList], ["dividida", "Dividida", Columns2], ["mapa", "Mapa", MapIcon]] as const).map(([v, t, I]) => (
              <button key={v} onClick={() => setVista(v)} className={`flex items-center gap-1.5 pb-1 ${vista === v ? "border-b-2 border-white text-white" : "text-muted hover:text-white"}`}><I size={15} />{t}</button>))}
          </div>
          <div className="relative">
            <button onClick={() => setOrdenOpen((v) => !v)} className="flex items-center gap-1.5 text-soft hover:text-white"><ArrowDownUp size={15} />{ORDENES.find(([k]) => k === orden)?.[1]}<ChevronDown size={14} /></button>
            {ordenOpen && <div className="panel absolute right-0 top-full z-20 mt-1 w-44 p-1">{ORDENES.map(([k, t]) => <button key={k} onClick={() => { setOrdenOpen(false); push({ ...urlBase(), orden: k }); }} className={`block w-full rounded-lg px-3 py-2 text-left hover:bg-card ${k === orden ? "text-brand-400" : ""}`}>{t}</button>)}</div>}
          </div>
        </div>
      </div>

      {res.total === 0 && (
        <div className="panel mx-auto max-w-lg p-8 text-center"><p className="font-serif text-2xl">Sin resultados por ahora</p><p className="mt-2 text-sm text-soft">Prueba a quitar algún filtro o crea una alerta y te avisamos cuando aparezca.</p>
          <button onClick={() => setAlerta(true)} className="btn-brand mt-5">Crear alerta</button></div>
      )}

      {vista === "mapa" ? (
        <div className="h-[calc(100vh-230px)] min-h-[420px]"><MapView items={items} hover={hover} onBounds={onBounds} /></div>
      ) : (
        <div className={vista === "dividida" ? "grid gap-6 lg:grid-cols-[1fr_minmax(380px,45%)]" : ""}>
          <div>
            <div className={`grid gap-x-5 gap-y-8 ${vista === "dividida" ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
              {items.map((l) => <PropertyCard key={l.id} l={l} onHover={setHover} />)}
            </div>
            {res.page < res.pages && <div className="mt-10 text-center"><button onClick={loadMore} className="btn-ghost">Cargar más ({(res.total - items.length).toLocaleString("es-ES")} restantes)</button></div>}
          </div>
          {vista === "dividida" && <div className="sticky top-[150px] hidden h-[calc(100vh-170px)] lg:block"><MapView items={items} hover={hover} onBounds={onBounds} /></div>}
        </div>
      )}

      {drawer && <FiltersDrawer base={urlBase()} op={op} onClose={() => setDrawer(false)} onApply={(f) => { setDrawer(false); push(f); }} />}
      {alerta && <AlertModal query={q || (ciudad ? `Pisos en ${ciudad}` : "Mi búsqueda")} params={`${op}?${sp.toString()}`} onClose={() => setAlerta(false)} />}
    </div>
  );
}
