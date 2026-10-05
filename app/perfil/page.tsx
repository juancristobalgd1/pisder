import type { Metadata } from "next";
import PerfilView from "@/components/PerfilView";
export const metadata: Metadata = { title: "Tu perfil", robots: { index: false } };
export default function Page() { return <PerfilView />; }
