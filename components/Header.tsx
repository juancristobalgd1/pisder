"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Calculator, ChevronDown, Heart, UserRound, Wrench, ShieldCheck, Landmark, BarChart3 } from "lucide-react";
import Logo from "./Logo";

const TOOLS = [
  { href: "/herramientas/actualizar-alquiler", t: "Actualizar alquiler (IPC / IRAV)", d: "Cuánto sube tu renta", i: Calculator },
  { href: "/herramientas/hipoteca", t: "Simulador de hipoteca", d: "Cuota con Euríbor + diferencial", i: Landmark },
  { href: "/herramientas/detector-estafas", t: "Detector de estafas", d: "Revisa un anuncio antes de pagar", i: ShieldCheck },
  { href: "/indice", t: "Índice de precios", d: "€/m² publicado por ciudad", i: BarChart3 },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const isHome = path === "/";
  return (
    <header className={`sticky top-0 z-40 ${isHome ? "bg-bg/80" : "bg-bg/95"} backdrop-blur border-b border-transparent`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-soft md:flex">
          {!isHome && (
            <div className="relative" onMouseLeave={() => setOpen(false)}>
              <button onClick={() => setOpen((v) => !v)} onMouseEnter={() => setOpen(true)} className="flex items-center gap-1.5 hover:text-white">
                <Wrench size={15} /> Herramientas <ChevronDown size={14} />
              </button>
              {open && (
                <div className="absolute left-1/2 top-full w-80 -translate-x-1/2 pt-2">
                  <div className="panel p-2 shadow-2xl">
                    {TOOLS.map(({ href, t, d, i: I }) => (
                      <Link key={href} href={href} className="flex gap-3 rounded-xl p-3 hover:bg-card">
                        <I size={18} className="mt-0.5 text-brand-400" />
                        <span><span className="block text-white">{t}</span><span className="text-xs text-muted">{d}</span></span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <Link href="/inmobiliarias" className="flex items-center gap-1.5 hover:text-white"><UserRound size={15} /> Soy inmobiliaria</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/favoritos" aria-label="Favoritos" className="grid h-9 w-9 place-items-center rounded-full border border-line text-soft hover:text-white"><Heart size={16} /></Link>
          <Link href="/entrar" className="btn-brand">Iniciar sesión</Link>
        </div>
      </div>
    </header>
  );
}
