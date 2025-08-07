// src/lib/services/new-apis/car-data-api.ts
import axios from 'axios';

const CAR_DATA_BASE_URL = 'https://car-data.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

if (!RAPIDAPI_KEY) {
  console.warn('RAPIDAPI_KEY not found in environment variables');
}

const carDataClient = axios.create({
  baseURL: CAR_DATA_BASE_URL,
  headers: {
    'x-rapidapi-host': 'car-data.p.rapidapi.com',
    'x-rapidapi-key': RAPIDAPI_KEY || '',
  },
  timeout: 10000,
});

// Types for Car Data API
export interface CarDataVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  type: string;
  generation?: string;
  body_style?: string;
  fuel_type: string;
  transmission: string;
  engine: {
    type?: string;
    displacement?: number;
    cylinders?: number;
    horsepower?: number;
    torque?: number;
  };
  drivetrain?: string;
  mpg?: {
    city?: number;
    highway?: number;
    combined?: number;
  };
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    wheelbase?: number;
    curb_weight?: number;
  };
  performance?: {
    acceleration_0_to_60?: number;
    top_speed?: number;
    quarter_mile?: number;
  };
  safety?: {
    nhtsa_overall?: number;
    nhtsa_frontal?: number;
    nhtsa_side?: number;
    nhtsa_rollover?: number;
    iihs_overall?: string;
  };
  features?: string[];
  colors?: {
    exterior?: string[];
    interior?: string[];
  };
  price?: {
    msrp?: number;
    invoice?: number;
  };
  images?: string[];
}

