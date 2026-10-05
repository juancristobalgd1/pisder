"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, ImagePlus, RotateCcw, Search, X, Check } from "lucide-react";
import { saveLastSearch, useLocal } from "./useLocal";

const POPULARES = {
  alquilar: ["Pisos hasta 1.200 € en Madrid", "Estudio en Ruzafa", "Ático con terraza en Gràcia"],
  comprar: ["Casa con piscina cerca de la playa", "Piso 3 habitaciones en Bilbao hasta 350k", "Piso en Donostia con ascensor"],
};
const PAISES = [["🇵🇹", "Portugal"], ["🇫🇷", "Francia"], ["🇲🇽", "México"], ["🇦🇷", "Argentina"]] as const;

export default function HeroSearch() {
  const [op, setOp] = useState<"alquilar" | "comprar">("alquilar");
  const [opOpen, setOpOpen] = useState(false);
  const [q, setQ] = useState("");
  const [ultima, setUltima] = useState<{ q: string; url: string } | null>(null);
  const [voto, setVoto] = useLocal<string | null>("pisoya:voto", null);
  const [avisoCerrado, setAvisoCerrado] = useLocal<boolean>("pisoya:aviso-cerrado", false);
  const file = useRef<HTMLInputElement>(null);
  const router = useRouter();
  useEffect(() => { try { setUltima(JSON.parse(localStorage.getItem("pisoya:ultima") || "null")); } catch {} }, []);
  const go = (text = q) => {
    const url = `/buscar/${op}/${text.trim() ? `?q=${encodeURIComponent(text.trim())}` : ""}`;
    if (text.trim()) saveLastSearch(text.trim(), url);
    router.push(url);
  };
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-[28px] border border-white/5 bg-[#1c1c1e]/95 p-5 shadow-[0_0_60px_rgba(150,70,255,.35)]">
        <textarea value={q} onChange={(e) => setQ(e.target.value)} rows={3} enterKeyHint="search"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(); } }}
          placeholder="Describe lo que buscas: zona, habitaciones, precio o sube imágenes.."
          className="w-full resize-none overflow-hidden bg-transparent text-[17px] leading-relaxed text-white outline-none placeholder:text-[#9a9aa0]" />
        <div className="mt-3 flex items-center justify-between">
          <div className="relative">
            <button onClick={() => setOpOpen((v) => !v)} className="flex items-center gap-2 rounded-full bg-[#2a2a2c] px-4 py-2 text-[15px] font-medium text-white">
              <Search size={18} />{op === "alquilar" ? "Alquilar" : "Comprar"}<ChevronDown size={17} />
            </button>
            {opOpen && <div className="absolute left-0 top-full z-20 mt-2 w-40 rounded-2xl border border-line bg-[#232325] p-1.5 shadow-xl">
              {(["alquilar", "comprar"] as const).map((o) => <button key={o} onClick={() => { setOp(o); setOpOpen(false); }} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[15px] ${op === o ? "text-white" : "text-soft"} hover:bg-white/5`}>{o === "alquilar" ? "Alquilar" : "Comprar"}{op === o && <Check size={16} />}</button>)}
            </div>}
          </div>
          <input ref={file} type="file" accept="image/*" hidden onChange={() => go("piso luminoso con estilo similar a mi foto")} />
          {q.trim() ? <button onClick={() => go()} aria-label="Buscar" className="grid h-10 w-10 place-items-center rounded-full bg-white text-black"><Search size={18} /></button>
            : <button onClick={() => file.current?.click()} aria-label="Buscar con una foto" className="grid h-10 w-10 place-items-center text-white"><ImagePlus size={24} /></button>}
        </div>
      </div>

      {ultima && (
        <Link href={ultima.url} className="mt-4 flex items-center gap-4 rounded-[24px] border border-[#3a2a55] bg-gradient-to-r from-[#1f1a2b] to-[#2a2140] px-4 py-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#3b2a5c] text-white"><RotateCcw size={20} /></span>
          <span className="min-w-0 flex-1"><span className="block text-[12px] font-medium uppercase tracking-[0.1em] text-[#b9a8d6]">Continuar búsqueda</span><span className="block truncate text-[17px] font-medium text-white">{ultima.q}</span></span>
          <ChevronRight size={22} className="text-white" />
        </Link>
      )}

      {!avisoCerrado && (
        <div className="mt-4 rounded-[24px] border border-white/10 bg-[#141414]/90 px-4 py-3 text-center">
          <p className="text-[15px] text-soft">Por ahora solo en 🇪🇸. Pronto, más países</p>
          {voto ? (
            <p className="mt-2 flex items-center justify-center gap-2 text-[15px] font-medium text-white"><Check size={17} />Gracias, sumamos tu voto por {voto}<button aria-label="Cerrar" onClick={() => setAvisoCerrado(true)} className="ml-3 text-soft"><X size={18} /></button></p>
          ) : (
            <div className="mt-2 flex items-center justify-center gap-2"><span className="text-[13px] text-muted">Vota:</span>{PAISES.map(([f, n]) => <button key={n} title={n} aria-label={`Votar por ${n}`} onClick={() => setVoto(f)} className="rounded-full bg-white/5 px-2.5 py-1 text-lg hover:bg-white/10">{f}</button>)}</div>
          )}
        </div>
      )}

      <div className="mt-6 hidden md:block">
        <p className="eyebrow text-center">Búsquedas populares</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">{POPULARES[op].map((p) => <button key={p} onClick={() => go(p)} className="chip">{p}<ChevronRight size={13} /></button>)}</div>
      </div>
    </div>
  );
}
