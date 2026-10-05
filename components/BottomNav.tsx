"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Home, Search, UserRound } from "lucide-react";
const ITEMS = [
  { href: "/", t: "Inicio", I: Home, match: (p: string) => p === "/" },
  { href: "/buscar/alquilar/", t: "Buscar", I: Search, match: (p: string) => p.startsWith("/buscar") || p.startsWith("/inmueble") },
  { href: "/flechazo/", t: "Flechazo", I: Flame, match: (p: string) => p.startsWith("/flechazo") },
  { href: "/perfil/", t: "Perfil", I: UserRound, match: (p: string) => p.startsWith("/perfil") || p.startsWith("/favoritos") },
];
export default function BottomNav() {
  const p = usePathname() || "/";
  return (
    <nav className="fixed inset-x-0 bottom-4 z-40 flex justify-center md:hidden" aria-label="Navegación principal">
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#1a231f]/95 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,.6)] backdrop-blur">
        {ITEMS.map(({ href, t, I, match }) => {
          const on = match(p);
          return (
            <Link key={t} href={href} aria-label={t} className={`flex h-11 items-center gap-2 rounded-full transition ${on ? "pill-active px-5 font-semibold" : "px-4 text-soft"}`}>
              <I size={22} strokeWidth={on ? 2.2 : 1.8} />{on && <span className="text-[15px]">{t}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
