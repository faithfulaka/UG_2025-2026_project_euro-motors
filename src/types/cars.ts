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
  
  // ADDED MISSING PROPERTIES (fixes TypeScript errors)
  topSpeed?: string;
  acceleration100?: string;
  acceleration60?: string; // Added this
  powerKW?: string;
  powerPS?: string;
  powerRPM?: string; // Added this
  torque?: string;
  torqueRange?: string; // Added this
  weight?: string;
  wheelbase?: string;
  wheelSize?: string;
  steeringType?: string; // Added this
  colorOptions?: string; // Added this
  vinPattern?: string; // Added VIN pattern support
  fuelEconomy?: string; // Added this
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

// SPA Data (Admin Helper Only - doesn't affect user experience)
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

export interface PricingData {
  baseMSRP: number;
  currentMarketRange: string;
  averageDealerPrice: number;
  dealerInventoryCount: number;
  priceTrend: string;
}

export interface AuctionHistory {
  recentSales: string;
  averageAuctionPrice: number;
  highestSale: string;
  lowestSale: string;
  commonAuctionNotes: string[];
}

export interface PopularConfigurations {
  basePrice: number;
  mostSelectedOptions: Array<{
    name: string;
    price: number;
  }>;
  mostPopularExteriorColor: string;
  mostPopularInterior: string;
}

export interface DepreciationData {
  year1: string;
  year3: string;
  year5: string;
  residualValueRating: string;
  rareOptionsForResale: string[];
}

export interface CompetingModels {
  primaryCompetitors: Array<{
    name: string;
    avgPrice: number;
  }>;
  pricePosition: string;
}

export interface OwnershipCosts {
  insuranceGroup: number;
  annualRoadTax: number;
  typicalFinancing: string;
  fuelCost: string;
  estimatedAnnualMaintenance: string;
}

// Complete SPA Data Structure (ADMIN HELPER ONLY)
export interface SupercarData {
  make: string;
  model: string;
  year: number;
  bodyType: string;
  colourOptions: string;
  vinPattern: string;
  performanceData: PerformanceData;
  pricingData: PricingData;
  auctionHistory: AuctionHistory;
  popularConfigurations: PopularConfigurations;
  depreciationData: DepreciationData;
  competingModels: CompetingModels;
  ownershipCosts: OwnershipCosts;
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

// MAIN CAR INTERFACES (What users see - unchanged)
export interface BuyCar {
  id: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  price: number; // Main price users see
  baseMSRP?: number; // Reference from SPA
  specifications: CarSpecifications; // What users see
  features: CarFeatures; // What users see
  standardEquipment: string[] | null;
  addedOptions: string[] | null;
  
  // SPA Data (ADMIN REFERENCE ONLY - users don't see this)
  performanceData?: PerformanceData;
  supercarData?: SupercarData;
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
  baseMSRP?: number;
  specifications: CarSpecifications; // What users see
  features: CarFeatures; // What users see
  
  // SPA Data (ADMIN REFERENCE ONLY)
  performanceData?: PerformanceData;
  supercarData?: SupercarData;
  
  description: string;
  isAvailable: boolean;
  stripeProductId?: string;
  images: CarImage[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type Car = BuyCar | RentalCar;