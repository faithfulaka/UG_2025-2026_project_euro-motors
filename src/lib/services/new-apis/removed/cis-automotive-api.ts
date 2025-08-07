// src/lib/services/new-apis/cis-automotive-api.ts - FIXED: Removed non-existent endpoints
import axios from 'axios';

const CIS_BASE_URL = 'https://cis-automotive.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '8e431933a5mshad199d436e3caf1p14df7djsn56edbda4c8c5';

// Add rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

async function rateLimitedRequest(fn: () => Promise<any>) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
  return fn();
}

const cisClient = axios.create({
  baseURL: CIS_BASE_URL,
  headers: {
    'x-rapidapi-host': 'cis-automotive.p.rapidapi.com',
    'x-rapidapi-key': RAPIDAPI_KEY,
  },
  timeout: 10000,
});

// Types for CIS Automotive API
export interface CISBrand {
  id: string;
  name: string;
  country?: string;
}

export interface CISModel {
  id: string;
  brand: string;
  name: string;
  year_from?: number;
  year_to?: number;
}

export interface CISPricing {
  listPrice?: number;
  salePrice?: number;
  priceConfidence?: string;
  marketTrend?: string;
}

// ========== STATIC DATA ENDPOINTS (WORKING) ==========

/**
 * GET /getBrands - Get all brands
 */
export async function getBrands(): Promise<CISBrand[]> {
  try {
    console.log('🔍 CIS Automotive: Getting brands');
    
    const response = await rateLimitedRequest(() => cisClient.get('/getBrands'));
    
    // Handle both array and object responses
    if (response.data) {
      // If it's directly an array
      if (Array.isArray(response.data)) {
        return response.data.map((brand: any) => ({
          id: brand.id || brand.brand_id || brand.brandId,
          name: brand.name || brand.brand_name || brand.brandName,
          country: brand.country || brand.origin
        }));
      }
      // If it's wrapped in an object
      else if (response.data.brands && Array.isArray(response.data.brands)) {
        return response.data.brands.map((brand: any) => ({
          id: brand.id || brand.brand_id || brand.brandId,
          name: brand.name || brand.brand_name || brand.brandName,
          country: brand.country || brand.origin
        }));
      }
      // If it's a single object response, try to extract brand info
      else if (response.data.brandName || response.data.brand_name) {
        return [{
          id: response.data.id || response.data.brand_id || '1',
          name: response.data.brandName || response.data.brand_name,
          country: response.data.country || response.data.origin
        }];
      }
    }
    
    return [];
  } catch (error: any) {
    if (error?.response?.status === 429) {
      console.warn('CIS Automotive rate limited (getBrands), returning empty array');
      return [];
    }
    console.error('CIS Automotive error (getBrands):', error);
    return [];
  }
}

/**
 * GET /getRegions - Get all regions
 */
export async function getRegions(): Promise<string[]> {
  try {
    console.log('🔍 CIS Automotive: Getting regions');
    
    const response = await rateLimitedRequest(() => cisClient.get('/getRegions'));
    
    if (response.data) {
      // Handle array response
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // Handle object with regions array
      else if (response.data.regions && Array.isArray(response.data.regions)) {
        return response.data.regions;
      }
      // Handle object with regionName field
      else if (response.data.regionName) {
        return [response.data.regionName];
      }
    }
    
    return [];
  } catch (error: any) {
    if (error?.response?.status === 429) {
      console.warn('CIS Automotive rate limited (getRegions), returning empty array');
      return [];
    }
    console.error('CIS Automotive error (getRegions):', error);
    return [];
  }
}

/**
 * GET /getInactiveModels - Get inactive models
 */
