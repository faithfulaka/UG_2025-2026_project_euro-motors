// src/lib/db-helpers.ts - Database Helper Utilities

import type { 
  BuyCar, 
  RentalCar, 
  CarSpecifications, 
  CarFeatures,
  PerformanceData,
  PricingData,
  SupercarData,
  RawBuyCar,
  RawRentalCar
} from '@/types/cars';
import type { ComprehensiveSPAData } from '@/types/spa';
import type { Prisma } from '@prisma/client';

/**
 * Safely parse JSON fields from database
 */
export function parseJsonField<T>(field: unknown, defaultValue: T): T {
  if (!field) return defaultValue;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      console.error('Failed to parse JSON field:', field);
      return defaultValue;
    }
  }
  return field as T;
}

/**
 * Parse raw BuyCar from database into typed BuyCar
 */
export function parseBuyCar(rawCar: RawBuyCar | BuyCar): BuyCar {
  return {
    ...rawCar,
    // Parse required JSON fields
    specifications: parseJsonField<CarSpecifications>(
      rawCar.specifications,
      {
        color: '',
        interiorColor: '',
        mileage: 0,
        engine: '',
        horsePower: 0,
        transmission: '',
        fuelType: '',
        bodyType: '',
        driveType: '',
        seats: 0,
        doors: 0
      }
    ),
    features: parseJsonField<CarFeatures>(
      rawCar.features,
      {
        interior: [],
        exterior: [],
        safety: []
      }
    ),
    
    // Parse optional JSON array fields
    standardEquipment: rawCar.standardEquipment 
      ? parseJsonField<string[]>(rawCar.standardEquipment, [])
      : null,
    addedOptions: rawCar.addedOptions
      ? parseJsonField<string[]>(rawCar.addedOptions, [])
      : null,
    
    // Parse optional SPA data fields
    supercarData: rawCar.supercarData
      ? parseJsonField<SupercarData | null>(rawCar.supercarData, null)
      : null,
    performanceData: rawCar.performanceData
      ? parseJsonField<PerformanceData | null>(rawCar.performanceData, null)
      : null,
    pricingData: rawCar.pricingData
      ? parseJsonField<PricingData | null>(rawCar.pricingData, null)
      : null,
    
    // Convert dates if needed
    createdAt: rawCar.createdAt instanceof Date 
      ? rawCar.createdAt 
      : new Date(rawCar.createdAt),
    updatedAt: rawCar.updatedAt instanceof Date
      ? rawCar.updatedAt
      : new Date(rawCar.updatedAt),
    
    // Keep other fields as-is
    baseMSRP: rawCar.baseMSRP ?? null
  };
}

/**
 * Parse raw RentalCar from database into typed RentalCar
 */
export function parseRentalCar(rawCar: RawRentalCar | RentalCar): RentalCar {
  return {
    ...rawCar,
    // Parse required JSON fields
    specifications: parseJsonField<CarSpecifications>(
      rawCar.specifications,
      {
        color: '',
        interiorColor: '',
        mileage: 0,
        engine: '',
        horsePower: 0,
        transmission: '',
        fuelType: '',
        bodyType: '',
        driveType: '',
        seats: 0,
        doors: 0
      }
    ),
    features: parseJsonField<CarFeatures>(
      rawCar.features,
      {
        interior: [],
        exterior: [],
        safety: []
      }
    ),
    
    // Parse optional SPA data fields
    supercarData: rawCar.supercarData
      ? parseJsonField<SupercarData | null>(rawCar.supercarData, null)
      : null,
    performanceData: rawCar.performanceData
      ? parseJsonField<PerformanceData | null>(rawCar.performanceData, null)
      : null,
    
    // Convert dates if needed
    createdAt: rawCar.createdAt instanceof Date 
      ? rawCar.createdAt 
      : new Date(rawCar.createdAt),
    updatedAt: rawCar.updatedAt instanceof Date
      ? rawCar.updatedAt
      : new Date(rawCar.updatedAt),
    
    // Keep other fields as-is
    baseMSRP: rawCar.baseMSRP ?? null,
    stripeProductId: rawCar.stripeProductId ?? null
  };
}

