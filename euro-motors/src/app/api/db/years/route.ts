import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/db/years?make=Ferrari&model=488
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make')?.trim();
    const model = searchParams.get('model')?.trim();
    if (!make || !model) {
      return NextResponse.json({ years: [] });
    }

    // Find distinct years in BuyCar and RentalCar for given make/model
    const [buyYears, rentYears] = await Promise.all([
      prisma.buyCar.findMany({
        select: { year: true },
        where: {

          make: { equals: make },
          model: { equals: model },

          make: { equals: make, mode: 'insensitive' },
          model: { equals: model, mode: 'insensitive' },

        },
      }),
      prisma.rentalCar.findMany({
        select: { year: true },
        where: {

          make: { equals: make },
          model: { equals: model },

          make: { equals: make, mode: 'insensitive' },
          model: { equals: model, mode: 'insensitive' },

        },
      }),
    ]);

    // Deduplicate and sort (descending)
    const allYears = Array.from(new Set([
      ...buyYears.map((c) => c.year),
      ...rentYears.map((c) => c.year),
    ].filter(Boolean))).sort((a, b) => b - a);

    return NextResponse.json({ years: allYears });
  } catch (error) {
    console.error('DB Years Error:', error);
    return NextResponse.json({ error: 'Failed to fetch years from database' }, { status: 500 });
  }
}
