import ToolShell from "@/components/ToolShell";
import RentUpdate from "@/components/tools/RentUpdate";
export const metadata = { title: "Calculadora de actualización del alquiler (IPC / IRAV)" };
export default function Page() {
  return (
    <ToolShell eyebrow="Herramientas" title="Actualiza tu alquiler" intro="Calcula la nueva renta según el índice que fija tu contrato: IPC o el índice de referencia para la actualización de los arrendamientos de vivienda (IRAV) que publica el INE.">
      <RentUpdate />
    </ToolShell>
  );
}
