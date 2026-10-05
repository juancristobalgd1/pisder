import ToolShell from "@/components/ToolShell";
import ScamCheck from "@/components/tools/ScamCheck";
export const metadata = { title: "Detector de estafas inmobiliarias" };
export default function Page() {
  return <ToolShell eyebrow="Herramientas" title="Detector de estafas" intro="Mete los datos del anuncio y te decimos qué señales de alarma vemos. Las reglas son públicas y no guardamos lo que escribes."><ScamCheck /></ToolShell>;
}
