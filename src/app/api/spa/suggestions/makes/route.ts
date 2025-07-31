//src/app/api/spa/suggestions/makes/route.ts   

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source') || 'combined';
  const search = searchParams.get('search')?.toLowerCase() || '';

  let makes: string[] = [];

  try {
    if (source === 'local' || source === 'combined') {
      const dbResults = await prisma.buyCar.findMany({
        where: {
          make: {
            contains: search,
          },
        },
        select: { make: true },
        distinct: ['make'],
        take: 50,
      });

      makes = dbResults.map((car) => car.make);
    }

    return NextResponse.json({ makes: Array.from(new Set(makes)) });
  } catch (error) {
    console.error('Failed to fetch makes:', error);
    return NextResponse.json({ error: 'Failed to fetch makes' }, { status: 500 });
  }
}