"use client";
import { useState } from "react";
import { Bell, X } from "lucide-react";
import { activar } from "@/lib/alertas";

export default function AlertModal({ query, params, onClose }: { query: string; params: string; onClose: () => void }) {
  const [estado, setEstado] = useState<"idle" | "cargando" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const enviar = async () => {
    setEstado("cargando");
    const r = await activar(query, params);
    setEstado(r.ok ? "ok" : "error"); setMsg(r.msg);
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="panel w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between"><div className="flex items-center gap-2"><Bell size={18} className="text-brand-400" /><p className="font-medium">Crear alerta instantánea</p></div><button onClick={onClose} aria-label="Cerrar"><X size={18} /></button></div>
        <p className="mt-2 text-sm text-soft">Te avisamos con una notificación en este móvil en cuanto aparezca un piso nuevo para «{query}».</p>
        <div className="mt-5 flex rounded-full border border-line bg-card p-0.5 text-sm">
          <span className="flex-1 rounded-full bg-brand-grad py-1.5 text-center">Notificación</span>
          <span className="flex-1 py-1.5 text-center text-muted" title="Muy pronto">WhatsApp <span className="text-[11px]">· pronto</span></span>
        </div>
        {estado === "ok" || estado === "error" ? <p className={`mt-3 text-sm ${estado === "ok" ? "text-green-400" : "text-red-400"}`}>{msg}</p> : null}
        {estado === "ok"
          ? <button onClick={onClose} className="btn-brand mt-5 w-full">Hecho</button>
          : <button onClick={enviar} disabled={estado === "cargando"} className="btn-brand mt-5 w-full disabled:opacity-50">{estado === "cargando" ? "Activando…" : "Activar notificaciones"}</button>}
      </div>
    </div>
  );
}
