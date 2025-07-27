// src/app/api/rentals/route.ts
import { NextResponse } from 'next/server';
import { prisma }      from '@/lib/prisma';
import type { RentalCar, CarSpecifications, CarFeatures } from '@/types/cars';

export async function GET() {
  try {
    // Fetch raw rows
    const rows = await prisma.rentalCar.findMany({
      where:   { isAvailable: true },
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    });

    // Map to your RentalCar type
    const result: RentalCar[] = rows.map(row => {
      // Parse out the JSON blobs, asserting to your interfaces so TS is happy
      const specifications = typeof row.specifications === 'string'
        ? (JSON.parse(row.specifications) as CarSpecifications)
        : (row.specifications as CarSpecifications);

      const features = typeof row.features === 'string'
        ? (JSON.parse(row.features) as CarFeatures)
        : (row.features as CarFeatures);

      return {
        ...row,
        specifications,
        features
      };
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Error in GET /api/rentals:', err);
    return NextResponse.json(
      { error: 'Failed to fetch rental cars' },
      { status: 500 }
    );
  }
}