"use client";
import { useEffect, useState } from "react";
// Pequeño almacén en localStorage con aviso entre componentes
export function useLocal<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  useEffect(() => {
    const read = () => { try { const s = localStorage.getItem(key); if (s) setV(JSON.parse(s)); } catch {} };
    read(); const h = (e: Event) => { if ((e as CustomEvent).detail === key) read(); };
    window.addEventListener("pisoya:local", h); return () => window.removeEventListener("pisoya:local", h);
  }, [key]);
  const set = (nv: T) => { localStorage.setItem(key, JSON.stringify(nv)); setV(nv); window.dispatchEvent(new CustomEvent("pisoya:local", { detail: key })); };
  return [v, set] as const;
}
export const markVisited = (id: string) => {
  try { const s: string[] = JSON.parse(localStorage.getItem("pisoya:visitadas") || "[]"); if (!s.includes(id)) { localStorage.setItem("pisoya:visitadas", JSON.stringify([id, ...s].slice(0, 500))); window.dispatchEvent(new CustomEvent("pisoya:local", { detail: "pisoya:visitadas" })); } } catch {}
};
export const saveLastSearch = (q: string, url: string) => { try { localStorage.setItem("pisoya:ultima", JSON.stringify({ q, url })); } catch {} };
