import { NextRequest, NextResponse } from 'next/server';
import { autotraderScraper } from '@/lib/scrapers/autotrader';
import * as bringatrailer from '@/lib/scrapers/bringatrailer';
import * as parkers from '@/lib/scrapers/parkers';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  const model = url.searchParams.get('model') || '';
  if (!make || !model) return NextResponse.json({ years: [] });
  try {
    const [autoYears, batYears, parkersYears] = await Promise.all([
      autotraderScraper.getAvailableYears(make, model),
      bringatrailer.getAvailableYears(make, model),
      parkers.getAvailableYears(make, model),
    ]);
    const years = Array.from(new Set([...autoYears, ...batYears, ...parkersYears])).sort((a, b) => b - a);
    return NextResponse.json({ years });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