export async function getInactiveModels(brand?: string): Promise<CISModel[]> {
  try {
    console.log('🔍 CIS Automotive: Getting inactive models for brand:', brand);
    
    // Try different parameter formats
    const params: any = {};
    if (brand) {
      params.brand = brand;
      params.brandName = brand;
      params.brand_name = brand;
    }
    
    const response = await rateLimitedRequest(() => cisClient.get('/getInactiveModels', { params }));
    
    if (response.data) {
      if (Array.isArray(response.data)) {
        return response.data.map((model: any) => ({
          id: model.id || model.model_id || model.modelId,
          brand: model.brand || model.brand_name || model.brandName || brand,
          name: model.name || model.model_name || model.modelName,
          year_from: model.year_from || model.yearFrom || model.start_year,
          year_to: model.year_to || model.yearTo || model.end_year
        }));
      } else if (response.data.models && Array.isArray(response.data.models)) {
        return response.data.models.map((model: any) => ({
          id: model.id || model.model_id || model.modelId,
          brand: model.brand || model.brand_name || model.brandName || brand,
          name: model.name || model.model_name || model.modelName,
          year_from: model.year_from || model.yearFrom || model.start_year,
          year_to: model.year_to || model.yearTo || model.end_year
        }));
      }
    }
    
    return [];
  } catch (error: any) {
    if (error?.response?.status === 429) {
      console.warn('CIS Automotive rate limited (getInactiveModels), returning empty array');
      return [];
    }
    console.error('CIS Automotive error (getInactiveModels):', error);
    return [];
  }
}

/**
 * GET /getModels - Get active models
 */
export async function getModels(brand?: string): Promise<CISModel[]> {
  try {
    console.log('🔍 CIS Automotive: Getting models for brand:', brand);
    
    // Build params with multiple possible parameter names
    const params: any = {};
    if (brand) {
      params.brand = brand;
      params.brandName = brand;
      params.brand_name = brand;
      params.make = brand; // Some APIs use 'make' instead of 'brand'
    }
    
    const response = await rateLimitedRequest(() => cisClient.get('/getModels', { params }));
    
    if (response.data) {
      // Handle array response
      if (Array.isArray(response.data)) {
        return response.data.map((model: any) => ({
          id: model.id || model.model_id || model.modelId,
          brand: model.brand || model.brand_name || model.brandName || brand,
          name: model.name || model.model_name || model.modelName,
          year_from: model.year_from || model.yearFrom || model.start_year,
          year_to: model.year_to || model.yearTo || model.end_year
        }));
      }
      // Handle object with models array
      else if (response.data.models && Array.isArray(response.data.models)) {
        return response.data.models.map((model: any) => ({
          id: model.id || model.model_id || model.modelId,
          brand: model.brand || model.brand_name || model.brandName || brand,
          name: model.name || model.model_name || model.modelName,
          year_from: model.year_from || model.yearFrom || model.start_year,
          year_to: model.year_to || model.yearTo || model.end_year
        }));
      }
      // Handle single model response
      else if (response.data.modelName || response.data.model_name) {
        return [{
          id: response.data.id || response.data.model_id || '1',
          brand: response.data.brand || response.data.brandName || brand || '',
          name: response.data.modelName || response.data.model_name,
          year_from: response.data.year_from || response.data.yearFrom,
          year_to: response.data.year_to || response.data.yearTo
        }];
      }
    }
    
    return [];
  } catch (error: any) {
    if (error?.response?.status === 429) {
      console.warn('CIS Automotive rate limited (getModels), returning empty array');
      return [];
    }
    console.error('CIS Automotive error (getModels):', error?.response?.status, error?.response?.data);
    return [];
  }
}

// ========== PRICING DATA ENDPOINTS (ONLY WORKING ONES) ==========

/**
 * GET /listPrice - Get list price
 */
