// src/app/api/spa/search/route.ts
import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';
import type { SimplifiedVehicleData, SPASearchResponse } from '@/types/spa';

interface SearchRequestBody {
  make: string;
  model: string;
  year: number;
  source?: string;
}

interface CarQueryTrim {
  model_id?: string;
  model_make_id?: string;
  model_name?: string;
  model_trim?: string;
  model_year?: string;
  model_body?: string;
  model_engine_cc?: string;
  model_engine_cyl?: string;
  model_engine_type?: string;
  model_engine_power_ps?: string;
  model_engine_torque_nm?: string;
  model_engine_fuel?: string;
  model_drive?: string;
  model_transmission_type?: string;
  model_doors?: string;
  model_seats?: string;
  model_top_speed_kph?: string;
  model_weight_kg?: string;
  model_length_mm?: string;
  model_width_mm?: string;
  model_height_mm?: string;
  model_wheelbase_mm?: string;
}

interface CarQueryResponse {
  Trims?: CarQueryTrim[];
}

async function fetchCarQueryData(params: Record<string, string>): Promise<CarQueryResponse | null> {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `https://www.carqueryapi.com/api/0.3/?${queryString}&callback=test`;
    
    const response = await axios.get<string>(url, {
      timeout: 8000,
      headers: {
        'Accept': 'text/javascript',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    const data = response.data;
    if (typeof data === 'string') {
      const match = data.match(/test\((.*)\);?$/s);
      if (match && match[1]) {
        return JSON.parse(match[1]) as CarQueryResponse;
      }
    }
    return data as CarQueryResponse;
  } catch {
    return null;
  }
}

async function searchVehicleData(make: string, model: string, year: number): Promise<SPASearchResponse> {
  try {
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

    const trim = carQueryData.Trims[0];

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
        acceleration060: 'N/A',
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

// Type guard function to validate request body
function isValidSearchRequestBody(body: unknown): body is SearchRequestBody {
  if (typeof body !== 'object' || body === null) {
    return false;
  }
  
  const obj = body as Record<string, unknown>;
  
  return (
    typeof obj.make === 'string' &&
    typeof obj.model === 'string' &&
    typeof obj.year === 'number' &&
    (obj.source === undefined || typeof obj.source === 'string')
  );
}

async function parseRequestBody(req: Request): Promise<SearchRequestBody> {
  try {
    const body: unknown = await req.json();
    
    if (!isValidSearchRequestBody(body)) {
      throw new Error('Invalid request body format');
    }
    
    return body;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to parse request body');
  }
}

export async function GET(req: NextRequest): Promise<NextResponse<SPASearchResponse>> {
  try {
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

    const yearNumber = parseInt(year);
    if (isNaN(yearNumber) || yearNumber < 1900 || yearNumber > new Date().getFullYear() + 2) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_YEAR',
          message: 'Year must be a valid number between 1900 and the current year + 2'
        }
      }, { status: 400 });
    }

    const result = await searchVehicleData(make, model, yearNumber);
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET request error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse<SPASearchResponse>> {
  try {
    const body = await parseRequestBody(req);
    const { make, model, year } = body;

    if (!make || !model || !year) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: 'Make, model, and year are required'
        }
      }, { status: 400 });
    }

    const result = await searchVehicleData(make, model, year);
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST request error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INVALID_REQUEST_BODY',
        message: error instanceof Error ? error.message : 'Invalid request body'
      }
    }, { status: 400 });
  }
}
