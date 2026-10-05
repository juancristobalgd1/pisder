import Link from "next/link";
export default function NotFound() {
  return <div className="mx-auto max-w-md px-4 pt-24 text-center"><h1 className="font-serif text-5xl">No lo encontramos</h1><p className="mt-3 text-soft">Puede que el anuncio ya no esté disponible.</p><Link href="/buscar/alquilar" className="btn-brand mt-6 inline-block">Seguir buscando</Link></div>;
}
