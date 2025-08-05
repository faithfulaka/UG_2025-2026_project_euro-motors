// src/app/api/spa/search/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/services';
import getWikipediaSummary from '@/lib/services/wikipedia-api';
import { getAuctionHistory } from '@/lib/services/ebay-api';
import { getMotorsPricing } from '@/lib/services/motors-api';
import { getClassicValuerData } from '@/lib/services/classicvaluer-api';
import { getAutoExpressForecast } from '@/lib/services/autoexpress-api';

async function handleSearch(
  source: string,
  make: string,
  model: string,
  year: string
) {
  const core = source !== 'database'
    ? await carQueryService.getCarData(make, model, year)
    : [];
  const dbEntries = source === 'database'
    ? await prisma.buyCar.findMany({ where: { make, model, year: Number(year) } })
    : [];
  const auctions = await getAuctionHistory(make, model, year);
  const motors = await getMotorsPricing(make, model, year);
  const classic = await getClassicValuerData(make, model, year);
  const ae = await getAutoExpressForecast(make, model, year);

  let wiki = { summary: '', image: '' };
  try {
    const wikiData = await getWikipediaSummary(make, model);
    wiki = wikiData;
  } catch {}

  return {
    success: true,
    data: {
      basicSpecifications: core,
      performanceData: core,
      pricingData: {
        database: dbEntries,
        ebay: auctions,
        motors,
        classicValuer: classic,
        autoExpress: ae
      },
      wikipedia: wiki
    }
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const source = url.searchParams.get('source') ?? 'webbase';
  const make   = url.searchParams.get('make')  ?? '';
  const model  = url.searchParams.get('model') ?? '';
  const year   = url.searchParams.get('year')  ?? '';
  const result = await handleSearch(source, make, model, year);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const { source, make, model, year } = await req.json();
  const result = await handleSearch(source, make, model, year);
  return NextResponse.json(result);
}