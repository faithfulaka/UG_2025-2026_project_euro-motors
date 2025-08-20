// src/lib/services/carquery-api.ts

import axios from 'axios';

const CARQUERY_BASE_URL = 'https://www.carqueryapi.com/api/0.3';

// Cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// CarQuery API response types
interface CarQueryMake {
  make_id: string;
  make_display: string;
  make_is_common?: string;
  make_country?: string;
}

interface CarQueryModel {
  model_name: string;
  model_make_id?: string;
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
  model_lkm_city?: string;
  model_lkm_hwy?: string;
  model_lkm_mixed?: string;
  model_top_speed_kph?: string;
  model_weight_kg?: string;
  model_length_mm?: string;
  model_width_mm?: string;
  model_height_mm?: string;
  model_wheelbase_mm?: string;
}

interface CarQueryResponse {
  Makes?: CarQueryMake[];
  Models?: CarQueryModel[];
  Trims?: CarQueryTrim[];
}

interface ProcessedCarData {
  make: string;
  model: string;
  year: number;
  trim?: string;
  engine?: {
    cylinders?: string;
    displacement?: string;
    power?: string;
    torque?: string;
    fuel?: string;
  };
  transmission?: string;
  drivetrain?: string;
  body?: string;
  doors?: string;
  seats?: string;
  mpg?: {
    city?: string;
    highway?: string;
    combined?: string;
  };
}

function getCacheKey(params: Record<string, string>): string {
  return JSON.stringify(params);
}

function getCachedData(key: string): unknown | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// CarQuery uses JSONP, so we need to handle it differently
async function fetchCarQueryData(params: Record<string, string>): Promise<CarQueryResponse | null> {
  const cacheKey = getCacheKey(params);
  const cached = getCachedData(cacheKey) as CarQueryResponse | null;
  if (cached) {
    return cached;
  }

  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${CARQUERY_BASE_URL}/?${queryString}&callback=test`;
    
    const response = await axios.get<string>(url, {
      timeout: 5000,
      headers: {
        'Accept': 'text/javascript',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    const data = response.data;
    if (typeof data === 'string') {
      const match = data.match(/test\((.*)\);?$/s);
      if (match) {
        const parsedData = JSON.parse(match[1]) as CarQueryResponse;
        setCachedData(cacheKey, parsedData);
        return parsedData;
      }
    }
    
    const typedData = data as CarQueryResponse;
    setCachedData(cacheKey, typedData);
    return typedData;
  } catch {
    return null;
  }
}

/**
 * Get all available makes - PERFECT for autocomplete suggestions
 */
export async function getMakes(): Promise<string[]> {
  try {
    const data = await fetchCarQueryData({ cmd: 'getMakes' });
    
    if (data?.Makes) {
      return data.Makes.map((make: CarQueryMake) => make.make_display || make.make_id)
        .filter((make: string) => make && make.length > 0)
        .sort();
    }
  } catch {
    console.log('CarQuery unavailable, using fallback makes');
  }
  
  // Return empty array to avoid duplicates - the new API will handle fallback
  return [];
}

/**
 * Get models for a specific make - PERFECT for autocomplete suggestions
 */
export async function getModels(make: string): Promise<string[]> {
  try {
    const data = await fetchCarQueryData({
      cmd: 'getModels',
      make: make.toLowerCase().replace(/\s+/g, '-')
    });
    
    if (data?.Models) {
      return data.Models.map((model: CarQueryModel) => model.model_name)
        .filter((model: string) => model && model.length > 0)
        .sort();
    }
  } catch {
    console.log('CarQuery unavailable for models');
  }
  
  // Return empty array to avoid duplicates - the new API will handle fallback
  return [];
}

/**
 * Get years for a specific make and model - PERFECT for autocomplete suggestions
 */
export async function getYears(make: string, model: string): Promise<number[]> {
  try {
    const data = await fetchCarQueryData({
      cmd: 'getTrims',
      make: make.toLowerCase().replace(/\s+/g, '-'),
      model: model.toLowerCase().replace(/\s+/g, '-')
    });
    
    if (data?.Trims) {
      const years = new Set<number>();
      data.Trims.forEach((trim: CarQueryTrim) => {
        if (trim.model_year) {
          const year = parseInt(trim.model_year);
          if (year > 1900 && year <= new Date().getFullYear() + 1) {
            years.add(year);
          }
        }
      });
      return Array.from(years).sort((a, b) => b - a);
    }
  } catch {
    console.log('CarQuery unavailable for years');
  }
  
  // Return empty array to avoid duplicates - the new API will handle fallback
  return [];
}

/**
 * Get detailed car data
 */
export async function getCarData(make: string, model: string, year: string | number): Promise<ProcessedCarData[]> {
  try {
    const data = await fetchCarQueryData({
      cmd: 'getTrims',
      make: make.toLowerCase().replace(/\s+/g, '-'),
      model: model.toLowerCase().replace(/\s+/g, '-'),
      year: year.toString()
    });
    
    if (data?.Trims) {
      return data.Trims.map((trim: CarQueryTrim): ProcessedCarData => ({
        make: trim.model_make_id || make,
        model: trim.model_name || model,
        year: parseInt(trim.model_year || year.toString()),
        trim: trim.model_trim,
        engine: {
          cylinders: trim.model_engine_cyl,
          displacement: trim.model_engine_cc,
          power: trim.model_engine_power_ps,
          torque: trim.model_engine_torque_nm,
          fuel: trim.model_engine_fuel
        },
        transmission: trim.model_transmission_type,
        drivetrain: trim.model_drive,
        body: trim.model_body,
        doors: trim.model_doors,
        seats: trim.model_seats,
        mpg: {
          city: trim.model_lkm_city,
          highway: trim.model_lkm_hwy,
          combined: trim.model_lkm_mixed
        }
      }));
    }
  } catch {
    console.log('CarQuery unavailable for detailed data');
  }
  
  return [];
}

/**
 * Test if CarQuery is available
 */
export async function testCarQueryConnection(): Promise<boolean> {
  try {
    const data = await fetchCarQueryData({ cmd: 'getMakes' });
    return Boolean(data?.Makes?.length);
  } catch {
    return false;
  }
}

// Export as service
export const carQueryService = {
  getMakes,
  getModels,
  getYears,
  getCarData,
  testCarQueryConnection
};