/**
 * Prepare data for saving to database (stringify JSON fields)
 */
export function prepareCarForDB(car: Partial<BuyCar | RentalCar>): Record<string, unknown> {
  const prepared: Record<string, unknown> = { ...car };
  
  // Stringify JSON fields if they're objects
  if (car.specifications && typeof car.specifications === 'object') {
    prepared.specifications = JSON.stringify(car.specifications);
  }
  
  if (car.features && typeof car.features === 'object') {
    prepared.features = JSON.stringify(car.features);
  }
  
  if ('standardEquipment' in car && car.standardEquipment) {
    prepared.standardEquipment = JSON.stringify(car.standardEquipment);
  }
  
  if ('addedOptions' in car && car.addedOptions) {
    prepared.addedOptions = JSON.stringify(car.addedOptions);
  }
  
  if (car.supercarData && typeof car.supercarData === 'object') {
    prepared.supercarData = JSON.stringify(car.supercarData);
  }
  
  if (car.performanceData && typeof car.performanceData === 'object') {
    prepared.performanceData = JSON.stringify(car.performanceData);
  }
  
  if ('pricingData' in car && car.pricingData && typeof car.pricingData === 'object') {
    prepared.pricingData = JSON.stringify(car.pricingData);
  }
  
  return prepared;
}

/**
 * Create type-safe Prisma include options
 */
export const buyCarInclude = {
  images: true
} satisfies Prisma.BuyCarInclude;

export const rentalCarInclude = {
  images: true
} satisfies Prisma.RentalCarInclude;

/**
 * Helper to enrich car data with SPA information
 */
export async function enrichCarWithSPAData(
  car: Partial<BuyCar | RentalCar>,
  spaData: ComprehensiveSPAData
): Promise<Partial<BuyCar | RentalCar>> {
  const enriched = { ...car };
  
  // Add performance data if available
  if (spaData.performanceData && enriched.specifications) {
    enriched.specifications = {
      ...enriched.specifications,
      topSpeed: spaData.performanceData.topSpeed,
      acceleration60: spaData.performanceData.acceleration060,
      torque: spaData.performanceData.torque,
      powerPS: spaData.performanceData.horsePower,
      weight: spaData.performanceData.weight,
      fuelEconomy: spaData.performanceData.fuelEconomy
    };
  }
  
  // Add pricing data for BuyCar
  if ('price' in car && spaData.pricingData) {
    // Ensure baseMSRP has a value (default to 0 if undefined)
    const pricingDataWithMSRP: PricingData = {
      ...spaData.pricingData,
      baseMSRP: spaData.pricingData.baseMSRP || 0
    };
    (enriched as Partial<BuyCar>).pricingData = pricingDataWithMSRP;
    if (spaData.pricingData.baseMSRP) {
      enriched.baseMSRP = spaData.pricingData.baseMSRP;
    }
  }
  
  // Add popular options
  if (spaData.popularOptions && spaData.popularOptions.length > 0) {
    (enriched as Partial<BuyCar>).addedOptions = spaData.popularOptions.map(opt => opt.name);
  }
  
  // Store complete SPA data for reference
  // Note: SupercarData and ComprehensiveSPAData have different structures
  // We can't directly assign ComprehensiveSPAData to supercarData field
  // enriched.supercarData would need conversion if required
  
  return enriched;
}

/**
 * Batch parse multiple cars efficiently
 */
export function parseBuyCars(rawCars: (RawBuyCar | BuyCar)[]): BuyCar[] {
  return rawCars.map(parseBuyCar);
}

export function parseRentalCars(rawCars: (RawRentalCar | RentalCar)[]): RentalCar[] {
  return rawCars.map(parseRentalCar);
}

/**
 * Type guard to check if a car is a BuyCar
 */
export function isBuyCar(car: BuyCar | RentalCar): car is BuyCar {
  return 'price' in car && !('hourlyRate' in car);
}

/**
 * Type guard to check if a car is a RentalCar
 */
export function isRentalCar(car: BuyCar | RentalCar): car is RentalCar {
  return 'hourlyRate' in car && 'dailyRate' in car && 'weeklyRate' in car;
}
