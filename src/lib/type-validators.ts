// src/lib/type-validators.ts
// Type Validation Utilities - Ensures type consistency across the application

import type { BuyCar, RentalCar, CarSpecifications, CarFeatures, PerformanceData, PricingData, CarFormData, RentalCarFormData } from '@/types/cars';
import type { AdminDashboardStats, AdminScraperResult } from '@/types/admin';
import type { SPASearchParams, ComprehensiveSPAData, SPASuggestion } from '@/types/spa';

/**
 * Type guard helper for object validation
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Validate CarSpecifications object
 */
export function validateCarSpecifications(specs: unknown): specs is CarSpecifications {
  if (!isRecord(specs)) return false;
  
  const requiredFields = ['color', 'interiorColor', 'mileage', 'engine', 
    'horsePower', 'transmission', 'fuelType', 'bodyType', 'driveType', 'seats', 'doors'];
  
  return requiredFields.every(field => field in specs);
}

/**
 * Validate CarFeatures object
 */
export function validateCarFeatures(features: unknown): features is CarFeatures {
  if (!isRecord(features)) return false;
  
  return (
    Array.isArray(features.interior) &&
    Array.isArray(features.exterior) &&
    Array.isArray(features.safety)
  );
}

/**
 * Validate BuyCar object
 */
export function validateBuyCar(car: unknown): car is BuyCar {
  if (!isRecord(car)) return false;
  
  const hasRequiredFields = (
    typeof car.id === 'string' &&
    typeof car.make === 'string' &&
    typeof car.model === 'string' &&
    typeof car.year === 'number' &&
    typeof car.price === 'number' &&
    typeof car.description === 'string' &&
    typeof car.isAvailable === 'boolean'
  );
  
  if (!hasRequiredFields) return false;
  
  // Validate nested objects
  if (!validateCarSpecifications(car.specifications)) return false;
  if (!validateCarFeatures(car.features)) return false;
  
  // Optional arrays should be arrays or null
  if (car.standardEquipment !== null && car.standardEquipment !== undefined && !Array.isArray(car.standardEquipment)) return false;
  if (car.addedOptions !== null && car.addedOptions !== undefined && !Array.isArray(car.addedOptions)) return false;
  
  return true;
}

/**
 * Validate RentalCar object
 */
export function validateRentalCar(car: unknown): car is RentalCar {
  if (!isRecord(car)) return false;
  
  const hasRequiredFields = (
    typeof car.id === 'string' &&
    typeof car.make === 'string' &&
    typeof car.model === 'string' &&
    typeof car.year === 'number' &&
    typeof car.hourlyRate === 'number' &&
    typeof car.dailyRate === 'number' &&
    typeof car.weeklyRate === 'number' &&
    typeof car.description === 'string' &&
    typeof car.isAvailable === 'boolean'
  );
  
  if (!hasRequiredFields) return false;
  
  // Validate nested objects
  if (!validateCarSpecifications(car.specifications)) return false;
  if (!validateCarFeatures(car.features)) return false;
  
  return true;
}

/**
 * Validate PerformanceData object
 */
export function validatePerformanceData(data: unknown): data is PerformanceData {
  if (!isRecord(data)) return false;
  
  const requiredFields = ['engine', 'horsePower', 'torque', 'acceleration060', 
    'topSpeed', 'transmission', 'driveType', 'weight'];
  
  return requiredFields.every(field => 
    field in data && typeof data[field] === 'string'
  );
}

/**
 * Validate PricingData object
 */
export function validatePricingData(data: unknown): data is PricingData {
  if (!isRecord(data)) return false;
  
  return (
    typeof data.baseMSRP === 'number' &&
    typeof data.currentMarketRange === 'string' &&
    typeof data.averageDealerPrice === 'number' &&
    typeof data.dealerInventoryCount === 'number' &&
    typeof data.priceTrend === 'string'
  );
}

/**
 * Validate AdminDashboardStats object
 */
