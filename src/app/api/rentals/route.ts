// src/app/api/rentals/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RentalCar } from '@/types/cars';

export async function GET() {
  try {
    const rentalCars = await prisma.rentalCar.findMany({
      where: { isAvailable: true },
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    }) as any[];

    // Parse JSON fields with consistent approach
    const parsedRentalCars = rentalCars.map((car: any) => ({
      ...car,
      specifications: typeof car.specifications === 'string' 
        ? JSON.parse(car.specifications) 
        : car.specifications,
      features: typeof car.features === 'string' 
        ? JSON.parse(car.features) 
        : car.features
    })) as RentalCar[];

    return NextResponse.json(parsedRentalCars);
  } catch (error) {
    console.error('Error fetching rental cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental cars' },
      { status: 500 }
    );
  }
}