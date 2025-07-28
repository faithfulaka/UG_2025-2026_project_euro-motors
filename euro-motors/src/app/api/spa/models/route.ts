import type { NextRequest }    from 'next/server';
import     { NextResponse }   from 'next/server';
import     { prisma }         from '@/lib/prisma';
import type { SPAModelsResponse } from '@/types/spa';

export async function GET(request: NextRequest) {
  const url    = new URL(request.url);
  const make   = url.searchParams.get('make')   ?? '';
  const source = (url.searchParams.get('source') as 'database' | 'combined') ?? 'combined';

  let models: string[] = [];
  if (make) {
    if (source === 'database') {
      const rows = await prisma.buyCar.findMany({
        where:    { make },
        distinct: ['model'],
        select:   { model: true }
      });
      models = rows.map(r => r.model);
    } else {
      const dbRows    = await prisma.buyCar.findMany({
        where:    { make },
        distinct: ['model'],
        select:   { model: true }
      });
      const dbModels  = dbRows.map(r => r.model);

      const resp       = await fetch(
        `https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getModels&make=${encodeURIComponent(make)}`
      );
      const text = await resp.text();
      // Robust JSONP stripping for CarQuery
      let jsonStr = text.trim();
      if (jsonStr.startsWith('?(')) jsonStr = jsonStr.slice(2);
      if (jsonStr.endsWith(');')) jsonStr = jsonStr.slice(0, -2);
      else if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
      // Fallback: find first { and last }
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
      }
      const parsed = JSON.parse(jsonStr) as { Models: Array<{ model_name: string }> };
      const apiModels = parsed.Models.map(m => m.model_name);

      models = Array.from(new Set([...dbModels, ...apiModels])).sort();
    }
  }

  const body: SPAModelsResponse = {
    success:   true,
    models,
    make,
    source,
    cached:    false,
    timestamp: new Date().toISOString()
  };
  return NextResponse.json(body);
}