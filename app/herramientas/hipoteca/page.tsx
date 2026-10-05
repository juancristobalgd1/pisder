import ToolShell from "@/components/ToolShell";
import Mortgage from "@/components/tools/Mortgage";
export const metadata = { title: "Simulador de hipoteca" };
export default function Page() {
  return <ToolShell eyebrow="Herramientas" title="Simulador de hipoteca" intro="Calcula tu cuota mensual a tipo fijo o variable (Euríbor + diferencial) y cuánto necesitas ahorrar para la entrada y los gastos."><Mortgage /></ToolShell>;
}
