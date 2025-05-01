// src/types/index.ts
export interface CarSpecifications {
    color: string;
    interiorColor: string;
    mileage: number;
    colorOptions?: number;
    engine: string;
    horsePower: number;
    torque: string;
    fuelType: string;
    transmission: string;
    driveType: string;
    fuelEconomy?: string;
    topSpeed: string;
    acceleration100: string;
    acceleration60?: string;
    powerKW: string;
    powerPS: string;
    powerRPM?: string;
    torqueRange?: string;
    bodyType: string;
    seats: number;
    doors: number;
    weight: string;
    wheelbase: string;
    wheelSize: string;
    brakeColor: string;
    steeringType?: string;
  }
  
  export interface CarFeatures {
    interior: string[];
    exterior: string[];
    safety: string[];
  }
  
  export interface BuyCar {
    id: string;
    make: string;
    model: string;
    trim?: string;
    year: number;
    price: number;
    specifications: CarSpecifications;
    features: CarFeatures;
    standardEquipment?: string[];
    addedOptions?: string[];
    description: string;
    isAvailable: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    images: CarImage[];
  }
  
  export interface RentalCar {
    id: string;
    make: string;
    model: string;
    trim?: string;
    year: number;
    hourlyRate: number;
    dailyRate: number;
    weeklyRate: number;
    specifications: CarSpecifications;
    features: CarFeatures;
    description: string;
    isAvailable: boolean;
    images: CarImage[];
  }
  
  export interface CarImage {
    id: string;
    url: string;
    carId: string;
    isMain: boolean;
    imageType?: string;
  }