"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowUp, Camera, ChevronRight } from "lucide-react";

const POPULARES = {
  alquilar: ["Pisos hasta 1.200 € en Madrid", "Estudio en Ruzafa", "Ático con terraza en Gràcia"],
  comprar: ["Piso 3 habitaciones en Bilbao hasta 350k", "Chalet con piscina en Málaga", "Piso en Donostia con ascensor"],
};

export default function HeroSearch() {
  const [op, setOp] = useState<"alquilar" | "comprar">("alquilar");
  const [q, setQ] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const go = (text = q) => router.push(`/buscar/${op}${text.trim() ? `?q=${encodeURIComponent(text.trim())}` : ""}`);
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="panel p-3 shadow-[0_0_80px_rgba(168,85,247,.08)]">
        <textarea value={q} onChange={(e) => setQ(e.target.value)} rows={2}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(); } }}
          placeholder="Describe lo que buscas: zona, habitaciones, precio o sube una foto"
          className="w-full resize-none bg-transparent px-2 pt-1 text-[15px] text-white outline-none placeholder:text-muted" />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex rounded-full border border-line bg-card p-0.5 text-xs">
            {(["alquilar", "comprar"] as const).map((o) => (
              <button key={o} onClick={() => setOp(o)} className={`rounded-full px-3 py-1 capitalize transition ${op === o ? "bg-brand-grad text-white" : "text-muted hover:text-white"}`}>
                {o === "alquilar" ? "Alquilar" : "Comprar"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input ref={file} type="file" accept="image/*" hidden onChange={() => router.push(`/buscar/${op}?q=${encodeURIComponent("piso luminoso con estilo similar a mi foto")}&img=1`)} />
            <button onClick={() => file.current?.click()} aria-label="Buscar por foto" className="grid h-8 w-8 place-items-center rounded-full text-soft hover:text-white"><Camera size={17} /></button>
            <button onClick={() => go()} aria-label="Buscar" className="grid h-8 w-8 place-items-center rounded-full bg-white text-black disabled:opacity-40" disabled={!q.trim()}><ArrowUp size={16} /></button>
          </div>
        </div>
      </div>
      <p className="eyebrow mt-6 text-center">Búsquedas populares</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {POPULARES[op].map((p) => <button key={p} onClick={() => go(p)} className="chip">{p}<ChevronRight size={13} /></button>)}
      </div>
    </div>
  );
}
