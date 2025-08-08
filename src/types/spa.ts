// src/types/spa.ts - COMPLETE types for CarQuery-only system
export interface SPASearchParams {
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
  dataSource?: 'comprehensive' | 'database' | 'carquery' | 'manufacturer' | 'market';
}

export interface SPASuggestion {
  value: string;
  label: string;
  count?: number;
  source?: string;
  type?: 'make' | 'model' | 'year' | 'trim';
  displayName?: string;
  popular?: boolean;
}

export interface SPASuggestionResponse {
  success: boolean;
  suggestions: SPASuggestion[];
  source: string;
  cached?: boolean;
  timestamp: string;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

// Export these missing types
export interface SPAMakesResponse {
  success: boolean;
  makes: string[];
  source?: string;
  cached?: boolean;
  timestamp?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface SPAModelsResponse {
  success: boolean;
  models: string[];
  source?: string;
  cached?: boolean;
  timestamp?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface ComprehensiveSPAData {
  // Basic vehicle information
  make: string;
  model: string;
  year: number;
  bodyType?: string;
  trim?: string;
  
  // Detailed specifications
  basicSpecifications?: {
    make: string;
    model: string;
    year: number;
    bodyType?: string;
    engine?: string;
    engineCC?: string;
    cylinders?: string;
    doors?: number;
    seats?: number;
    drivetrain?: string;
    transmission?: string;
    fuelType?: string;
  };
  
  // Performance metrics
  performanceData?: {
    engine?: string;
    horsePower?: string;
    torque?: string;
    acceleration060?: string;
    topSpeed?: string;
    transmission?: string;
    driveType?: string;
    weight?: string;
    fuelEconomy?: string;
  };
  
  // Pricing information
  pricingData?: {
    baseMSRP?: number;
    currentMarketRange?: string;
    averageDealerPrice?: number;
    dealerInventoryCount?: number;
    priceDistribution?: {
      min: number;
      max: number;
      median: number;
    };
  };
  
  // Physical dimensions
  dimensions?: {
    length?: string;
    width?: string;
    height?: string;
    wheelbase?: string;
    weight?: string;
  };
  
  // Available colors
  colors?: {
    exterior?: string[];
    interior?: string[];
    totalCombinations?: number;
  };
  
  // Available trims
  availableTrims?: Array<{
    name: string;
    msrp?: number;
    invoice?: number;
    engine?: string;
    transmission?: string;
    drivetrain?: string;
  }>;
  
  // Available engines
  availableEngines?: string[];
  
  // Available body types
  availableBodies?: string[];
  
  // Brand info
  brandInfo?: {
    brands?: Array<{ id: string; name: string; country?: string }>;
    models?: Array<{ id: string; name: string; yearFrom?: number; yearTo?: number }>;
    regions?: string[];
  };
  
  // Fuel economy
  fuelEconomy?: {
    city?: number;
    highway?: number;
    combined?: number;
    tankCapacity?: string;
    co2?: string;
  };
  
  // Market data (optional)
  marketData?: MarketData;
  
  // Popular options/features
  popularOptions?: Array<{ name: string; description?: string }>;
  
  // Data source information
  dataSources?: {
    database: boolean;
    carQuery: boolean;
    manufacturer: boolean;
    market: boolean;
  };
  
  // Metadata
  dataSource?: string;
  searchQuery?: SPASearchParams;
  timestamp?: string;
  cacheExpiry?: string;
}

// Simplified vehicle data for basic display
export interface SimplifiedVehicleData {
  make: string;
  model: string;
  year: number;
  bodyType?: string;
  trim?: string;
  basicSpecifications?: {
    make: string;
    model: string;
    year: number;
    bodyType?: string;
    engine?: string;
    engineCC?: string;
    cylinders?: string;
    doors?: number;
    seats?: number;
    drivetrain?: string;
    transmission?: string;
    fuelType?: string;
  };
  performanceData?: {
    engine?: string;
    horsePower?: string;
    torque?: string;
    acceleration060?: string;
    topSpeed?: string;
    transmission?: string;
    driveType?: string;
    weight?: string;
    fuelEconomy?: string;
  };
  pricingData?: {
    baseMSRP?: number;
    currentMarketRange?: string;
    averageDealerPrice?: number;
    dealerInventoryCount?: number;
  };
  dimensions?: {
    length?: string;
    width?: string;
    height?: string;
    wheelbase?: string;
    weight?: string;
  };
  colors?: {
    exterior?: string[];
    interior?: string[];
    totalCombinations?: number;
  };
  fuelEconomy?: {
    city?: number;
    highway?: number;
    combined?: number;
    tankCapacity?: string;
  };
  dataSources?: {
    database: boolean;
    carQuery: boolean;
    manufacturer: boolean;
    market: boolean;
  };
  dataSource?: string;
  searchQuery?: SPASearchParams;
  timestamp?: string;
  cacheExpiry?: string;
}

export interface MarketData {
  averagePrice?: number;
  medianPrice?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  totalListings?: number;
  averageMileage?: number;
  averageDaysOnMarket?: number;
  popularColors?: string[];
  popularOptions?: string[];
}

export interface SPASearchResponse {
  success: boolean;
  data?: ComprehensiveSPAData;
  error?: {
    code: string;
    message: string;
    retryable?: boolean;
  };
  meta?: {
    searchQuery?: SPASearchParams;
    executionTime?: number;
    timestamp?: string;
    version?: string;
    dataPoints?: number;
    sources?: string[];
  };
}

export interface SPADealerInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  website?: string;
  distance?: number;
  inventory?: number;
  rating?: number;
}

export interface SPAListingInfo {
  id: string;
  price: number;
  mileage: number;
  color?: string;
  condition?: string;
  dealer?: SPADealerInfo;
  photos?: string[];
  url?: string;
  daysOnMarket?: number;
}

export type SPADataSource = 'database' | 'carquery' | 'api' | 'cache';

export interface SPACacheEntry {
  data: unknown;
  timestamp: number;
  expiresAt: number;
}
