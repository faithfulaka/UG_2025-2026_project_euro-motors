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
    // Only keep fulfilled, non-empty arrays
    const allMakes = results
      .filter(r => r.status === 'fulfilled' && Array.isArray(r.value) && r.value.length > 0)
      .flatMap(r => (r.status === 'fulfilled' ? r.value : []));
    const makes = Array.from(new Set(allMakes)).sort();
    return NextResponse.json({ makes });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
