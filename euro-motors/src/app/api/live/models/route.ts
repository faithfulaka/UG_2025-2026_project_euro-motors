import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  if (!make) return NextResponse.json({ models: [] });
  try {
    const { AutotraderScraper } = await import('@/lib/scrapers/autotrader');
    const scraper = new AutotraderScraper();
    const models = await scraper.getAvailableModels(make);
    return NextResponse.json({ models });
  } catch (error) {
    console.error('[API/live/models] Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
