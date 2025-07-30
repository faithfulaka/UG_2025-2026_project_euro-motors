import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/services';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const make = searchParams.get('make');
  const model = searchParams.get('model');
  const source = (searchParams.get('source') as 'database' | 'webbase' | 'combined') ?? 'combined';
  if (!make || !model) {
    return NextResponse.json({ years: [] }, { status: 400 });
  }

  let years: number[] = [];
  if (source === 'database' || source === 'combined') {
    const rows = await prisma.buyCar.findMany({
      where: { make, model },
      distinct: ['year'],
      select: { year: true }
    });
    years = rows.map(r => r.year);
  }

  if (source === 'webbase' || source === 'combined') {
    const apiYears = await carQueryService.getYears(make, model)
      .then(arr => arr.map(y => typeof y === 'string' ? parseInt(y, 10) : y));
    years = [...years, ...apiYears];
  }

  years = Array.from(new Set(years)).sort((a, b) => b - a);
  return NextResponse.json({ years });
}