// src/app/api/spa/models/route.ts
import type { NextRequest } from "next/server";
import { NextResponse }    from "next/server";
import { prisma }          from "@/lib/prisma";

interface DBModel { model: string }
interface CQModels { Models: Array<{ model_name: string }> }

export async function GET(request: NextRequest) {
  const url    = new URL(request.url);
  const make   = url.searchParams.get("make")   ?? "";
  const source = url.searchParams.get("source") ?? "combined";

  if (!make) {
    return NextResponse.json({ models: [] });
  }

  if (source === "database") {
    const rows = await prisma.buyCar.findMany({
      where:    { make },
      distinct: ["model"],
      select:   { model: true },
    });
    return NextResponse.json({ models: rows.map(r => r.model) });
  }

  const dbRows    = await prisma.buyCar.findMany({
    where:    { make },
    distinct: ["model"],
    select:   { model: true },
  });
  const dbModels  = dbRows.map(r => r.model);

  const resp       = await fetch(
    `https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getModels&make=${encodeURIComponent(make)}`
  );
  const text       = await resp.text();
  const jsonp      = text.replace(/^[^(]*\((.*)\)$/, "$1");
  const parsed     = JSON.parse(jsonp) as CQModels;
  const apiModels  = parsed.Models.map(m => m.model_name);

  const combined   = Array.from(new Set([...dbModels, ...apiModels])).sort();
  return NextResponse.json({ models: combined });
}