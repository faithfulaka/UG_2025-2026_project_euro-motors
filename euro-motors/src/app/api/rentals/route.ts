// src/app/api/rentals/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RentalCar as PrismaRentalCar } from '@prisma/client';

export async function GET() {
  try {
    const rentalCars = await prisma.rentalCar.findMany({
      where: { isAvailable: true },
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON fields with proper typing
    const parsedRentalCars = rentalCars.map((car: PrismaRentalCar & { images: any[] }) => ({
      ...car,
      specifications: typeof car.specifications === 'string' 
        ? JSON.parse(car.specifications as string) 
        : car.specifications,
      features: typeof car.features === 'string' 
        ? JSON.parse(car.features as string) 
        : car.features
    }));

    return NextResponse.json(parsedRentalCars);
  } catch (error) {
    console.error('Error fetching rental cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental cars' },
      { status: 500 }
    );
  }
}