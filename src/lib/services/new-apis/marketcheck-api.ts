// src/lib/services/new-apis/marketcheck-api.ts
import axios from 'axios';

const MARKETCHECK_BASE_URL = 'https://marketcheck-cars-search-v1.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

if (!RAPIDAPI_KEY) {
  console.warn('RAPIDAPI_KEY not found in environment variables');
}

const marketCheckClient = axios.create({
  baseURL: MARKETCHECK_BASE_URL,
  headers: {
    'x-rapidapi-host': 'marketcheck-cars-search-v1.p.rapidapi.com',
    'x-rapidapi-key': RAPIDAPI_KEY || '',
  },
  timeout: 15000,
});

// Types for MarketCheck API
export interface MarketCheckVehicle {
  id: string;
  heading: string;
  price: number;
  miles: number;
  msrp: number;
  savings: number;
  dom: number; // Days on Market
  dealer: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  build: {
    make: string;
    model: string;
    year: number;
    body_type: string;
    vehicle_type: string;
    drivetrain: string;
    transmission: string;
    engine: string;
    fuel_type: string;
    doors: number;
    cylinders: number;
    engine_size: number;
  };
  media: {
    photo_links: string[];
  };
  vdp_url: string;
  source: string;
}

export interface MarketCheckSearchResponse {
  num_found: number;
  listings: MarketCheckVehicle[];
  search_area: {
    city: string;
    state: string;
    radius: number;
  };
}

export interface MarketCheckSearchParams {
  api_key?: string;
  make?: string;
  model?: string;
  year?: string;
  body_type?: string;
  vehicle_type?: string;
  transmission?: string;
  drivetrain?: string;
  fuel_type?: string;
  exterior_color?: string;
  interior_color?: string;
  engine?: string;
  dealer_id?: string;
  start?: number;
  rows?: number;
  sort?: string;
  sort_order?: 'asc' | 'desc';
  radius?: number;
  zip?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  price_min?: number;
  price_max?: number;
  miles_min?: number;
  miles_max?: number;
  dom_min?: number;
  dom_max?: number;
  year_min?: number;
  year_max?: number;
}

export interface MarketCheckStats {
  make: string;
  model: string;
  year?: number;
  averagePrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  totalListings: number;
  averageMiles: number;
  averageDaysOnMarket: number;
  priceDistribution: {
    q1: number;
    q2: number;
    q3: number;
  };
}

/**
 * Search for vehicles with various filters
 */
export async function searchVehicles(params: MarketCheckSearchParams): Promise<MarketCheckSearchResponse | null> {
  try {
    const searchParams = {
      ...params,
      api_key: RAPIDAPI_KEY, // Some endpoints might need this
      rows: params.rows || 25,
      start: params.start || 0,
    };

    const response = await marketCheckClient.get('/search', {
      params: searchParams
    });

    return response.data;
  } catch (error) {
    console.error('MarketCheck API error (searchVehicles):', error);
    return null;
  }
}

/**
 * Search specifically by make, model, and year
 */
export async function searchByMakeModelYear(
  make: string,
  model: string,
  year?: number,
  options: {
    maxResults?: number;
    radius?: number;
    zip?: string;
    priceMin?: number;
    priceMax?: number;
  } = {}
): Promise<MarketCheckVehicle[]> {
  try {
    const params: MarketCheckSearchParams = {
      make,
      model,
      rows: options.maxResults || 25,
      radius: options.radius || 100,
      zip: options.zip || '10001', // Default to NYC
      sort: 'price',
      sort_order: 'asc'
    };

    if (year) {
      params.year = year.toString();
    }

    if (options.priceMin) {
      params.price_min = options.priceMin;
    }

    if (options.priceMax) {
      params.price_max = options.priceMax;
    }

    const response = await searchVehicles(params);
    return response?.listings || [];
  } catch (error) {
    console.error('MarketCheck API error (searchByMakeModelYear):', error);
    return [];
  }
}

/**
 * Get market statistics for a specific vehicle
 */
