// src/app/api/admin/cars/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { parseBuyCars, parseRentalCars, buyCarInclude, rentalCarInclude } from '@/lib/db-helpers';
import type { BuyCar, RentalCar } from '@/types/cars';

export async function GET(request: NextRequest) {
  try {
    // Verify admin user
    const isAdmin = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Admin access required'
          }
        }, 
        { status: 401 }
      );
    }
    
    // Get car type from query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'buy';
    
    if (type === 'buy') {
      // Fetch buy cars with proper includes
      const rawCars = await prisma.buyCar.findMany({
        include: buyCarInclude,
        orderBy: { createdAt: 'desc' }
      });
      
      // Use centralized parsing logic
      const parsedCars: BuyCar[] = parseBuyCars(rawCars as any);
      
      return NextResponse.json({
        success: true,
        data: parsedCars,
        count: parsedCars.length,
        type: 'buy',
        timestamp: new Date().toISOString()
      });
      
    } else if (type === 'rent') {
      // Fetch rental cars with proper includes
      const rawCars = await prisma.rentalCar.findMany({
        include: rentalCarInclude,
        orderBy: { createdAt: 'desc' }
      });

      // Use centralized parsing logic
      const parsedCars: RentalCar[] = parseRentalCars(rawCars as any);

      return NextResponse.json({
        success: true,
        data: parsedCars,
        count: parsedCars.length,
        type: 'rent',
        timestamp: new Date().toISOString()
      });
      
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: 'Invalid car type. Must be "buy" or "rent"'
          }
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching admin cars:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch cars',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin user
    const isAdmin = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Admin access required'
          }
        }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type = 'buy', ...carData } = body;

    // Validate required fields based on type
    if (type === 'buy') {
      const { 
        make, model, year, price, specifications, features, description 
      } = carData;

      if (!make || !model || !year || !price || !specifications || !features) {
        return NextResponse.json(
          { 
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Missing required fields for buy car'
            }
          },
          { status: 400 }
        );
      }

      // Create buy car with optional SPA enrichment
      const newCar = await prisma.buyCar.create({
        data: {
          make,
          model,
          trim: carData.trim || null,
          year,
          price,
          specifications,
          features,
          standardEquipment: carData.standardEquipment || null,
          addedOptions: carData.addedOptions || null,
          description: description || '',
          isAvailable: carData.isAvailable ?? true,
          // SPA fields
          supercarData: carData.supercarData || null,
          baseMSRP: carData.baseMSRP || null,
          performanceData: carData.performanceData || null,
          pricingData: carData.pricingData || null,
          // Handle images if provided
          images: carData.images ? {
            create: carData.images.map((img: any, index: number) => ({
              url: img.url,
              isMain: img.isMain ?? index === 0,
              imageType: img.imageType || null
            }))
          } : undefined
        },
        include: buyCarInclude
      });

      const parsedCar = parseBuyCars([newCar] as any)[0];

      return NextResponse.json({
        success: true,
        data: parsedCar,
        message: 'Buy car created successfully',
        timestamp: new Date().toISOString()
      });

    } else if (type === 'rent') {
      const { 
        make, model, year, hourlyRate, dailyRate, weeklyRate, 
        specifications, features, description 
      } = carData;

      if (!make || !model || !year || !hourlyRate || !dailyRate || !weeklyRate || !specifications || !features) {
        return NextResponse.json(
          { 
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Missing required fields for rental car'
            }
          },
          { status: 400 }
        );
      }

      // Create rental car
      const newCar = await prisma.rentalCar.create({
        data: {
          make,
          model,
          trim: carData.trim || null,
          year,
          hourlyRate,
          dailyRate,
          weeklyRate,
          specifications,
          features,
          description: description || '',
          isAvailable: carData.isAvailable ?? true,
          // SPA fields
          supercarData: carData.supercarData || null,
          baseMSRP: carData.baseMSRP || null,
          performanceData: carData.performanceData || null,
          // Handle images if provided
          images: carData.images ? {
            create: carData.images.map((img: any, index: number) => ({
              url: img.url,
              isMain: img.isMain ?? index === 0,
              imageType: img.imageType || null
            }))
          } : undefined
        },
        include: rentalCarInclude
      });

      const parsedCar = parseRentalCars([newCar] as any)[0];

      return NextResponse.json({
        success: true,
        data: parsedCar,
        message: 'Rental car created successfully',
        timestamp: new Date().toISOString()
      });

    } else {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: 'Invalid car type. Must be "buy" or "rent"'
          }
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error creating car:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create car',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}
