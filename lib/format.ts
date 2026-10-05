export const eur = (n: number) => n.toLocaleString("es-ES", { maximumFractionDigits: 0 }) + " €";
export function hace(iso: string, now = Date.now()) {
  const d = Math.floor((now - Date.parse(iso)) / 86400000);
  if (d <= 0) return "hoy";
  if (d === 1) return "ayer";
  if (d < 30) return `hace ${d} días`;
  return `hace ${Math.floor(d / 30)} mes${d >= 60 ? "es" : ""}`;
}
