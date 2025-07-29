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
  if (!make || !model) return NextResponse.json({ years: [] });
  try {
    const years = await scraper.getAvailableYears(make, model);
    return NextResponse.json({ years });
  } catch (error) {
    console.error('[API/years] Critical error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}