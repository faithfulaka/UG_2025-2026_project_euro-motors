// src/app/api/spa/makes/route.ts 

import type { NextRequest }    from 'next/server';
import     { NextResponse }   from 'next/server';
import     { prisma }         from '@/lib/prisma';
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
    // database + CarQuery
    const dbRows   = await prisma.buyCar.findMany({ distinct: ['make'], select: { make: true } });
    const dbMakes  = dbRows.map(r => r.make);

    const resp     = await fetch(
      'https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getMakes'
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
    let apiMakes: string[] = [];
    try {
      const parsed = JSON.parse(jsonStr) as { Makes: Array<{ make_display: string }> };
      apiMakes = Array.isArray(parsed.Makes) ? parsed.Makes.map(m => m.make_display) : [];
    } catch {
      apiMakes = [];
    }

    makes = Array.from(new Set([...dbMakes, ...apiMakes])).sort();
  }

  const body: SPAMakesResponse = {
    success:   true,
    makes,
    source,
    cached:    false,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(body);
}