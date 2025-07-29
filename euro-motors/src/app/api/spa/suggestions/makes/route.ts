import { NextResponse } from 'next/server';
import { AutotraderScraper } from '@/lib/scrapers/autotrader';

const scraper = new AutotraderScraper();

export async function GET() {
  // DEV ONLY: Bypass auth in development for backend test script
  if (process.env.NODE_ENV === 'development') {
    process.env.SKIP_AUTH = 'true';
  }
  try {
    const makes = await scraper.getAvailableMakes();
    return NextResponse.json({ makes });
  } catch (error) {
    console.error('[API/makes] Critical error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


