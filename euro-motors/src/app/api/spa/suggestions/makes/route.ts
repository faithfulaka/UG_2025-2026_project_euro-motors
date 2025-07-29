import { NextResponse } from 'next/server';
import { AutotraderScraper } from '@/lib/scrapers/autotrader';

const scraper = new AutotraderScraper();

export async function GET() {
  // DEV ONLY: Bypass auth in development for backend test script
  if (process.env.NODE_ENV === 'development') {
    process.env.SKIP_AUTH = 'true';
  }
  try {
    let makes: string[] = await scraper.getAvailableMakes();
    if (!Array.isArray(makes)) makes = [];
    // Normalize and deduplicate
    makes = Array.from(new Set(makes.map(m => m.trim()).filter(Boolean)));
    console.log(`[API/makes] Returning ${makes.length} makes.`);
    if (makes.length === 0) {
      console.warn('[API/makes] No makes found from live scraper!');
    }
    return NextResponse.json({
      makes,
      source: 'autotrader-live',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API/makes] Critical error:', error);
    return NextResponse.json({
      makes: [],
      error: (error as Error).message,
      source: 'autotrader-live',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}


