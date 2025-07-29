import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/db/makes?search=fer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';

    // Find distinct makes in BuyCar and RentalCar
    const [buyMakes, rentMakes] = await Promise.all([
      prisma.buyCar.findMany({
        select: { make: true },

        where: search ? { make: { contains: search } } : undefined,
      }),
      prisma.rentalCar.findMany({
        select: { make: true },
        where: search ? { make: { contains: search } } : undefined,

        where: search ? { make: { contains: search, mode: 'insensitive' } } : undefined,
      }),
      prisma.rentalCar.findMany({
        select: { make: true },
        where: search ? { make: { contains: search, mode: 'insensitive' } } : undefined,

      }),
    ]);

    // Deduplicate and sort
    const allMakes = Array.from(new Set([
      ...buyMakes.map((c) => c.make),
      ...rentMakes.map((c) => c.make),
    ].filter(Boolean))).sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ makes: allMakes });
  } catch (error) {
    console.error('DB Makes Error:', error);
    return NextResponse.json({ error: 'Failed to fetch makes from database' }, { status: 500 });
  }
}
