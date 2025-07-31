//src/app/api/spa/suggestions/years/route.ts 

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const make = searchParams.get('make') || '';
  const model = searchParams.get('model') || '';
  const source = searchParams.get('source') || 'local';

  let dbYears: { year: number }[] = [];

  if ((source === 'local' || source === 'combined') && make && model) {
    dbYears = await prisma.buyCar.findMany({
      where: {
        make: { equals: make },
        model: { equals: model }
      },
      select: {
        year: true
      },
      distinct: ['year']
    });
  }

  const years = dbYears.map((entry) => entry.year?.toString()).filter(Boolean).sort((a, b) => Number(b) - Number(a));

  return NextResponse.json({ years });
}