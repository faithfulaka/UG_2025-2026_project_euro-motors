// src/app/api/spa/suggestions/years/route.ts
import { getYears as getCarQueryYears } from '@/lib/services/carquery-api';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const source = (url.searchParams.get('source') ?? 'webbase') as 'database'|'webbase';
  const make = url.searchParams.get('make')?.trim() || '';
  const model = url.searchParams.get('model')?.trim() || '';
  let years: string[] = [];

  if (make && model && source === 'database') {
    const db = await prisma.buyCar.findMany({
      where: { make, model },
      select: { year: true },
      distinct: ['year'],
    });
    years = db.map(r => String(r.year));
  } else if (make && model) {
    const carqueryYears = await getCarQueryYears(make, model);
    years = carqueryYears.map(String);
  }

  // only valid year formats (e.g., "2012")
  years = years.filter(y => /^\d{4}$/.test(y));
  years = Array.from(new Set(years)).sort((a,b) => Number(b) - Number(a));

  const suggestions = years.map(year => ({
    value: year,
    label: year,
    displayName: year,
    source,
    type: 'year' as const,
  }));

  return NextResponse.json({
    success: true,
    suggestions,
    source,
    cached: false,
    timestamp: new Date().toISOString(),
  });
}