export async function getListPrice(params: {
  make: string;
  model: string;
  year: number;
  trim?: string;
}): Promise<number | null> {
  try {
    console.log('🔍 CIS Automotive: Getting list price', params);
    
    const requestParams: any = {
      make: params.make,
      model: params.model,
      year: params.year,
      // Alternative parameter names
      brand: params.make,
      brandName: params.make,
      modelName: params.model,
      model_year: params.year
    };
    
    if (params.trim) {
      requestParams.trim = params.trim;
      requestParams.trim_level = params.trim;
      requestParams.variant = params.trim;
    }
    
    const response = await rateLimitedRequest(() => cisClient.get('/listPrice', { params: requestParams }));
    
    if (response.data) {
      if (response.data.listPrice) return response.data.listPrice;
      if (response.data.list_price) return response.data.list_price;
      if (response.data.msrp) return response.data.msrp;
      if (response.data.price) return response.data.price;
      if (typeof response.data === 'number') return response.data;
    }
    
    return null;
  } catch (error: any) {
    if (error?.response?.status === 429) {
      console.warn('CIS Automotive rate limited (getListPrice), returning null');
      return null;
    }
    console.error('CIS Automotive error (getListPrice):', error?.response?.status, error?.response?.data);
    return null;
  }
}

/**
 * GET /salePrice - Get sale price
 */
export async function getSalePrice(params: {
  make: string;
  model: string;
  year: number;
  trim?: string;
  region?: string;
}): Promise<number | null> {
  try {
    console.log('🔍 CIS Automotive: Getting sale price', params);
    
    const requestParams: any = {
      make: params.make,
      model: params.model,
      year: params.year,
      // Alternative parameter names
      brand: params.make,
      brandName: params.make,
      modelName: params.model,
      model_year: params.year
    };
    
    if (params.trim) {
      requestParams.trim = params.trim;
      requestParams.trim_level = params.trim;
    }
    
    if (params.region) {
      requestParams.region = params.region;
      requestParams.location = params.region;
      requestParams.market = params.region;
    }
    
    const response = await rateLimitedRequest(() => cisClient.get('/salePrice', { params: requestParams }));
    
    if (response.data) {
      if (response.data.salePrice) return response.data.salePrice;
      if (response.data.sale_price) return response.data.sale_price;
      if (response.data.price) return response.data.price;
      if (response.data.selling_price) return response.data.selling_price;
      if (typeof response.data === 'number') return response.data;
    }
    
    return null;
  } catch (error: any) {
    if (error?.response?.status === 429) {
      console.warn('CIS Automotive rate limited (getSalePrice), returning null');
      return null;
    }
    console.error('CIS Automotive error (getSalePrice):', error?.response?.status, error?.response?.data);
    return null;
  }
}

/**
 * Get comprehensive pricing data (only working endpoints)
 */
export async function getComprehensivePricing(
  make: string,
  model: string,
  year: number,
  options?: {
    trim?: string;
    region?: string;
  }
): Promise<CISPricing> {
  console.log('🔍 CIS Automotive: Getting comprehensive pricing for', make, model, year);
  
  // Only call working endpoints with rate limiting
  const [listPrice, salePrice] = await Promise.allSettled([
    getListPrice({ 
      make, 
      model, 
      year, 
      trim: options?.trim 
    }),
    getListPrice({ // Add delay by calling listPrice twice
      make, 
      model, 
      year, 
      trim: options?.trim 
    }).then(() => getSalePrice({ 
      make, 
      model, 
      year, 
      trim: options?.trim, 
      region: options?.region || 'US'
    }))
  ]);
  
  const result: CISPricing = {};
  
  // Extract successful results
  if (listPrice.status === 'fulfilled' && listPrice.value) {
    result.listPrice = listPrice.value;
    console.log('✅ Got list price:', listPrice.value);
  }
  
  if (salePrice.status === 'fulfilled' && salePrice.value) {
    result.salePrice = salePrice.value;
    console.log('✅ Got sale price:', salePrice.value);
  }
  
  return result;
}

export const cisAutomotiveService = {
  // Static Data (All Working)
  getBrands,
  getRegions,
  getInactiveModels,
  getModels,
  // Pricing Data (Only Working Ones)
  getListPrice,
  getSalePrice,
  getComprehensivePricing
  // REMOVED: getDealersByBrand (doesn't exist)
  // REMOVED: searchVehicles (doesn't exist)
  // REMOVED: getValuation (401 - subscription limited)
  // REMOVED: getSimilarSalePrice (422 - requires VIN)
};
