// src/app/api/spa/suggestions/makes/route.ts
import { getMakes as getCarQueryMakes } from '@/lib/services/carquery-api';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const source = (url.searchParams.get('source') ?? 'webbase') as 'database'|'webbase';
  const search = url.searchParams.get('search')?.toLowerCase() || '';
  let makes: string[] = [];

  if (source === 'database') {
    const db = await prisma.buyCar.findMany({
      where: { make: { contains: search } },
      select: { make: true },
      distinct: ['make'],
      take: 50,
    });
    makes = db.map(r => r.make);
  } else { // default to webbase
    const carqueryList = await getCarQueryMakes();
    makes = carqueryList
      .filter(m => m.toLowerCase().includes(search))
      .slice(0, 50);
  }

  makes = Array.from(new Set(makes)).slice(0, 50);

  // Only return minimal suggestion fields (value, label, displayName, source, type)
  const suggestions = makes.map((make) => ({
    value: make,
    label: make,
    displayName: make,
    source,
    type: 'make' as const,
  }));

  return NextResponse.json({
    success: true,
    suggestions,
    source,
    cached: false,
    timestamp: new Date().toISOString(),
  });
}