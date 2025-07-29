// src/app/api/spa/suggestions/route.ts
import type { NextRequest }      from 'next/server';
import     { NextResponse }     from 'next/server';
// import { prisma } from '@/lib/prisma'; // no longer used, all data is live-scraped
import     { carQueryService }  from '@/lib/services';
// Patch: Allow dynamic 'source' string for SPASuggestion
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SPASuggestionPatched = Omit<import('@/types/spa').SPASuggestion, 'source'> & { source: string };
import type { SPASuggestion }   from '@/types/spa';

const CACHE_TTL = 1000 * 60 * 10; // 10m
const cache     = new Map<string, { data: SPASuggestion[]; expires: number }>();

export async function GET(request: NextRequest) {
  // DEV ONLY: Bypass auth in development for backend test script
  if (process.env.NODE_ENV === 'development') {
    process.env.SKIP_AUTH = 'true';
  }
  const url    = new URL(request.url);
  const type   = url.searchParams.get('type') as 'makes' | 'models' | 'years' | null;
  const make   = url.searchParams.get('make')   ?? '';
  const model  = url.searchParams.get('model')  ?? '';
  const search = url.searchParams.get('search') ?? '';

  if (!type) {
    return NextResponse.json(
      { success: false, error: { code:'INVALID_INPUT', message:'type is required' } },
      { status: 400 }
    );
  }

  // attempt cache
  const key = `${type}|${make}|${model}|${search}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) {
    return NextResponse.json({ success:true, data:hit.data, source:'cache' });
  }

  let suggestions: SPASuggestion[] = [];

  if (type === 'makes') {
    // 1) from CarQuery API (live, easy, global)
    const carQueryMakes = await carQueryService.getMakes(search);
    suggestions = carQueryMakes.map(m => ({
      type: 'make',
      value: m,
      label: m,
      count: 0,
      popular: false,
      source: 'carquery',
      displayName: m
    }));

    // 2) supplement with marketScraperService (live, multi-site)
    try {
      const { marketScraperService } = await import('@/lib/scrapers/market-scrapers');
      const result = await marketScraperService.scrapeAllMarketData(search, '', undefined);
      if (result.success && Array.isArray(result.data)) {
        for (const market of result.data) {
          for (const listing of market.listings) {
            const make = search || (listing.title.split(' ')[0] || '').trim();
            if (!make) continue;
            if (!suggestions.find(s => s.value.toLowerCase() === make.toLowerCase())) {
              suggestions.push({
                type: 'make',
                value: make,
                label: make,
                count: 1,
                popular: false,
                source: market.source,
                displayName: make
              });
            }
          }
        }
      }
    } catch {

      // fallback: ignore scraper error, just use carquery
    }
    // deduplicate
    suggestions = suggestions.filter((s, idx, arr) =>
      arr.findIndex(t => t.value.toLowerCase() === s.value.toLowerCase()) === idx
    );
  }
  else if (type === 'models') {
    if (!make) {
      return NextResponse.json(
        { success:false, error:{ code:'INVALID_INPUT', message:'make is required for models' } },
        { status:400 }
      );
    }
    // 1) from CarQuery API (live, easy, global)
    const carQueryModels = await carQueryService.getModels(make, search);
    suggestions = carQueryModels.map(m => ({
      type: 'model',
      value: m,
      label: m,
      count: 0,
      popular: false,
      source: 'carquery',
      displayName: m
    }));
    // 2) supplement with marketScraperService (live, multi-site)
    try {
      const { marketScraperService } = await import('@/lib/scrapers/market-scrapers');
      const result = await marketScraperService.scrapeAllMarketData(make, search, undefined);
      if (result.success && Array.isArray(result.data)) {
        for (const market of result.data) {
          for (const listing of market.listings) {
            // Try to extract model from title (after make)
            const parts = listing.title.split(' ');
            if (parts.length < 2) continue;
            const model = parts.slice(1, 3).join(' ').trim();
            if (!model) continue;
            if (!suggestions.find(s => s.value.toLowerCase() === model.toLowerCase())) {
              suggestions.push({
                type: 'model',
                value: model,
                label: model,
                count: 1,
                popular: false,
                source: market.source,
                displayName: model
              });
            }
          }
        }
      }
    } catch {

      // fallback: ignore scraper error, just use carquery
    }
    // deduplicate
    suggestions = suggestions.filter((s, idx, arr) =>
      arr.findIndex(t => t.value.toLowerCase() === s.value.toLowerCase()) === idx
    );
  }
  else if (type === 'years') {
    if (!make || !model) {
      return NextResponse.json(
        { success:false, error:{ code:'INVALID_INPUT', message:'make+model required for years' } },
        { status:400 }
      );
    }
    // 1) from CarQuery API (live, easy, global)
    const carQueryYears = await carQueryService.getYears(make, model);
    suggestions = carQueryYears.map(y => {
      const vs = String(y);
      return {
        type: 'year',
        value: vs,
        label: vs,
        count: 0,
        popular: Number(y) >= new Date().getFullYear() - 3,
        source: 'carquery',
        displayName: vs
      };
    });
    // 2) supplement with marketScraperService (live, multi-site)
    try {
      const { marketScraperService } = await import('@/lib/scrapers/market-scrapers');
      const result = await marketScraperService.scrapeAllMarketData(make, model, undefined);
      if (result.success && Array.isArray(result.data)) {
        for (const market of result.data) {
          for (const listing of market.listings) {
            // Try to extract year from title or listing
            const yearMatch = listing.title.match(/\b(19|20)\d{2}\b/);
            const year = yearMatch ? yearMatch[0] : String(listing.year || '');
            if (!year || isNaN(Number(year))) continue;
            if (!suggestions.find(s => s.value === year)) {
              suggestions.push({
                type: 'year',
                value: year,
                label: year,
                count: 1,
                popular: Number(year) >= new Date().getFullYear() - 3,
                source: String(market.source), // allow dynamic source string
                displayName: year
              });
            }
          }
        }
      }
    } catch {

      // fallback: ignore scraper error, just use carquery
    }
    // deduplicate
    suggestions = suggestions.filter((s, idx, arr) =>
      arr.findIndex(t => t.value === s.value) === idx
    );
  }

  // sort: popular first, then by label
  suggestions.sort((a,b)=>{
    if (a.popular!==b.popular) return a.popular ? -1 : 1;
    return a.label.localeCompare(b.label);
  });

  // cache
  cache.set(key, { data: suggestions, expires: Date.now() + CACHE_TTL });

  return NextResponse.json({ success:true, data: suggestions });
}