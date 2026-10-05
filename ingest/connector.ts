import type { Listing } from "../lib/types";

export interface Connector {
  nombre: string;
  fetch(since: Date): AsyncIterable<unknown>;
  normalize(raw: unknown): Listing | null;
}

// Clave de deduplicación: misma vivienda publicada en varios sitios
export function dedupeKey(l: Pick<Listing, "direccion" | "lat" | "lng" | "m2" | "habitaciones">) {
  const dir = l.direccion.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\b(calle|c\/|avenida|avda|plaza|pza|paseo)\b/g, "").replace(/[^a-z0-9]/g, "");
  const geo = `${l.lat.toFixed(3)},${l.lng.toFixed(3)}`;
  const m2 = Math.round(l.m2 / 3) * 3;
  return `${dir}|${geo}|${m2}|${l.habitaciones}`;
}
