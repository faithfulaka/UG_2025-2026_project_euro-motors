// src/app/api/spa/suggestions/route.ts
import type { NextRequest }      from 'next/server';
import     { NextResponse }     from 'next/server';
import     { prisma }           from '@/lib/prisma';
import     { carQueryService }  from '@/lib/services';
import type { SPASuggestion }   from '@/types/spa';

const CACHE_TTL = 1000 * 60 * 10; // 10m
const cache     = new Map<string, { data: SPASuggestion[]; expires: number }>();

export async function GET(request: NextRequest) {
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
    // 1) from DB
    const db = await prisma.buyCar.groupBy({
      by: ['make'],
      where: { make: { contains: search } },
      _count: { make:true },
      orderBy: { _count:{ make:'desc' } },
      take: 15
    });
    suggestions = db.map(d => ({
      type: 'make',
      value: d.make,
      label: d.make,
      count: Number(d._count?.make ?? 0),
      popular: true,
      source: 'database',
      displayName: d.make
    }));

    // 2) supplement with CarQuery
    if (suggestions.length < 10) {
      const more = await carQueryService.getMakes(search);
      for (const m of more) {
        if (suggestions.find(s=>s.value.toLowerCase()===m.toLowerCase())) continue;
        suggestions.push({
          type: 'make',
          value: m,
          label: m,
          count: 0,
          popular: false,
          source: 'carquery',
          displayName: m
        });
      }
    }
  }
  else if (type === 'models') {
    if (!make) {
      return NextResponse.json(
        { success:false, error:{ code:'INVALID_INPUT', message:'make is required for models' } },
        { status:400 }
      );
    }
    const db = await prisma.buyCar.groupBy({
      by: ['model','year'],
      where: { make, model: { contains: search } },
      _count:{ model:true },
      orderBy:{ _count:{ model:'desc' }, year:'desc'},
      take:15
    });
    suggestions = db.map(d=>({
      type: 'model',
      value: d.model || '',
      label: (d.model || '') + ` (${d.year})`,
      count: Number(d._count?.model ?? 0),
      popular: true,
      source: 'database',
      displayName: d.model || ''
    }));
    if (suggestions.length < 10) {
      const more = await carQueryService.getModels(make, search);
      for (const m of more) {
        if (suggestions.find(s=>s.value.toLowerCase()===m.toLowerCase())) continue;
        suggestions.push({
          type: 'model',
          value: m,
          label: m,
          count: 0,
          popular: false,
          source: 'carquery',
          displayName: m
        });
      }
    }
  }
  else if (type === 'years') {
    if (!make || !model) {
      return NextResponse.json(
        { success:false, error:{ code:'INVALID_INPUT', message:'make+model required for years' } },
        { status:400 }
      );
    }
    const db = await prisma.buyCar.groupBy({
      by:['year'],
      where:{ make, model },
      _count:{ year:true },
      orderBy:{ year:'desc' },
      take:10
    });
    suggestions = db.map(d=>({
      type: 'year',
      value: String(d.year),
      label: String(d.year),
      count: Number(d._count?.year ?? 0),
      popular: Number(d.year) >= new Date().getFullYear() - 3,
      source: 'database',
      displayName: String(d.year)
    }));
    if (suggestions.length < 5) {
      const more = await carQueryService.getYears(make, model);
      for (const y of more) {
        const vs = String(y);
        if (suggestions.find(s=>s.value===vs)) continue;
        suggestions.push({
          type:'year',
          value:vs,
          label:vs,
          count:0,
          popular: Number(y) >= new Date().getFullYear()-3,
          source:'carquery',
          displayName: vs
        });
      }
    }
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