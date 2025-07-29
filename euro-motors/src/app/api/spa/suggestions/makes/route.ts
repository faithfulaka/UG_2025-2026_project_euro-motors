import { NextResponse } from 'next/server';
import { autotraderScraper } from '@/lib/scrapers/autotrader';
import * as bringatrailer from '@/lib/scrapers/bringatrailer';
import * as parkers from '@/lib/scrapers/parkers';

export async function GET() {
  try {
    // Query all sources for live make data
    const results = await Promise.allSettled([
      autotraderScraper.getAvailableMakes(),
      bringatrailer.getAvailableMakes(),
      parkers.getAvailableMakes(),
    ]);
    // Log all results for debugging
    console.log('[API/makes] Scraper results:', results.map(r => ({ status: r.status, value: r.status === 'fulfilled' ? r.value : r.reason })));
    // Only keep fulfilled, non-empty arrays
    const allMakes = results
      .filter(r => r.status === 'fulfilled' && Array.isArray(r.value) && r.value.length > 0)
      .flatMap(r => (r.status === 'fulfilled' ? r.value : []));
    // Ensure all values are strings
    const makes = Array.from(new Set(allMakes.map(m => String(m)))).sort();
    if (makes.length === 0) {
      console.error('[API/makes] All scrapers failed or returned empty.');
      return NextResponse.json({ error: 'No makes found from any live source.' }, { status: 503 });
    }
    return NextResponse.json({ makes });
  } catch (error) {
    console.error('[API/makes] Critical error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
