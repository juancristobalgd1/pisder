"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell, ChevronDown, ChevronUp, FolderOpen, Heart, LogOut, Plus, Trash2, X } from "lucide-react";
import { useLocal } from "./useLocal";
import { useFavs } from "./useFavs";
import { getListing } from "@/lib/data";
import PropertyCard from "./PropertyCard";


export default function PerfilView() {
  const [perfil, setPerfil] = useLocal<{ nombre?: string }>("pisoya:perfil", {});
  const [alertas, setAlertas] = useLocal<{ query: string; params: string; expira: string }[]>("pisoya:alertas", []);
  const { cols: todas, crear: crearCol, borrar } = useFavs();
  const cols = todas.filter((c) => c.id !== "fav");
  const favs = todas.find((c) => c.id === "fav")?.ids ?? [];
  const [abierto, setAbierto] = useState(true);
  const [modal, setModal] = useState(false);
  const [nombreCol, setNombreCol] = useState("");
  const [nombre, setNombre] = useState("");
  const favListings = useMemo(() => favs.map(getListing).filter(Boolean).slice(0, 6), [favs.join()]); // eslint-disable-line

  if (!perfil.nombre) {
    return (
      <div className="mx-auto max-w-md px-5 pb-10 pt-6">
        <h1 className="text-[32px] font-bold">Hola 👋</h1>
        <p className="mt-1 text-soft">Entra para guardar colecciones y alertas.</p>
        <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); if (nombre.trim()) setPerfil({ nombre: nombre.trim() }); }}>
          <input className="input h-12 text-base" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <button className="btn-deep w-full">Continuar</button>
          <p className="text-center text-xs text-muted">Versión de prueba: tus datos se guardan solo en este dispositivo.</p>
        </form>
      </div>
    );
  }

  const crear = () => { if (!nombreCol.trim()) return; crearCol(nombreCol.trim()); setNombreCol(""); setModal(false); setAbierto(true); };

  return (
    <div className="mx-auto max-w-2xl px-5 pb-10 pt-4">
      <h1 className="text-[34px] font-bold leading-tight">Hola, {perfil.nombre}</h1>
      <p className="mt-1 text-[17px] text-soft">Gestiona tus propiedades y colecciones</p>

      <div className="mt-6 overflow-hidden rounded-[22px] border border-white/10 bg-[#1a1a1c]">
        <button onClick={() => setAbierto((v) => !v)} className="flex w-full items-center justify-between px-5 py-5">
          <span className="text-left"><span className="block text-[20px] font-semibold">Colecciones</span><span className="text-[15px] text-soft">{cols.length} {cols.length === 1 ? "colección" : "colecciones"}</span></span>
          {abierto ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
        {abierto && (
          <div className="px-5 pb-6">
            <button onClick={() => setModal(true)} className="btn-deep flex w-full items-center justify-center gap-2 py-3.5 text-[17px]"><Plus size={20} />Nueva colección</button>
            {cols.length === 0 ? (
              <div className="py-10 text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/[.06] text-soft"><FolderOpen size={30} /></span>
                <p className="mt-5 text-[20px] font-semibold">No tienes colecciones</p>
                <p className="mx-auto mt-2 max-w-xs text-[16px] text-soft">Crea tu primera colección para organizar tus propiedades favoritas</p>
                <button onClick={() => setModal(true)} className="btn-deep mt-6 px-7">Crear colección</button>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-white/5">
                {cols.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-3.5">
                    <span className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#123328] text-[#34d399]"><FolderOpen size={20} /></span><span><span className="block font-medium">{c.nombre}</span><span className="text-sm text-muted">{c.ids.length} propiedades</span></span></span>
                    <button onClick={() => borrar(c.id)} aria-label={`Borrar ${c.nombre}`} className="p-2 text-muted"><Trash2 size={18} /></button>
                  </li>))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-[22px] border border-white/10 bg-[#1a1a1c] p-5">
        <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-[20px] font-semibold"><Heart size={20} className="text-[#34d399]" />Favoritos</span><Link href="/favoritos/" className="text-sm text-soft">Ver todos ({favs.length})</Link></div>
        {favListings.length ? <div className="mt-4 grid gap-6 sm:grid-cols-2">{favListings.map((l) => <PropertyCard key={l!.id} l={l!} compact />)}</div>
          : <p className="mt-3 text-[15px] text-soft">Toca el corazón de cualquier anuncio para guardarlo aquí.</p>}
      </div>

      <div className="mt-4 rounded-[22px] border border-white/10 bg-[#1a1a1c] p-5">
        <span className="flex items-center gap-2 text-[20px] font-semibold"><Bell size={20} className="text-[#34d399]" />Alertas</span>
        {alertas.length ? <ul className="mt-3 space-y-2">{alertas.map((a, k) => (
          <li key={k + a.expira} className="flex items-center justify-between rounded-xl bg-white/[.04] px-4 py-3"><Link href={`/buscar/${a.params}`} className="min-w-0"><span className="block truncate">{a.query}</span><span className="text-xs text-muted">Caduca el {new Date(a.expira).toLocaleDateString("es-ES")}</span></Link><button onClick={() => setAlertas(alertas.filter((_, j) => j !== k))} aria-label="Borrar alerta" className="p-2 text-muted"><X size={16} /></button></li>))}</ul>
          : <p className="mt-3 text-[15px] text-soft">Desde una búsqueda, toca «Crear alerta» y te avisamos de los pisos nuevos.</p>}
      </div>

      <button onClick={() => setPerfil({})} className="mx-auto mt-8 flex items-center gap-2 text-sm text-muted"><LogOut size={16} />Cerrar sesión</button>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={() => setModal(false)}>
          <div className="w-full max-w-md rounded-t-[28px] border border-line bg-surface p-6 sm:rounded-[28px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><p className="text-xl font-semibold">Nueva colección</p><button onClick={() => setModal(false)} aria-label="Cerrar"><X size={20} /></button></div>
            <input autoFocus className="input mt-5 h-12 text-base" placeholder="Ej.: Pisos para visitar en Donostia" value={nombreCol} onChange={(e) => setNombreCol(e.target.value)} onKeyDown={(e) => e.key === "Enter" && crear()} />
            <button onClick={crear} className="btn-deep mt-4 w-full">Crear colección</button>
          </div>
        </div>
      )}
    </div>
  );
}
