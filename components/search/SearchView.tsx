"use client";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowDownUp, Bell, Camera, ChevronDown, Columns2, EyeOff, ImagePlus, KeyRound, LayoutList, List, Map as MapIcon, MapPin, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { saveLastSearch } from "../useLocal";
import type { Operacion, SearchFilters, SearchResult } from "@/lib/types";
import { conteoProvincias, filtersFromParams, filtersToParams, search } from "@/lib/search";
import { ciudadPorSlug } from "@/lib/geo";
import { PROVINCIAS, PROV_KEY, provinciaCercana, provinciaPorSlug } from "@/lib/provincias";
import PropertyCard from "../PropertyCard";
import FiltersDrawer from "./FiltersDrawer";
import AlertModal from "./AlertModal";
import IASheet, { type ResultadoIA } from "./IASheet";

const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-card" /> });
type Vista = "lista" | "dividida" | "mapa";
const ORDENES: [NonNullable<SearchFilters["orden"]>, string][] = [["recientes", "Más recientes"], ["relevancia", "Más relevantes"], ["precio_asc", "Más baratos"], ["precio_desc", "Más caros"], ["precio_m2", "Mejor €/m²"], ["m2_desc", "Más grandes"]];

export default function SearchView({ op }: { op: Operacion }) {
  const router = useRouter();
  const sp = useSearchParams();
  const initial = useMemo(() => search(filtersFromParams(new URLSearchParams(sp.toString()), op)), [sp, op]);
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
  const [iaModo, setIaModo] = useState<"foto" | "frase" | null>(null);
  const [ia, setIa] = useState<ResultadoIA | null>(null);
  const lista = ia ? ia.items : items;

  useEffect(() => { setRes(initial); setItems(initial.items); setQ(initial.filtros.q ?? ""); setIa(null); }, [initial]);
  useEffect(() => { const qq = sp.get("q"); if (qq) saveLastSearch(qq, `/buscar/${op}/?${sp.toString()}`); }, [sp, op]);

  // Provincia por defecto: la que elegiste la última vez o, si es la primera visita, la de tu ubicación
  const [ubicando, setUbicando] = useState(false);
  useEffect(() => {
    if (sp.get("provincia") || sp.get("ciudad") || sp.get("bbox")) return;
    let guardada: string | null = null;
    try { guardada = localStorage.getItem(PROV_KEY); } catch {}
    const aplicar = (slug: string) => { const p = new URLSearchParams(sp.toString()); p.set("provincia", slug); router.replace(`/buscar/${op}?${p.toString()}`, { scroll: false }); };
    if (guardada !== null) { if (guardada) aplicar(guardada); return; }
    if (!("geolocation" in navigator)) return;
    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUbicando(false); const pr = provinciaCercana(pos.coords.latitude, pos.coords.longitude); try { localStorage.setItem(PROV_KEY, pr?.slug ?? ""); } catch {} if (pr) aplicar(pr.slug); },
      () => { setUbicando(false); try { localStorage.setItem(PROV_KEY, ""); } catch {} },
      { timeout: 10000, maximumAge: 3600000 },
    );
  }, []); // eslint-disable-line
  const cuentaProv = useMemo(() => conteoProvincias(op), [op]);
  const elegirProvincia = (slug: string) => { try { localStorage.setItem(PROV_KEY, slug); } catch {} push({ ...urlBase(), provincia: slug || undefined, ciudad: undefined, barrio: undefined }); };

  const push = (f: Partial<SearchFilters>, o: Operacion = op) => start(() => router.push(`/buscar/${o}?${filtersToParams(f)}`, { scroll: false }));
  // Base = lo que hay en la URL (no lo interpretado), para no "congelar" la interpretación
  const urlBase = (): Partial<SearchFilters> => {
    const o: Partial<SearchFilters> = { q: sp.get("q") ?? "" };
    const n = (k: string) => (sp.get(k) ? Number(sp.get(k)) : undefined);
    o.provincia = sp.get("provincia") ?? undefined; o.ciudad = sp.get("ciudad") ?? undefined; o.barrio = sp.get("barrio") ?? undefined;
    o.tipos = sp.get("tipo")?.split(",") as SearchFilters["tipos"]; o.extras = sp.get("extras")?.split(",");
    o.precioMin = n("pmin"); o.precioMax = n("pmax"); o.m2Min = n("m2min"); o.habMin = n("hab"); o.banosMin = n("banos");
    o.soloParticulares = sp.get("part") === "1"; o.cercaPlayaKm = n("playa"); o.orden = (sp.get("orden") as SearchFilters["orden"]) ?? undefined;
    return o;
  };
  const nActivos = useMemo(() => { const b = urlBase(); return [b.tipos?.length, b.precioMin, b.precioMax, b.m2Min, b.habMin, b.banosMin, b.extras?.length, b.soloParticulares].filter(Boolean).length; }, [sp]); // eslint-disable-line

  const loadMore = () => {
    const p = new URLSearchParams(sp.toString()); p.set("page", String(res.page + 1));
    const r = search(filtersFromParams(p, op));
    setRes(r); setItems((prev) => [...prev, ...r.items]);
  };
  const onBounds = (bbox: [number, number, number, number]) => {
    const p = new URLSearchParams(sp.toString()); p.set("bbox", bbox.map((x) => x.toFixed(4)).join(",")); p.set("pp", "60");
    const r = search(filtersFromParams(p, op));
    setRes(r); setItems(r.items);
  };
  const ciudad = ciudadPorSlug(res.filtros.ciudad)?.nombre ?? provinciaPorSlug(res.filtros.provincia)?.nombre;
  const provSel = res.filtros.provincia ?? "";
  const SelectProv = ({ movil }: { movil?: boolean }) => (
    <label className={movil ? "relative flex shrink-0 items-center gap-2 rounded-full border border-[#3a3a3e] bg-[#1c1c1e] px-4 py-2.5 text-[15px] font-medium text-white" : "chip relative"}>
      <MapPin size={movil ? 18 : 12} className="text-[#34d399]" />{ubicando ? "Ubicando…" : provinciaPorSlug(provSel)?.nombre ?? "Toda España"}<ChevronDown size={movil ? 16 : 12} />
      <select aria-label="Provincia" value={provSel} onChange={(e) => elegirProvincia(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0">
        <option value="">Toda España</option>{PROVINCIAS.map((p) => <option key={p.slug} value={p.slug}>{p.nombre}{cuentaProv[p.slug] ? ` (${cuentaProv[p.slug].toLocaleString("es-ES")})` : ""}</option>)}
      </select>
    </label>
  );
  const submitQ = () => push({ ...urlBase(), q, tipos: undefined, extras: undefined, precioMax: undefined, precioMin: undefined, habMin: undefined, ciudad: undefined, barrio: undefined, m2Min: undefined, cercaPlayaKm: undefined });
  const playa = res.filtros.cercaPlayaKm;
  const quitarPlaya = () => { const nq = (sp.get("q") ?? "").replace(/\s*(?:a\s*)?(?:menos de\s*)?\d*[.,]?\d*\s*(?:km|m|metros|kilometros?)?\s*(?:cerca\s+)?(?:de\s+|en\s+)?(?:la\s+)?playa/gi, "").trim(); setQ(nq); push({ ...urlBase(), q: nq, cercaPlayaKm: undefined }); };
  const chipsIA = res.interpretacion.filter((c) => !c.startsWith("Playa"));
  const orden = res.filtros.orden ?? "recientes";

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-10 md:px-6">
      {/* Barra móvil (calcada a la app) */}
      <div className="sticky top-0 z-30 -mx-4 bg-bg px-4 pb-3 pt-4 md:hidden">
        <div className="flex gap-3">
          <form className="flex h-[60px] flex-1 items-center rounded-[22px] border border-[#cfcfd4] bg-[#141414] pl-5 pr-3" onSubmit={(e) => { e.preventDefault(); submitQ(); }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} enterKeyHint="search" placeholder="Describe lo que buscas" className="min-w-0 flex-1 bg-transparent text-[17px] text-white outline-none placeholder:text-muted" />
            {q ? <button type="button" onClick={() => { setQ(""); push({}); }} className="p-2 text-soft" aria-label="Borrar"><X size={20} /></button>
              : <button type="button" onClick={() => setIaModo("foto")} className="p-1.5 text-white" aria-label="Buscar por foto"><ImagePlus size={24} /></button>}
          </form>
          <button onClick={() => setDrawer(true)} aria-label="Filtros" className="relative grid h-[60px] w-[60px] place-items-center rounded-[18px] border border-[#3a3a3e] bg-[#1c1c1e] text-white">
            <SlidersHorizontal size={24} />{nActivos > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-[#34d399] text-[12px] font-bold text-[#052e22]">{nActivos}</span>}
          </button>
        </div>
        <div className="-mx-4 mt-3 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <button onClick={() => setAlerta(true)} className="flex shrink-0 items-center gap-2 rounded-full border border-[#3a3a3e] bg-[#1c1c1e] px-4 py-2.5 text-[15px] font-medium text-white"><Bell size={18} />Crear alerta</button>
          <button onClick={() => setIaModo("frase")} className="flex shrink-0 items-center gap-2 rounded-full border border-[#1f4a3c] bg-[#15241e] px-4 py-2.5 text-[15px] font-medium text-[#bdf2dc]"><Sparkles size={18} />Por parecido</button>
          {playa ? <span className="flex shrink-0 items-center gap-2 rounded-full border border-[#3a3a3e] bg-[#1c1c1e] py-2 pl-3 pr-2 text-[13px] font-semibold uppercase tracking-wide text-white"><MapPin size={18} className="text-[#34d399]" />Cerca de playa<span className="font-normal normal-case text-soft">≤ {playa < 1 ? `${Math.round(playa * 1000)} m` : `${playa.toLocaleString("es-ES")} km`}</span><button onClick={quitarPlaya} aria-label="Quitar" className="p-0.5 text-soft"><X size={17} /></button></span> : null}
          <SelectProv movil />
          <div className="relative shrink-0">
            <button onClick={() => setOpOpen((v) => !v)} className="flex items-center gap-2 rounded-full border border-[#3a3a3e] bg-[#1c1c1e] px-4 py-2.5 text-[15px] font-medium text-white"><KeyRound size={18} className="text-[#34d399]" />{op === "alquilar" ? "Alquiler" : "Venta"}</button>
          </div>
          {!hideAI && chipsIA.map((c) => <span key={c} className="flex shrink-0 items-center rounded-full border border-[#1f4a3c] bg-[#15241e] px-3.5 py-2.5 text-[14px] text-[#bdf2dc]">{c}</span>)}
        </div>
        {opOpen && <div className="absolute left-4 top-full z-20 -mt-1 w-40 rounded-2xl border border-line bg-[#232325] p-1.5 shadow-xl">{(["alquilar", "comprar"] as const).map((o) => <button key={o} onClick={() => { setOpOpen(false); push(urlBase(), o); }} className={`block w-full rounded-xl px-3 py-2.5 text-left text-[15px] ${o === op ? "text-white" : "text-soft"}`}>{o === "alquilar" ? "Alquiler" : "Venta"}</button>)}</div>}
        <p className="mt-2 text-[13px] text-muted">{res.total.toLocaleString("es-ES")} {res.total === 1 ? "inmueble" : "inmuebles"}{ciudad ? ` en ${res.filtros.barrio ? res.filtros.barrio + ", " : ""}${ciudad.split(" /")[0]}` : ""}{pending ? " · actualizando…" : ""}</p>
      </div>

      {/* Barra escritorio */}
      <div className="sticky top-16 z-30 -mx-6 hidden bg-bg/95 px-6 pb-3 pt-2 backdrop-blur md:block">
        <div className="flex gap-2">
          <form className="flex flex-1 items-center rounded-full border border-line bg-surface pl-4 pr-1.5" onSubmit={(e) => { e.preventDefault(); submitQ(); }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Refina esta búsqueda..." className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
            {q && <button type="button" onClick={() => { setQ(""); push({}); }} className="p-2 text-muted hover:text-white" aria-label="Borrar"><X size={16} /></button>}
            <button type="button" onClick={() => setIaModo("foto")} className="p-2 text-soft hover:text-white" aria-label="Buscar por foto"><Camera size={17} /></button>
          </form>
          <button onClick={() => setDrawer(true)} className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm text-soft hover:text-white">
            <SlidersHorizontal size={16} /> <span>Filtros</span>{nActivos > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-[11px] text-white">{nActivos}</span>}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={() => setAlerta(true)} className="inline-flex items-center gap-1.5 rounded-full bg-brand-grad px-3 py-1.5 text-xs font-medium"><Bell size={13} /> Crear alerta</button>
          <button onClick={() => setIaModo("frase")} className="chip border-brand/40 text-brand-400"><Sparkles size={12} />Por parecido</button>
          <SelectProv />
          <div className="relative">
            <button onClick={() => setOpOpen((v) => !v)} className="chip"><Sparkles size={12} />{op === "alquilar" ? "Alquiler" : "Venta"}<ChevronDown size={12} /></button>
          </div>
          {playa ? <span className="chip border-brand/40 text-brand-400"><MapPin size={12} />Cerca de playa ≤ {playa} km<button onClick={quitarPlaya} aria-label="Quitar"><X size={12} /></button></span> : null}
          {!hideAI && chipsIA.map((c) => <span key={c} className="chip border-brand/40 text-brand-400">{c}</span>)}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 mt-1 hidden flex-wrap items-center justify-between gap-3 text-sm md:flex">
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

      {ia && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#1f4a3c] bg-[#15241e] p-3">
          {ia.img ? <img src={ia.img} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <Sparkles size={22} className="ml-1 text-[#34d399]" />}
          <p className="flex-1 text-[14px] text-[#bdf2dc]"><b className="text-white">Los {ia.items.length} más parecidos</b> a {ia.etiqueta}, en {op === "alquilar" ? "alquiler" : "venta"}</p>
          <button onClick={() => setIa(null)} className="flex items-center gap-1 rounded-full border border-[#2c5e4c] px-3 py-1.5 text-[13px] text-white"><X size={14} />Quitar</button>
        </div>
      )}

      {!ia && res.total === 0 && (
        <div className="panel mx-auto max-w-lg p-8 text-center"><p className="font-serif text-2xl">Sin resultados por ahora</p><p className="mt-2 text-sm text-soft">Prueba a quitar algún filtro o crea una alerta y te avisamos cuando aparezca.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2"><button onClick={() => setAlerta(true)} className="btn-brand">Crear alerta</button>{provSel && <button onClick={() => elegirProvincia("")} className="btn-ghost">Ver toda España</button>}</div></div>
      )}

      {vista === "mapa" ? (
        <div className="h-[calc(100svh-260px)] min-h-[420px] md:h-[calc(100vh-230px)]"><MapView items={lista} hover={hover} onBounds={onBounds} /></div>
      ) : (
        <div className={vista === "dividida" ? "grid gap-6 lg:grid-cols-[1fr_minmax(380px,45%)]" : ""}>
          <div>
            <div className={`grid gap-x-5 gap-y-9 ${vista === "dividida" ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
              {lista.map((l) => <PropertyCard key={l.id} l={l} onHover={setHover} onMap={(x) => { setHover(x.id); setVista("mapa"); window.scrollTo({ top: 0 }); }} />)}
            </div>
            {!ia && res.page < res.pages && <div className="mt-10 text-center"><button onClick={loadMore} className="btn-ghost">Cargar más ({(res.total - items.length).toLocaleString("es-ES")} restantes)</button></div>}
          </div>
          {vista === "dividida" && <div className="sticky top-[150px] hidden h-[calc(100vh-170px)] lg:block"><MapView items={lista} hover={hover} onBounds={onBounds} /></div>}
        </div>
      )}

      {/* Botón flotante Mapa / Lista (móvil) */}
      <button onClick={() => { setVista((v) => (v === "mapa" ? "lista" : "mapa")); window.scrollTo({ top: 0 }); }} className="fixed bottom-[92px] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-5 py-3 text-[15px] font-semibold text-black shadow-[0_8px_30px_rgba(0,0,0,.5)] md:hidden">
        {vista === "mapa" ? <><List size={18} />Lista</> : <><MapIcon size={18} />Mapa</>}
      </button>

      {iaModo && <IASheet op={op} modo={iaModo} onClose={() => setIaModo(null)} onResult={(r) => { setIaModo(null); setIa(r); setVista((v) => (v === "mapa" ? "lista" : v)); window.scrollTo({ top: 0 }); }} />}
      {drawer && <FiltersDrawer base={urlBase()} op={op} onClose={() => setDrawer(false)} onApply={(f) => { setDrawer(false); push(f); }} />}
      {alerta && <AlertModal query={q || (ciudad ? `Pisos en ${ciudad}` : "Mi búsqueda")} params={`${op}?${sp.toString()}`} onClose={() => setAlerta(false)} />}
    </div>
  );
}
