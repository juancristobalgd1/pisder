"use client";
import { useState } from "react";
import { CIUDADES } from "@/lib/geo";
import { riesgoEstafa } from "@/lib/scam";
export default function ScamCheck() {
  const [f, setF] = useState({ ciudad: "Madrid", operacion: "alquilar" as "alquilar" | "comprar", precio: 600, m2: 70, fotos: 6, particular: true, verificado: false, descripcion: "" });
  const [res, setRes] = useState<ReturnType<typeof riesgoEstafa> | null>(null);
  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));
  return (
    <div className="panel space-y-4 p-6 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-soft">Ciudad<select className="input mt-1" value={f.ciudad} onChange={(e) => set({ ciudad: e.target.value })}>{CIUDADES.map((c) => <option key={c.slug}>{c.nombre}</option>)}</select></label>
        <label className="text-soft">Operación<select className="input mt-1" value={f.operacion} onChange={(e) => set({ operacion: e.target.value as "alquilar" | "comprar" })}><option value="alquilar">Alquiler</option><option value="comprar">Venta</option></select></label>
        <label className="text-soft">Precio (€)<input className="input mt-1" type="number" value={f.precio} onChange={(e) => set({ precio: +e.target.value })} /></label>
        <label className="text-soft">Superficie (m²)<input className="input mt-1" type="number" value={f.m2} onChange={(e) => set({ m2: +e.target.value })} /></label>
        <label className="text-soft">Nº de fotos<input className="input mt-1" type="number" value={f.fotos} onChange={(e) => set({ fotos: +e.target.value })} /></label>
        <div className="flex flex-col justify-end gap-2 text-soft">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.particular} onChange={(e) => set({ particular: e.target.checked })} className="accent-[#2fd3a0]" />Lo anuncia un particular</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.verificado} onChange={(e) => set({ verificado: e.target.checked })} className="accent-[#2fd3a0]" />Identidad verificada</label></div>
      </div>
      <label className="block text-soft">Texto del anuncio o de los mensajes<textarea className="input mt-1 h-28" value={f.descripcion} onChange={(e) => set({ descripcion: e.target.value })} placeholder="Pega aquí la descripción o lo que te ha escrito el anunciante" /></label>
      <button className="btn-brand" onClick={() => setRes(riesgoEstafa({ precio: f.precio, m2: f.m2, ciudad: f.ciudad, operacion: f.operacion, fotos: Array(Math.max(0, f.fotos)).fill(""), descripcion: f.descripcion, anunciante: { tipo: f.particular ? "particular" : "agencia", nombre: "", telefono: "", verificado: f.verificado } }))}>Analizar</button>
      {res && <div className={`rounded-xl border p-4 ${res.nivel === "alto" ? "border-red-500/50" : res.nivel === "medio" ? "border-yellow-500/50" : "border-green-500/50"}`}>
        <p className="font-medium">Riesgo {res.nivel} ({res.riesgo}/100)</p><ul className="mt-2 list-disc space-y-1 pl-5 text-soft">{res.motivos.map((m) => <li key={m}>{m}</li>)}</ul></div>}
    </div>
  );
}
