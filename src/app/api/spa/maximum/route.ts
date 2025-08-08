// src/app/api/spa/maximum/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { carQueryService } from '@/lib/services/carquery-api';
import type { ComprehensiveSPAData } from '@/types/spa';

async function getMaximumVehicleData(make: string, model: string, year: number): Promise<ComprehensiveSPAData | null> {
  try {
    // Get data from CarQuery API
    const trims = await carQueryService.getCarData(make, model, year);
    
    if (!trims || trims.length === 0) {
      return null;
    }

    // Use the first trim as the primary data source
    const primaryTrim = trims[0];

    const data: ComprehensiveSPAData = {
      make,
      model,
      year,
      bodyType: primaryTrim.body || undefined,
      
      basicSpecifications: {
        make,
        model,
        year,
        bodyType: primaryTrim.body || undefined,
        engine: primaryTrim.engine ? `${primaryTrim.engine.displacement}cc ${primaryTrim.engine.cylinders} Cylinder` : undefined,
        engineCC: primaryTrim.engine?.displacement ? `${primaryTrim.engine.displacement}cc` : undefined,
        cylinders: primaryTrim.engine?.cylinders || undefined,
        doors: primaryTrim.doors ? parseInt(primaryTrim.doors) : undefined,
        seats: primaryTrim.seats ? parseInt(primaryTrim.seats) : undefined,
        drivetrain: primaryTrim.drivetrain || undefined,
        transmission: primaryTrim.transmission || undefined,
        fuelType: primaryTrim.engine?.fuel || undefined
      },
      
      performanceData: {
        engine: primaryTrim.engine ? `${primaryTrim.engine.displacement}cc ${primaryTrim.engine.cylinders} Cylinder` : undefined,
        horsePower: primaryTrim.engine?.power ? `${primaryTrim.engine.power} PS` : undefined,
        torque: primaryTrim.engine?.torque ? `${primaryTrim.engine.torque} Nm` : undefined,
        transmission: primaryTrim.transmission || undefined,
        driveType: primaryTrim.drivetrain || undefined
      },
      
      dataSources: {
        database: false,
        carQuery: true,
        manufacturer: false,
        market: false
      },
      
      dataSource: 'carquery',
      timestamp: new Date().toISOString()
    };

    return data;
  } catch (error) {
    console.error('Error getting maximum vehicle data:', error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const make = url.searchParams.get('make');
  const model = url.searchParams.get('model');
  const year = url.searchParams.get('year');

  if (!make || !model || !year) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'INVALID_PARAMS',
        message: 'Make, model, and year are required'
      }
    }, { status: 400 });
  }

  try {
    const data = await getMaximumVehicleData(make, model, parseInt(year));
    
    if (!data) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NO_DATA',
          message: 'No vehicle data found for the specified parameters'
        }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'API_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch maximum data'
      }
    }, { status: 500 });
  }
}
