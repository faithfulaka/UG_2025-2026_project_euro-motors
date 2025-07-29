import { NextRequest, NextResponse } from 'next/server';
import { autotraderScraper } from '@/lib/scrapers/autotrader';
import * as bringatrailer from '@/lib/scrapers/bringatrailer';
import * as parkers from '@/lib/scrapers/parkers';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  if (!make) return NextResponse.json({ models: [] });
  try {
    // Query all sources for live model data
    const results = await Promise.allSettled([
      autotraderScraper.getAvailableModels(make),
      bringatrailer.getAvailableModels(make),
      parkers.getAvailableModels(make),
    ]);
    // Only keep fulfilled, non-empty arrays
    const allModels = results
      .filter(r => r.status === 'fulfilled' && Array.isArray(r.value) && r.value.length > 0)
      .flatMap(r => (r.status === 'fulfilled' ? r.value : []));
    const models = Array.from(new Set(allModels)).sort();
    return NextResponse.json({ models });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
