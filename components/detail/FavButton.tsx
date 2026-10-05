"use client";
import { Heart } from "lucide-react";
import { useFavs } from "../useFavs";
export default function FavButton({ id }: { id: string }) {
  const { isFav, toggle } = useFavs(); const on = isFav(id);
  return <button onClick={() => toggle(id)} className="btn-ghost inline-flex shrink-0 items-center gap-2"><Heart size={16} className={on ? "fill-brand text-brand" : ""} />{on ? "Guardado" : "Guardar"}</button>;
}
