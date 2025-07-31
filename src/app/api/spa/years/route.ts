// src/app/api/spa/years/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { carQueryService } from '@/lib/services';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') ?? '';
  const model = url.searchParams.get('model') ?? '';

  if (!make || !model) {
    return NextResponse.json({ years: [] });
  }

  try {
    const years = await carQueryService.getYears(make, model);
    const uniq = Array.from(new Set(years)).sort((a, b) => b - a);
    return NextResponse.json({ years: uniq });
  } catch (error: unknown) {
    console.error('[SPA suggestions/years] Error fetching years:', error);
    return NextResponse.json({ years: [] }, { status: 500 });
  }
}