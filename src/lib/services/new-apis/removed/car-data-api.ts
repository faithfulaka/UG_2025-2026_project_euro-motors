// src/lib/services/new-apis/car-data-api.ts - Using ONLY specified endpoints
import axios from 'axios';

const CARDATA_BASE_URL = 'https://car-data.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '8e431933a5mshad199d436e3caf1p14df7djsn56edbda4c8c5';

const carDataClient = axios.create({
  baseURL: CARDATA_BASE_URL,
  headers: {
    'x-rapidapi-host': 'car-data.p.rapidapi.com',
    'x-rapidapi-key': RAPIDAPI_KEY,
  },
  timeout: 10000,
});

// Types for Car Data API
export interface CarDataVehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  type: string; // Body type
}

/**
 * GET /cars - Search for cars
 */
export async function getCars(params?: {
  limit?: number;
  page?: number;
  make?: string;
  model?: string;
  year?: number;
  type?: string;
}): Promise<CarDataVehicle[]> {
  try {
    console.log('🔍 Car Data API: Getting cars', params);
    const response = await carDataClient.get('/cars', { params });
    
    if (Array.isArray(response.data)) {
      return response.data.map((car: any) => ({
        id: car.id,
        year: car.year,
        make: car.make,
        model: car.model,
        type: car.type || 'Unknown'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Car Data API error (getCars):', error);
    return [];
  }
}

/**
 * GET /types - Get all body types
 */
export async function getTypes(): Promise<string[]> {
  try {
    console.log('🔍 Car Data API: Getting types');
    const response = await carDataClient.get('/types');
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Car Data API error (getTypes):', error);
    return [];
  }
}

/**
 * GET /makes - Get all makes
 */
export async function getMakes(): Promise<string[]> {
  try {
    console.log('🔍 Car Data API: Getting makes');
    const response = await carDataClient.get('/makes');
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Car Data API error (getMakes):', error);
    return [];
  }
}

/**
 * GET /years - Get all years
 */
export async function getYears(): Promise<number[]> {
  try {
    console.log('🔍 Car Data API: Getting years');
    const response = await carDataClient.get('/years');
    
    if (Array.isArray(response.data)) {
      return response.data.map((year: any) => parseInt(year)).filter((y: number) => !isNaN(y));
    }
    
    return [];
  } catch (error) {
    console.error('Car Data API error (getYears):', error);
    return [];
  }
}

export const carDataService = {
  getCars,
  getTypes,
  getMakes,
  getYears
};
