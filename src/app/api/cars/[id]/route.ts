// src/app/api/cars/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseBuyCar, buyCarInclude } from '@/lib/db-helpers';
import type { BuyCar } from '@/types/cars';

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // NEXT.JS 15 FIX: Await params
    const { id } = await params;

    // Fetch car with proper includes
    const rawCar = await prisma.buyCar.findUnique({
      where: { id },
      include: buyCarInclude
    });

    if (!rawCar) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Car not found'
          }
        },
        { status: 404 }
      );
    }

    // Parse JSON fields using centralized helper
    const parsedCar: BuyCar = parseBuyCar(rawCar as any);

    return NextResponse.json({
      success: true,
      data: parsedCar,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch car data',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}
