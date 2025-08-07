// src/lib/services/new-apis/car-api2.ts - CLEANED: Removed VIN-related endpoints
import axios from 'axios';

const CARAPI2_BASE_URL = 'https://car-api2.p.rapidapi.com/api';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '8e431933a5mshad199d436e3caf1p14df7djsn56edbda4c8c5';

const carApi2Client = axios.create({
  baseURL: CARAPI2_BASE_URL,
  headers: {
    'x-rapidapi-host': 'car-api2.p.rapidapi.com',
    'x-rapidapi-key': RAPIDAPI_KEY,
  },
  timeout: 10000,
});

// Types for Car API2
export interface CarAPI2Trim {
  id: string;
  make: string;
  model: string;
  year: number;
  name: string;
  description?: string;
  msrp?: number;
  invoice?: number;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
}

export interface CarAPI2TrimView {
  trim: CarAPI2Trim;
  colors: {
    exterior: string[];
    interior: string[];
  };
  specifications: {
    engine?: string;
    horsepower?: number;
    torque?: number;
    transmission?: string;
    drivetrain?: string;
    fuelType?: string;
    mpgCity?: number;
    mpgHighway?: number;
    seating?: number;
    doors?: number;
  };
}

/**
 * GET /years - Get all available years
 */
export async function getYears(): Promise<number[]> {
  try {
    console.log('🔍 Car API2: Getting years');
    const response = await carApi2Client.get('/years');
    
    if (Array.isArray(response.data)) {
      return response.data
        .map((year: any) => parseInt(year))
        .filter((y: number) => !isNaN(y) && y > 1900 && y <= new Date().getFullYear() + 1)
        .sort((a: number, b: number) => b - a);
    }
    
    return [];
  } catch (error) {
    console.error('Car API2 error (getYears):', error);
    return [];
  }
}

/**
 * GET /makes - Get all makes
 */
export async function getMakes(year?: number): Promise<string[]> {
  try {
    console.log('🔍 Car API2: Getting makes', year ? `for year ${year}` : '');
    const params = year ? { year } : {};
    const response = await carApi2Client.get('/makes', { params });
    
    if (Array.isArray(response.data)) {
      return response.data.map((make: any) => 
        typeof make === 'string' ? make : make.name || make.make
      ).filter((m: string) => m);
    }
    
    return [];
  } catch (error) {
    console.error('Car API2 error (getMakes):', error);
    return [];
  }
}

/**
 * GET /models - Get models for a make
 */
export async function getModels(make: string, year?: number): Promise<string[]> {
  try {
    console.log('🔍 Car API2: Getting models for', make, year ? `year ${year}` : '');
    const params: any = { make };
    if (year) params.year = year;
    
    const response = await carApi2Client.get('/models', { params });
    
    if (Array.isArray(response.data)) {
      return response.data.map((model: any) => 
        typeof model === 'string' ? model : model.name || model.model
      ).filter((m: string) => m);
    }
    
    return [];
  } catch (error) {
    console.error('Car API2 error (getModels):', error);
    return [];
  }
}

/**
 * GET /trims - Get trims for make/model/year
 */
