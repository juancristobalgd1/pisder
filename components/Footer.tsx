import Link from "next/link";
import { CIUDADES } from "@/lib/geo";
import { BRAND } from "@/lib/brand";
import Logo from "./Logo";

export default function Footer() {
  const cols = [
    { t: "Propiedades", l: CIUDADES.slice(0, 7).map((c) => ({ t: `Pisos en alquiler en ${c.nombre.split(" /")[0]}`, h: `/buscar/alquilar?ciudad=${c.slug}` })) },
    { t: "Precios y mercado", l: [{ t: "Índice de precios", h: "/indice" }, ...CIUDADES.slice(0, 5).map((c) => ({ t: `Precios en ${c.nombre.split(" /")[0]}`, h: `/indice#${c.slug}` }))] },
    { t: "Herramientas", l: [{ t: "Actualizar alquiler (IPC / IRAV)", h: "/herramientas/actualizar-alquiler" }, { t: "Simulador de hipoteca", h: "/herramientas/hipoteca" }, { t: "Detector de estafas", h: "/herramientas/detector-estafas" }] },
    { t: "Guías y recursos", l: [{ t: "Qué es " + BRAND.name, h: "/#faq" }, { t: "Para inmobiliarias", h: "/inmobiliarias" }, { t: "Mis favoritos", h: "/favoritos" }] },
  ];
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="mb-10 max-w-md"><Logo /><p className="mt-3 text-sm text-muted">Reunimos los anuncios de todos los portales en una sola búsqueda y te avisamos al instante cuando aparece lo que buscas.</p>
          <p className="mt-3 text-sm text-muted">{BRAND.email} · {BRAND.city}</p></div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {cols.map((c) => (
            <div key={c.t}><p className="mb-3 text-sm font-medium text-white">{c.t}</p>
              <ul className="space-y-2 text-sm text-muted">{c.l.map((l) => <li key={l.t}><Link href={l.h} className="hover:text-white">{l.t}</Link></li>)}</ul></div>
          ))}
        </div>
        <p className="mt-10 text-xs text-muted">© 2026 {BRAND.name}. Los anuncios pertenecen a sus anunciantes. {BRAND.name} no es una inmobiliaria ni interviene en la operación.</p>
      </div>
    </footer>
  );
}
