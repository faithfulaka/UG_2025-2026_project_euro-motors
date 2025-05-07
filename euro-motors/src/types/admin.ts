// src/types/admin.ts
import { BuyCar, RentalCar, CarSpecifications, CarFeatures } from '@/types/cars';

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
}

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
    powerKW?: string;
    powerPS?: string;
    weight?: string;
    wheelbase?: string;
    wheelSize?: string;
    brakeColor?: string;
    steeringType?: string;
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
    powerKW?: string;
    powerPS?: string;
    weight?: string;
    wheelbase?: string;
    wheelSize?: string;
    brakeColor?: string;
    steeringType?: string;
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

export interface ScraperResult {
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

export interface ScraperSearchParams {
  make: string;
  model: string;
  year?: number;
  trim?: string;
}

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
}

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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface AdminOrderData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  carId: string;
  carMake: string;
  carModel: string;
  amount: number;
  financingOption: boolean;
  monthlyPayment: number | null;
  cashDeposit: number | null;
  tradeInIncluded: boolean;
  quoteStatus: 'PENDING' | 'GENERATED' | 'RESERVED' | 'CANCELLED';
  createdAt: string;
}

export interface AdminRentalData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  carId: string;
  carMake: string;
  carModel: string;
  startDate: string;
  endDate: string;
  rentalDuration: 'HOURLY' | 'DAILY' | 'WEEKLY';
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  rentalStatus: 'RESERVED' | 'PAID' | 'PICKED_UP' | 'ACTIVE' | 'RETURNED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}