// src/app/api/cars/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BuyCar } from '@/types/cars';

export async function GET() {
  try {
    const cars = await prisma.buyCar.findMany({
      where: { isAvailable: true },
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    }) as any[];

    // Parse JSON fields with consistent approach
    const parsedCars = cars.map((car: any) => ({
      ...car,
      specifications: typeof car.specifications === 'string' 
        ? JSON.parse(car.specifications) 
        : car.specifications,
      features: typeof car.features === 'string' 
        ? JSON.parse(car.features) 
        : car.features,
      standardEquipment: car.standardEquipment 
        ? (typeof car.standardEquipment === 'string' 
            ? JSON.parse(car.standardEquipment) 
            : car.standardEquipment)
        : [],
      addedOptions: car.addedOptions 
        ? (typeof car.addedOptions === 'string' 
            ? JSON.parse(car.addedOptions) 
            : car.addedOptions) 
        : []
    })) as BuyCar[];

    return NextResponse.json(parsedCars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
      { status: 500 }
    );
  }
}