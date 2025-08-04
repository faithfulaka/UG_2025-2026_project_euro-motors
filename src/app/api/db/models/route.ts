//src/app/api/db/models/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/db/models?make=Ferrari&search=488
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make')?.trim();
    const search = searchParams.get('search')?.trim() || '';
    
    if (!make) {
      return NextResponse.json({ models: [] });
    }

    // Find distinct models in BuyCar and RentalCar for given make
    const [buyModels, rentModels] = await Promise.all([
      prisma.buyCar.findMany({
        select: { model: true },
        where: {
          make: { equals: make },
          ...(search ? { model: { contains: search } } : {})
        },
      }),
      prisma.rentalCar.findMany({
        select: { model: true },
        where: {
          make: { equals: make },
          ...(search ? { model: { contains: search } } : {})
        },
      }),
    ]);

    // Deduplicate and sort
    const allModels = Array.from(new Set([
      ...buyModels.map((c) => c.model),
      ...rentModels.map((c) => c.model),
    ].filter(Boolean))).sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ models: allModels });
  } catch (error) {
    console.error('DB Models Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models from database' }, 
      { status: 500 }
    );
  }
}
