// src/lib/services/new-apis/marketcheck-api.ts - Using ONLY Search API endpoint
import axios from 'axios';

const MARKETCHECK_BASE_URL = 'https://marketcheck-cars-search-v1.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '8e431933a5mshad199d436e3caf1p14df7djsn56edbda4c8c5';

const marketCheckClient = axios.create({
  baseURL: MARKETCHECK_BASE_URL,
  headers: {
    'x-rapidapi-host': 'marketcheck-cars-search-v1.p.rapidapi.com',
    'x-rapidapi-key': RAPIDAPI_KEY,
  },
  timeout: 15000,
});

// Types for MarketCheck API
export interface MarketCheckListing {
  id: string;
  vin?: string;
  price: number;
  miles: number;
  year: number;
  make: string;
  model: string;
  trim?: string;
  body_type?: string;
  vehicle_type?: string;
  drivetrain?: string;
  transmission?: string;
  engine?: string;
  fuel_type?: string;
  exterior_color?: string;
  interior_color?: string;
  doors?: number;
  dealer: {
    name?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    website?: string;
  };
  photos?: string[];
  dom?: number; // Days on market
  certified?: boolean;
  one_owner?: boolean;
  clean_title?: boolean;
}

export interface MarketCheckSearchResult {
  num_found: number;
  listings: MarketCheckListing[];
  stats?: {
    price: {
      min: number;
      max: number;
      mean: number;
      median: number;
    };
    miles: {
      min: number;
      max: number;
      mean: number;
      median: number;
    };
    dom: {
      mean: number;
      median: number;
    };
  };
}

/**
 * GET /search - The ONLY endpoint we use for MarketCheck
 * This single endpoint provides all vehicle search and market data
 */
export async function searchVehicles(params?: {
  // Basic search
  make?: string;
  model?: string;
  year?: number;
  year_min?: number;
  year_max?: number;
  trim?: string;
  
  // Vehicle details
  body_type?: string;
  vehicle_type?: string;
  drivetrain?: string;
  transmission?: string;
  engine?: string;
  fuel_type?: string;
  exterior_color?: string;
  interior_color?: string;
  
  // Pricing
  price_min?: number;
  price_max?: number;
  
  // Mileage
  miles_min?: number;
  miles_max?: number;
  
  // Location
  zip?: string;
  radius?: number;
  city?: string;
  state?: string;
  
  // Pagination
  start?: number;
  rows?: number;
  
  // Sorting
  sort_by?: 'price' | 'miles' | 'dom' | 'year';
  sort_order?: 'asc' | 'desc';
  
  // Filters
  certified?: boolean;
  one_owner?: boolean;
  clean_title?: boolean;
  photos_available?: boolean;
}): Promise<MarketCheckSearchResult | null> {
  try {
    console.log('🔍 MarketCheck: Searching vehicles', params);
    
    // Build query parameters
    const queryParams: any = {
      ...params,
      rows: params?.rows || 50,
      start: params?.start || 0
    };
    
    // Clean up parameters
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined || queryParams[key] === null || queryParams[key] === '') {
        delete queryParams[key];
      }
    });
    
    const response = await marketCheckClient.get('/search', { params: queryParams });
    
    if (response.data) {
      // Parse the response properly
      const result: MarketCheckSearchResult = {
        num_found: response.data.num_found || 0,
        listings: []
      };
      
      // Parse listings
      if (response.data.listings && Array.isArray(response.data.listings)) {
        result.listings = response.data.listings.map((listing: any) => ({
          id: listing.id,
          vin: listing.vin,
          price: listing.price || 0,
          miles: listing.miles || listing.mileage || 0,
          year: listing.build?.year || listing.year,
          make: listing.build?.make || listing.make,
          model: listing.build?.model || listing.model,
          trim: listing.build?.trim || listing.trim,
          body_type: listing.build?.body_type || listing.body_type,
          vehicle_type: listing.build?.vehicle_type || listing.vehicle_type,
          drivetrain: listing.build?.drivetrain || listing.drivetrain,
          transmission: listing.build?.transmission || listing.transmission,
          engine: listing.build?.engine || listing.engine,
          fuel_type: listing.build?.fuel_type || listing.fuel_type,
          exterior_color: listing.exterior_color,
          interior_color: listing.interior_color,
          doors: listing.build?.doors || listing.doors,
          dealer: {
            name: listing.dealer?.name,
            city: listing.dealer?.city,
            state: listing.dealer?.state,
            zip: listing.dealer?.zip,
            phone: listing.dealer?.phone,
            website: listing.dealer?.website
          },
          photos: listing.media?.photo_links || listing.photos || [],
          dom: listing.dom,
          certified: listing.certified,
          one_owner: listing.one_owner,
          clean_title: listing.clean_title
        }));
      }
      
      // Calculate statistics from listings
      if (result.listings.length > 0) {
        const prices = result.listings.map(l => l.price).filter(p => p > 0).sort((a, b) => a - b);
        const miles = result.listings.map(l => l.miles).filter(m => m >= 0).sort((a, b) => a - b);
        const doms = result.listings.map(l => l.dom || 0).filter(d => d >= 0).sort((a, b) => a - b);
        
        result.stats = {
          price: prices.length > 0 ? {
            min: Math.min(...prices),
            max: Math.max(...prices),
            mean: prices.reduce((sum, p) => sum + p, 0) / prices.length,
            median: prices[Math.floor(prices.length / 2)]
          } : { min: 0, max: 0, mean: 0, median: 0 },
          miles: miles.length > 0 ? {
            min: Math.min(...miles),
            max: Math.max(...miles),
            mean: miles.reduce((sum, m) => sum + m, 0) / miles.length,
            median: miles[Math.floor(miles.length / 2)]
          } : { min: 0, max: 0, mean: 0, median: 0 },
          dom: doms.length > 0 ? {
            mean: doms.reduce((sum, d) => sum + d, 0) / doms.length,
            median: doms[Math.floor(doms.length / 2)]
          } : { mean: 0, median: 0 }
        };
      }
      
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('MarketCheck API error (searchVehicles):', error);
    return null;
  }
}

/**
 * Helper function to get market statistics for a specific vehicle
 */
export async function getMarketStats(make: string, model: string, year?: number): Promise<{
  averagePrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  totalListings: number;
  averageMiles: number;
  averageDaysOnMarket: number;
} | null> {
  const result = await searchVehicles({
    make,
    model,
    year,
    rows: 100 // Get more results for better statistics
  });
  
  if (result && result.stats) {
    return {
      averagePrice: result.stats.price.mean,
      medianPrice: result.stats.price.median,
      minPrice: result.stats.price.min,
      maxPrice: result.stats.price.max,
      totalListings: result.num_found,
      averageMiles: result.stats.miles.mean,
      averageDaysOnMarket: result.stats.dom.mean
    };
  }
  
  return null;
}

/**
 * Helper function to find similar vehicles
 */
export async function findSimilarVehicles(
  make: string,
  model: string,
  year: number,
  maxResults: number = 20
): Promise<MarketCheckListing[]> {
  // Search for exact match first
  let result = await searchVehicles({
    make,
    model,
    year,
    rows: maxResults
  });
  
  // If not enough results, broaden search to nearby years
  if (!result || result.listings.length < maxResults / 2) {
    result = await searchVehicles({
      make,
      model,
      year_min: year - 2,
      year_max: year + 2,
      rows: maxResults
    });
  }
  
  return result?.listings || [];
}

export const marketCheckService = {
  searchVehicles,
  getMarketStats,
  findSimilarVehicles
};
