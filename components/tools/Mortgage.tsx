"use client";
import { useState } from "react";
import { eur } from "@/lib/format";
import { cuota } from "@/lib/mortgage";

function F({ l, v, s, step = 1, suf }: { l: string; v: number; s: (n: number) => void; step?: number; suf: string }) {
  return <label className="block text-sm text-soft">{l}<div className="mt-1 flex items-center gap-2"><input className="input" type="number" step={step} value={v} onChange={(e) => s(Number(e.target.value))} /><span className="text-muted">{suf}</span></div></label>;
}
export default function Mortgage() {
  const [precio, setPrecio] = useState(250000);
  const [entrada, setEntrada] = useState(20);
  const [anios, setAnios] = useState(30);
  const [tipo, setTipo] = useState<"fijo" | "variable">("fijo");
  const [fijo, setFijo] = useState(2.8);
  const [euribor, setEuribor] = useState(2.2);
  const [dif, setDif] = useState(0.7);
  const [gastos, setGastos] = useState(10);
  const capital = precio * (1 - entrada / 100);
  const tae = tipo === "fijo" ? fijo : euribor + dif;
  const c = cuota(capital, tae, anios);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="panel space-y-4 p-6">
        <F l="Precio de la vivienda" v={precio} s={setPrecio} step={1000} suf="€" />
        <F l="Entrada" v={entrada} s={setEntrada} suf="%" />
        <F l="Plazo" v={anios} s={setAnios} suf="años" />
        <div className="flex gap-2">{(["fijo", "variable"] as const).map((t) => <button key={t} onClick={() => setTipo(t)} className={`chip ${tipo === t ? "border-brand bg-brand/15 text-white" : ""}`}>{t === "fijo" ? "Tipo fijo" : "Variable"}</button>)}</div>
        {tipo === "fijo" ? <F l="Tipo de interés" v={fijo} s={setFijo} step={0.05} suf="%" /> : <><F l="Euríbor (introduce el actual)" v={euribor} s={setEuribor} step={0.01} suf="%" /><F l="Diferencial" v={dif} s={setDif} step={0.05} suf="%" /></>}
        <F l="Impuestos y gastos de compra" v={gastos} s={setGastos} step={0.5} suf="%" />
      </div>
      <div className="panel p-6">
        <p className="text-sm text-soft">Cuota mensual</p><p className="mt-1 text-4xl font-semibold">{eur(Math.round(c))}</p>
        <dl className="mt-6 space-y-3 text-sm">
          {[["Importe del préstamo", eur(Math.round(capital))], ["Ahorro necesario (entrada + gastos)", eur(Math.round(precio * (entrada + gastos) / 100))], ["Intereses totales", eur(Math.round(c * anios * 12 - capital))], ["Coste total", eur(Math.round(c * anios * 12))], ["Ingresos netos recomendados (cuota ≤ 35%)", `${eur(Math.round(c / 0.35))}/mes`]].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-line pb-2"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>))}
        </dl>
        <p className="mt-4 text-xs text-muted">Simulación orientativa. Los gastos (ITP o IVA, notaría, registro) cambian según la comunidad autónoma.</p>
      </div>
    </div>
  );
}
