import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

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
    const sources = [];
    const errors: string[] = [];
    let allModels: string[] = [];

    // 1. Autotrader UK (dynamic import)
    try {
      const { AutotraderScraper } = await import('@/lib/scrapers/autotrader');
      const autotrader = new AutotraderScraper();
      const models = await autotrader.getAvailableModels(make);
      allModels = allModels.concat(models);
      sources.push('autotrader');
    } catch (e) {
      errors.push('autotrader: ' + (e as Error).message);
    }

    // 2. Bring a Trailer
    try {
      const { getAvailableModels: getBaTModels } = await import('@/lib/scrapers/bringatrailer');
      const batModels = await getBaTModels(make);
      if (Array.isArray(batModels)) {
        allModels = allModels.concat(batModels);
        sources.push('bringatrailer');
      }
    } catch (e) {
      errors.push('bringatrailer: ' + (e as Error).message);
    }

    // 3. Parkers
    try {
      const { getAvailableModels: getParkersModels } = await import('@/lib/scrapers/parkers');
      const parkersModels = await getParkersModels(make);
      if (Array.isArray(parkersModels)) {
        allModels = allModels.concat(parkersModels);
        sources.push('parkers');
      }
    } catch (e) {
      errors.push('parkers: ' + (e as Error).message);
    }

    // 4. Porsche Configurator (only for Porsche)
    if (make.toLowerCase() === 'porsche') {
      try {
        const { getAvailableModels: getPorscheModels } = await import('@/lib/scrapers/porsche');
        const porscheModels = await getPorscheModels();
        if (Array.isArray(porscheModels)) {
          allModels = allModels.concat(porscheModels);
          sources.push('porsche');
        }
      } catch (e) {
        errors.push('porsche: ' + (e as Error).message);
      }
    }

    // 5. CarQuery API (global fallback)
    try {
      const { carQueryService } = await import('@/lib/services');
      const cqModels = await carQueryService.getModels(make);
      if (Array.isArray(cqModels)) {
        allModels = allModels.concat(cqModels);
        sources.push('carquery');
      }
    } catch (e) {
      errors.push('carquery: ' + (e as Error).message);
    }

    // Deduplicate and normalize
    allModels = Array.from(new Set(allModels.map((m) => (m || '').trim()).filter(Boolean)));
    allModels.sort((a, b) => a.localeCompare(b));

    return NextResponse.json({
      models: allModels,
      make,
      sources,
      errors: errors.length ? errors : undefined,
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
