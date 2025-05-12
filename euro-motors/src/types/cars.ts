export interface CarSpecifications {
  color: string;
  interiorColor: string;
  mileage: number;
  colorOptions?: number;
  engine: string;
  horsePower: number;
  torque?: string;
  fuelType: string;
  transmission: string;
  driveType: string;
  topSpeed?: string;
  acceleration100?: string;
  acceleration60?: string;
  powerKW?: string;
  powerPS?: string;
  powerRPM?: string;
  torqueRange?: string;
  bodyType: string;
  seats: number;
  doors: number;
  weight?: string;
  wheelbase?: string;
  wheelSize?: string;
  brakeColor?: string;
  steeringType?: string;
  fuelEconomy?: string;
  colorOptions?: string;
}

export interface CarFeatures {
  interior: string[];
  exterior: string[];
  safety: string[];
}

export interface CarImage {
  id: string;
  url: string;
  carId: string;
  isMain: boolean;
  imageType: string | null;
}

export interface BuyCar {
  id: string;
  make: string;
  model: string;
  trim: string | null; // Changed to string | null
  year: number;
  price: number;
  specifications: CarSpecifications;
  features: CarFeatures;
  standardEquipment: string[] | null; // Changed to string[] | null
  addedOptions: string[] | null; // Changed to string[] | null
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
  trim: string | null; // Changed to string | null
  year: number;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  specifications: CarSpecifications;
  features: CarFeatures;
  description: string;
  isAvailable: boolean;
  stripeProductId?: string;
  images: CarImage[];
  createdAt?: Date;
  updatedAt?: Date;
}

// This is needed by CarDetailsPage to handle both BuyCar and RentalCar
export type Car = BuyCar | RentalCar;