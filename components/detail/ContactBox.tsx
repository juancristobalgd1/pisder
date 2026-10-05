"use client";
import { useState } from "react";
import { BadgeCheck, MessageCircle, Phone } from "lucide-react";
import type { Listing } from "@/lib/types";
export default function ContactBox({ anunciante, titulo }: { anunciante: Listing["anunciante"]; titulo: string }) {
  const [ver, setVer] = useState(false);
  const wa = `https://wa.me/${anunciante.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, me interesa: ${titulo}. ¿Sigue disponible?`)}`;
  return (
    <div className="panel p-5">
      <p className="text-xs text-muted">{anunciante.tipo === "agencia" ? "Agencia" : "Particular"}</p>
      <p className="mt-0.5 flex items-center gap-1.5 font-medium">{anunciante.nombre}{anunciante.verificado && <BadgeCheck size={16} className="text-brand-400" />}</p>
      <a href={wa} target="_blank" rel="noopener" className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-wa py-2.5 text-sm font-medium text-black"><MessageCircle size={16} />Escribir por WhatsApp</a>
      <button onClick={() => setVer(true)} className="btn-ghost mt-2 flex w-full items-center justify-center gap-2"><Phone size={15} />{ver ? <a href={`tel:${anunciante.telefono}`}>{anunciante.telefono}</a> : "Ver teléfono"}</button>
      <p className="mt-3 text-[11px] text-muted">Sin registro. Nunca pagues señal ni fianza antes de visitar el inmueble.</p>
    </div>
  );
}
