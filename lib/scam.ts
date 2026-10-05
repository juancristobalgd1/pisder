import type { Listing } from "./types";
import { CIUDADES } from "./geo";

// Detector de estafas: reglas transparentes. Devuelve 0-100 (más alto = más riesgo) y motivos.
export function riesgoEstafa(l: Pick<Listing, "precio" | "m2" | "ciudad" | "operacion" | "anunciante" | "fotos" | "descripcion">) {
  const motivos: string[] = [];
  let r = 0;
  const c = CIUDADES.find((x) => x.nombre === l.ciudad);
  if (c && l.m2 > 0) {
    const ref = l.operacion === "alquilar" ? c.alquilerM2 : c.ventaM2;
    const ratio = l.precio / l.m2 / ref;
    if (ratio < 0.5) { r += 45; motivos.push("Precio muy por debajo de la zona (menos de la mitad del €/m² habitual)."); }
    else if (ratio < 0.7) { r += 20; motivos.push("Precio bastante por debajo de la media de la zona."); }
  }
  if (l.anunciante.tipo === "particular" && !l.anunciante.verificado) { r += 15; motivos.push("Anunciante particular sin verificar."); }
  if (l.fotos.length < 3) { r += 15; motivos.push("Pocas fotos."); }
  const d = l.descripcion.toLowerCase();
  if (/(western union|transferencia antes|fianza por adelantado|estoy en el extranjero|no puedo ense|airbnb te env|enviar las llaves)/.test(d)) { r += 40; motivos.push("La descripción pide pagos o fianza sin visita, o el dueño dice estar fuera del país."); }
  if (!motivos.length) motivos.push("No vemos señales de alarma. Aun así, nunca pagues nada antes de visitar y firmar.");
  return { riesgo: Math.min(100, r), nivel: r >= 50 ? "alto" : r >= 20 ? "medio" : "bajo", motivos } as const;
}
