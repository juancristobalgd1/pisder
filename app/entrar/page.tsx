"use client";
import { useState } from "react";
export default function Entrar() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-sm px-4 pt-20">
      <h1 className="text-center font-serif text-4xl">Inicia sesión</h1>
      <p className="mt-2 text-center text-sm text-soft">Sincroniza favoritos y alertas entre dispositivos. Para buscar no hace falta.</p>
      <form className="panel mt-8 space-y-3 p-6" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
        <input required type="email" className="input" placeholder="tu@email.com" />
        <button className="btn-brand w-full">{sent ? "Te hemos enviado un enlace" : "Recibir enlace de acceso"}</button>
        <button type="button" className="btn-ghost w-full">Continuar con Google</button>
      </form>
    </div>
  );
}
