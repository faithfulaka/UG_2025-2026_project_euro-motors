// src/types/cars.ts
export interface CarSpecifications {
  color: string;
  interiorColor: string;
  mileage: number;
  engine: string;
  horsePower: number;
  transmission: string;
  fuelType: string;
  bodyType: string;
  driveType: string;
  seats: number;
  doors: number;
  topSpeed?: string;
  acceleration100?: string;
  powerKW?: string;
  powerPS?: string;
  torque?: string;
  weight?: string;
  wheelbase?: string;
  wheelSize?: string;
  brakeColor?: string;
}

export interface CarFeatures {
  interior: string[];
  exterior: string[];
  safety: string[];
}

export interface CarImage {
  id: string;
  carId: string;
  url: string;
  isMain: boolean;
  imageType: string | null;
}

// Enhanced Performance Data from SPA
export interface PerformanceData {
  engine: string;
  horsePower: string;
  torque: string;
  acceleration060: string;
  topSpeed: string;
  transmission: string;
  driveType: string;
  weight: string;
  fuelEconomy?: string;
}

// SPA Pricing Data
export interface PricingData {
  baseMSRP: number;
  currentMarketRange: string;
  averageDealerPrice: number;
  dealerInventoryCount: number;
  priceTrend: string;
}

// SPA Auction History
export interface AuctionHistory {
  recentSales: string;
  averageAuctionPrice: number;
  highestSale: string;
  lowestSale: string;
  commonAuctionNotes: string[];
}

// SPA Popular Configurations
export interface PopularConfigurations {
  basePrice: number;
  mostSelectedOptions: Array<{
    name: string;
    price: number;
  }>;
  mostPopularExteriorColor: string;
  mostPopularInterior: string;
}

// SPA Depreciation Data
export interface DepreciationData {
  year1: string;
  year3: string;
  year5: string;
  residualValueRating: string;
  rareOptionsForResale: string[];
}

// SPA Competing Models
export interface CompetingModels {
  primaryCompetitors: Array<{
    name: string;
    avgPrice: number;
  }>;
  pricePosition: string;
}

// SPA Ownership Costs
export interface OwnershipCosts {
  insuranceGroup: number;
  annualRoadTax: number;
  typicalFinancing: string;
  fuelCost: string;
  estimatedAnnualMaintenance: string;
}

// Complete SPA Data Structure
export interface SupercarData {
  // Basic Specifications
  make: string;
  model: string;
  year: number;
  bodyType: string;
  colourOptions: string;
  vinPattern: string;
  
  // Performance
  performanceData: PerformanceData;
  
  // Pricing
  pricingData: PricingData;
  
  // Market Data
  auctionHistory: AuctionHistory;
  popularConfigurations: PopularConfigurations;
  depreciationData: DepreciationData;
  competingModels: CompetingModels;
  ownershipCosts: OwnershipCosts;
  
  // Additional Data
  dealerData: {
    averageDaysOnMarket: number;
    currentUKInventory: number;
    mostCommonDealerAddOns: string[];
  };
  
  warrantyMaintenance: {
    factoryWarranty: string;
    extendedOptions: string;
    commonServiceItems: Array<{
      item: string;
      cost: string;
    }>;
  };
}

export interface BuyCar {
  id: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  price: number; // Dealer Price from SPA
  baseMSRP?: number; // Base MSRP from SPA
  specifications: CarSpecifications;
  features: CarFeatures;
  standardEquipment: string[] | null;
  addedOptions: string[] | null; // Popular configurations from SPA (without prices)
  
  // SPA Enhanced Data
  performanceData?: PerformanceData;
  supercarData?: SupercarData; // Full SPA comprehensive data
  pricingData?: PricingData;
  
  description: string;
  isAvailable: boolean;
  images: CarImage[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RentalCar {
  id: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  baseMSRP?: number; // Base MSRP from SPA for reference
  specifications: CarSpecifications;
  features: CarFeatures;
  
  // SPA Enhanced Data
  performanceData?: PerformanceData;
  supercarData?: SupercarData; // Full SPA comprehensive data
  
  description: string;
  isAvailable: boolean;
  stripeProductId?: string;
  images: CarImage[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Union type for both car types
export type Car = BuyCar | RentalCar;

// SPA Search Parameters
export interface SPASearchParams {
  make: string;
  model: string;
  year: number;
  trim?: string;
}

// SPA API Response
export interface SPAResponse {
  success: boolean;
  data?: SupercarData;
  error?: string;
}
