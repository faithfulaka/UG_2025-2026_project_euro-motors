import { getMakes as getCarQueryMakes } from '@/lib/services/carquery-api';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Accepts source: 'database', 'webbase', or 'combined'
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source') || 'combined';
  const search = searchParams.get('search')?.toLowerCase() || '';

  let makes: string[] = [];

  try {
    if (source === 'database') {
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
    } else if (source === 'webbase') {
      const apiMakes = await getCarQueryMakes();
      makes = apiMakes.filter((m) => m.toLowerCase().includes(search));
    } else if (source === 'combined') {
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
      const dbMakes = dbResults.map((car) => car.make);
      const apiMakes = await getCarQueryMakes();
      const filteredApiMakes = apiMakes.filter((m) => m.toLowerCase().includes(search));
      makes = [...dbMakes, ...filteredApiMakes];
    } else {
      makes = [];
    }
    // Dedupe and limit to 50
    const uniqueMakes = Array.from(new Set(makes)).slice(0, 50);
    return NextResponse.json({ makes: uniqueMakes });
  } catch (error) {
    console.error('Failed to fetch makes:', error);
    return NextResponse.json({ error: 'Failed to fetch makes' }, { status: 500 });
  }
}