export function validateAdminDashboardStats(stats: unknown): stats is AdminDashboardStats {
  if (!isRecord(stats)) return false;
  
  const requiredFields = [
    'totalUsers', 'totalOrders', 'totalRentals', 'totalTradeIns',
    'pendingOrders', 'pendingRentals', 'pendingTradeIns',
    'carsForSale', 'carsForRent', 'monthlyRevenue'
  ];
  
  const hasRequiredFields = requiredFields.every(field => 
    field in stats && typeof stats[field] === 'number'
  );
  
  if (!hasRequiredFields) return false;
  
  // Validate arrays
  if (!Array.isArray(stats.popularMakes)) return false;
  if (!Array.isArray(stats.recentActivity)) return false;
  
  return true;
}

/**
 * Validate SPASearchParams object
 */
export function validateSPASearchParams(params: unknown): params is SPASearchParams {
  if (!isRecord(params)) return false;
  
  // Check if dataSource exists and is valid
  if (params.dataSource && !['comprehensive', 'database', 'carquery', 'manufacturer', 'market'].includes(params.dataSource as string)) {
    return false;
  }
  
  return (
    (typeof params.make === 'string' || params.make === undefined) &&
    (typeof params.model === 'string' || params.model === undefined) &&
    (params.year === undefined || typeof params.year === 'number') &&
    (params.trim === undefined || typeof params.trim === 'string')
  );
}

/**
 * Validate ComprehensiveSPAData object
 */
export function validateComprehensiveSPAData(data: unknown): data is ComprehensiveSPAData {
  if (!isRecord(data)) return false;
  
  const hasRequiredFields = (
    typeof data.make === 'string' &&
    typeof data.model === 'string' &&
    typeof data.year === 'number'
  );
  
  return hasRequiredFields;
}

/**
 * Validate SPASuggestion object
 */
export function validateSPASuggestion(suggestion: unknown): suggestion is SPASuggestion {
  if (!isRecord(suggestion)) return false;
  
  return (
    typeof suggestion.value === 'string' &&
    typeof suggestion.label === 'string'
  );
}

/**
 * Ensure default values for CarSpecifications
 */
export function ensureCarSpecifications(specs: Partial<CarSpecifications>): CarSpecifications {
  return {
    color: specs.color || '',
    interiorColor: specs.interiorColor || '',
    mileage: specs.mileage || 0,
    engine: specs.engine || '',
    horsePower: specs.horsePower || 0,
    transmission: specs.transmission || '',
    fuelType: specs.fuelType || '',
    bodyType: specs.bodyType || '',
    driveType: specs.driveType || '',
    seats: specs.seats || 0,
    doors: specs.doors || 0,
    // Optional fields
    topSpeed: specs.topSpeed,
    acceleration100: specs.acceleration100,
    acceleration60: specs.acceleration60,
    powerKW: specs.powerKW,
    powerPS: specs.powerPS,
    powerRPM: specs.powerRPM,
    torque: specs.torque,
    torqueRange: specs.torqueRange,
    weight: specs.weight,
    wheelbase: specs.wheelbase,
    wheelSize: specs.wheelSize,
    brakeColor: specs.brakeColor,
    steeringType: specs.steeringType,
    colorOptions: specs.colorOptions,
    vinPattern: specs.vinPattern,
    fuelEconomy: specs.fuelEconomy
  };
}

/**
 * Ensure default values for CarFeatures
 */
export function ensureCarFeatures(features: Partial<CarFeatures>): CarFeatures {
  return {
    interior: features.interior || [],
    exterior: features.exterior || [],
    safety: features.safety || []
  };
}

/**
 * Clean and validate form data for car creation/update
 */
export function cleanCarFormData(data: unknown, type: 'buy' | 'rent'): CarFormData | RentalCarFormData {
  // Type guard for input data
  const inputData = data as Record<string, unknown>;
  
  // Ensure specifications are valid
  const specifications = ensureCarSpecifications((inputData.specifications || {}) as Partial<CarSpecifications>);
  
  // Ensure features are valid
  const features = ensureCarFeatures((inputData.features || {}) as Partial<CarFeatures>);
  
  // Base fields common to both types
  const baseData = {
    id: inputData.id as string | undefined,
    make: (inputData.make as string) || '',
    model: (inputData.model as string) || '',
    trim: (inputData.trim as string | null) || null,
    year: parseInt(String(inputData.year)) || new Date().getFullYear(),
    description: (inputData.description as string) || '',
    isAvailable: inputData.isAvailable !== false,
    specifications,
    features
  };
  
  if (type === 'buy') {
    return {
      ...baseData,
      price: parseFloat(String(inputData.price)) || 0,
      standardEquipment: Array.isArray(inputData.standardEquipment) ? inputData.standardEquipment as string[] : [],
      addedOptions: Array.isArray(inputData.addedOptions) ? inputData.addedOptions as string[] : []
    } as CarFormData;
  } else {
    return {
      ...baseData,
      hourlyRate: parseFloat(String(inputData.hourlyRate)) || 0,
      dailyRate: parseFloat(String(inputData.dailyRate)) || 0,
      weeklyRate: parseFloat(String(inputData.weeklyRate)) || 0
    } as RentalCarFormData;
  }
}

