import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { AutotraderScraper } from '@/lib/scrapers/autotrader';

const scraper = new AutotraderScraper();

export async function GET(request: NextRequest) {
  // DEV ONLY: Bypass auth in development for backend test script
  if (process.env.NODE_ENV === 'development') {
    process.env.SKIP_AUTH = 'true';
  }
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  if (!make) {
    console.warn('[API/models] No make provided in query. Returning empty array.');
    return NextResponse.json({ models: [], make, source: 'autotrader-live', timestamp: new Date().toISOString() });
  }
  try {
    let models: string[] = await scraper.getAvailableModels(make);
    if (!Array.isArray(models)) models = [];
    // Normalize and deduplicate
    models = Array.from(new Set(models.map(m => m.trim()).filter(Boolean)));
    console.log(`[API/models] Returning ${models.length} models for make: ${make}`);
    if (models.length === 0) {
      console.warn(`[API/models] No models found for make: ${make} from live scraper!`);
    }
    return NextResponse.json({
      models,
      make,
      source: 'autotrader-live',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API/models] Critical error:', error);
    return NextResponse.json({
      models: [],
      make,
      error: (error as Error).message,
      source: 'autotrader-live',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
