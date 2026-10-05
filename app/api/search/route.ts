import { NextRequest, NextResponse } from "next/server";
import { filtersFromParams, search } from "@/lib/search";

export function GET(req: NextRequest) {
  const f = filtersFromParams(req.nextUrl.searchParams);
  const res = search(f);
  return NextResponse.json(res, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
