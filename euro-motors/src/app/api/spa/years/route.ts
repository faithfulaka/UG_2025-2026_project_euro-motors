// src/app/api/spa/years/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AutotraderScraper } from '@/lib/scrapers/autotrader';

const scraper = new AutotraderScraper();

export async function GET(request: NextRequest) {
  // DEV ONLY: Bypass auth in development for backend test script
  if (process.env.NODE_ENV === 'development') {
    process.env.SKIP_AUTH = 'true';
  }
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  const model = url.searchParams.get('model') || '';
  if (!make || !model) {
    console.warn('[API/years] No make or model provided in query. Returning empty array.');
    return NextResponse.json({ years: [], make, model, source: 'autotrader-live', timestamp: new Date().toISOString() });
  }
  try {
    let years: (string|number)[] = await scraper.getAvailableYears(make, model);
    if (!Array.isArray(years)) years = [];
    // Normalize, deduplicate, sort descending
    years = Array.from(new Set(years.map(y => typeof y === 'string' ? y.trim() : y)))
      .filter(Boolean)
      .map(y => typeof y === 'string' ? parseInt(y, 10) : y)
      .filter(y => typeof y === 'number' && !isNaN(y))
      .sort((a, b) => b - a);
    console.log(`[API/years] Returning ${years.length} years for make: ${make}, model: ${model}`);
    if (years.length === 0) {
      console.warn(`[API/years] No years found for make: ${make}, model: ${model} from live scraper!`);
    }
    return NextResponse.json({
      years,
      make,
      model,
      source: 'autotrader-live',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API/years] Critical error:', error);
    return NextResponse.json({
      years: [],
      make,
      model,
      error: (error as Error).message,
      source: 'autotrader-live',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}