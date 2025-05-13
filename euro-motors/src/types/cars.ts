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
  topSpeed?: string;
  acceleration100?: string;
  acceleration60?: string;
  powerKW?: string;
  powerPS?: string;
  powerRPM?: string;
  torqueRange?: string;
  torque?: string;
  weight?: string;
  wheelbase?: string;
  wheelSize?: string;
  brakeColor?: string;
  steeringType?: string;
  fuelEconomy?: string;
  colorOptions?: string;
  seats: number;
  doors: number;
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
  trim: string | null;
  year: number;
  price: number;
  specifications: CarSpecifications;
  features: CarFeatures;
  standardEquipment: string[] | null;
  addedOptions: string[] | null;
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