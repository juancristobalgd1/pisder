"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
export default function Inmobiliarias() {
  const [ok, setOk] = useState(false);
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-12 md:grid-cols-2 md:px-6">
      <div><p className="eyebrow">Para inmobiliarias</p><h1 className="mt-2 font-serif text-5xl">Impulsa tu negocio inmobiliario</h1>
        <p className="mt-4 text-soft">Publica gratis si eres agencia verificada, recibe contactos directos y mide qué anuncios funcionan.</p>
        <ul className="mt-6 space-y-3 text-soft">{["Importación automática de tu feed (XML / API)", "Métricas por anuncio: vistas, guardados, contactos", "Contactos por WhatsApp y email", "Ficha de agencia con valoraciones"].map((t) => <li key={t} className="flex gap-2"><CheckCircle2 size={18} className="text-brand-400" />{t}</li>)}</ul></div>
      <form className="panel space-y-3 p-6" onSubmit={(e) => { e.preventDefault(); setOk(true); }}>
        <p className="font-medium">Reclama tu agencia</p>
        <input required className="input" placeholder="Nombre de la agencia" /><input required className="input" placeholder="CIF" /><input required type="email" className="input" placeholder="Email de contacto" /><input className="input" placeholder="Teléfono" />
        <select className="input" defaultValue=""><option value="" disabled>Nº de inmuebles activos</option><option>1-20</option><option>21-100</option><option>101-500</option><option>+500</option></select>
        <button className="btn-brand w-full">{ok ? "Recibido, te contactamos" : "Enviar solicitud"}</button>
      </form>
    </div>
  );
}
