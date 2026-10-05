"use client";
import { useCallback, useEffect, useState } from "react";

// Favoritos + colecciones en localStorage (sin registro, como el original).
export interface Coleccion { id: string; nombre: string; ids: string[] }
const KEY = "pisoya:colecciones";
const read = (): Coleccion[] => { try { return JSON.parse(localStorage.getItem(KEY) || "") } catch { return [{ id: "fav", nombre: "Favoritos", ids: [] }] } };

export function useFavs() {
  const [cols, setCols] = useState<Coleccion[]>([{ id: "fav", nombre: "Favoritos", ids: [] }]);
  useEffect(() => { setCols(read()); const h = () => setCols(read()); window.addEventListener("pisoya:favs", h); return () => window.removeEventListener("pisoya:favs", h); }, []);
  const save = (c: Coleccion[]) => { localStorage.setItem(KEY, JSON.stringify(c)); window.dispatchEvent(new Event("pisoya:favs")); };
  const isFav = useCallback((id: string) => cols.some((c) => c.ids.includes(id)), [cols]);
  const toggle = (id: string, colId = "fav") => {
    const c = read(); const col = c.find((x) => x.id === colId) ?? c[0];
    col.ids = col.ids.includes(id) ? col.ids.filter((x) => x !== id) : [id, ...col.ids];
    save(c);
  };
  const crear = (nombre: string) => { const c = read(); c.push({ id: Math.random().toString(36).slice(2, 8), nombre, ids: [] }); save(c); };
  const borrar = (colId: string) => save(read().filter((c) => c.id !== colId || c.id === "fav"));
  return { cols, isFav, toggle, crear, borrar };
}
