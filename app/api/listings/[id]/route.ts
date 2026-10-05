import { NextResponse } from "next/server";
import { getListing } from "@/lib/data";

export function GET(_: Request, { params }: { params: { id: string } }) {
  const l = getListing(params.id);
  return l ? NextResponse.json(l) : NextResponse.json({ error: "No encontrado" }, { status: 404 });
}
