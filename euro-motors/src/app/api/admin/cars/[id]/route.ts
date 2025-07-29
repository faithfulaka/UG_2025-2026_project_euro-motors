// src/app/api/admin/cars/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Extract id from the URL path
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const id = pathParts[pathParts.length - 1] || '';
  // Verify admin user
  const isAdmin = await verifyAdmin(request);
  
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = params;
  
  // Get car type from query params
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'buy';
  
  try {
    if (type === 'buy') {
      // Fetch car details
      const car = await prisma.buyCar.findUnique({
        where: { id },
        include: {
          images: true
        }
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
      
      return NextResponse.json(parsedCar);
    } else if (type === 'rent') {
      // Fetch car details
      const car = await prisma.rentalCar.findUnique({
        where: { id },
        include: {
          images: true
        }
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
        specifications: typeof car.specifications === 'string' 
          ? JSON.parse(car.specifications as string) 
          : car.specifications,
        features: typeof car.features === 'string' 
          ? JSON.parse(car.features as string) 
          : car.features
      };
      
      return NextResponse.json(parsedCar);
    } else {
      return NextResponse.json(
        { error: 'Invalid car type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json(
      { error: 'Failed to fetch car' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify admin user
  const isAdmin = await verifyAdmin(request);
  
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = params;
  
  // Get car type from query params
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'buy';
  
  try {
    const data = await request.json();
    
    if (type === 'buy') {
      // Check if car exists
      const existingCar = await prisma.buyCar.findUnique({
        where: { id }
      });
      
      if (!existingCar) {
        return NextResponse.json(
          { error: 'Car not found' },
          { status: 404 }
        );
      }
      
      // Update car in database
      const car = await prisma.buyCar.update({
        where: { id },
        data: {
          make: data.make,
          model: data.model,
          trim: data.trim,
          year: data.year,
          price: data.price,
          specifications: JSON.stringify(data.specifications),
          features: JSON.stringify(data.features),
          standardEquipment: JSON.stringify(data.standardEquipment),
          addedOptions: JSON.stringify(data.addedOptions),
          description: data.description,
          isAvailable: data.isAvailable === 'true' || data.isAvailable === true,
        }
      });
      
      return NextResponse.json(car);
    } else if (type === 'rent') {
      // Check if car exists
      const existingCar = await prisma.rentalCar.findUnique({
        where: { id }
      });
      
      if (!existingCar) {
        return NextResponse.json(
          { error: 'Car not found' },
          { status: 404 }
        );
      }
      
      // Update car in database
      const car = await prisma.rentalCar.update({
        where: { id },
        data: {
          make: data.make,
          model: data.model,
          trim: data.trim,
          year: data.year,
          hourlyRate: data.hourlyRate,
          dailyRate: data.dailyRate,
          weeklyRate: data.weeklyRate,
          specifications: JSON.stringify(data.specifications),
          features: JSON.stringify(data.features),
          description: data.description,
          isAvailable: data.isAvailable === 'true' || data.isAvailable === true,
        }
      });
      
      return NextResponse.json(car);
    } else {
      return NextResponse.json(
        { error: 'Invalid car type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating car:', error);
    return NextResponse.json(
      { error: 'Failed to update car' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify admin user
  const isAdmin = await verifyAdmin(request);
  
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = params;
  
  // Get car type from query params
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'buy';
  
  try {
    if (type === 'buy') {
      // Check if car exists
      const existingCar = await prisma.buyCar.findUnique({
        where: { id }
      });
      
      if (!existingCar) {
        return NextResponse.json(
          { error: 'Car not found' },
          { status: 404 }
        );
      }
      
      // Delete images first to avoid foreign key constraint errors
      await prisma.buyCarImage.deleteMany({
        where: { carId: id }
      });
      
      // Delete car from database (fixed unused variable)
      await prisma.buyCar.delete({
        where: { id }
      });
      
      return NextResponse.json({ success: true });
    } else if (type === 'rent') {
      // Check if car exists
      const existingCar = await prisma.rentalCar.findUnique({
        where: { id }
      });
      
      if (!existingCar) {
        return NextResponse.json(
          { error: 'Car not found' },
          { status: 404 }
        );
      }
      
      // Delete images first to avoid foreign key constraint errors
      await prisma.rentalCarImage.deleteMany({
        where: { carId: id }
      });
      
      // Delete car from database (fixed unused variable)
      await prisma.rentalCar.delete({
        where: { id }
      });
      
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid car type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting car:', error);
    return NextResponse.json(
      { error: 'Failed to delete car' },
      { status: 500 }
    );
  }
}