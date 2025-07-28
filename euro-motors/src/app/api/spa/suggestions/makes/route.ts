import { NextResponse } from 'next/server';
import { autotraderScraper } from '@/lib/scrapers/autotrader';
import * as bringatrailer from '@/lib/scrapers/bringatrailer';
import * as parkers from '@/lib/scrapers/parkers';

export async function GET() {
  try {
    const [autoMakes, batMakes, parkersMakes] = await Promise.all([
      autotraderScraper.getAvailableMakes(),
      bringatrailer.getAvailableMakes(),
      parkers.getAvailableMakes(),
    ]);
    const makes = Array.from(new Set([...autoMakes, ...batMakes, ...parkersMakes])).sort();
    return NextResponse.json({ makes });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
