import { Suspense } from "react";
import SearchView from "@/components/search/SearchView";

export const dynamicParams = false;
export function generateStaticParams() { return [{ op: "alquilar" }, { op: "comprar" }]; }
export function generateMetadata({ params }: { params: { op: string } }) {
  return { title: `Pisos ${params.op === "comprar" ? "en venta" : "en alquiler"} en España` };
}
export default function Buscar({ params }: { params: { op: string } }) {
  const op = params.op === "comprar" ? "comprar" : "alquilar";
  return <Suspense fallback={<div className="mx-auto max-w-7xl px-4 pt-6 text-soft">Cargando…</div>}><SearchView op={op} /></Suspense>;
}
