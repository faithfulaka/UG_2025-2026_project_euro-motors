// src/app/api/cars/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BuyCar } from '@/types/cars';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params; // Proper destructuring
  
  try {
    const car = await prisma.buyCar.findUnique({
      where: { id },
      include: { images: true }
    }) as any;
    
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    
    // Parse JSON fields with consistent approach
    const result = {
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
    } as BuyCar;
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json({ error: 'Failed to fetch car' }, { status: 500 });
  }
}