/**
 * Validate API response structure
 */
export function validateAPIResponse(response: unknown): boolean {
  if (!isRecord(response)) return false;
  
  // Check for success flag
  if (!('success' in response)) return false;
  
  // If unsuccessful, should have error
  if (!response.success && !response.error) return false;
  
  // If successful, should have data (unless it's a delete operation)
  const message = response.message as string | undefined;
  if (response.success && !('data' in response) && !message?.includes('deleted')) {
    return false;
  }
  
  return true;
}

/**
 * Type guard to check if error has expected structure
 */
export function isAPIError(error: unknown): error is { code: string; message: string; details?: string } {
  if (!isRecord(error)) return false;
  
  return (
    typeof error.code === 'string' &&
    typeof error.message === 'string'
  );
}

/**
 * Validate and transform scraper result to car data
 */
export function transformScraperToCarData(
  scraperResult: AdminScraperResult,
  type: 'buy' | 'rent'
): CarFormData | RentalCarFormData {
  const specifications = ensureCarSpecifications({
    ...scraperResult.specifications,
    // Map performance data if available
    topSpeed: scraperResult.performanceData?.topSpeed,
    acceleration60: scraperResult.performanceData?.acceleration060,
    torque: scraperResult.performanceData?.torque,
    powerPS: scraperResult.performanceData?.horsePower,
    weight: scraperResult.performanceData?.weight,
    fuelEconomy: scraperResult.performanceData?.fuelEconomy
  });
  
  const features = ensureCarFeatures(scraperResult.features || {});
  
  const baseData = {
    make: scraperResult.make,
    model: scraperResult.model,
    trim: scraperResult.trim || null,
    year: scraperResult.year,
    description: scraperResult.description || '',
    isAvailable: true,
    specifications,
    features
  };
  
  if (type === 'buy') {
    return {
      ...baseData,
      price: scraperResult.price,
      standardEquipment: scraperResult.standardEquipment || [],
      addedOptions: scraperResult.addedOptions || []
    } as CarFormData;
  } else {
    // Calculate rental rates based on price
    const dailyRate = scraperResult.price * 0.01; // 1% of value per day
    return {
      ...baseData,
      hourlyRate: Math.round(dailyRate / 8), // 8 hour day
      dailyRate: Math.round(dailyRate),
      weeklyRate: Math.round(dailyRate * 5.5) // Discount for weekly
    } as RentalCarFormData;
  }
}

/**
 * Batch validate an array of items
 */
export function batchValidate<T>(
  items: unknown[],
  validator: (item: unknown) => item is T
): { valid: T[]; invalid: unknown[] } {
  const valid: T[] = [];
  const invalid: unknown[] = [];
  
  items.forEach(item => {
    if (validator(item)) {
      valid.push(item);
    } else {
      invalid.push(item);
    }
  });
  
  return { valid, invalid };
}

// Export all validators as a namespace
export const validators = {
  carSpecifications: validateCarSpecifications,
  carFeatures: validateCarFeatures,
  buyCar: validateBuyCar,
  rentalCar: validateRentalCar,
  performanceData: validatePerformanceData,
  pricingData: validatePricingData,
  adminDashboardStats: validateAdminDashboardStats,
  spaSearchParams: validateSPASearchParams,
  comprehensiveSPAData: validateComprehensiveSPAData,
  spaSuggestion: validateSPASuggestion,
  apiResponse: validateAPIResponse
};

// Export all transformers as a namespace
export const transformers = {
  cleanCarFormData,
  scraperToCarData: transformScraperToCarData,
  ensureCarSpecifications,
  ensureCarFeatures
};
