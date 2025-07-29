import { NextResponse } from 'next/server';


export async function GET() {
  // DEV ONLY: Bypass auth in development for backend test script
  if (process.env.NODE_ENV === 'development') {
    process.env.SKIP_AUTH = 'true';
  }
  try {
    // Aggregate makes from all easy-to-scrape sources
    const sources = [];
    const errors: string[] = [];
    let allMakes: string[] = [];

    // 1. Autotrader UK (dynamic import)
    try {
      const { AutotraderScraper } = await import('@/lib/scrapers/autotrader');
      const autotrader = new AutotraderScraper();
      const makes = await autotrader.getAvailableMakes();
      allMakes = allMakes.concat(makes);
      sources.push('autotrader');
    } catch (e) {
      errors.push('autotrader: ' + (e as Error).message);
    }

    // 2. Bring a Trailer
    try {
      const { getAvailableMakes: getBaTMakes } = await import('@/lib/scrapers/bringatrailer');
      const batMakes = await getBaTMakes();
      if (Array.isArray(batMakes)) {
        allMakes = allMakes.concat(batMakes);
        sources.push('bringatrailer');
      }
    } catch (e) {
      errors.push('bringatrailer: ' + (e as Error).message);
    }

    // 3. Parkers
    try {
      const { getAvailableMakes: getParkersMakes } = await import('@/lib/scrapers/parkers');
      const parkersMakes = await getParkersMakes();
      if (Array.isArray(parkersMakes)) {
        allMakes = allMakes.concat(parkersMakes);
        sources.push('parkers');
      }
    } catch (e) {
      errors.push('parkers: ' + (e as Error).message);
    }


    // 5. CarQuery API (global fallback)
    try {
      const { carQueryService } = await import('@/lib/services');
      const cqMakes = await carQueryService.getMakes();
      if (Array.isArray(cqMakes)) {
        allMakes = allMakes.concat(cqMakes);
        sources.push('carquery');
      }
    } catch (e) {
      errors.push('carquery: ' + (e as Error).message);
    }

    // Deduplicate and normalize
    allMakes = Array.from(new Set(allMakes.map((m) => (m || '').trim()).filter(Boolean)));
    allMakes.sort((a, b) => a.localeCompare(b));

    return NextResponse.json({
      makes: allMakes,
      sources,
      errors: errors.length ? errors : undefined,
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


