"use client";
import { useState } from "react";
import { Bell, X } from "lucide-react";

export default function AlertModal({ query, params, onClose }: { query: string; params: string; onClose: () => void }) {
  const [canal, setCanal] = useState<"whatsapp" | "email">("whatsapp");
  const [valor, setValor] = useState("");
  const [estado, setEstado] = useState<"idle" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const enviar = async () => {
    const r = await fetch("/api/alerts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query, params, [canal]: valor }) });
    const j = await r.json();
    if (r.ok) { setEstado("ok"); setMsg(`Alerta creada. Caduca el ${new Date(j.expira).toLocaleDateString("es-ES")}; podrás renovarla.`); } else { setEstado("error"); setMsg(j.error); }
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="panel w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between"><div className="flex items-center gap-2"><Bell size={18} className="text-brand-400" /><p className="font-medium">Crear alerta instantánea</p></div><button onClick={onClose} aria-label="Cerrar"><X size={18} /></button></div>
        <p className="mt-2 text-sm text-soft">Te avisamos en cuanto aparezca un anuncio nuevo para «{query}».</p>
        <div className="mt-5 flex rounded-full border border-line bg-card p-0.5 text-sm">
          {(["whatsapp", "email"] as const).map((c) => <button key={c} onClick={() => setCanal(c)} className={`flex-1 rounded-full py-1.5 ${canal === c ? "bg-brand-grad" : "text-muted"}`}>{c === "whatsapp" ? "WhatsApp" : "Email"}</button>)}
        </div>
        <input className="input mt-3" value={valor} onChange={(e) => setValor(e.target.value)} placeholder={canal === "whatsapp" ? "+34 600 000 000" : "tu@email.com"} />
        {estado !== "idle" && <p className={`mt-3 text-sm ${estado === "ok" ? "text-green-400" : "text-red-400"}`}>{msg}</p>}
        <button onClick={enviar} disabled={!valor} className="btn-brand mt-5 w-full disabled:opacity-50">Activar alerta</button>
      </div>
    </div>
  );
}
