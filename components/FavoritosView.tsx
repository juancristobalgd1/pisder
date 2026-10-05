"use client";
import { useEffect, useState } from "react";
import { FolderPlus, Share2, Trash2 } from "lucide-react";
import type { Listing } from "@/lib/types";
import PropertyCard from "./PropertyCard";
import { getListing } from "@/lib/data";
import { useFavs } from "./useFavs";
export default function FavoritosView() {
  const { cols, crear, borrar } = useFavs();
  const [sel, setSel] = useState("fav");
  const [nombre, setNombre] = useState("");
  const [copiado, setCopiado] = useState(false);
  const col = cols.find((c) => c.id === sel) ?? cols[0];
  const [items, setItems] = useState<Listing[]>([]);
  const key = col?.ids.join(",") ?? "";
  useEffect(() => { setItems(key ? (key.split(",").map(getListing).filter(Boolean) as Listing[]) : []); }, [key]);
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
      <h1 className="h-section">Mis colecciones</h1>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {cols.map((c) => <button key={c.id} onClick={() => setSel(c.id)} className={`chip ${sel === c.id ? "border-brand bg-brand/15 text-white" : ""}`}>{c.nombre} · {c.ids.length}</button>)}
        <form onSubmit={(e) => { e.preventDefault(); if (nombre.trim()) { crear(nombre.trim()); setNombre(""); } }} className="flex items-center gap-2">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nueva colección" className="input h-8 w-44 rounded-full py-1" /><button className="chip" aria-label="Crear"><FolderPlus size={13} /></button></form>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => { navigator.clipboard.writeText(location.href); setCopiado(true); }} className="chip"><Share2 size={13} />{copiado ? "Enlace copiado" : "Compartir"}</button>
        {col && col.id !== "fav" && <button onClick={() => { borrar(col.id); setSel("fav"); }} className="chip"><Trash2 size={13} />Borrar colección</button>}
      </div>
      {items.length === 0 ? <p className="mt-10 text-soft">Aún no hay nada aquí. Pulsa el corazón en cualquier anuncio para guardarlo.</p> :
        <div className="mt-8 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">{items.map((l) => <PropertyCard key={l.id} l={l} />)}</div>}
    </div>
  );
}
