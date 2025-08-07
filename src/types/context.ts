// src/types/context.ts
import type { ComprehensiveSPAData } from './spa';

export interface CartItem {
  id: string;
  type: 'buy' | 'rent';
  carId: string;
  carMake: string;
  carModel: string;
  carYear: number;
  price: number;
  quantity: number;
  selectedOptions?: string[];
  addedAt: Date;
  rentalDates?: {
    startDate: Date;
    endDate: Date;
    duration: 'HOURLY' | 'DAILY' | 'WEEKLY';
  };
  car?: {
    make: string;
    model: string;
    year: number;
    price: number;
  };
}

export interface CarFilters {
  make?: string;
  model?: string;
  yearRange?: { min: number; max: number };
  priceRange?: { min: number; max: number };
  bodyType?: string;
  transmission?: string;
  fuelType?: string;
  features?: string[];
  sortBy?: 'price' | 'year' | 'make' | 'model';
  sortOrder?: 'asc' | 'desc';
}

// SPA result in Context should carry full ComprehensiveSPAData
export interface ContextSPAResult {
  id: string;
  make: string;
  model: string;
  year: number;
  data: ComprehensiveSPAData;
  searchedAt: Date;
  source:
    | 'database'
    | 'carquery'
    | 'manufacturer'
    | 'market'
    | 'comprehensive'
    | 'mock';
}

export interface TradeInVehicle {
  registrationNumber: string;
  make?: string;
  model: string;
  year?: number;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  estimatedValue?: number;
  images?: string[];
  dvlaData?: Record<string, unknown>;
  userInputData?: Record<string, unknown>;
  valuationFactors?: Record<string, number>;
}