import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { AutotraderScraper } from '@/lib/scrapers/autotrader';

const scraper = new AutotraderScraper();

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  if (!make) return NextResponse.json({ models: [] });
  try {
    const models = await scraper.getAvailableModels(make);
    return NextResponse.json({ models });
  } catch (error) {
    console.error('[API/models] Critical error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
