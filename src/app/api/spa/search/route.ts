// src/app/api/spa/search/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/services';
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
  // 1) CarQuery core trims
  const core =
    source !== 'database'
      ? await carQueryService.getCarData(make, model, year)
      : [];
  const primary = core[0] ?? {};

  // 2) Database pricing data and other API integrations
  const dbEntries = await prisma.buyCar.findMany({
    where: { make, model, year: Number(year) },
    select: { price: true },
  });
  const prices = dbEntries.map((r) => r.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const avgPrice =
    prices.length > 0
      ? prices.reduce((sum, p) => sum + p, 0) / prices.length
      : 0;
  const dbPricing = {
    baseMSRP: maxPrice || null,
    currentMarketRange:
      prices.length > 1
        ? `£${minPrice.toLocaleString()} - £${maxPrice.toLocaleString()}`
        : null,
    averageDealerPrice: avgPrice,
    dealerInventoryCount: dbEntries.length,
    priceTrend: 'Stable (±1.5% last 30 days)',
  };

  // 3) eBay auction history
  const auctions = await getAuctionHistory(make, model, year);

  // 4) Motors.co.uk pricing
  const motors = await getMotorsPricing(make, model, year);

  // 5) Classic Valuer pricing
  const classic = await getClassicValuerData(make, model, year);

  // 6) AutoExpress forecast
  const ae = await getAutoExpressForecast(make, model, year);

  // 7) Compose pricingData as a map of all results
  const pricingData = {
    database: dbPricing,
    ebay: auctions,
    motors,
    classicValuer: classic,
    autoExpress: ae,
  };

  // 8) For basicSpecifications and performanceData, pass through raw primary (from carquery)
  //    If no carquery data, fallback to empty object
  return {
    success: true,
    data: {
      basicSpecifications: primary,
      performanceData: primary,
      pricingData,
    },
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const source = url.searchParams.get('source') ?? 'webbase';
  const make = url.searchParams.get('make') ?? '';
  const model = url.searchParams.get('model') ?? '';
  const year = url.searchParams.get('year') ?? '';
  return NextResponse.json(
    await handleSearch(source, make, model, year)
  );
}

export async function POST(req: Request) {
  const { source, make, model, year } = await req.json();
  return NextResponse.json(
    await handleSearch(source, make, model, year)
  );
}