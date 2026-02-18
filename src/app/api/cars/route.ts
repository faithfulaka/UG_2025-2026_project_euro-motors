// src/app/api/cars/route.ts - IMPROVED VERSION

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseBuyCars, buyCarInclude } from '@/lib/db-helpers';
import type { BuyCar } from '@/types/cars';
import type { SPASearchResponse } from '@/types/spa';

/**
 * GET /api/cars - Fetch all available cars for purchase
 */
export async function GET() {
  try {
    // Fetch cars with images
    const rawCars = await prisma.buyCar.findMany({
      where: { isAvailable: true },
      include: buyCarInclude,
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON fields to ensure type safety
    const parsedCars: BuyCar[] = parseBuyCars(rawCars as any);

    // Return properly typed response
    return NextResponse.json({
      success: true,
      data: parsedCars,
      count: parsedCars.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching cars:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch cars',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cars - Create a new car listing with optional SPA enrichment
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      make, 
      model, 
      year, 
      trim,
      price,
      specifications,
      features,
      standardEquipment,
      addedOptions,
      description,
      images,
      enrichWithSPA = false // Option to enrich with SPA data
    } = body;

    // Validate required fields
    if (!make || !model || !year || !price || !specifications || !features) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
            details: 'make, model, year, price, specifications, and features are required'
          }
        },
        { status: 400 }
      );
    }

    let spaData = null;
    let performanceData = null;
    let pricingData = null;
    let baseMSRP = null;

    // If requested, fetch SPA data to enrich the listing
    if (enrichWithSPA) {
      try {
        const spaResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/spa/search`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              make,
              model,
              year: year.toString(),
              source: 'comprehensive'
            })
          }
        );

        if (spaResponse.ok) {
          const spaResult: SPASearchResponse = await spaResponse.json();
          if (spaResult.success && spaResult.data) {
            spaData = spaResult.data;
            performanceData = spaResult.data.performanceData;
            pricingData = spaResult.data.pricingData;
            baseMSRP = spaResult.data.pricingData?.baseMSRP;

            // Merge SPA data into specifications
            if (performanceData && specifications) {
              specifications.topSpeed = performanceData.topSpeed;
              specifications.acceleration60 = performanceData.acceleration060;
              specifications.torque = performanceData.torque;
              specifications.powerPS = performanceData.horsePower;
              specifications.weight = performanceData.weight;
              specifications.fuelEconomy = performanceData.fuelEconomy;
            }

            // Add popular options if not provided
            if (!addedOptions && (spaData as any).popularOptions) {
              body.addedOptions = (spaData as any).popularOptions.map((opt: any) => opt.name);
            }
          }
        }
      } catch (spaError) {
        console.error('Failed to fetch SPA data:', spaError);
        // Continue without SPA enrichment
      }
    }

    // Create the car in database
    const newCar = await prisma.buyCar.create({
      data: {
        make,
        model,
        trim: trim || null,
        year,
        price,
        specifications: specifications as any, // Prisma will handle JSON conversion
        features: features as any,
        standardEquipment: standardEquipment || null,
        addedOptions: addedOptions || null,
        supercarData: spaData as any,
        baseMSRP: baseMSRP,
        performanceData: performanceData as any,
        pricingData: pricingData as any,
        description: description || '',
        isAvailable: true,
        images: {
          create: images?.map((img: any, index: number) => ({
            url: img.url,
            isMain: img.isMain || index === 0,
            imageType: img.imageType || null
          })) || []
        }
      },
      include: buyCarInclude
    });

    // Parse the created car to ensure proper types
    const parsedCar: BuyCar = parseBuyCars([newCar] as any)[0];

    return NextResponse.json({
      success: true,
      data: parsedCar,
      message: 'Car created successfully',
      enriched: enrichWithSPA && !!spaData,
      timestamp: new Date().toISOString()
    });

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

/**
 * PATCH /api/cars - Update multiple cars with SPA data
 */
export async function PATCH(req: Request) {
  try {
    const { carIds, enrichWithSPA = true } = await req.json();

    if (!carIds || !Array.isArray(carIds) || carIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'carIds array is required'
          }
        },
        { status: 400 }
      );
    }

    const updatedCars: BuyCar[] = [];
    const errors: any[] = [];

    for (const carId of carIds) {
      try {
        // Get existing car
        const existingCar = await prisma.buyCar.findUnique({
          where: { id: carId },
          include: buyCarInclude
        });

        if (!existingCar) {
          errors.push({ carId, error: 'Car not found' });
          continue;
        }

        // Fetch SPA data if requested
        if (enrichWithSPA) {
          const spaResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/spa/search`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                make: existingCar.make,
                model: existingCar.model,
                year: existingCar.year.toString(),
                source: 'comprehensive'
              })
            }
          );

          if (spaResponse.ok) {
            const spaResult: SPASearchResponse = await spaResponse.json();
            if (spaResult.success && spaResult.data) {
              // Update car with SPA data
              const updatedCar = await prisma.buyCar.update({
                where: { id: carId },
                data: {
                  supercarData: spaResult.data as any,
                  performanceData: spaResult.data.performanceData as any,
                  pricingData: spaResult.data.pricingData as any,
                  baseMSRP: spaResult.data.pricingData?.baseMSRP
                },
                include: buyCarInclude
              });

              updatedCars.push(parseBuyCars([updatedCar] as any)[0]);
            }
          }
        }
      } catch (carError) {
        errors.push({ 
          carId, 
          error: carError instanceof Error ? carError.message : 'Update failed' 
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        updated: updatedCars,
        errors: errors
      },
      message: `Updated ${updatedCars.length} cars, ${errors.length} errors`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating cars:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update cars',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}
