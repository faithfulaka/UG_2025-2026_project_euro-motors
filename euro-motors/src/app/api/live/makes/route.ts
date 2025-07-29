import { NextResponse } from 'next/server';


export async function GET() {
  try {
    const { AutotraderScraper } = await import('@/lib/scrapers/autotrader');
    const scraper = new AutotraderScraper();
    const makes = await scraper.getAvailableMakes();
    return NextResponse.json({ makes });
  } catch (error) {
    console.error('[API/live/makes] Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
