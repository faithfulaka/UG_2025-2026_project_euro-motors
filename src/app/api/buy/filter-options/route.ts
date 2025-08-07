// src/app/api/buy/filter-options/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all available cars
    const cars = await prisma.buyCar.findMany({
      where: {
        isAvailable: true
      },
      select: {
        specifications: true
      }
    });

    // Extract unique values for each filter type
    const bodyTypes = new Set<string>();
    const fuelTypes = new Set<string>();
    const transmissions = new Set<string>();

    cars.forEach(car => {
      // Parse specifications if it's a string
      let specs = car.specifications;
      if (typeof specs === 'string') {
        try {
          specs = JSON.parse(specs);
        } catch {
          specs = {};
        }
      }

      if (specs && typeof specs === 'object') {
        const specObj = specs as any;
        if (specObj.bodyType) bodyTypes.add(specObj.bodyType);
        if (specObj.fuelType) fuelTypes.add(specObj.fuelType);
        if (specObj.transmission) transmissions.add(specObj.transmission);
      }
    });

    // Convert sets to suggestion format with counts
    const formatSuggestions = (values: Set<string>) => {
      const valueArray = Array.from(values).sort();
      return valueArray.map(value => {
        // Count how many cars have this value
        const count = cars.filter(car => {
          let specs = car.specifications;
          if (typeof specs === 'string') {
            try {
              specs = JSON.parse(specs);
            } catch {
              return false;
            }
          }
          return specs && typeof specs === 'object' && 
                 (Object.values(specs as any).includes(value));
        }).length;

        return {
          value,
          label: value,
          count
        };
      });
    };

    return NextResponse.json({
      success: true,
      bodyTypes: formatSuggestions(bodyTypes),
      fuelTypes: formatSuggestions(fuelTypes),
      transmissions: formatSuggestions(transmissions),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch filter options',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}