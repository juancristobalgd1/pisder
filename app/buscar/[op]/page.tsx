import type { Metadata } from "next";
import { filtersFromParams, search } from "@/lib/search";
import { ciudadPorSlug } from "@/lib/geo";
import SearchView from "@/components/search/SearchView";

type P = { params: { op: string }; searchParams: Record<string, string | string[] | undefined> };

export function generateMetadata({ params, searchParams }: P): Metadata {
  const c = ciudadPorSlug(searchParams.ciudad as string)?.nombre;
  const op = params.op === "comprar" ? "en venta" : "en alquiler";
  return { title: `Pisos ${op}${c ? ` en ${c}` : " en España"}` };
}

export default function Buscar({ params, searchParams }: P) {
  const f = filtersFromParams(searchParams, params.op);
  const res = search(f);
  return <SearchView initial={res} op={f.operacion} />;
}
