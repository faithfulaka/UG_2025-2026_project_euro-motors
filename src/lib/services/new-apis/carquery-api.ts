// src/lib/services/new-apis/carquery-api.ts - Full CarQuery API implementation
import axios from 'axios';

const CARQUERY_BASE_URL = 'https://www.carqueryapi.com/api/0.3';

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(params: Record<string, any>): string {
  return JSON.stringify(params);
}

function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Make a request to CarQuery API
 */
async function fetchCarQueryData(params: Record<string, string>): Promise<any> {
  const cacheKey = getCacheKey(params);
  const cached = getCachedData(cacheKey);
  if (cached) {
    console.log('📦 Using cached CarQuery data for:', params.cmd);
    return cached;
  }

  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${CARQUERY_BASE_URL}/?${queryString}&callback=test`;
    
    console.log('🔍 CarQuery API request:', params.cmd);
    
    const response = await axios.get(url, {
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
        const parsedData = JSON.parse(match[1]);
        setCachedData(cacheKey, parsedData);
        return parsedData;
      }
    }
    
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('CarQuery API error:', error);
    return null;
  }
}

/**
 * Get all available years
 */
export async function getYears(): Promise<{ min_year: number; max_year: number }> {
  const data = await fetchCarQueryData({ cmd: 'getYears' });
  if (data?.Years) {
    return {
      min_year: parseInt(data.Years.min_year) || 1990,
      max_year: parseInt(data.Years.max_year) || new Date().getFullYear()
    };
  }
  return { min_year: 1990, max_year: new Date().getFullYear() };
}

/**
 * Get all makes
 */
export async function getMakes(year?: number): Promise<Array<{ id: string; name: string; country?: string }>> {
  const params: any = { cmd: 'getMakes' };
  if (year) {
    params.year = year.toString();
  }
  
  const data = await fetchCarQueryData(params);
  if (data?.Makes && Array.isArray(data.Makes)) {
    return data.Makes.map((make: any) => ({
      id: make.make_id,
      name: make.make_display || make.make_id,
      country: make.make_country
    }));
  }
  return [];
}

/**
 * Get models for a specific make
 */
export async function getModels(make: string, year?: number): Promise<Array<{ name: string; year?: number }>> {
  const params: any = { 
    cmd: 'getModels',
    make: make.toLowerCase().replace(/\s+/g, '-')
  };
  
  if (year) {
    params.year = year.toString();
  }
  
  const data = await fetchCarQueryData(params);
  if (data?.Models && Array.isArray(data.Models)) {
    return data.Models.map((model: any) => ({
      name: model.model_name,
      year: model.model_year ? parseInt(model.model_year) : undefined
    }));
  }
  return [];
}

/**
 * Get detailed trim information
 */
export async function getTrims(make: string, model: string, year?: number): Promise<any[]> {
  const params: any = {
    cmd: 'getTrims',
    make: make.toLowerCase().replace(/\s+/g, '-'),
    model: model.toLowerCase().replace(/\s+/g, '-')
  };
  
  if (year) {
    params.year = year.toString();
  }
  
  const data = await fetchCarQueryData(params);
  if (data?.Trims && Array.isArray(data.Trims)) {
    return data.Trims;
  }
  return [];
}

/**
 * Get complete vehicle specifications
 */
export async function getVehicleSpecs(make: string, model: string, year: number): Promise<any> {
  console.log(`🔍 CarQuery: Getting specs for ${year} ${make} ${model}`);
  
  // First try to get trims for specific year
  const trims = await getTrims(make, model, year);
  
  if (trims.length > 0) {
    // Return the most complete trim data
    const bestTrim = trims.reduce((best, current) => {
      const bestCount = Object.keys(best).filter(k => best[k]).length;
      const currentCount = Object.keys(current).filter(k => current[k]).length;
      return currentCount > bestCount ? current : best;
    }, trims[0]);
    
    return formatTrimData(bestTrim);
  }
  
  // Try without year
  const allTrims = await getTrims(make, model);
  if (allTrims.length > 0) {
    // Find closest year or best match
    const yearTrims = allTrims.filter((t: any) => 
      parseInt(t.model_year) === year
    );
    
    if (yearTrims.length > 0) {
      return formatTrimData(yearTrims[0]);
    }
    
    // Return any trim as fallback
    return formatTrimData(allTrims[0]);
  }
  
  return null;
}

/**
 * Format trim data into standardized structure
 */
function formatTrimData(trim: any): any {
  return {
    // Basic Info
    make: trim.make_display || trim.make_id,
    model: trim.model_name,
    year: parseInt(trim.model_year) || 0,
    trim: trim.model_trim,
    bodyType: trim.model_body,
    
    // Engine
    engine: {
      displacement: trim.model_engine_cc ? `${trim.model_engine_cc}cc` : null,
      cylinders: trim.model_engine_cyl,
      valves: trim.model_engine_valves_per_cyl ? 
        `${trim.model_engine_valves_per_cyl} per cylinder` : null,
      power: {
        hp: trim.model_engine_power_ps ? parseInt(trim.model_engine_power_ps) : null,
        kw: trim.model_engine_power_kw ? parseInt(trim.model_engine_power_kw) : null,
        rpm: trim.model_engine_max_power_rpm
      },
      torque: {
        nm: trim.model_engine_torque_nm,
        lbft: trim.model_engine_torque_lbft,
        rpm: trim.model_engine_max_torque_rpm
      },
      fuelType: trim.model_engine_fuel,
      fuelSystem: trim.model_engine_type,
      compression: trim.model_engine_compression,
      bore: trim.model_engine_bore_mm ? `${trim.model_engine_bore_mm}mm` : null,
      stroke: trim.model_engine_stroke_mm ? `${trim.model_engine_stroke_mm}mm` : null,
      valveTiming: trim.model_engine_valves
    },
    
    // Transmission
    transmission: {
      type: trim.model_transmission_type,
      speeds: trim.model_transmission_speeds
    },
    
    // Drivetrain
    drivetrain: trim.model_drive,
    
    // Dimensions
    dimensions: {
      length: trim.model_length_mm ? `${trim.model_length_mm}mm` : null,
      width: trim.model_width_mm ? `${trim.model_width_mm}mm` : null,
      height: trim.model_height_mm ? `${trim.model_height_mm}mm` : null,
      wheelbase: trim.model_wheelbase_mm ? `${trim.model_wheelbase_mm}mm` : null,
      frontTrack: trim.model_track_front_mm ? `${trim.model_track_front_mm}mm` : null,
      rearTrack: trim.model_track_rear_mm ? `${trim.model_track_rear_mm}mm` : null,
      groundClearance: trim.model_ground_clearance_mm ? `${trim.model_ground_clearance_mm}mm` : null,
      cargoVolume: trim.model_cargo_volume_l ? `${trim.model_cargo_volume_l}L` : null,
      weight: trim.model_weight_kg ? `${trim.model_weight_kg}kg` : null,
      maxPayload: trim.model_max_payload_kg ? `${trim.model_max_payload_kg}kg` : null
    },
    
    // Capacity
    capacity: {
      doors: trim.model_doors ? parseInt(trim.model_doors) : null,
      seats: trim.model_seats ? parseInt(trim.model_seats) : null,
      fuelCapacity: trim.model_fuel_cap_l ? `${trim.model_fuel_cap_l}L` : null
    },
    
    // Performance
    performance: {
      topSpeed: {
        kph: trim.model_top_speed_kph,
        mph: trim.model_top_speed_mph
      },
      acceleration: {
        zeroTo100Kph: trim.model_0_to_100_kph,
        zeroTo60Mph: trim.model_0_to_60_mph,
        quarterMile: trim.model_quarter_mile_time
      }
    },
    
    // Fuel Economy
    fuelEconomy: {
      city: {
        mpg: trim.model_mpg_city ? parseInt(trim.model_mpg_city) : null,
        l100km: trim.model_lkm_city
      },
      highway: {
        mpg: trim.model_mpg_hwy ? parseInt(trim.model_mpg_hwy) : null,
        l100km: trim.model_lkm_hwy
      },
      combined: {
        mpg: trim.model_mpg_mixed ? parseInt(trim.model_mpg_mixed) : null,
        l100km: trim.model_lkm_mixed
      },
      co2: trim.model_co2_emissions_gkm ? `${trim.model_co2_emissions_gkm}g/km` : null
    },
    
    // Wheels & Tires
    wheels: {
      wheelbase: trim.model_wheelbase_mm ? `${trim.model_wheelbase_mm}mm` : null,
      frontTireSize: trim.model_front_tire,
      rearTireSize: trim.model_rear_tire,
      frontRimSize: trim.model_front_rim_diameter_in ? `${trim.model_front_rim_diameter_in}"` : null,
      rearRimSize: trim.model_rear_rim_diameter_in ? `${trim.model_rear_rim_diameter_in}"` : null
    },
    
    // Brakes
    brakes: {
      front: trim.model_front_brake_type,
      rear: trim.model_rear_brake_type
    },
    
    // Suspension
    suspension: {
      front: trim.model_front_suspension,
      rear: trim.model_rear_suspension
    },
    
    // Steering
    steering: {
      type: trim.model_steering_type,
      turningCircle: trim.model_turning_radius_m ? `${trim.model_turning_radius_m}m` : null
    },
    
    // Additional Info
    soldInUs: trim.model_sold_in_us === '1',
    makeCountry: trim.make_country,
    extendedData: trim // Keep all raw data for reference
  };
}

