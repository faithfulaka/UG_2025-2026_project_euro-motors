// src/app/api/spa/makes/route.ts
import type { NextRequest } from "next/server";
import { NextResponse }    from "next/server";
import { prisma }          from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const source = new URL(request.url).searchParams.get("source") ?? "combined";

  // DATABASE ONLY
  if (source === "database") {
    const rows: { make: string }[] = await prisma.buyCar.findMany({
      distinct: ["make"],
      select:   { make: true },
    });
    return NextResponse.json({ makes: rows.map(r => r.make) });
  }

  // FALLBACK: combine DB + CarQuery API
  const dbRows: { make: string }[] = await prisma.buyCar.findMany({
    distinct: ["make"],
    select:   { make: true },
  });
  const dbMakes = dbRows.map(r => r.make);

  const resp = await fetch(
    "https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getMakes"
  );
  const text = await resp.text();
  // unwrap JSONP
  const jsonp = text.replace(/^[^(]*\((.*)\)$/, "$1");
  const parsed = JSON.parse(jsonp) as { Makes: { make_display: string }[] };
  const apiMakes = parsed.Makes.map(m => m.make_display);

  const combined = Array.from(new Set([...dbMakes, ...apiMakes])).sort();
  return NextResponse.json({ makes: combined });
}