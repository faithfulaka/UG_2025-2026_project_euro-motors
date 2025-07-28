import { NextRequest, NextResponse } from 'next/server';
import { autotraderScraper } from '@/lib/scrapers/autotrader';
import * as bringatrailer from '@/lib/scrapers/bringatrailer';
import * as parkers from '@/lib/scrapers/parkers';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  if (!make) return NextResponse.json({ models: [] });
  try {
    const [autoModels, batModels, parkersModels] = await Promise.all([
      autotraderScraper.getAvailableModels(make),
      bringatrailer.getAvailableModels(make),
      parkers.getAvailableModels(make),
    ]);
    const models = Array.from(new Set([...autoModels, ...batModels, ...parkersModels])).sort();
    return NextResponse.json({ models });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
