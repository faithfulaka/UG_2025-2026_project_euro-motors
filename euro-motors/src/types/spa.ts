// src/types/spa.ts 

// Base SPA Search Parameters
export interface SPASearchParams {
  make: string;
  model: string;
  year?: number;
  trim?: string;
  dataSource: 'comprehensive' | 'database' | 'carquery' | 'manufacturer' | 'market';
}

// Auto-complete/Suggestion Types
export interface SPASuggestion {
  value: string;
  label: string;
  count?: number;
  source: 'database' | 'carquery' | 'cache';
}

export interface SPASuggestionResponse {
  success: boolean;
  suggestions: SPASuggestion[];
  source: string;
  cached: boolean;
  timestamp: string;
}

// CarQuery API Response Types
export interface CarQueryMake {
  make_id: string;
  make_display: string;
  make_is_common: string;
  make_country?: string;
}

export interface CarQueryModel {
  model_name: string;
  model_make_id: string;
  model_make_display: string;
}

export interface CarQueryTrim {
  model_id: string;
  model_make_id: string;
  model_name: string;
  model_trim: string;
  model_year: string;
  model_body: string;
  model_engine_position: string;
  model_engine_cc: string;
  model_engine_cyl: string;
  model_engine_type: string;
  model_engine_valves_per_cyl: string;
  model_engine_power_ps: string;
  model_engine_power_rpm: string;
  model_engine_torque_nm: string;
  model_engine_torque_rpm: string;
  model_top_speed_kph: string;
  model_0_to_100_kph: string;
  model_drive: string;
  model_transmission_type: string;
  model_seats: string;
  model_doors: string;
  model_weight_kg: string;
  model_length_mm: string;
  model_width_mm: string;
  model_height_mm: string;
  model_wheelbase_mm: string;
  model_lkm_hwy: string;
  model_lkm_mixed: string;
  model_lkm_city: string;
  model_fuel_cap_l: string;
  model_sold_in_us: string;
  model_co2: string;
  model_make_display: string;
}

// Market Data Types (Autotrader, etc.)
export interface MarketListing {
  title: string;
  price: string;
  priceNumeric: number;
  mileage?: string;
  year?: number;
  location?: string;
  dealer?: string;
  specs?: string;
  url: string;
  imageUrl?: string;
  datePosted?: string;
}

export interface MarketData {
  listings: MarketListing[];
  averagePrice: number;
  priceRange: string;
  inventoryCount: number;
  priceDistribution?: {
    min: number;
    max: number;
    median: number;
    q1: number;
    q3: number;
  };
  dataSource: string;
  searchParams: {
    make: string;
    model: string;
    year?: number;
  };
  timestamp: string;
}

// Manufacturer Configurator Types
export interface ManufacturerOption {
  id?: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category?: string;
  isPopular?: boolean;
  availability?: 'standard' | 'optional' | 'package';
}

export interface ManufacturerPricing {
  basePrice: number;
  currency: string;
  totalPrice?: number;
  options: ManufacturerOption[];
  packages?: Array<{
    name: string;
    price: number;
    options: string[];
  }>;
  deliveryTime?: string;
  availability?: 'available' | 'limited' | 'custom_order';
}

export interface ManufacturerData {
  make: string;
  model: string;
  year: number;
  trim?: string;
  bodyType?: string;
  pricing: ManufacturerPricing;
  specifications?: {
    engine?: string;
    power?: string;
    torque?: string;
    transmission?: string;
    drivetrain?: string;
    acceleration?: string;
    topSpeed?: string;
    fuelEconomy?: string;
  };
  colors?: Array<{
    name: string;
    type: 'standard' | 'metallic' | 'special';
    price?: number;
    imageUrl?: string;
  }>;
  dataSource: string;
  configuratorUrl?: string;
  lastUpdated: string;
}

// Comprehensive SPA Result Types
export interface ComprehensiveSPAData {
  // Basic Info
  make: string;
  model: string;
  year: number;
  bodyType?: string;
  trim?: string;

  // CarQuery Technical Data
  basicSpecifications?: {
    make: string;
    model: string;
    year: number;
    bodyType: string;
    engine: string;
    engineCC?: string;
    cylinders?: string;
    doors: number;
    seats: number;
    drivetrain?: string;
    transmission?: string;
    fuelType?: string;
  };

  // Enhanced Performance Data
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

  // Real Market Pricing
  pricingData?: {
    baseMSRP?: number;
    currentMarketRange: string;
    averageDealerPrice: number;
    dealerInventoryCount: number;
    priceTrend: string;
    priceDistribution?: {
      min: number;
      max: number;
      median: number;
    };
  };

  // Manufacturer Data
  manufacturerData?: ManufacturerData;

  // Market Data
  marketData?: MarketData;

  // Aggregated Options (for addedOptions field)
  popularOptions?: Array<{
    name: string;
    frequency?: number;
    source: 'manufacturer' | 'market' | 'database';
  }>;

  // Data Sources Used
  dataSources: {
    database: boolean;
    carQuery: boolean;
    manufacturer: boolean;
    market: boolean;
  };

  // Metadata
  dataSource: string;
  searchQuery: SPASearchParams;
  timestamp: string;
  cacheExpiry?: string;
}

// Error Types
export interface SPAError {
  code: string;
  message: string;
  source?: string;
  details?: Record<string, unknown>;
  retryable?: boolean;
  retryAfter?: number;
}

// API Response Types
export interface SPASearchResponse {
  success: boolean;
  data?: ComprehensiveSPAData;
  error?: SPAError;
  meta: {
    searchQuery: SPASearchParams;
    executionTime: number;
    timestamp: string;
    version: string;
  };
}

export interface SPAMakesResponse {
  success: boolean;
  makes: string[];
  source: 'carquery' | 'database' | 'combined';
  cached: boolean;
  timestamp: string;
  error?: SPAError;
}

export interface SPAModelsResponse {
  success: boolean;
  models: string[];
  make: string;
  source: 'carquery' | 'database' | 'combined';
  cached: boolean;
  timestamp: string;
  error?: SPAError;
}

// Cache Types
export interface SPACacheEntry {
  key: string;
  data: unknown;
  timestamp: number;
  expiry: number;
  source: string;
}

// Scraper Configuration
export interface ScraperConfig {
  name: string;
  baseUrl: string;
  rateLimit: number; // requests per minute
  timeout: number; // milliseconds
  retries: number;
  userAgent: string;
  headers?: Record<string, string>;
  proxy?: {
    host: string;
    port: number;
    username?: string;
    password?: string;
  };
}

// Real-time Search Context (for frontend state)
export interface SPASearchContext {
  currentSearch: SPASearchParams | null;
  searchResults: ComprehensiveSPAData | null;
  searchHistory: Array<{
    params: SPASearchParams;
    timestamp: string;
    resultSummary: string;
  }>;
  suggestions: {
    makes: SPASuggestion[];
    models: SPASuggestion[];
    years: number[];
  };
  loading: boolean;
  error: SPAError | null;
}