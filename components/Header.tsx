"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { BarChart3, Calculator, ChevronDown, Gift, Landmark, ShieldCheck, UserRound, Wrench } from "lucide-react";
import Logo from "./Logo";
import { useLocal } from "./useLocal";

const TOOLS = [
  { href: "/herramientas/actualizar-alquiler/", t: "Actualizar alquiler (IPC / IRAV)", d: "Cuánto sube tu renta", i: Calculator },
  { href: "/herramientas/hipoteca/", t: "Simulador de hipoteca", d: "Cuota con Euríbor + diferencial", i: Landmark },
  { href: "/herramientas/detector-estafas/", t: "Detector de estafas", d: "Revisa un anuncio antes de pagar", i: ShieldCheck },
  { href: "/indice/", t: "Índice de precios", d: "€/m² publicado por ciudad", i: BarChart3 },
];

export function Avatar({ nombre, size = 44 }: { nombre: string; size?: number }) {
  return <span style={{ width: size, height: size }} className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#10b981] to-[#34d399] p-[2px]"><span className="grid h-full w-full place-items-center rounded-full bg-[#123328] text-sm font-semibold">{nombre.slice(0, 1).toUpperCase()}</span></span>;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [toolsMobile, setToolsMobile] = useState(false);
  const [perfil] = useLocal<{ nombre?: string }>("pisoya:perfil", {});
  const path = usePathname() || "/";
  const isHome = path === "/";
  const isSearch = path.startsWith("/buscar");
  return (
    <header className={`${isHome ? "absolute inset-x-0 top-0 bg-transparent" : "sticky top-0 bg-bg/95 backdrop-blur"} z-40 ${isSearch ? "hidden md:block" : ""}`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:h-16 md:px-6">
        <span className="md:hidden"><Logo big /></span><span className="hidden md:block"><Logo /></span>
        <nav className="hidden items-center gap-6 text-sm text-soft md:flex">
          <div className="relative" onMouseLeave={() => setOpen(false)}>
            <button onClick={() => setOpen((v) => !v)} onMouseEnter={() => setOpen(true)} className="flex items-center gap-1.5 hover:text-white"><Wrench size={15} /> Herramientas <ChevronDown size={14} /></button>
            {open && (
              <div className="absolute left-1/2 top-full w-80 -translate-x-1/2 pt-2"><div className="panel p-2 shadow-2xl">
                {TOOLS.map(({ href, t, d, i: I }) => (
                  <Link key={href} href={href} className="flex gap-3 rounded-xl p-3 hover:bg-card"><I size={18} className="mt-0.5 text-brand-400" /><span><span className="block text-white">{t}</span><span className="text-xs text-muted">{d}</span></span></Link>))}
              </div></div>)}
          </div>
          <Link href="/inmobiliarias/" className="flex items-center gap-1.5 hover:text-white"><UserRound size={15} /> Soy inmobiliaria</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={() => setToolsMobile((v) => !v)} aria-label="Herramientas" className="relative text-white md:hidden"><Gift size={30} strokeWidth={1.8} /></button>
          {perfil.nombre ? <Link href="/perfil/" aria-label="Tu perfil"><Avatar nombre={perfil.nombre} size={48} /></Link> : null}
          <Link href="/perfil/" className="btn-brand hidden md:inline-block">{perfil.nombre ? "Mi perfil" : "Iniciar sesión"}</Link>
        </div>
      </div>
      {toolsMobile && (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden" onClick={() => setToolsMobile(false)}>
          <div className="absolute inset-x-3 top-20 rounded-3xl border border-line bg-surface p-2" onClick={(e) => e.stopPropagation()}>
            <p className="px-3 pb-1 pt-2 text-xs uppercase tracking-widest text-muted">Herramientas gratis</p>
            {[...TOOLS, { href: "/inmobiliarias/", t: "Soy inmobiliaria", d: "Publica y mide tus anuncios", i: UserRound }].map(({ href, t, d, i: I }) => (
              <Link key={href} href={href} onClick={() => setToolsMobile(false)} className="flex gap-3 rounded-2xl p-3 active:bg-card"><I size={20} className="mt-0.5 text-brand-400" /><span><span className="block text-white">{t}</span><span className="text-xs text-muted">{d}</span></span></Link>))}
          </div>
        </div>)}
    </header>
  );
}
