// src/app/api/buy/cars/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BuyCar } from '@/types/cars';

export async function GET(request: NextRequest) {
  try {
    const cars = await prisma.buyCar.findMany({
      where: {
        isAvailable: true
      },
      include: {
        images: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parse JSON fields safely
    type RawBuyCar = Omit<BuyCar, 'baseMSRP' | 'specifications' | 'features' | 'standardEquipment' | 'addedOptions' | 'performanceData' | 'supercarData' | 'pricingData'> & {
      baseMSRP?: number | null;
      specifications?: unknown;
      features?: unknown;
      standardEquipment?: unknown;
      addedOptions?: unknown;
      performanceData?: unknown;
      supercarData?: unknown;
      pricingData?: unknown;
    };

    const parsedCars = cars.map((car: RawBuyCar) => ({
      ...car,
      standardEquipment: typeof car.standardEquipment === 'string'
        ? (car.standardEquipment ? JSON.parse(car.standardEquipment) : [])
        : (car.standardEquipment ?? []),
      addedOptions: typeof car.addedOptions === 'string'
        ? (car.addedOptions ? JSON.parse(car.addedOptions) : [])
        : (car.addedOptions ?? []),
      baseMSRP: car.baseMSRP === null ? undefined : car.baseMSRP,
      specifications: typeof car.specifications === 'string'
        ? (car.specifications ? JSON.parse(car.specifications) : {})
        : (car.specifications ?? {}),
      features: typeof car.features === 'string'
        ? (car.features ? JSON.parse(car.features) : {})
        : (car.features ?? {}),
      performanceData: typeof car.performanceData === 'string'
        ? (car.performanceData ? JSON.parse(car.performanceData) : undefined)
        : (car.performanceData ?? undefined),
      supercarData: typeof car.supercarData === 'string'
        ? (car.supercarData ? JSON.parse(car.supercarData) : undefined)
        : (car.supercarData ?? undefined),
      pricingData: typeof car.pricingData === 'string'
        ? (car.pricingData ? JSON.parse(car.pricingData) : undefined)
        : (car.pricingData ?? undefined)
    })) as BuyCar[];

    return NextResponse.json({
      success: true,
      cars: parsedCars,
      count: parsedCars.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching buy cars:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch cars',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}