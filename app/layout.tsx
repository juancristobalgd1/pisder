import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${BRAND.name}: encuentra tu casa ideal en España`,
  description: "Buscador de pisos con IA: todos los portales en una sola búsqueda. Escribe lo que buscas como se lo dirías a una persona.",
};
export const viewport: Viewport = { themeColor: "#161616", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
