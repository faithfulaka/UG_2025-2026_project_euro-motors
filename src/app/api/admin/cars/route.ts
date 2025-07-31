// src/app/api/admin/cars/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Verify admin user
  const isAdmin = await verifyAdmin(request);
  
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get car type from query params
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'buy';
  
  try {
    if (type === 'buy') {
      // Fetch buy cars
      const cars = await prisma.buyCar.findMany({
        include: {
          images: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Parse JSON fields
      const parsedCars = cars.map(car => ({
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
      }));
      
      return NextResponse.json(parsedCars);
    } else if (type === 'rent') {
      // Fetch rental cars
      const cars = await prisma.rentalCar.findMany({
        include: {
          images: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Parse JSON fields
      const parsedCars = cars.map(car => ({
        ...car,
        specifications: typeof car.specifications === 'string' 
          ? JSON.parse(car.specifications as string) 
          : car.specifications,
        features: typeof car.features === 'string' 
          ? JSON.parse(car.features as string) 
          : car.features,
      }));

      return NextResponse.json(parsedCars);
    } else {
      return NextResponse.json(
        { error: 'Invalid car type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
      { status: 500 }
    );
  }
}