"use client";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, ShieldCheck, Sparkles, X } from "lucide-react";
import type { Listing, Operacion } from "@/lib/types";

export type ResultadoIA = { items: Listing[]; etiqueta: string; img?: string };
const EJEMPLOS = ["luminoso con cocina abierta", "estilo nórdico, mucha madera", "vistas al mar desde el salón", "reformado, suelos de microcemento"];

export default function IASheet({ op, modo, onClose, onResult }: { op: Operacion; modo: "foto" | "frase"; onClose: () => void; onResult: (r: ResultadoIA) => void }) {
  const [frase, setFrase] = useState("");
  const [pct, setPct] = useState<number | null>(null);
  const [error, setError] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const yaCargado = typeof window !== "undefined" && localStorage.getItem("pisoya:ia-modelo") === "1";

  const correr = async (fn: () => Promise<Listing[]>, etiqueta: string, img?: string) => {
    setError(""); setPct(0);
    try {
      const items = await fn();
      localStorage.setItem("pisoya:ia-modelo", "1");
      onResult({ items, etiqueta, img });
    } catch (e) {
      console.error(e); setPct(null);
      setError("No hemos podido preparar la búsqueda con IA en este navegador. Prueba con Chrome o Safari actualizados.");
    }
  };
  const porFrase = async (t = frase) => { if (!t.trim()) return; const { buscarPorFrase } = await import("@/lib/ia"); correr(() => buscarPorFrase(t, op, setPct), `“${t.trim()}”`); };
  const porFoto = async (f?: File) => { if (!f) return; const { buscarPorFoto } = await import("@/lib/ia"); correr(() => buscarPorFoto(f, op, setPct), "tu foto", URL.createObjectURL(f)); };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-[28px] border border-line bg-[#18181a] p-5 pb-8 md:rounded-[28px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[19px] font-semibold"><Sparkles size={20} className="text-[#34d399]" />Busca por parecido</p>
          <button onClick={onClose} aria-label="Cerrar" className="p-1 text-soft"><X size={22} /></button>
        </div>
        <p className="mt-1 text-[14px] text-soft">Sube una foto de un piso que te guste o describe el ambiente que buscas.</p>

        {pct !== null ? (
          <div className="mt-6">
            <p className="flex items-center gap-2 text-[15px]"><Loader2 size={18} className="animate-spin text-[#34d399]" />{pct < 100 ? (yaCargado ? "Preparando la IA…" : `Descargando la IA… ${pct}%`) : "Buscando parecidos…"}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#2a2a2d]"><div className="h-full rounded-full bg-[#34d399] transition-all" style={{ width: `${pct}%` }} /></div>
          </div>
        ) : (
          <>
            <button onClick={() => file.current?.click()} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-6 text-[16px] font-medium ${modo === "foto" ? "border-[#34d399] text-white" : "border-[#3a3a3e] text-soft"}`}>
              <ImagePlus size={22} />Subir una foto
            </button>
            <input ref={file} type="file" accept="image/*" hidden onChange={(e) => porFoto(e.target.files?.[0])} />
            <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); porFrase(); }}>
              <input autoFocus={modo === "frase"} value={frase} onChange={(e) => setFrase(e.target.value)} placeholder="O descríbelo: luminoso, cocina abierta…" className="h-12 min-w-0 flex-1 rounded-2xl border border-[#3a3a3e] bg-[#141414] px-4 text-[15px] outline-none placeholder:text-muted" />
              <button className="rounded-2xl bg-[#34d399] px-4 text-[15px] font-semibold text-[#052e22]">Buscar</button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">{EJEMPLOS.map((t) => <button key={t} onClick={() => { setFrase(t); porFrase(t); }} className="rounded-full border border-[#3a3a3e] px-3 py-1.5 text-[13px] text-soft">{t}</button>)}</div>
          </>
        )}
        {error && <p className="mt-4 text-[14px] text-orange-300">{error}</p>}
        <p className="mt-5 flex items-start gap-2 text-[12px] leading-snug text-muted"><ShieldCheck size={15} className="mt-px shrink-0" />
          {yaCargado ? "Todo se calcula en tu dispositivo: tu foto no sale de él." : "Todo se calcula en tu dispositivo: tu foto no sale de él. La primera vez se descarga el modelo (≈210 MB con frase, ≈320 MB con foto) y luego queda guardado."}</p>
      </div>
    </div>
  );
}
