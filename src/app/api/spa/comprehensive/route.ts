// src/app/api/spa/comprehensive/route.ts - SIMPLIFIED to use only CarQuery
import { NextRequest, NextResponse } from 'next/server';
import { maximumDataAggregator } from '@/lib/services/new-apis/maximum-data-aggregator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');
    
    if (!make || !model || !year) {
      return NextResponse.json(
        {
          success: false,
          error: 'Make, model, and year are required parameters'
        },
        { status: 400 }
      );
    }
    
    console.log(`📊 Comprehensive endpoint called for ${year} ${make} ${model}`);
    
    // Get vehicle data from CarQuery
    const vehicleData = await maximumDataAggregator.getMaximumVehicleData(
      make,
      model,
      parseInt(year)
    );
    
    // Format comprehensive response
    const response = {
      success: true,
      data: {
        vehicle: {
          make: vehicleData.basic.make,
          model: vehicleData.basic.model,
          year: vehicleData.basic.year,
          trim: vehicleData.basic.trim,
          bodyType: vehicleData.basic.bodyType
        },
        specifications: {
          engine: vehicleData.engine,
          transmission: vehicleData.transmission,
          drivetrain: vehicleData.drivetrain,
          dimensions: vehicleData.dimensions,
          performance: vehicleData.performance,
          fuelEconomy: vehicleData.fuelEconomy
        },
        features: {
          wheels: vehicleData.wheels,
          brakes: vehicleData.brakes
        },
        metadata: {
          sources: vehicleData.sources,
          timestamp: new Date().toISOString()
        }
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Comprehensive endpoint error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch comprehensive vehicle data'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { make, model, year } = body;
    
    if (!make || !model || !year) {
      return NextResponse.json(
        {
          success: false,
          error: 'Make, model, and year are required parameters'
        },
        { status: 400 }
      );
    }
    
    // Get vehicle data from CarQuery
    const vehicleData = await maximumDataAggregator.getMaximumVehicleData(
      make,
      model,
      parseInt(year)
    );
    
    // Format comprehensive response
    const response = {
      success: true,
      data: {
        vehicle: {
          make: vehicleData.basic.make,
          model: vehicleData.basic.model,
          year: vehicleData.basic.year,
          trim: vehicleData.basic.trim,
          bodyType: vehicleData.basic.bodyType
        },
        specifications: {
          engine: vehicleData.engine,
          transmission: vehicleData.transmission,
          drivetrain: vehicleData.drivetrain,
          dimensions: vehicleData.dimensions,
          performance: vehicleData.performance,
          fuelEconomy: vehicleData.fuelEconomy
        },
        features: {
          wheels: vehicleData.wheels,
          brakes: vehicleData.brakes
        },
        metadata: {
          sources: vehicleData.sources,
          timestamp: new Date().toISOString()
        }
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Comprehensive endpoint error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch comprehensive vehicle data'
      },
      { status: 500 }
    );
  }
}
