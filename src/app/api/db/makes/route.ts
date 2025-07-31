import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

interface CarMake {
  make: string;
}

// GET /api/db/makes?search=fer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';

    // Find distinct makes in BuyCar and RentalCar with case-insensitive search
    const [buyMakes, rentMakes] = await Promise.all([
      prisma.$queryRaw<CarMake[]>`
        SELECT DISTINCT make 
        FROM BuyCar 
        ${search ? Prisma.sql`WHERE LOWER(make) LIKE LOWER(${'%' + search + '%'})` : Prisma.empty}
        ORDER BY make
      `,
      prisma.$queryRaw<CarMake[]>`
        SELECT DISTINCT make 
        FROM RentalCar 
        ${search ? Prisma.sql`WHERE LOWER(make) LIKE LOWER(${'%' + search + '%'})` : Prisma.empty}
        ORDER BY make
      `,
    ]);

    // Deduplicate and sort
    const allMakes = Array.from(new Set([
      ...buyMakes.map((c: CarMake) => c.make),
      ...rentMakes.map((c: CarMake) => c.make),
    ].filter(Boolean))).sort((a: string, b: string) => a.localeCompare(b));

    return NextResponse.json({ makes: allMakes });
  } catch (error) {
    console.error('DB Makes Error:', error);
    return NextResponse.json({ error: 'Failed to fetch makes from database' }, { status: 500 });
  }
}