export async function getTrims(make: string, model: string, year: number): Promise<CarAPI2Trim[]> {
  try {
    console.log('🔍 Car API2: Getting trims for', year, make, model);
    const response = await carApi2Client.get('/trims', {
      params: { make, model, year }
    });
    
    if (Array.isArray(response.data)) {
      return response.data.map((trim: any) => ({
        id: trim.id || trim.trim_id,
        make: trim.make || make,
        model: trim.model || model,
        year: trim.year || year,
        name: trim.name || trim.trim || 'Base',
        description: trim.description,
        msrp: trim.msrp || trim.starting_msrp,
        invoice: trim.invoice || trim.invoice_price,
        engine: trim.engine || trim.engine_type,
        transmission: trim.transmission,
        drivetrain: trim.drivetrain || trim.drive_type
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Car API2 error (getTrims):', error);
    return [];
  }
}

/**
 * GET /trim/{id} - Get detailed trim view
 */
export async function getTrimView(trimId: string): Promise<CarAPI2TrimView | null> {
  try {
    console.log('🔍 Car API2: Getting trim view for', trimId);
    const response = await carApi2Client.get(`/trim/${trimId}`);
    
    if (response.data) {
      return {
        trim: {
          id: response.data.id || trimId,
          make: response.data.make,
          model: response.data.model,
          year: response.data.year,
          name: response.data.trim_name || response.data.trim,
          msrp: response.data.msrp,
          invoice: response.data.invoice
        },
        colors: {
          exterior: response.data.exterior_colors || [],
          interior: response.data.interior_colors || []
        },
        specifications: {
          engine: response.data.engine,
          horsepower: response.data.horsepower,
          torque: response.data.torque,
          transmission: response.data.transmission,
          drivetrain: response.data.drivetrain,
          fuelType: response.data.fuel_type,
          mpgCity: response.data.mpg_city,
          mpgHighway: response.data.mpg_highway,
          seating: response.data.seating_capacity,
          doors: response.data.doors
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error('Car API2 error (getTrimView):', error);
    return null;
  }
}

/**
 * GET /bodies - Get body types
 */
export async function getBodies(make?: string, model?: string, year?: number): Promise<string[]> {
  try {
    console.log('🔍 Car API2: Getting body types');
    const params: any = {};
    if (make) params.make = make;
    if (model) params.model = model;
    if (year) params.year = year;
    
    const response = await carApi2Client.get('/bodies', { params });
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Car API2 error (getBodies):', error);
    return [];
  }
}

/**
 * GET /engines - Get engine types
 */
export async function getEngines(make?: string, model?: string, year?: number): Promise<string[]> {
  try {
    console.log('🔍 Car API2: Getting engines');
    const params: any = {};
    if (make) params.make = make;
    if (model) params.model = model;
    if (year) params.year = year;
    
    const response = await carApi2Client.get('/engines', { params });
    
    if (Array.isArray(response.data)) {
      return response.data.map((engine: any) => 
        typeof engine === 'string' ? engine : engine.description || engine.name
      ).filter((e: string) => e);
    }
    
    return [];
  } catch (error) {
    console.error('Car API2 error (getEngines):', error);
    return [];
  }
}

/**
 * GET /exterior-colors - Get exterior colors
 */
export async function getExteriorColors(make?: string, model?: string, year?: number): Promise<string[]> {
  try {
    console.log('🔍 Car API2: Getting exterior colors');
    const params: any = {};
    if (make) params.make = make;
    if (model) params.model = model;
    if (year) params.year = year;
    
    const response = await carApi2Client.get('/exterior-colors', { params });
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Car API2 error (getExteriorColors):', error);
    return [];
  }
}

/**
 * GET /interior-colors - Get interior colors
 */
export async function getInteriorColors(make?: string, model?: string, year?: number): Promise<string[]> {
  try {
    console.log('🔍 Car API2: Getting interior colors');
    const params: any = {};
    if (make) params.make = make;
    if (model) params.model = model;
    if (year) params.year = year;
    
    const response = await carApi2Client.get('/interior-colors', { params });
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Car API2 error (getInteriorColors):', error);
    return [];
  }
}

/**
 * GET /mileages - Get mileage data
 */
export async function getMileages(make: string, model: string, year: number): Promise<{
  city?: number;
  highway?: number;
  combined?: number;
} | null> {
  try {
    console.log('🔍 Car API2: Getting mileages');
    const response = await carApi2Client.get('/mileages', {
      params: { make, model, year }
    });
    
    if (response.data) {
      return {
        city: response.data.city || response.data.mpg_city,
        highway: response.data.highway || response.data.mpg_highway,
        combined: response.data.combined || response.data.mpg_combined
      };
    }
    
    return null;
  } catch (error) {
    console.error('Car API2 error (getMileages):', error);
    return null;
  }
}

export const carApi2Service = {
  getYears,
  getMakes,
  getModels,
  getTrims,
  getTrimView,
  getBodies,
  getEngines,
  getExteriorColors,
  getInteriorColors,
  getMileages
  // REMOVED: decodeVIN (VIN-related functionality not needed)
  // REMOVED: getVehicleAttributes (404 error)
};
