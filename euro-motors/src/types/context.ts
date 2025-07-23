// src/types/context.ts - FIXED CONTEXT TYPES WITH SPA INTEGRATION
import { BuyCar, RentalCar } from './cars';

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
  car?: { // ADD THIS PROPERTY
    make: string;
    model: string;
    year: number;
    price: number;
  };
  rentalDates?: {
    startDate: Date;
    endDate: Date;
    duration: 'HOURLY' | 'DAILY' | 'WEEKLY';
  };
  addedAt: Date;
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

// FIXED: Expanded SPASearchResult with all data sources
export interface ContextSPAResult {
  id: string;
  make: string;
  model: string;
  year: number;
  data: {
    make: string;
    model: string;
    year: number;
    bodyType?: string;
    performanceData?: {
      engine: string;
      horsePower: string;
      torque: string;
      acceleration060: string;
      topSpeed: string;
      transmission: string;
      driveType: string;
      weight: string;
      fuelEconomy?: string;
    };
    pricingData?: {
      baseMSRP?: number;
      currentMarketRange?: string;
      averageDealerPrice?: number;
      dealerInventoryCount?: number;
      priceTrend?: string;
    };
    specifications?: any;
    configurator?: any;
    marketData?: any[];
    ownershipCosts?: any;
    dataSources?: {
      carQuery?: boolean;
      manufacturerOfficial?: boolean;
      autotrader?: boolean;
      carscom?: boolean;
      classiccom?: boolean;
      bringatrailer?: boolean;
      edmunds?: boolean;
      kbb?: boolean;
    };
    confidence?: {
      specifications: 'high' | 'medium' | 'low';
      pricing: 'high' | 'medium' | 'low';
      marketData: 'high' | 'medium' | 'low';
      overall: 'high' | 'medium' | 'low';
    };
  };
  searchedAt: Date;
  source: 'database' | 'carquery' | 'manufacturer' | 'market' | 'comprehensive' | 'mock';
}

export interface RecentlyViewed {
  carId: string;
  carType: 'buy' | 'rent';
  make: string;
  model: string;
  year: number;
  viewedAt: Date;
}

export interface DVLAData {
  make?: string;
  model?: string;
  yearOfManufacture?: number;
  monthOfFirstRegistration?: string;
  fuelType?: string;
  engineCapacity?: number;
  co2Emissions?: number;
  euroStatus?: string;
  taxStatus?: string;
  taxDueDate?: string;
  motStatus?: string;
  colour?: string;
}

export interface UserInputData {
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  conditionDetails?: string;
  accidentHistory: boolean;
  numberOfAccidents?: number;
  previousOwners: number;
  fullServiceHistory: boolean;
  hasModifications: boolean;
  interiorCondition: number; // 1-10 scale
  exteriorCondition: number; // 1-10 scale
  maintenanceIssues?: string[];
  additionalFeatures?: string[];
  documentsAvailable: string[];
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
  dvlaData?: DVLAData;
  userInputData?: UserInputData;
  valuationFactors?: {
    ageDepreciation: number;
    mileageDepreciation: number;
    conditionAdjustment: number;
    accidentAdjustment: number;
    serviceHistoryAdjustment: number;
    modificationAdjustment: number;
  };
}

// USER-FACING QUOTE TYPES (Not admin-specific)
export interface UserQuoteRequest {
  carId: string;
  carType: 'buy' | 'rent';
  contactDetails: {
    name: string;
    email: string;
    phone?: string;
  };
  financingOption?: boolean;
  financingTerm?: number;
  tradeInIncluded?: boolean;
  tradeInData?: TradeInVehicle;
  rentalDuration?: {
    startDate: Date;
    endDate: Date;
    durationType: 'HOURLY' | 'DAILY' | 'WEEKLY';
  };
}

export interface UserQuoteResponse {
  quoteId: string;
  carDetails: {
    make: string;
    model: string;
    year: number;
    price: number;
  };
  basePrice: number;
  tradeInCredit?: number;
  financingDetails?: {
    monthlyPayment: number;
    interestRate: number;
    term: number;
    downPayment: number;
  };
  totalPrice: number;
  validUntil: Date;
  terms: string;
}

// WISHLIST & COMPARISON
export interface WishlistItem {
  id: string;
  carId: string;
  carType: 'buy' | 'rent';
  make: string;
  model: string;
  year: number;
  price: number;
  addedAt: Date;
}

export interface ComparisonItem {
  carId: string;
  carType: 'buy' | 'rent';
  make: string;
  model: string;
  year: number;
  price: number;
  key_specs: {
    engine: string;
    horsePower: number;
    topSpeed: string;
    acceleration: string;
  };
}

// SEARCH HISTORY
export interface SearchHistory {
  id: string;
  searchTerm: string;
  filters: CarFilters;
  resultsCount: number;
  searchedAt: Date;
}

// NOTIFICATION TYPES
export interface UserNotification {
  id: string;
  type: 'price_drop' | 'new_arrival' | 'quote_ready' | 'rental_reminder' | 'trade_in_update';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}