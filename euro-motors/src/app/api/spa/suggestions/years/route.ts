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
    // Query all sources for live year data
    const results = await Promise.allSettled([
      autotraderScraper.getAvailableYears(make, model),
      bringatrailer.getAvailableYears(make, model),
      parkers.getAvailableYears(make, model),
    ]);
    // Only keep fulfilled, non-empty arrays
    const allYears = results
      .filter(r => r.status === 'fulfilled' && Array.isArray(r.value) && r.value.length > 0)
      .flatMap(r => (r.status === 'fulfilled' ? r.value : []));
    // Ensure all values are numbers and filter out NaN
    const years = Array.from(new Set(
      allYears
        .map(y => typeof y === 'number' ? y : Number(y))
        .filter((y): y is number => typeof y === 'number' && !isNaN(y))
    )).sort((a, b) => b - a);
    // Convert all years to string for type safety
    const yearsAsStrings = years.map(String);
    return NextResponse.json({ years: yearsAsStrings });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
