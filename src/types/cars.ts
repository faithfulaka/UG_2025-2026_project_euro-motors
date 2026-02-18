// src/types/cars.ts

// Car Specifications (JSON FIELD IN DATABASE)
export interface CarSpecifications {
  // Basic Info
  color: string;
  interiorColor: string;
  mileage: number;
  
  // Engine & Performance
  engine: string;
  horsePower: number;
  transmission: string;
  fuelType: string;
  bodyType: string;
  driveType: string;
  seats: number;
  doors: number;
  
  // Optional Performance Fields (from SPA data)
  topSpeed?: string;
  acceleration100?: string;
  acceleration60?: string;
  powerKW?: string;
  powerPS?: string;
  powerRPM?: string;
  torque?: string;
  torqueRange?: string;
  weight?: string;
  wheelbase?: string;
  wheelSize?: string;
  brakeColor?: string;
  steeringType?: string;
  colorOptions?: string;
  vinPattern?: string;
  fuelEconomy?: string;
}

// Car Features (JSON FIELD IN DATABASE)
export interface CarFeatures {
  interior: string[];
  exterior: string[];
  safety: string[];
}

// Form Data Types for Admin Operations
export interface CarFormData {
  id?: string;
  make: string;
  model: string;
  trim?: string | null;
  year: number;
  price: number;
  description: string;
  isAvailable: boolean;
  specifications: CarSpecifications;
  features: CarFeatures;
  standardEquipment: string[];
  addedOptions: string[];
}

export interface RentalCarFormData {
  id?: string;
  make: string;
  model: string;
  trim?: string | null;
  year: number;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  description: string;
  isAvailable: boolean;
  specifications: CarSpecifications;
  features: CarFeatures;
}

// Car Image (SEPARATE TABLE)
export interface CarImage {
  id: string;
  carId: string;
  url: string;
  isMain: boolean;
  imageType: string | null;
}

// Performance Data (JSON FIELD - FROM SPA)
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

// Pricing Data (JSON FIELD - FROM SPA)
export interface PricingData {
  baseMSRP: number;
  currentMarketRange: string;
  averageDealerPrice: number;
  dealerInventoryCount: number;
  priceTrend: string;
  priceDistribution?: {
    min: number;
    max: number;
    median: number;
  };
}

//     Supercar Data (JSON FIELD - COMPLETE SPA DATA)
export interface SupercarData {
  make: string;
  model: string;
  year: number;
  bodyType: string;
  colourOptions: string;
  vinPattern: string;
  performanceData: PerformanceData;
  pricingData: PricingData;
  auctionHistory: {
    recentSales: string;
    averageAuctionPrice: number;
    highestSale: string;
    lowestSale: string;
    commonAuctionNotes: string[];
  };
  popularConfigurations: {
    basePrice: number;
    mostSelectedOptions: Array<{
      name: string;
      price: number;
    }>;
    mostPopularExteriorColor: string;
    mostPopularInterior: string;
  };
  depreciationData: {
    year1: string;
    year3: string;
    year5: string;
    residualValueRating: string;
    rareOptionsForResale: string[];
  };
  competingModels: {
    primaryCompetitors: Array<{
      name: string;
      avgPrice: number;
    }>;
    pricePosition: string;
  };
  ownershipCosts: {
    insuranceGroup: number;
    annualRoadTax: number;
    typicalFinancing: string;
    fuelCost: string;
    estimatedAnnualMaintenance: string;
  };
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

// ===== BUY CAR (MATCHES PRISMA SCHEMA EXACTLY) =====
export interface BuyCar {
  id: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  price: number; // Float in Prisma
  
  // JSON fields - parsed at runtime
  specifications: CarSpecifications;
  features: CarFeatures;
  standardEquipment: string[] | null;
  addedOptions: string[] | null;
  
  // SPA JSON fields - optional and parsed at runtime
  supercarData?: SupercarData | null;
  baseMSRP?: number | null; // Float in Prisma
  performanceData?: PerformanceData | null;
  pricingData?: PricingData | null;
  
  // Basic fields
  description: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  images: CarImage[];
}

// ===== RENTAL CAR (MATCHES PRISMA SCHEMA EXACTLY) =====
export interface RentalCar {
  id: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  hourlyRate: number; // Float in Prisma
  dailyRate: number; // Float in Prisma
  weeklyRate: number; // Float in Prisma
  
  // JSON fields - parsed at runtime
  specifications: CarSpecifications;
  features: CarFeatures;
  
  // SPA JSON fields - optional and parsed at runtime
  supercarData?: SupercarData | null;
  baseMSRP?: number | null; // Float in Prisma
  performanceData?: PerformanceData | null;
  
  // Basic fields
  description: string;
  isAvailable: boolean;
  stripeProductId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  images: CarImage[];
}

// ===== UNION TYPE =====
export type Car = BuyCar | RentalCar;

// ===== RAW DATABASE TYPES (BEFORE JSON PARSING) =====
export interface RawBuyCar {
  id: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  price: number;
  specifications: string | CarSpecifications | null;
  features: string | CarFeatures | null;
  standardEquipment: string | string[] | null;
  addedOptions: string | string[] | null;
  supercarData: string | SupercarData | null;
  baseMSRP?: number | null;
  performanceData: string | PerformanceData | null;
  pricingData: string | PricingData | null;
  description: string;
  isAvailable: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  images: CarImage[];
}

export interface RawRentalCar {
  id: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  specifications: string | CarSpecifications | null;
  features: string | CarFeatures | null;
  supercarData: string | SupercarData | null;
  baseMSRP?: number | null;
  performanceData: string | PerformanceData | null;
  description: string;
  isAvailable: boolean;
  stripeProductId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  images: CarImage[];
}