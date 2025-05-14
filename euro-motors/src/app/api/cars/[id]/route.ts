// src/app/api/cars/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params; // Proper destructuring
  
  try {
    const car = await prisma.buyCar.findUnique({
      where: { id },
      include: { images: true }
    });
    
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    
    // Parse JSON fields
    const result = {
      ...car,
      specifications: typeof car.specifications === 'string' 
        ? JSON.parse(car.specifications as string) 
        : car.specifications,
      features: typeof car.features === 'string' 
        ? JSON.parse(car.features as string) 
        : car.features,
      standardEquipment: car.standardEquipment 
        ? (typeof car.standardEquipment === 'string' 
            ? JSON.parse(car.standardEquipment as string) 
            : car.standardEquipment)
        : [],
      addedOptions: car.addedOptions 
        ? (typeof car.addedOptions === 'string' 
            ? JSON.parse(car.addedOptions as string) 
            : car.addedOptions) 
        : []
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json({ error: 'Failed to fetch car' }, { status: 500 });
  }
}