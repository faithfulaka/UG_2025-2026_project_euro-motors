// src/app/api/spa/search/route.ts - Simplified single API approach
import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';
import type { SimplifiedVehicleData, SPASearchResponse } from '@/types/spa';

// CarQuery API helper - ONLY API we use
async function fetchCarQueryData(params: Record<string, string>): Promise<any> {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `https://www.carqueryapi.com/api/0.3/?${queryString}&callback=test`;
    
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'Accept': 'text/javascript',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    // Extract JSON from JSONP response
    const data = response.data;
    if (typeof data === 'string') {
      const match = data.match(/test\((.*)\);?$/s);
      if (match) {
        return JSON.parse(match[1]);
      }
    }
    return data;
  } catch (error) {
    console.error('CarQuery API error:', error);
    return null;
  }
}

async function searchVehicleData(make: string, model: string, year: number): Promise<SPASearchResponse> {
  try {
    // Get trims for the specific vehicle
    const carQueryData = await fetchCarQueryData({
      cmd: 'getTrims',
      make: make.toLowerCase().replace(/\s+/g, '-'),
      model: model.toLowerCase().replace(/\s+/g, '-'),
      year: year.toString()
    });

    if (!carQueryData?.Trims || carQueryData.Trims.length === 0) {
      return {
        success: false,
        error: {
          code: 'NO_DATA',
          message: 'No vehicle data found for the specified make, model, and year'
        }
      };
    }

    // Use the first trim result (they're usually similar for the same year)
    const trim = carQueryData.Trims[0];

    // Build the simplified data structure - ONLY the fields you want
    const vehicleData: SimplifiedVehicleData = {
      make,
      model,
      year,
      bodyType: trim.model_body || 'N/A',
      
      basicSpecifications: {
        make,
        model,
        year,
        bodyType: trim.model_body || 'N/A',
        engine: trim.model_engine_type ? `${trim.model_engine_cc}cc ${trim.model_engine_type}` : 'N/A',
        engineCC: trim.model_engine_cc || 'N/A',
        cylinders: trim.model_engine_cyl || 'N/A',
        doors: trim.model_doors ? parseInt(trim.model_doors) : 0,
        seats: trim.model_seats ? parseInt(trim.model_seats) : 0,
        drivetrain: trim.model_drive || 'N/A',
        transmission: trim.model_transmission_type || 'N/A',
        fuelType: trim.model_engine_fuel || 'N/A'
      },
      
      performanceData: {
        engine: trim.model_engine_type ? `${trim.model_engine_cc}cc ${trim.model_engine_type}` : 'N/A',
        horsePower: trim.model_engine_power_ps || 'N/A',
        torque: trim.model_engine_torque_nm ? `${trim.model_engine_torque_nm} Nm` : 'N/A',
        acceleration060: 'N/A', // CarQuery doesn't provide this
        topSpeed: trim.model_top_speed_kph ? `${trim.model_top_speed_kph} km/h` : 'N/A',
        transmission: trim.model_transmission_type || 'N/A',
        driveType: trim.model_drive || 'N/A',
        weight: trim.model_weight_kg ? `${trim.model_weight_kg}kg` : 'N/A'
      },
      
      dimensions: {
        length: trim.model_length_mm ? `${trim.model_length_mm}mm` : 'N/A',
        width: trim.model_width_mm ? `${trim.model_width_mm}mm` : 'N/A',
        height: trim.model_height_mm ? `${trim.model_height_mm}mm` : 'N/A',
        wheelbase: trim.model_wheelbase_mm ? `${trim.model_wheelbase_mm}mm` : 'N/A',
        weight: trim.model_weight_kg ? `${trim.model_weight_kg}kg` : 'N/A'
      }
    };

    return {
      success: true,
      data: vehicleData
    };

  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to search vehicle data'
      }
    };
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
    } as SPASearchResponse, { status: 400 });
  }

  const result = await searchVehicleData(make, model, parseInt(year));
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { make, model, year } = body;

  if (!make || !model || !year) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'INVALID_PARAMS',
        message: 'Make, model, and year are required'
      }
    } as SPASearchResponse, { status: 400 });
  }

  const result = await searchVehicleData(make, model, parseInt(year));
  return NextResponse.json(result);
}
