"use client";
import { useState } from "react";
import { eur } from "@/lib/format";

// El % se introduce a mano (dato del INE o pactado). No inventamos valores oficiales.
export default function RentUpdate() {
  const [renta, setRenta] = useState(950);
  const [indice, setIndice] = useState<"ipc" | "irav" | "pactado">("irav");
  const [pct, setPct] = useState<string>("");
  const p = Number(pct.replace(",", "."));
  const valido = pct !== "" && !Number.isNaN(p);
  const nueva = valido ? renta * (1 + p / 100) : null;
  return (
    <div className="panel space-y-5 p-6">
      <label className="block text-sm text-soft">Renta mensual actual (€)<input className="input mt-1" inputMode="decimal" value={renta} onChange={(e) => setRenta(Number(e.target.value) || 0)} /></label>
      <div><p className="text-sm text-soft">Índice del contrato</p>
        <div className="mt-2 flex flex-wrap gap-2">{([["irav", "IRAV (INE)"], ["ipc", "IPC interanual"], ["pactado", "% pactado"]] as const).map(([k, t]) => <button key={k} onClick={() => setIndice(k)} className={`chip ${indice === k ? "border-brand bg-brand/15 text-white" : ""}`}>{t}</button>)}</div></div>
      <label className="block text-sm text-soft">Variación a aplicar (%)<input className="input mt-1" inputMode="decimal" placeholder="Ej.: 2,2" value={pct} onChange={(e) => setPct(e.target.value)} />
        <span className="mt-1 block text-xs text-muted">{indice === "pactado" ? "El porcentaje que fija tu contrato." : <>Consulta el último dato publicado en <a className="underline" href="https://www.ine.es" target="_blank" rel="noopener">ine.es</a> para el mes anterior a la fecha de actualización.</>}</span></label>
      {nueva !== null && (
        <div className="rounded-xl border border-line bg-card p-5">
          <p className="text-sm text-soft">Nueva renta</p><p className="mt-1 text-3xl font-semibold">{eur(Math.round(nueva * 100) / 100)}<span className="text-base font-normal text-soft">/mes</span></p>
          <p className="mt-2 text-sm text-muted">{p >= 0 ? "Sube" : "Baja"} {eur(Math.abs(Math.round((nueva - renta) * 100) / 100))} al mes ({eur(Math.abs(Math.round((nueva - renta) * 12)))} al año).</p>
        </div>)}
      <p className="text-xs text-muted">Orientativo. Lo que manda es tu contrato y la normativa vigente.</p>
    </div>
  );
}
