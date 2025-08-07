// src/lib/services/new-apis/cis-automotive-api.ts
import axios from 'axios';

const CIS_BASE_URL = 'https://cis-automotive.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

if (!RAPIDAPI_KEY) {
  console.warn('RAPIDAPI_KEY not found in environment variables');
}

const cisClient = axios.create({
  baseURL: CIS_BASE_URL,
  headers: {
    'x-rapidapi-host': 'cis-automotive.p.rapidapi.com',
    'x-rapidapi-key': RAPIDAPI_KEY || '',
  },
  timeout: 10000,
});

// Types for CIS Automotive API
export interface CISDealer {
  dealerID: string;
  dealerName: string;
  dealerType: string;
  phone: string;
  fax?: string;
  website?: string;
  email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  brands: string[];
  services: string[];
  certifications: string[];
  ratings?: {
    overall: number;
    service: number;
    sales: number;
    facilities: number;
  };
  hours: {
    [day: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  inventory?: {
    new: number;
    used: number;
    certified: number;
  };
}

export interface CISVehicle {
  vehicleID: string;
  vin?: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  bodyStyle?: string;
  condition: 'new' | 'used' | 'certified';
  mileage?: number;
  price: number;
  msrp?: number;
  dealerID: string;
  exterior: {
    color?: string;
    colorCode?: string;
  };
  interior: {
    color?: string;
    material?: string;
  };
  engine: {
    type?: string;
    size?: string;
    cylinders?: number;
    horsepower?: number;
    torque?: number;
    fuelType?: string;
  };
  transmission?: string;
  drivetrain?: string;
  features: string[];
  options: string[];
  images: string[];
  description?: string;
  dateAdded: string;
  lastUpdated: string;
}

export interface CISSearchFilters {
  make?: string;
  model?: string;
  year?: number;
  yearMin?: number;
  yearMax?: number;
  condition?: 'new' | 'used' | 'certified';
  priceMin?: number;
  priceMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  bodyStyle?: string;
  fuelType?: string;
  transmission?: string;
  drivetrain?: string;
  zip?: string;
  radius?: number;
  limit?: number;
  offset?: number;
}

/**
 * Get dealer information by ID
 */
export async function getDealerByID(dealerID: string): Promise<CISDealer | null> {
  try {
    const response = await cisClient.get('/getDealersByID', {
      params: { dealerID }
    });

    return response.data;
  } catch (error) {
    console.error('CIS Automotive API error (getDealerByID):', error);
    return null;
  }
}

/**
 * Search for dealers by location
 */
export async function searchDealers(params: {
  zip?: string;
  city?: string;
  state?: string;
  radius?: number;
  brand?: string;
  services?: string[];
  limit?: number;
}): Promise<CISDealer[]> {
  try {
    const searchParams = {
      ...params,
      radius: params.radius || 25,
      limit: params.limit || 50
    };

    const response = await cisClient.get('/searchDealers', {
      params: searchParams
    });

    return response.data?.dealers || [];
  } catch (error) {
    console.error('CIS Automotive API error (searchDealers):', error);
    return [];
  }
}

/**
 * Get dealers for a specific brand/make
 */
export async function getDealersByBrand(
  brand: string,
  location?: {
    zip?: string;
    city?: string;
    state?: string;
    radius?: number;
  }
): Promise<CISDealer[]> {
  try {
    const params = {
      brand,
      ...location,
      radius: location?.radius || 50,
      limit: 100
    };

    const response = await cisClient.get('/dealersByBrand', {
      params
    });

    return response.data?.dealers || [];
  } catch (error) {
    console.error('CIS Automotive API error (getDealersByBrand):', error);
    return [];
  }
}

/**
 * Get dealer inventory
 */
export async function getDealerInventory(
  dealerID: string,
  filters?: CISSearchFilters
): Promise<CISVehicle[]> {
  try {
    const params = {
      dealerID,
      ...filters,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0
    };

    const response = await cisClient.get('/dealerInventory', {
      params
    });

    return response.data?.vehicles || [];
  } catch (error) {
    console.error('CIS Automotive API error (getDealerInventory):', error);
    return [];
  }
}

/**
 * Search vehicles across all dealers
 */
export async function searchVehicles(filters: CISSearchFilters): Promise<CISVehicle[]> {
  try {
    const params = {
      ...filters,
      limit: filters.limit || 50,
      offset: filters.offset || 0
    };

    const response = await cisClient.get('/searchVehicles', {
      params
    });

    return response.data?.vehicles || [];
  } catch (error) {
    console.error('CIS Automotive API error (searchVehicles):', error);
    return [];
  }
}

/**
 * Get vehicle details by ID
 */
export async function getVehicleByID(vehicleID: string): Promise<CISVehicle | null> {
  try {
    const response = await cisClient.get('/getVehicleByID', {
      params: { vehicleID }
    });

    return response.data;
  } catch (error) {
    console.error('CIS Automotive API error (getVehicleByID):', error);
    return null;
  }
}

/**
 * Get available makes from dealers
 */
export async function getAvailableMakes(): Promise<string[]> {
  try {
    const response = await cisClient.get('/getMakes');
    return response.data?.makes || [];
  } catch (error) {
    console.error('CIS Automotive API error (getAvailableMakes):', error);
    return [];
  }
}

/**
 * Get available models for a specific make
 */
export async function getAvailableModels(make: string): Promise<string[]> {
  try {
    const response = await cisClient.get('/getModels', {
      params: { make }
    });
    
    return response.data?.models || [];
  } catch (error) {
    console.error('CIS Automotive API error (getAvailableModels):', error);
    return [];
  }
}

/**
 * Get dealer ratings and reviews
 */
export async function getDealerReviews(dealerID: string): Promise<any> {
  try {
    const response = await cisClient.get('/getDealerReviews', {
      params: { dealerID }
    });

    return response.data;
  } catch (error) {
    console.error('CIS Automotive API error (getDealerReviews):', error);
    return null;
  }
}

/**
 * Find nearest dealers to a specific vehicle
 */
export async function findNearestDealers(
  make: string,
  location: {
    zip?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
  },
  radius: number = 25
): Promise<CISDealer[]> {
  try {
    const dealers = await getDealersByBrand(make, { ...location, radius });
    
    // Sort by distance if coordinates are provided
    if (location.latitude && location.longitude) {
      dealers.sort((a, b) => {
        const distA = calculateDistance(
          location.latitude!,
          location.longitude!,
          a.coordinates?.latitude || 0,
          a.coordinates?.longitude || 0
        );
        const distB = calculateDistance(
          location.latitude!,
          location.longitude!,
          b.coordinates?.latitude || 0,
          b.coordinates?.longitude || 0
        );
        return distA - distB;
      });
    }

    return dealers;
  } catch (error) {
    console.error('CIS Automotive API error (findNearestDealers):', error);
    return [];
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const cisAutomotiveService = {
  getDealerByID,
  searchDealers,
  getDealersByBrand,
  getDealerInventory,
  searchVehicles,
  getVehicleByID,
  getAvailableMakes,
  getAvailableModels,
  getDealerReviews,
  findNearestDealers,
};