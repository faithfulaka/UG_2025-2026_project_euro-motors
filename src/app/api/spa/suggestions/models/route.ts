//src/app/api/spa/suggestions/models/route.ts   

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source') || 'combined';
  const make = searchParams.get('make')?.toLowerCase() || '';
  const search = searchParams.get('search')?.toLowerCase() || '';

  let models: string[] = [];

  try {
    if (source === 'local' || source === 'combined') {
      const dbResults = await prisma.buyCar.findMany({
        where: {
          make: { equals: make },
          model: { contains: search },
        },
        select: { model: true },
        distinct: ['model'],
        take: 50,
      });

      models = dbResults.map((car) => car.model);
    }

    return NextResponse.json({ models: Array.from(new Set(models)) });
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}