export interface CarDataSearchFilters {
  make?: string;
  model?: string;
  type?: string;
  year?: number;
  year_from?: number;
  year_to?: number;
  fuel_type?: string;
  transmission?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

export interface CarDataResponse {
  collection: CarDataVehicle[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get all cars with pagination and filters
 */
export async function getCars(filters: CarDataSearchFilters = {}): Promise<CarDataResponse | null> {
  try {
    const params = {
      limit: 10,
      page: 0,
      ...filters,
    };

    const response = await carDataClient.get('/cars', { params });
    return response.data;
  } catch (error) {
    console.error('Car Data API error (getCars):', error);
    return null;
  }
}

/**
 * Search cars by make, model, and year
 */
export async function searchCars(
  make: string,
  model?: string,
  year?: number,
  options: {
    limit?: number;
    page?: number;
    type?: string;
  } = {}
): Promise<CarDataVehicle[]> {
  try {
    const filters: CarDataSearchFilters = {
      make,
      limit: options.limit || 25,
      page: options.page || 0,
    };

    if (model) filters.model = model;
    if (year) filters.year = year;
    if (options.type) filters.type = options.type;

    const response = await getCars(filters);
    return response?.collection || [];
  } catch (error) {
    console.error('Car Data API error (searchCars):', error);
    return [];
  }
}

/**
 * Get all available makes
 */
export async function getMakes(): Promise<string[]> {
  try {
    const response = await carDataClient.get('/makes');
    return response.data?.collection || [];
  } catch (error) {
    console.error('Car Data API error (getMakes):', error);
    return [];
  }
}

/**
 * Get all available models for a specific make
 */
export async function getModels(make: string): Promise<string[]> {
  try {
    const response = await carDataClient.get('/models', {
      params: { make }
    });
    
    return response.data?.collection || [];
  } catch (error) {
    console.error('Car Data API error (getModels):', error);
    return [];
  }
}

/**
 * Get all available years
 */
export async function getYears(): Promise<number[]> {
  try {
    const response = await carDataClient.get('/years');
    return response.data?.collection || [];
  } catch (error) {
    console.error('Car Data API error (getYears):', error);
    return [];
  }
}

/**
 * Get all available types (body styles)
 */
export async function getTypes(): Promise<string[]> {
  try {
    const response = await carDataClient.get('/types');
    return response.data?.collection || [];
  } catch (error) {
    console.error('Car Data API error (getTypes):', error);
    return [];
  }
}

/**
 * Get car by specific ID
 */
export async function getCarById(id: string): Promise<CarDataVehicle | null> {
  try {
    const response = await carDataClient.get(`/cars/${id}`);
    return response.data;
  } catch (error) {
    console.error('Car Data API error (getCarById):', error);
    return null;
  }
}

/**
 * Get cars by year range
 */
export async function getCarsByYearRange(
  yearFrom: number,
  yearTo: number,
  options: {
    make?: string;
    model?: string;
    limit?: number;
    page?: number;
  } = {}
): Promise<CarDataVehicle[]> {
  try {
    const filters: CarDataSearchFilters = {
      year_from: yearFrom,
      year_to: yearTo,
      limit: options.limit || 50,
      page: options.page || 0,
    };

    if (options.make) filters.make = options.make;
    if (options.model) filters.model = options.model;

    const response = await getCars(filters);
    return response?.collection || [];
  } catch (error) {
    console.error('Car Data API error (getCarsByYearRange):', error);
    return [];
  }
}

/**
 * Get popular/featured cars
 */
export async function getPopularCars(limit: number = 20): Promise<CarDataVehicle[]> {
  try {
    const response = await getCars({
      sort: 'year',
      direction: 'desc',
      limit,
      page: 0
    });

    return response?.collection || [];
  } catch (error) {
    console.error('Car Data API error (getPopularCars):', error);
    return [];
  }
}

/**
 * Get cars by fuel type
 */
export async function getCarsByFuelType(
  fuelType: string,
  options: {
    make?: string;
    model?: string;
    limit?: number;
    page?: number;
  } = {}
): Promise<CarDataVehicle[]> {
  try {
    const filters: CarDataSearchFilters = {
      fuel_type: fuelType,
      limit: options.limit || 50,
      page: options.page || 0,
    };

    if (options.make) filters.make = options.make;
    if (options.model) filters.model = options.model;

    const response = await getCars(filters);
    return response?.collection || [];
  } catch (error) {
    console.error('Car Data API error (getCarsByFuelType):', error);
    return [];
  }
}

/**
 * Get comprehensive car data (combines multiple API calls for complete info)
 */
export async function getComprehensiveCarData(
  make: string,
  model: string,
  year: number
): Promise<{
  vehicles: CarDataVehicle[];
  stats: {
    totalVariants: number;
    fuelTypes: string[];
    transmissionTypes: string[];
    priceRange?: {
      min: number;
      max: number;
      average: number;
    };
  };
} | null> {
  try {
    const vehicles = await searchCars(make, model, year, { limit: 100 });
    
    if (vehicles.length === 0) {
      return null;
    }

    // Calculate statistics
    const fuelTypes = Array.from(new Set(vehicles.map(v => v.fuel_type).filter(Boolean)));
    const transmissionTypes = Array.from(new Set(vehicles.map(v => v.transmission).filter(Boolean)));
    
    const prices = vehicles
      .map(v => v.price?.msrp || 0)
      .filter(p => p > 0);

    const priceRange = prices.length > 0 ? {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((sum, price) => sum + price, 0) / prices.length
    } : undefined;

    return {
      vehicles,
      stats: {
        totalVariants: vehicles.length,
        fuelTypes,
        transmissionTypes,
        priceRange
      }
    };
  } catch (error) {
    console.error('Car Data API error (getComprehensiveCarData):', error);
    return null;
  }
}

/**
 * Search for cars similar to a given car
 */
export async function getSimilarCars(
  referenceCarId: string,
  options: { limit?: number } = {}
): Promise<CarDataVehicle[]> {
  try {
    const referenceCar = await getCarById(referenceCarId);
    if (!referenceCar) {
      return [];
    }

    // Search for cars with similar characteristics
    const similarCars = await searchCars(
      referenceCar.make,
      undefined, // Don't restrict model to get more variety
      referenceCar.year,
      {
        limit: options.limit || 20,
        type: referenceCar.type
      }
    );

    // Filter out the reference car and return results
    return similarCars.filter(car => car.id !== referenceCarId);
  } catch (error) {
    console.error('Car Data API error (getSimilarCars):', error);
    return [];
  }
}

export const carDataService = {
  getCars,
  searchCars,
  getMakes,
  getModels,
  getYears,
  getTypes,
  getCarById,
  getCarsByYearRange,
  getPopularCars,
  getCarsByFuelType,
  getComprehensiveCarData,
  getSimilarCars,
};