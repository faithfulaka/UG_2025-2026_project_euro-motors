import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  const model = url.searchParams.get('model') || '';
  if (!make || !model) return NextResponse.json({ years: [] });
  try {
    const sources = [];
    const errors: string[] = [];
    let allYears: (string|number)[] = [];

    // 1. Autotrader UK (dynamic import)
    try {
      const { AutotraderScraper } = await import('@/lib/scrapers/autotrader');
      const autotrader = new AutotraderScraper();
      const years = await autotrader.getAvailableYears(make, model);
      if (Array.isArray(years)) {
        allYears = allYears.concat(years);
        sources.push('autotrader');
      }
    } catch (e) {
      errors.push('autotrader: ' + (e as Error).message);
    }

    // 2. Bring a Trailer
    try {
      const { getAvailableYears: getBaTYears } = await import('@/lib/scrapers/bringatrailer');
      const batYears = await getBaTYears(make, model);
      if (Array.isArray(batYears)) {
        allYears = allYears.concat(batYears);
        sources.push('bringatrailer');
      }
    } catch (e) {
      errors.push('bringatrailer: ' + (e as Error).message);
    }

    // 3. Parkers
    try {
      const { getAvailableYears: getParkersYears } = await import('@/lib/scrapers/parkers');
      const parkersYears = await getParkersYears(make, model);
      if (Array.isArray(parkersYears)) {
        allYears = allYears.concat(parkersYears);
        sources.push('parkers');
      }
    } catch (e) {
      errors.push('parkers: ' + (e as Error).message);
    }

    // 4. Porsche Configurator (only for Porsche)
    if (make.toLowerCase() === 'porsche') {
      try {
        const { getAvailableYears: getPorscheYears } = await import('@/lib/scrapers/porsche');
        const porscheYears = await getPorscheYears(model);
        if (Array.isArray(porscheYears)) {
          allYears = allYears.concat(porscheYears);
          sources.push('porsche');
        }
      } catch (e) {
        errors.push('porsche: ' + (e as Error).message);
      }
    }

    // 5. CarQuery API (global fallback)
    try {
      const { carQueryService } = await import('@/lib/services');
      const cqYears = await carQueryService.getYears(make, model);
      if (Array.isArray(cqYears)) {
        allYears = allYears.concat(cqYears);
        sources.push('carquery');
      }
    } catch (e) {
      errors.push('carquery: ' + (e as Error).message);
    }

    // Deduplicate, cast all to string, and sort descending
    allYears = Array.from(new Set(allYears.map((y) => String(y).trim()).filter(Boolean)));
    allYears.sort((a, b) => Number(b) - Number(a));

    return NextResponse.json({
      years: allYears,
      make,
      model,
      sources,
      errors: errors.length ? errors : undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API/years] Critical error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
