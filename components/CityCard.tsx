import Link from "next/link";
import { ArrowRight } from "lucide-react";
export default function CityCard({ nombre, href, foto, links }: { nombre: string; href: string; foto: string; links: { t: string; href: string }[] }) {
  return (
    <div className="w-[260px] shrink-0 snap-start md:w-[290px]">
      <Link href={href} className="group relative block aspect-[4/3] overflow-hidden rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foto} alt={nombre} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-card-fade" />
        <span className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-lg font-medium">{nombre}<ArrowRight size={18} /></span>
      </Link>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">{links.map((l) => <Link key={l.t} href={l.href} className="hover:text-white">{l.t}</Link>)}</div>
    </div>
  );
}
