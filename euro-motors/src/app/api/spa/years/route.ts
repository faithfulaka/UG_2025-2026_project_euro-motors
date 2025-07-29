// src/app/api/spa/years/route.ts
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  // DEV ONLY: Bypass auth in development for backend test script
  if (process.env.NODE_ENV === 'development') {
    process.env.SKIP_AUTH = 'true';
  }
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  const model = url.searchParams.get('model') || '';
  if (!make || !model) {
    console.warn('[API/years] No make or model provided in query. Returning empty array.');
    return NextResponse.json({ years: [], make, model, source: 'autotrader-live', timestamp: new Date().toISOString() });
  }
  try {
    const resp = await fetch(`http://localhost:4001/years?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
    if (!resp.ok) throw new Error('Failed to fetch years from scraper backend');
    let { years } = await resp.json();
    // Normalize, deduplicate, sort descending
    years = Array.from(new Set((years as (string|number)[]).map((y: string|number) => typeof y === 'string' ? y.trim() : y)))
      .filter(Boolean)
      .sort((b: string|number, a: string|number) => Number(a) - Number(b));
    console.log(`[API/years] Returning ${years.length} years for make: ${make}, model: ${model}`);
    if (years.length === 0) {
      console.warn(`[API/years] No years found for make: ${make}, model: ${model} from live scraper!`);
    }
    return NextResponse.json({
      years,
      make,
      model,
      source: 'autotrader-live',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API/years] Critical error:', error);
    return NextResponse.json({
      years: [],
      make,
      model,
      error: (error as Error).message,
      source: 'autotrader-live',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}