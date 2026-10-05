import { NextRequest, NextResponse } from "next/server";

// Alta de alerta. En producción: guardar en BD y disparar tras cada ingesta (WhatsApp Cloud API / email).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.query || !(body?.whatsapp || body?.email)) return NextResponse.json({ error: "Faltan datos: búsqueda y WhatsApp o email" }, { status: 400 });
  const id = Math.random().toString(36).slice(2, 10);
  return NextResponse.json({ ok: true, id, expira: new Date(Date.now() + 10 * 86400000).toISOString() });
}
