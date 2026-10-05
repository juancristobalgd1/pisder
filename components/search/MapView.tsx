"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useRouter } from "next/navigation";
import type { Listing } from "@/lib/types";

const fmt = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1).replace(".", ",")}M €` : n >= 1e4 ? `${Math.round(n / 1000)}k €` : `${n.toLocaleString("es-ES")} €`);

function Fit({ items }: { items: Listing[] }) {
  const map = useMap(); const done = useRef(false);
  useEffect(() => { if (done.current || !items.length) return; done.current = true; map.fitBounds(L.latLngBounds(items.map((l) => [l.lat, l.lng])), { padding: [30, 30], maxZoom: 15 }); }, [items, map]);
  return null;
}
function Bounds({ onBounds }: { onBounds: (b: [number, number, number, number]) => void }) {
  const t = useRef<ReturnType<typeof setTimeout>>();
  const first = useRef(true);
  useMapEvents({ moveend(e) { if (first.current) { first.current = false; return; } const b = e.target.getBounds(); clearTimeout(t.current); t.current = setTimeout(() => onBounds([b.getSouth(), b.getWest(), b.getNorth(), b.getEast()]), 350); } });
  return null;
}

export default function MapView({ items, hover, onBounds }: { items: Listing[]; hover: string | null; onBounds: (b: [number, number, number, number]) => void }) {
  const router = useRouter();
  const icons = useMemo(() => new Map(items.map((l) => [l.id, (active: boolean) => L.divIcon({ className: "", html: `<div class="price-pin ${active ? "active" : ""}">${fmt(l.precio)}</div>`, iconSize: [0, 0] })])), [items]);
  return (
    <MapContainer center={[40.2, -3.7]} zoom={6} className="h-full w-full rounded-xl" scrollWheelZoom>
      <TileLayer attribution='&copy; OpenStreetMap &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      <Fit items={items} /><Bounds onBounds={onBounds} />
      {items.map((l) => <Marker key={l.id} position={[l.lat, l.lng]} icon={icons.get(l.id)!(hover === l.id)} zIndexOffset={hover === l.id ? 1000 : 0} eventHandlers={{ click: () => router.push(`/inmueble/${l.id}`) }} />)}
    </MapContainer>
  );
}
