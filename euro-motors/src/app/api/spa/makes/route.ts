// src/app/api/spa/makes/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse }    from 'next/server';
import { prisma }          from '@/lib/prisma';
import type { SPAMakesResponse } from '@/types/spa';

export async function GET(request: NextRequest) {
  const url    = new URL(request.url);
  const source = (url.searchParams.get('source') as 'database' | 'combined') ?? 'combined';

  let makes: string[];
  if (source === 'database') {
    const rows = await prisma.buyCar.findMany({
      distinct: ['make'],
      select:   { make: true }
    });
    makes = rows.map(r => r.make);
  } else {
    // DB → CarQuery combined
    const dbRows    = await prisma.buyCar.findMany({
      distinct: ['make'],
      select:   { make: true }
    });
    const dbMakes   = dbRows.map(r => r.make);

    const resp      = await fetch(
      'https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getMakes'
    );
    const text      = await resp.text();
    const jsonp     = text.replace(/^[^(]*\((.*)\)$/, '$1');
    const parsed    = JSON.parse(jsonp) as { Makes: Array<{ make_display: string }> };
    const apiMakes  = parsed.Makes.map(m => m.make_display);

    makes = Array.from(new Set([...dbMakes, ...apiMakes])).sort();
  }

  const result: SPAMakesResponse = {
    success: true,
    makes,
    source: source === 'database' ? 'database' : 'combined',
    cached: false,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(result);
}