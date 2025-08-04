// src/app/api/spa/suggestions/makes/route.ts
import { getMakes as getCarQueryMakes } from '@/lib/services/carquery-api';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import getWikipediaSummary from '@/lib/services/wikipedia-api';
import { getAuctionHistory } from '@/lib/services/ebay-api';
import { getMotorsPricing } from '@/lib/services/motors-api';
import { getClassicValuerData } from '@/lib/services/classicvaluer-api';
import { getAutoExpressForecast } from '@/lib/services/autoexpress-api';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const source = (url.searchParams.get('source') ?? 'combined') as 'database'|'webbase'|'combined';
  const search = url.searchParams.get('search')?.toLowerCase() || '';
  let makes: string[] = [];

  if (source === 'database' || source === 'combined') {
    const db = await prisma.buyCar.findMany({
      where: { make: { contains: search } },
      select: { make: true },
      distinct: ['make'],
      take: 50,
    });
    makes = db.map(r => r.make);
  }

  if (source === 'webbase' || source === 'combined') {
    const api = (await getCarQueryMakes()).filter(m => m.toLowerCase().includes(search));
    makes = source === 'combined' ? [...makes, ...api] : api;
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