/**
 * Search for vehicles by various criteria
 */
export async function searchVehicles(criteria: {
  make?: string;
  model?: string;
  year?: number;
  minYear?: number;
  maxYear?: number;
  bodyType?: string;
  drivetrain?: string;
  fuelType?: string;
  cylinders?: string;
  minPower?: number;
  maxPower?: number;
  seats?: number;
}): Promise<any[]> {
  const params: any = { cmd: 'getTrims' };
  
  if (criteria.make) params.make = criteria.make.toLowerCase().replace(/\s+/g, '-');
  if (criteria.model) params.model = criteria.model.toLowerCase().replace(/\s+/g, '-');
  if (criteria.year) params.year = criteria.year.toString();
  if (criteria.minYear) params.min_year = criteria.minYear.toString();
  if (criteria.maxYear) params.max_year = criteria.maxYear.toString();
  if (criteria.bodyType) params.body = criteria.bodyType;
  if (criteria.drivetrain) params.drive = criteria.drivetrain;
  if (criteria.fuelType) params.fuel_type = criteria.fuelType;
  if (criteria.cylinders) params.cylinders = criteria.cylinders;
  if (criteria.seats) params.seats = criteria.seats.toString();
  
  const data = await fetchCarQueryData(params);
  
  if (data?.Trims && Array.isArray(data.Trims)) {
    let results = data.Trims;
    
    // Apply additional filters if needed
    if (criteria.minPower) {
      results = results.filter((t: any) => 
        parseInt(t.model_engine_power_ps) >= criteria.minPower
      );
    }
    if (criteria.maxPower) {
      results = results.filter((t: any) => 
        parseInt(t.model_engine_power_ps) <= criteria.maxPower
      );
    }
    
    return results.map(formatTrimData);
  }
  
  return [];
}

/**
 * Get body types
 */
export async function getBodyTypes(): Promise<string[]> {
  const data = await fetchCarQueryData({ cmd: 'getTrims', sold_in_us: '1' });
  if (data?.Trims && Array.isArray(data.Trims)) {
    const bodyTypes = new Set<string>();
    data.Trims.forEach((trim: any) => {
      if (trim.model_body) {
        bodyTypes.add(trim.model_body);
      }
    });
    return Array.from(bodyTypes).sort();
  }
  return [];
}

/**
 * Get drive types
 */
export async function getDriveTypes(): Promise<string[]> {
  return ['Front', 'Rear', 'AWD', '4WD'];
}

/**
 * Get fuel types
 */
export async function getFuelTypes(): Promise<string[]> {
  return ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'Hydrogen', 'Natural Gas'];
}

export const carQueryService = {
  getYears,
  getMakes,
  getModels,
  getTrims,
  getVehicleSpecs,
  searchVehicles,
  getBodyTypes,
  getDriveTypes,
  getFuelTypes,
  // Direct access to raw API
  fetchCarQueryData
};
