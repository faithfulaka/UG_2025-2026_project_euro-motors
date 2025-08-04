// src/app/api/spa/suggestions/years/route.ts
import { getYears as getCarQueryYears } from '@/lib/services/carquery-api';
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
  const make = url.searchParams.get('make')?.trim() || '';
  const model = url.searchParams.get('model')?.trim() || '';
  let years: string[] = [];

  if (make && model && (source === 'database' || source === 'combined')) {
    const db = await prisma.buyCar.findMany({
      where: { make, model },
      select: { year: true },
      distinct: ['year'],
    });
    years = db.map(r => String(r.year));
  }

  if (make && model && (source === 'webbase' || source === 'combined')) {
    const api = (await getCarQueryYears(make, model)).map(String);
    years = source === 'combined' ? [...years, ...api] : api;
  }

  years = Array.from(new Set(years)).sort((a,b) => Number(b) - Number(a));

  const suggestions = await Promise.all(
    years.map(async (year) => {
      const entry = {
        value: year,
        label: year,
        displayName: year,
        source,
        type: 'year' as const,
        summary: '' as string,
        imageUrl: '' as string,
        auctionCount: 0,
        averageAuctionPrice: 0,
        motorsMsrp: null as number | null,
        motorsMarketRange: null as string | null,
        classicMsrp: null as number | null,
        classicTypicalValue: null as number | null,
        autoExpressMsrp: null as number | null,
        autoExpressForecast: null as string | null,
      };

      try {
        const wiki = await getWikipediaSummary(make, model);
        entry.summary = wiki.summary || '';
        entry.imageUrl = wiki.image || '';
      } catch {}

      try {
        const auctions = await getAuctionHistory(make, model, year);
        entry.auctionCount = auctions.length;
        entry.averageAuctionPrice =
          auctions.reduce((sum, a) => sum + a.price, 0) / (auctions.length || 1);
      } catch {}

      try {
        const motors = await getMotorsPricing(make, model, year);
        entry.motorsMsrp = motors.msrp ?? null;
        entry.motorsMarketRange = motors.marketRange ?? null;
      } catch {}

      try {
        const classic = await getClassicValuerData(make, model, year);
        entry.classicMsrp = classic.msrp ?? null;
        entry.classicTypicalValue = classic.typicalValue ?? null;
      } catch {}

      try {
        const ae = await getAutoExpressForecast(make, model, year);
        entry.autoExpressMsrp = ae.msrp ?? null;
        entry.autoExpressForecast = ae.fiveYearForecast ?? null;
      } catch {}

      return entry;
    })
  );

  return NextResponse.json({
    success: true,
    suggestions,
    source,
    cached: false,
    timestamp: new Date().toISOString(),
  });
}