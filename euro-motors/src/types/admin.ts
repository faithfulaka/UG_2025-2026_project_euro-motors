// src/types/admin.ts - BEST COMBINED VERSION (No Conflicts)
import { BuyCar, RentalCar, CarSpecifications, CarFeatures } from '@/types/cars';

// Enhanced AdminDashboardStats with all required properties
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
  
  // Additional enhanced properties
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
    acceleration60?: string;
    powerKW?: string;
    powerPS?: string;
    powerRPM?: string;
    torqueRange?: string;
    weight?: string;
    wheelbase?: string;
    wheelSize?: string;
    brakeColor?: string;
    steeringType?: string;
    colorOptions?: string;
    fuelEconomy?: string;
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
    acceleration60?: string;
    powerKW?: string;
    powerPS?: string;
    powerRPM?: string;
    torqueRange?: string;
    weight?: string;
    wheelbase?: string;
    wheelSize?: string;
    brakeColor?: string;
    steeringType?: string;
    colorOptions?: string;
    fuelEconomy?: string;
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

// SPA and Scraper Interfaces (RENAMED to avoid conflicts)
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
}

export interface AdminSPASearchParams {
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
}

// Trade-in Management Interfaces
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
  conditionDetails?: string;
  accidentHistory: boolean;
  numberOfAccidents?: number;
  previousOwners: number;
  fullServiceHistory: boolean;
  hasModifications: boolean;
  interiorCondition?: number;
  exteriorCondition?: number;
  estimatedValue: number | null;
  actualValue: number | null;
  adminNotes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  images?: string[];
  createdAt: string;
  updatedAt?: string;
}

// Order Management Interfaces
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
  financingTerm?: number;
  monthlyPayment: number | null;
  cashDeposit: number | null;
  tradeInIncluded: boolean;
  tradeInId?: string;
  tradeInCredit?: number;
  finalAmount: number;
  quoteStatus: 'PENDING' | 'GENERATED' | 'RESERVED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  updatedAt?: string;
}

// Rental Management Interfaces
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
  depositAmount?: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  rentalStatus: 'RESERVED' | 'PAID' | 'PICKED_UP' | 'ACTIVE' | 'RETURNED' | 'COMPLETED' | 'CANCELLED';
  isSplitPayment: boolean;
  coRentersCount?: number;
  createdAt: string;
  updatedAt?: string;
}

// Enhanced Report Interfaces
export interface AdminReportData {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  salesData: {
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    topSellingCars: Array<{
      carId: string;
      make: string;
      model: string;
      salesCount: number;
      totalRevenue: number;
    }>;
  };
  rentalData: {
    totalRentals: number;
    totalRentalRevenue: number;
    averageRentalValue: number;
    utilizationRate: number;
    topRentalCars: Array<{
      carId: string;
      make: string;
      model: string;
      rentalCount: number;
      totalRevenue: number;
    }>;
  };
  tradeInData: {
    totalTradeIns: number;
    averageTradeInValue: number;
    approvalRate: number;
  };
}

// Notification System
export interface AdminNotification {
  id: string;
  type: 'order' | 'rental' | 'trade-in' | 'user' | 'system' | 'spa';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  relatedId?: string; // ID of related order, rental, etc.
  createdAt: Date;
}

// System Settings
export interface AdminSystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
  };
  business: {
    currency: string;
    taxRate: number;
    businessHours: {
      open: string;
      close: string;
      days: string[];
    };
  };
  spa: {
    enabledSources: ('carquery' | 'manufacturer' | 'auction')[];
    defaultDataSource: 'carquery' | 'manufacturer' | 'mock';
    cacheResults: boolean;
    cacheDuration: number; // in minutes
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    adminNotifications: string[];
  };
  payment: {
    stripeEnabled: boolean;
    paypalEnabled: boolean;
    bankTransferEnabled: boolean;
    depositPercentage: number;
  };
}

// Bulk Operations
export interface AdminBulkOperation {
  type: 'update-availability' | 'update-pricing' | 'delete' | 'export';
  entityType: 'cars' | 'users' | 'orders' | 'rentals';
  selectedIds: string[];
  operation: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  results?: {
    successful: number;
    failed: number;
    errors?: string[];
  };
}