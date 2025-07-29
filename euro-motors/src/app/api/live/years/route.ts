import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  const model = url.searchParams.get('model') || '';
  if (!make || !model) return NextResponse.json({ years: [] });
  try {
    const { AutotraderScraper } = await import('@/lib/scrapers/autotrader');
    const scraper = new AutotraderScraper();
    const years = await scraper.getAvailableYears(make, model);
    return NextResponse.json({ years });
  } catch (error) {
    console.error('[API/live/years] Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
