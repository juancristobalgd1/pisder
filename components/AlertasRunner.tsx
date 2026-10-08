"use client";
import { useEffect } from "react";
import { leerAlertas, sincronizar } from "@/lib/alertas";

// Cada vez que se abre Pisder, revisa las alertas activas por si han entrado pisos nuevos
export default function AlertasRunner() {
  useEffect(() => { if (leerAlertas().length) sincronizar(true).catch(() => {}); }, []);
  return null;
}
