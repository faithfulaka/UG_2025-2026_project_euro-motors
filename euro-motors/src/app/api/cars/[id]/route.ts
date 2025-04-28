// app/api/cars/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    const car = await prisma.buyCar.findUnique({
      where: { id }
      // No need to include images anymore since we're generating paths locally
    });
    
    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }
    
    // Parse JSON fields
    const parsedCar = {
      ...car,
      specifications: JSON.parse(car.specifications as string),
      features: JSON.parse(car.features as string),
      standardEquipment: car.standardEquipment ? JSON.parse(car.standardEquipment as string) : [],
      addedOptions: car.addedOptions ? JSON.parse(car.addedOptions as string) : []
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