export async function getMarketStats(
  make: string,
  model: string,
  year?: number
): Promise<MarketCheckStats | null> {
  try {
    const vehicles = await searchByMakeModelYear(make, model, year, { maxResults: 100 });

    if (vehicles.length === 0) {
      return null;
    }

    // Calculate statistics
    const prices = vehicles.map(v => v.price).filter(p => p > 0).sort((a, b) => a - b);
    const miles = vehicles.map(v => v.miles).filter(m => m >= 0);
    const dom = vehicles.map(v => v.dom).filter(d => d >= 0);

    if (prices.length === 0) {
      return null;
    }

    const q1Index = Math.floor(prices.length * 0.25);
    const q2Index = Math.floor(prices.length * 0.5);
    const q3Index = Math.floor(prices.length * 0.75);

    return {
      make,
      model,
      year,
      averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      medianPrice: prices[q2Index],
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      totalListings: vehicles.length,
      averageMiles: miles.length > 0 ? miles.reduce((sum, m) => sum + m, 0) / miles.length : 0,
      averageDaysOnMarket: dom.length > 0 ? dom.reduce((sum, d) => sum + d, 0) / dom.length : 0,
      priceDistribution: {
        q1: prices[q1Index],
        q2: prices[q2Index],
        q3: prices[q3Index]
      }
    };
  } catch (error) {
    console.error('MarketCheck API error (getMarketStats):', error);
    return null;
  }
}

/**
 * Get vehicles near a specific location
 */
export async function searchNearLocation(
  location: { zip?: string; city?: string; state?: string },
  filters: {
    make?: string;
    model?: string;
    year?: number;
    priceMin?: number;
    priceMax?: number;
    radius?: number;
  } = {}
): Promise<MarketCheckVehicle[]> {
  try {
    const params: MarketCheckSearchParams = {
      ...location,
      ...filters,
      year: filters.year?.toString(),
      radius: filters.radius || 50,
      rows: 50,
      sort: 'distance',
      sort_order: 'asc'
    };

    const response = await searchVehicles(params);
    return response?.listings || [];
  } catch (error) {
    console.error('MarketCheck API error (searchNearLocation):', error);
    return [];
  }
}

/**
 * Get featured/popular vehicles
 */
export async function getFeaturedVehicles(limit: number = 20): Promise<MarketCheckVehicle[]> {
  try {
    const params: MarketCheckSearchParams = {
      rows: limit,
      sort: 'relevance',
      sort_order: 'desc'
    };

    const response = await searchVehicles(params);
    return response?.listings || [];
  } catch (error) {
    console.error('MarketCheck API error (getFeaturedVehicles):', error);
    return [];
  }
}

/**
 * Get vehicle details by ID
 */
export async function getVehicleDetails(vehicleId: string): Promise<MarketCheckVehicle | null> {
  try {
    const response = await marketCheckClient.get(`/listing/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error('MarketCheck API error (getVehicleDetails):', error);
    return null;
  }
}

/**
 * Get available makes from the market
 */
export async function getAvailableMakes(): Promise<string[]> {
  try {
    // Search with minimal params to get a diverse set of results
    const response = await searchVehicles({ rows: 100 });
    
    if (!response?.listings) {
      return [];
    }

    // Extract unique makes
    const makes = Array.from(
      new Set(response.listings.map(vehicle => vehicle.build.make))
    ).sort();

    return makes;
  } catch (error) {
    console.error('MarketCheck API error (getAvailableMakes):', error);
    return [];
  }
}

/**
 * Get available models for a specific make
 */
export async function getAvailableModels(make: string): Promise<string[]> {
  try {
    const response = await searchVehicles({ make, rows: 100 });
    
    if (!response?.listings) {
      return [];
    }

    // Extract unique models
    const models = Array.from(
      new Set(response.listings.map(vehicle => vehicle.build.model))
    ).sort();

    return models;
  } catch (error) {
    console.error('MarketCheck API error (getAvailableModels):', error);
    return [];
  }
}

export const marketCheckService = {
  searchVehicles,
  searchByMakeModelYear,
  getMarketStats,
  searchNearLocation,
  getFeaturedVehicles,
  getVehicleDetails,
  getAvailableMakes,
  getAvailableModels,
};