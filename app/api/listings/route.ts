import { NextRequest, NextResponse } from "next/server";
import { getListing } from "@/lib/data";
export function GET(req: NextRequest) {
  const ids = (req.nextUrl.searchParams.get("ids") ?? "").split(",").filter(Boolean).slice(0, 200);
  return NextResponse.json(ids.map(getListing).filter(Boolean));
}
