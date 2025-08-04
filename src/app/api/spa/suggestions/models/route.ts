// src/app/api/spa/suggestions/models/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getModels as getCarQueryModels } from '@/lib/services/carquery-api';
import getWikipediaSummary from '@/lib/services/wikipedia-api';
import { getAuctionHistory } from '@/lib/services/ebay-api';
import { getMotorsPricing } from '@/lib/services/motors-api';
import { getClassicValuerData } from '@/lib/services/classicvaluer-api';
import { getAutoExpressForecast } from '@/lib/services/autoexpress-api';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const source = (url.searchParams.get('source') ?? 'combined') as 'database' | 'webbase' | 'combined';
  const make = url.searchParams.get('make')?.trim() || '';
  const search = url.searchParams.get('search')?.trim().toLowerCase() || '';

  if (!make) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_INPUT', message: 'Make required' } },
      { status: 400 }
    );
  }

  // 1) Collect raw model names from database and/or CarQuery
  let models: string[] = [];

  if (source === 'database' || source === 'combined') {
    const db = await prisma.buyCar.findMany({
      where: { make, model: { contains: search } },
      select: { model: true },
      distinct: ['model'],
      take: 50,
    });
    models = db.map(r => r.model);
  }

  if (source === 'webbase' || source === 'combined') {
    const apiModels = (await getCarQueryModels(make))
      .filter(m => m.toLowerCase().includes(search))
      .slice(0, 50);
    models = source === 'combined' ? [...models, ...apiModels] : apiModels;
  }

  // Dedupe and limit
  models = Array.from(new Set(models)).slice(0, 50);

  // 2) Enrich each suggestion with all APIs
  const suggestions: any[] = await Promise.all(models.map(async (model) => {
    const base = {
      value: model,
      label: model,
      displayName: model,
      source,
      type: 'model' as const,
      summary: '' as string | null,
      imageUrl: '' as string | null,
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
      base.summary = (wiki.summary || '') as string | null;
      base.imageUrl = (wiki.image || '') as string | null;
    } catch {}

    try {
      const auctions = await getAuctionHistory(make, model, '');
      base.auctionCount = auctions.length;
      base.averageAuctionPrice =
        auctions.reduce((sum, a) => sum + a.price, 0) / (auctions.length || 1);
    } catch {}

    try {
      const motors = await getMotorsPricing(make, model, '');
      base.motorsMsrp = motors.msrp ?? (null as number | null);
      base.motorsMarketRange = motors.marketRange ?? (null as string | null);
    } catch {}

    try {
      const classic = await getClassicValuerData(make, model, '');
      base.classicMsrp = classic.msrp ?? (null as number | null);
      base.classicTypicalValue = classic.typicalValue ?? (null as number | null);
    } catch {}

    try {
      const ae = await getAutoExpressForecast(make, model, '');
      base.autoExpressMsrp = ae.msrp ?? (null as number | null);
      base.autoExpressForecast = ae.fiveYearForecast ?? (null as string | null);
    } catch {}

    return base;
  }));

  return NextResponse.json({
    success: true,
    suggestions,
    source,
    cached: false,
    timestamp: new Date().toISOString(),
  });
}