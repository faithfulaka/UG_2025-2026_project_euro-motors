// src/app/api/spa/maximum/route.ts - SIMPLIFIED to use only CarQuery
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
    
    console.log(`📊 Maximum endpoint called for ${year} ${make} ${model}`);
    
    // Get vehicle data from CarQuery
    const vehicleData = await maximumDataAggregator.getMaximumVehicleData(
      make,
      model,
      parseInt(year)
    );
    
    // Calculate data completeness
    const calculateCompleteness = (data: any): string => {
      const fields = [
        // Basic
        data.basic.bodyType,
        data.basic.country,
        // Engine
        data.engine.description,
        data.engine.horsepower,
        data.engine.torque,
        data.engine.displacement,
        data.engine.cylinders,
        // Transmission
        data.transmission.type,
        // Dimensions
        data.dimensions.length,
        data.dimensions.width,
        data.dimensions.height,
        data.dimensions.weight,
        // Fuel
        data.fuelEconomy.city,
        data.fuelEconomy.highway,
      ];
      
      const filledFields = fields.filter(f => f && f !== 'N/A').length;
      const percentage = Math.round((filledFields / fields.length) * 100);
      
      return `${percentage}% complete (${filledFields}/${fields.length} fields)`;
    };
    
    // Format the response
    const response = {
      success: true,
      
      // ===== VEHICLE IDENTIFICATION =====
      vehicle: {
        make: vehicleData.basic.make,
        model: vehicleData.basic.model,
        year: vehicleData.basic.year,
        trim: vehicleData.basic.trim,
        bodyType: vehicleData.basic.bodyType,
        country: vehicleData.basic.country
      },
      
      // ===== ENGINE & PERFORMANCE =====
      engine: vehicleData.engine,
      
      // ===== TRANSMISSION & DRIVETRAIN =====
      transmission: vehicleData.transmission,
      drivetrain: vehicleData.drivetrain,
      
      // ===== DIMENSIONS & CAPACITY =====
      dimensions: vehicleData.dimensions,
      
      // ===== PERFORMANCE METRICS =====
      performance: vehicleData.performance,
      
      // ===== FUEL ECONOMY =====
      fuelEconomy: vehicleData.fuelEconomy,
      
      // ===== WHEELS & BRAKES =====
      wheels: vehicleData.wheels,
      brakes: vehicleData.brakes,
      
      // ===== METADATA =====
      metadata: {
        sources: vehicleData.sources,
        timestamp: new Date().toISOString(),
        endpointsUsed: [
          'CarQuery: getVehicleSpecs, getTrims'
        ],
        dataCompleteness: calculateCompleteness(vehicleData)
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Maximum endpoint error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch maximum vehicle data',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
