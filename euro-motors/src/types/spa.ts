export interface MarketData {
  source: 'autotrader' | 'carscom' | 'classiccom' | 'bringatrailer';
  listings: MarketListing[];
  marketAnalysis: {
    averagePrice: number;
    priceRange: {
      min: number;
      max: number;
    };
    inventoryCount: number;
    averageMileage?: number;
    pricePerMile?: number;
  };
  averagePrice: number;  // Duplicate for backward compatibility
  priceRange: string;    // Duplicate for backward compatibility
  inventoryCount: number; // Duplicate for backward compatibility
  dataSource: string;
  searchParams?: {
    make: string;
    model: string;
    year?: number;
  };
  timestamp?: string;
}

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

export interface SPAError {
  code: string;
  message: string;
  source?: string;
  details?: Record<string, unknown>;
}

export interface SPASearchResponse {
  success: boolean;
  data?: ComprehensiveSPAData; // ADD this - was missing
  error?: SPAError;
  meta: {
    searchQuery: SPASearchParams;
    executionTime: number;
    timestamp: string;
    version: string;
  };
}

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

export interface SPASearchParams {
  make: string;
  model: string;
  year?: number;
  dataSource?: string;
}

export interface SPAMakesResponse {
  success: boolean;
  makes: string[];
  source: 'carquery' | 'database' | 'combined'; // ADD this - was missing
  cached: boolean;
  timestamp: string;
  error?: SPAError;
}

export interface SPAModelsResponse {
  success: boolean;
  models: string[];
  make: string; // ADD this - was missing
  source: 'carquery' | 'database' | 'combined';
  cached: boolean;
  timestamp: string;
  error?: SPAError;
}

export interface ManufacturerConfigData {
  make: string;
  model: string;
  year: number;
  basePrice: number;
  currency: string;
  configuratorUrl: string;
  availableOptions: any[];
  colors: any[];
  interiorOptions: any[];
  packages: any[];
  engine?: string;
  horsepower?: number;
  acceleration?: number;
}

export interface SPAServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    recoverable?: boolean;
    retryAfter?: number;
  };
  processingTime: number;
  cached: boolean;
}

export interface ManufacturerPricing {
  basePrice: number;
  currency: string;
  options: Array<{
    name: string;
    price: number;
    currency: string;
  }>;
}

export interface ManufacturerConfigData {
  make: string;
  model: string;
  year: number;
  basePrice: number;
  currency: string;
  configuratorUrl: string;
  availableOptions: any[];
  colors: any[];
  interiorOptions: any[];
  packages: any[];
  engine?: string;
  horsepower?: number;
  acceleration?: number;
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

// ADD these missing exports:
export interface SPASuggestion {
  type: 'make' | 'model' | 'year';
  value: string;
  displayName: string;
  count?: number;
  popular?: boolean;
}

export interface ManufacturerConfigData {
  make: string;
  model: string;
  year: number;
  basePrice: number;
  currency: string;
  configuratorUrl: string;
  availableOptions: Array<{
    category: string;
    name: string;
    price: number;
    description: string;
  }>;
  colors: string[];
  interiorOptions: string[];
  packages: string[];
  engine?: string;
  horsepower?: number;
  acceleration?: number;
}

export interface SPAServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    recoverable?: boolean;
    retryAfter?: number;
  };
  processingTime: number;
  cached: boolean;
}