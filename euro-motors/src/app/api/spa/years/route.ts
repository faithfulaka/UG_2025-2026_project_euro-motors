import { NextRequest, NextResponse } from 'next/server';
import { carQueryService } from '@/lib/services';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const make = url.searchParams.get('make') || '';
  const model = url.searchParams.get('model') || '';

  if (!make || !model) {
    return NextResponse.json({ years: [] });
  }

  try {
    // Pull available years from CarQuery service
    const years = await carQueryService.getYears(make, model);
    // CarQuery returns numbers; ensure deduped & sorted desc
    const uniq = Array.from(new Set(years)).sort((a, b) => Number(b) - Number(a));
    return NextResponse.json({ years: uniq });
  } catch (error) {
    console.error('[SPA suggestions/years] Error fetching years:', error);
    return NextResponse.json({ years: [] }, { status: 500 });
  }
}