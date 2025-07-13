// src/types/context.ts - FIXED VERSION (No Any Types)
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
  
  export interface SPASearchResult {
    id: string;
    make: string;
    model: string;
    year: number;
    data: {
      make: string;
      model: string;
      year: number;
      bodyType: string;
      performanceData: {
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
      pricingData: {
        baseMSRP: number;
        currentMarketRange: string;
        averageDealerPrice: number;
        dealerInventoryCount: number;
        priceTrend: string;
      };
    };
    searchedAt: Date;
    source: 'carquery' | 'manufacturer' | 'mock';
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
  
  export interface RecentActivity {
    id: string;
    type: 'order' | 'rental' | 'trade-in' | 'user-registration' | 'spa-search';
    description: string;
    timestamp: Date;
    userId?: string;
    details?: {
      carMake?: string;
      carModel?: string;
      amount?: number;
      status?: string;
    };
  }
  
  // Enhanced Admin types
  export interface AdminDashboardStats {
    totalUsers: number;
    totalOrders: number;
    totalRentals: number;
    totalTradeIns: number;
    pendingOrders: number;
    pendingRentals: number;
    pendingTradeIns: number;
    carsForSale: number;
    carsForRent: number;
    monthlyRevenue: number;
    popularMakes: Array<{ make: string; count: number }>;
    recentActivity: RecentActivity[];
  }
  
  // SPA Integration Types
  export interface SPAConfiguration {
    enabledSources: ('carquery' | 'manufacturer' | 'auction')[];
    defaultDataSource: 'carquery' | 'manufacturer' | 'mock';
    cacheResults: boolean;
    cacheDuration: number; // in minutes
  }
  
  // Quote System Types
  export interface QuoteRequest {
    carId: string;
    carType: 'buy' | 'rent';
    userId: string;
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
  
  export interface QuoteResponse {
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