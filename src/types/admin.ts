// src/types/admin.ts
import { BuyCar, RentalCar, CarSpecifications, CarFeatures } from '@/types/cars';

// Enhanced AdminDashboardStats (fixes the missing properties error)
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
  // Added missing properties to fix the error
  monthlyRevenue: number;
  popularMakes: Array<{ make: string; count: number }>;
  recentActivity: Array<{
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
  }>;
}

// Car Management Interfaces
export interface AdminCarListProps {
  cars: BuyCar[] | RentalCar[];
  type: 'buy' | 'rent';
  onDelete: (id: string) => void;
}

export interface CarFormData {
  id?: string;
  make: string;
  model: string;
  trim?: string | null;
  year: number;
  price: number;
  description: string;
  isAvailable: boolean;
  specifications: {
    color: string;
    interiorColor: string;
    mileage: number;
    engine: string;
    horsePower: number;
    torque: string;
    fuelType: string;
    transmission: string;
    driveType: string;
    bodyType: string;
    doors: number;
    seats: number;
    topSpeed?: string;
    acceleration100?: string;
    acceleration60?: string; // Added for TypeScript completeness
    powerKW?: string;
    powerPS?: string;
    powerRPM?: string; // Added for TypeScript completeness
    torqueRange?: string; // Added for TypeScript completeness
    weight?: string;
    wheelbase?: string;
    wheelSize?: string;
    brakeColor?: string;
    steeringType?: string;
    colorOptions?: string; // Added for TypeScript completeness
    fuelEconomy?: string; // Added for TypeScript completeness
  };
  features: {
    interior: string[];
    exterior: string[];
    safety: string[];
  };
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
  specifications: {
    color: string;
    interiorColor: string;
    mileage: number;
    engine: string;
    horsePower: number;
    torque: string;
    fuelType: string;
    transmission: string;
    driveType: string;
    bodyType: string;
    doors: number;
    seats: number;
    topSpeed?: string;
    acceleration100?: string;
    acceleration60?: string; // Added for completeness
    powerKW?: string;
    powerPS?: string;
    powerRPM?: string; // Added for completeness
    torqueRange?: string; // Added for completeness
    weight?: string;
    wheelbase?: string;
    wheelSize?: string;
    brakeColor?: string;
    steeringType?: string;
    colorOptions?: string; // Added for completeness
    fuelEconomy?: string; // Added for completeness
  };
  features: {
    interior: string[];
    exterior: string[];
    safety: string[];
  };
}

export interface AdminCarFormProps {
  car?: BuyCar | RentalCar;
  type: 'buy' | 'rent';
  mode: 'add' | 'edit';
  onSubmit: (data: CarFormData | RentalCarFormData) => Promise<void>;
  onCancel: () => void;
}

// SPA/Scraper Interfaces (renamed to avoid conflicts)
export interface AdminScraperResult {
  make: string;
  model: string;
  year: number;
  trim?: string;
  price: number;
  specifications: Partial<CarSpecifications>;
  features: Partial<CarFeatures>;
  standardEquipment?: string[];
  addedOptions?: string[];
  description?: string;
  source: string;
  imageUrl?: string;
  // Enhanced SPA data
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
    baseMSRP: number;
    currentMarketRange: string;
    averageDealerPrice: number;
    dealerInventoryCount: number;
    priceTrend: string;
  };
}

export interface AdminScraperSearchParams {
  make: string;
  model: string;
  year?: number;
  trim?: string;
  dataSource?: 'carquery' | 'manufacturer' | 'mock';
}

// User Management Interfaces
export interface AdminUserListProps {
  users: AdminUserData[];
  onRoleChange: (userId: string, newRole: 'USER' | 'ADMIN') => void;
}

export interface AdminUserData {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  lastLogin?: string;
  totalOrders?: number;
  totalRentals?: number;
  totalSpent?: number;
}

// Trade-In Management
export interface AdminTradeInData {
  id: string;
  quoteId: string;
  userId: string;
  userName: string;
  userEmail: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: string;
  estimatedValue: number | null;
  actualValue: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
  adminNotes?: string;
  images?: string[];
  dvlaData?: {
    make?: string;
    model?: string;
    fuelType?: string;
    engineCapacity?: number;
    taxStatus?: string;
    motStatus?: string;
  };
}

// Order Management
export interface AdminOrderData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  carId: string;
  carMake: string;
  carModel: string;
  carYear: number;
  amount: number;
  financingOption: boolean;
  monthlyPayment: number | null;
  cashDeposit: number | null;
  tradeInIncluded: boolean;
  tradeInId?: string;
  tradeInValue?: number;
  quoteStatus: 'PENDING' | 'GENERATED' | 'RESERVED' | 'CANCELLED';
  createdAt: string;
  updatedAt?: string;
  adminNotes?: string;
}

// Rental Management
export interface AdminRentalData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  carId: string;
  carMake: string;
  carModel: string;
  carYear: number;
  startDate: string;
  endDate: string;
  rentalDuration: 'HOURLY' | 'DAILY' | 'WEEKLY';
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  rentalStatus: 'RESERVED' | 'PAID' | 'PICKED_UP' | 'ACTIVE' | 'RETURNED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  adminNotes?: string;
  depositAmount?: number;
  depositRefunded?: boolean;
}

// Settings and Configuration
export interface AdminSettings {
  businessInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  spaConfiguration: {
    enabledSources: ('carquery' | 'manufacturer' | 'auction')[];
    defaultDataSource: 'carquery' | 'manufacturer' | 'mock';
    cacheResults: boolean;
    cacheDuration: number; // in minutes
  };
  paymentSettings: {
    stripePublicKey: string;
    acceptedCurrencies: string[];
    depositPercentage: number;
  };
  emailSettings: {
    smtpServer: string;
    fromEmail: string;
    enableNotifications: boolean;
  };
}

// Reports and Analytics
export interface AdminReportData {
  salesReport: {
    totalSales: number;
    monthlyTrend: Array<{ month: string; sales: number; revenue: number }>;
    topSellingCars: Array<{ make: string; model: string; sales: number }>;
  };
  rentalReport: {
    totalRentals: number;
    utilizationRate: number;
    topRentalCars: Array<{ make: string; model: string; rentals: number }>;
  };
  tradeInReport: {
    totalTradeIns: number;
    averageValue: number;
    acceptanceRate: number;
  };
  userAnalytics: {
    totalUsers: number;
    activeUsers: number;
    userGrowth: Array<{ month: string; newUsers: number }>;
  };
}