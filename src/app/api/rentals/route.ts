// src/app/api/rentals/route.ts - IMPROVED VERSION
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseRentalCars, rentalCarInclude } from '@/lib/db-helpers';
import type { RentalCar } from '@/types/cars';

/**
 * GET /api/rentals - Fetch all available rental cars
 */
export async function GET() {
  try {
    // Fetch rental cars with images
    const rawCars = await prisma.rentalCar.findMany({
      where: { isAvailable: true },
      include: rentalCarInclude,
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON fields to ensure type safety
    const parsedCars: RentalCar[] = parseRentalCars(rawCars);

    // Return properly typed response
    return NextResponse.json({
      success: true,
      data: parsedCars,
      count: parsedCars.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching rental cars:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch rental cars',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
