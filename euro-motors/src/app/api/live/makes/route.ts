import { NextRequest, NextResponse } from 'next/server';
import { AutotraderScraper } from '@/lib/scrapers/autotrader';

const scraper = new AutotraderScraper();

export async function GET(request: NextRequest) {
  try {
    const makes = await scraper.getAvailableMakes();
    return NextResponse.json({ makes });
  } catch (error) {
    console.error('[API/live/makes] Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
