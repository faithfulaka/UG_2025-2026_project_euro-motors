//src/app/api/cars/[id]/route.ts 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // NEXT.JS 15 FIX: Await params
    const { id } = await params;

    const car = await prisma.buyCar.findUnique({
      where: { id },
      include: {
        images: true
      }
    });

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // Parse JSON fields safely
    const parsedCar = {
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
        : [],
      performanceData: car.performanceData 
        ? (typeof car.performanceData === 'string' 
            ? JSON.parse(car.performanceData) 
            : car.performanceData)
        : null,
      supercarData: car.supercarData 
        ? (typeof car.supercarData === 'string' 
            ? JSON.parse(car.supercarData) 
            : car.supercarData)
        : null,
      pricingData: car.pricingData 
        ? (typeof car.pricingData === 'string' 
            ? JSON.parse(car.pricingData) 
            : car.pricingData)
        : null
    };

    return NextResponse.json(parsedCar);
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json(
      { error: 'Failed to fetch car data' },
      { status: 500 }
    );
  }
}