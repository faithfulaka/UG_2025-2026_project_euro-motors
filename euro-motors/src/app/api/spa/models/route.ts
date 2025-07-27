// src/app/api/spa/models/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse }    from 'next/server';
import { prisma }          from '@/lib/prisma';
import type { SPAModelsResponse } from '@/types/spa';

export async function GET(request: NextRequest) {
  const url    = new URL(request.url);
  const make   = url.searchParams.get('make') ?? '';
  const source = (url.searchParams.get('source') as 'database' | 'combined') ?? 'combined';

  if (!make) {
    const empty: SPAModelsResponse = {
      success: true,
      models: [],
      make,
      source: 'combined',
      cached: false,
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(empty);
  }

  let models: string[];
  if (source === 'database') {
    const rows = await prisma.buyCar.findMany({
      where:    { make },
      distinct: ['model'],
      select:   { model: true }
    });
    models = rows.map(r => r.model);
  } else {
    // DB + CarQuery
    const dbRows   = await prisma.buyCar.findMany({
      where:    { make },
      distinct: ['model'],
      select:   { model: true }
    });
    const dbModels = dbRows.map(r => r.model);

    const resp      = await fetch(
      `https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getModels&make=${encodeURIComponent(make)}`
    );
    const text      = await resp.text();
    const jsonp     = text.replace(/^[^(]*\((.*)\)$/, '$1');
    const parsed    = JSON.parse(jsonp) as { Models: Array<{ model_name: string }> };
    const apiModels = parsed.Models.map(m => m.model_name);

    models = Array.from(new Set([...dbModels, ...apiModels])).sort();
  }

  const result: SPAModelsResponse = {
    success: true,
    models,
    make,
    source: source === 'database' ? 'database' : 'combined',
    cached: false,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(result);
}