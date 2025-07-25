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
  colors: Array<{
    name: string;
    type: 'standard' | 'metallic' | 'special';
    price?: number;
  }>;
  interiorOptions: Array<{
    name: string;
    price: number;
  }>;
  packages: Array<{
    name: string;
    price: number;
    options: string[];
  }>;
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

export interface SPASuggestion {
  type: 'make' | 'model' | 'year';
  value: string;
  displayName: string;
  count?: number;
  popular?: boolean;
}

// ADD these missing exports at the END of spa.ts:
export interface ComprehensiveSPAData {
  make: string;
  model: string;
  year: number;
  bodyType?: string;
  trim?: string;
  
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
  
  manufacturerData?: ManufacturerData;
  marketData?: MarketData;
  
  popularOptions?: Array<{
    name: string;
    frequency?: number;
    source: 'manufacturer' | 'market' | 'database';
  }>;
  
  dataSources: {
    database: boolean;
    carQuery: boolean;
    manufacturer: boolean;
    market: boolean;
  };
  
  dataSource: string;
  searchQuery: SPASearchParams;
  timestamp: string;
  cacheExpiry?: string;
}

export interface SPASearchParams {
  make: string;
  model: string;
  year?: number;
  trim?: string;
  dataSource: 'comprehensive' | 'database' | 'carquery' | 'manufacturer' | 'market';
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

