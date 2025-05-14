// src/app/api/rentals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  try {
    const car = await prisma.rentalCar.findUnique({
      where: { id },
      include: { images: true }
    });
    
    if (!car) {
      return NextResponse.json(
        { error: 'Rental car not found' },
        { status: 404 }
      );
    }
    
    // Parse JSON fields
    const parsedCar = {
      ...car,
      specifications: typeof car.specifications === 'string' 
        ? JSON.parse(car.specifications as string) 
        : car.specifications,
      features: typeof car.features === 'string' 
        ? JSON.parse(car.features as string) 
        : car.features
    };
    
    return NextResponse.json(parsedCar);
  } catch (error) {
    console.error('Error fetching rental car:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental car data' },
      { status: 500 }
    );
  }
}