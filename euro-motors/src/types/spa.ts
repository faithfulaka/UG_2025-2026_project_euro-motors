// src/types/spa.ts
export interface CarQueryAPIResponse {
  Makes?: Array<{
    make_id: string;
    make_display: string;
    make_is_common: string;
  }>;
  Models?: Array<{
    model_name: string;
    model_make_id: string;
  }>;
  Trims?: Array<{
    model_id: string;
    model_make_id: string;
    model_name: string;
    model_trim: string;
    model_year: string;
    model_body: string;
    model_engine_type: string;
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
    model_lkm_mixed: string;
    model_fuel_cap_l: string;
    model_co2: string;
    model_make_display: string;
  }>;
}

// REAL MANUFACTURER CONFIGURATOR DATA
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
    description?: string;
  }>;
  colors: Array<{
    name: string;
    price: number;
    hex?: string;
  }>;
  interiorOptions: Array<{
    name: string;
    price: number;
  }>;
  packages: Array<{
    name: string;
    price: number;
    includedFeatures: string[];
  }>;
}

// REAL MARKET DATA FROM SCRAPERS
export interface MarketData {
  source: 'autotrader' | 'cars.com' | 'classic.com' | 'bringatrailer';
  listings: Array<{
    title: string;
    price: number;
    mileage?: number;
    year: number;
    location?: string;
    dealerName?: string;
    listingUrl: string;
    images?: string[];
    daysOnMarket?: number;
  }>;
  marketAnalysis: {
    averagePrice: number;
    priceRange: {
      min: number;
      max: number;
    };
    inventoryCount: number;
    averageMileage?: number;
    averageDaysOnMarket?: number;
    pricePerMile?: number;
  };
  regionalData?: {
    region: string;
    averagePrice: number;
    inventory: number;
  }[];
}

// COMPREHENSIVE SPA SEARCH REQUEST
export interface SPASearchRequest {
  make: string;
  model: string;
  year?: number;
  trim?: string;
  sources: ('database' | 'carquery' | 'manufacturer' | 'market' | 'auction')[];
  includeHistorical?: boolean;
  includeForecasting?: boolean;
  maxResults?: number;
}

// COMPREHENSIVE SPA SEARCH RESPONSE
export interface SPASearchResponse {
  searchQuery: SPASearchRequest;
  timestamp: string;
  processingTimeMs: number;
  
  // BASIC CAR INFO
  vehicle: {
    make: string;
    model: string;
    year: number;
    trim?: string;
    bodyType?: string;
    category?: string;
  };
  
  // TECHNICAL SPECIFICATIONS (from CarQuery + Manufacturers)
  specifications?: {
    engine: {
      type: string;
      displacement?: string;
      cylinders?: number;
      configuration?: string;
      fuelType: string;
      fuelSystem?: string;
    };
    performance: {
      horsepower: number;
      horsepowerRPM?: number;
      torque: number;
      torqueRPM?: string;
      acceleration0to60?: number;
      acceleration0to100?: number;
      topSpeed?: number;
      topSpeedUnit?: 'mph' | 'kph';
    };
    drivetrain: {
      transmission: string;
      driveType: string;
    };
    dimensions: {
      weight?: number;
      length?: number;
      width?: number;
      height?: number;
      wheelbase?: number;
      groundClearance?: number;
    };
    efficiency: {
      fuelEconomyCity?: number;
      fuelEconomyHighway?: number;
      fuelEconomyCombined?: number;
      fuelTankCapacity?: number;
      co2Emissions?: number;
      emissionStandard?: string;
    };
  };
  
  // REAL PRICING DATA (from multiple sources)
  pricing: {
    // NEW CAR PRICING
    newCar?: {
      msrp: number;
      startingPrice: number;
      averagePaidPrice?: number;
      incentives?: Array<{
        type: string;
        amount: number;
        description: string;
        expiresAt?: string;
      }>;
      financing?: {
        apr: number;
        terms: number[];
        monthlyPaymentEstimate?: number;
      };
    };
    
    // USED CAR MARKET DATA
    usedMarket?: {
      averagePrice: number;
      priceRange: {
        min: number;
        max: number;
      };
      priceByMileage?: Array<{
        mileageRange: string;
        averagePrice: number;
        sampleSize: number;
      }>;
      priceByCondition?: Array<{
        condition: 'excellent' | 'good' | 'fair' | 'poor';
        averagePrice: number;
      }>;
      marketTrend: {
        direction: 'rising' | 'falling' | 'stable';
        changePercent: number;
        timeframe: '30d' | '90d' | '1y';
      };
    };
    
    // AUCTION DATA
    auctionHistory?: {
      recentSales: Array<{
        salePrice: number;
        saleDate: string;
        mileage?: number;
        condition?: string;
        auctionHouse: string;
        lotNumber?: string;
      }>;
      averageSalePrice: number;
      highestSale: number;
      lowestSale: number;
      totalSales: number;
    };
  };
  
  // CONFIGURATOR DATA (from manufacturer websites)
  configurator?: ManufacturerConfigData;
  
  // MARKET ANALYSIS (from scraping)
  marketData?: MarketData[];
  
  // OWNERSHIP COSTS
  ownershipCosts?: {
    insurance: {
      averageAnnual: number;
      group?: number;
      factors?: string[];
    };
    maintenance: {
      averageAnnual: number;
      commonServices: Array<{
        service: string;
        intervalMiles: number;
        averageCost: number;
      }>;
    };
    depreciation: {
      year1Percent: number;
      year3Percent: number;
      year5Percent: number;
      projectedValue: {
        year1: number;
        year3: number;
        year5: number;
      };
    };
    totalCostOfOwnership: {
      year1: number;
      year3: number;
      year5: number;
    };
  };
  
  // DATA SOURCES & CONFIDENCE
  dataSources: {
    carQuery: boolean;
    manufacturerOfficial: boolean;
    autotrader: boolean;
    carscom: boolean;
    classiccom: boolean;
    bringatrailer: boolean;
    edmunds: boolean;
    kbb: boolean;
  };
  
  confidence: {
    specifications: 'high' | 'medium' | 'low';
    pricing: 'high' | 'medium' | 'low';
    marketData: 'high' | 'medium' | 'low';
    overall: 'high' | 'medium' | 'low';
  };
  
  // SUGGESTIONS & ALTERNATIVES
  suggestions?: {
    similarVehicles: Array<{
      make: string;
      model: string;
      year: number;
      priceComparison: 'higher' | 'similar' | 'lower';
      keyDifferences: string[];
    }>;
    betterDeals?: Array<{
      description: string;
      savings: number;
      source: string;
    }>;
  };
}

// AUTO-COMPLETE SUGGESTIONS
export interface SPASuggestion {
  type: 'make' | 'model' | 'year';
  value: string;
  displayName: string;
  count?: number;
  popular?: boolean;
}

// ERROR HANDLING
export interface SPAError {
  code: 'NETWORK_ERROR' | 'SCRAPING_FAILED' | 'API_LIMIT' | 'NO_DATA_FOUND' | 'INVALID_INPUT';
  message: string;
  details?: any;
  recoverable: boolean;
  retryAfter?: number;
}

// SPA SERVICE RESPONSE
export interface SPAServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: SPAError;
  processingTime: number;
  cached: boolean;
  cacheExpiresAt?: string;
}

// CONTEXT-SPECIFIC SPA RESULT (For CarContext)
export interface ContextSPAResult {
  id: string;
  make: string;
  model: string;
  year: number;
  data: SPASearchResponse;
  searchedAt: Date;
  source: 'database' | 'carquery' | 'manufacturer' | 'market' | 'comprehensive';
}