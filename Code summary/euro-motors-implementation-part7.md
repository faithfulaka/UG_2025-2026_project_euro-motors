# Luxury Car Platform - Implementation Summary (Part 7)

## Detailed Implementation Guide

### Step 1: Set Up Proper Database Access

First, let's create a proper database connection with the singleton pattern to avoid multiple connections:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Use global to prevent multiple instances in development
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Only assign to global in development to prevent memory leaks
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Step 2: Update Car Type Definitions

Create proper TypeScript interfaces for the car data:

```typescript
// src/types/cars.ts
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

export interface CarImage {
  id: string;
  url: string;
  carId: string;
  isMain: boolean;
  imageType?: string;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  trim?: string;
  year: number;
  price: number;
  specifications: CarSpecifications;
  features: CarFeatures;
  standardEquipment: string[];
  addedOptions: string[];
  description: string;
  isAvailable: boolean;
  images: CarImage[];
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}
```

### Step 3: Implementation of API Routes

#### Cars API Route

```typescript
// src/app/api/cars/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cars = await prisma.buyCar.findMany({
      where: { isAvailable: true },
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON fields
    const parsedCars = cars.map(car => ({
      ...car,
      specifications: JSON.parse(car.specifications as string),
      features: JSON.parse(car.features as string),
      standardEquipment: car.standardEquipment ? JSON.parse(car.standardEquipment as string) : [],
      addedOptions: car.addedOptions ? JSON.parse(car.addedOptions as string) : []
    }));

    return NextResponse.json(parsedCars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
      { status: 500 }
    );
  }
}
```

#### Single Car API Route

```typescript
// src/app/api/cars/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    const car = await prisma.buyCar.findUnique({
      where: { id },
      include: { images: true }
    });
    
    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }
    
    // Parse JSON fields
    const parsedCar = {
      ...car,
      specifications: JSON.parse(car.specifications as string),
      features: JSON.parse(car.features as string),
      standardEquipment: car.standardEquipment ? JSON.parse(car.standardEquipment as string) : [],
      addedOptions: car.addedOptions ? JSON.parse(car.addedOptions as string) : []
    };
    
    return NextResponse.json(parsedCar);
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json(
      { error: 'Failed to fetch car data' },
      { status: 500 }
    );
  }
}
```

#### Rentals API Route

```typescript
// src/app/api/rentals/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rentalCars = await prisma.rentalCar.findMany({
      where: { isAvailable: true },
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON fields
    const parsedRentalCars = rentalCars.map(car => ({
      ...car,
      specifications: JSON.parse(car.specifications as string),
      features: JSON.parse(car.features as string)
    }));

    return NextResponse.json(parsedRentalCars);
  } catch (error) {
    console.error('Error fetching rental cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental cars' },
      { status: 500 }
    );
  }
}
```

#### Single Rental API Route

```typescript
// src/app/api/rentals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    const car = await prisma.rentalCar.findUnique({
      where: { id },
      include: { images: true }
    });
    
    if (!car) {
      return NextResponse.json(
        { error: 'Rental car not found' },
        { status: 404 }
      );
    }
    
    // Parse JSON fields
    const parsedCar = {
      ...car,
      specifications: JSON.parse(car.specifications as string),
      features: JSON.parse(car.features as string)
    };
    
    return NextResponse.json(parsedCar);
  } catch (error) {
    console.error('Error fetching rental car:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental car data' },
      { status: 500 }
    );
  }
}
```

### Step 4: Update Buy Page Implementation

Let's convert the current buy page from using mock data to fetching real data:

```typescript
// src/app/buy/page.tsx
import Link from 'next/link';
import CarSlideshow from '@/components/ui/CarSlideshow';
import { prisma } from '@/lib/prisma';

export default async function BuyPage() {
  // Fetch cars directly from the database using Prisma
  const cars = await prisma.buyCar.findMany({
    where: {
      isAvailable: true
    },
    include: {
      images: true
    }
  });

  // Parse JSON strings to objects
  const parsedCars = cars.map(car => ({
    ...car,
    specifications: JSON.parse(car.specifications as string),
    features: JSON.parse(car.features as string),
    standardEquipment: car.standardEquipment ? JSON.parse(car.standardEquipment as string) : [],
    addedOptions: car.addedOptions ? JSON.parse(car.addedOptions as string) : []
  }));

  return (
    <div className="bg-white">
      <div className="py-12 bg-white pt-20 pb-36">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-black">Luxury Cars For Sale</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parsedCars.map((car) => (
              <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <CarSlideshow 
                  carId={car.id} 
                  make={car.make} 
                  model={car.model} 
                  imageUrls={car.images.map(img => img.url)}
                />
                
                <div className="p-4 bg-white">
                  <h2 className="text-xl font-semibold mb-2 text-black">{car.make} {car.model}</h2>
                  <p className="text-gray-600 text-sm mb-2">{car.trim}</p>
                  <div className="flex justify-between mb-4">
                    <span className="text-black">{car.year} {car.specifications.mileage === 0 ? '(Brand new)' : ''}</span>
                    <span className="text-black">{car.specifications.mileage > 0 ? `${car.specifications.mileage.toLocaleString()} miles` : 'New'}</span>
                  </div>
                  
                  {/* Specifications using icon layout */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <div>
                        <div className="text-xs text-black">Body Type</div>
                        <div className="text-sm font-medium text-black">{car.specifications.bodyType}</div>
                      </div>
                    </div>
                    
                    {/* Additional specifications */}
                    <div className="flex items-center gap-2">
                      <span className="text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <div>
                        <div className="text-xs text-black">Transmission</div>
                        <div className="text-sm font-medium text-black">{car.specifications.transmission}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <div>
                        <div className="text-xs text-black">Horse Power</div>
                        <div className="text-sm font-medium text-black">{car.specifications.horsePower}hp</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <div>
                        <div className="text-xs text-black">Engine</div>
                        <div className="text-sm font-medium text-black">{car.specifications.engine}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <div>
                        <div className="text-xs text-black">Color</div>
                        <div className="text-sm font-medium text-black">{car.specifications.color}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <div>
                        <div className="text-xs text-black">Fuel Type</div>
                        <div className="text-sm font-medium text-black">{car.specifications.fuelType}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-red-600">£{car.price.toLocaleString()}</span>
                    <Link 
                      href={`/buy/${car.id}`}
                      className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 5: Update Rent Page Implementation

Similarly, update the rent page:

```typescript
// src/app/rent/page.tsx
import Link from 'next/link';
import CarSlideshow from '@/components/ui/CarSlideshow';
import { prisma } from '@/lib/prisma';

export default async function RentPage() {
  // Fetch rental cars directly from the database
  const cars = await prisma.rentalCar.findMany({
    where: {
      isAvailable: true
    },
    include: {
      images: true
    }
  });

  // Parse JSON strings to objects
  const parsedCars = cars.map(car => ({
    ...car,
    specifications: JSON.parse(car.specifications as string),
    features: JSON.parse(car.features as string)
  }));

  return (
    <div className="bg-white">
      <div className="py-12 bg-white pt-20 pb-36">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-black">Luxury Cars For Rent</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parsedCars.map((car) => (
              <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <CarSlideshow 
                  carId={car.id} 
                  make={car.make} 
                  model={car.model}
                  imageUrls={car.images.map(img => img.url)}
                />
                
                <div className="p-4 bg-white">
                  <h2 className="text-xl font-semibold mb-2 text-black">{car.make} {car.model}</h2>
                  <p className="text-gray-600 text-sm mb-2">{car.trim}</p>
                  <div className="flex justify-between mb-4">
                    <span className="text-black">{car.year} {car.specifications.mileage === 0 ? '(Brand new)' : ''}</span>
                    <span className="text-black">{car.specifications.mileage > 0 ? `${car.specifications.mileage.toLocaleString()} miles` : 'New'}</span>
                  </div>
                  
                  {/* Rental rates section - unique to the rent page */}
                  <div className="mb-4 border-t border-gray-100 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-600">Hourly:</span>
                      <span className="font-medium text-black">£{car.hourlyRate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-600">Daily:</span>
                      <span className="font-medium text-black">£{car.dailyRate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-600">Weekly:</span>
                      <span className="font-medium text-black">£{car.weeklyRate}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Link 
                      href={`/rent/${car.id}`}
                      className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 6: Update Car Details Page

Let's update the car details page to fetch data from the API:

```typescript
// src/app/buy/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CarDetailSlideshow from '@/components/ui/CarDetailSlideshow';
import TermSlider from '@/components/ui/TermSlider';
import { Car } from '@/types/cars';

export default function CarDetailsPage() {
  const params = useParams();
  const carId = params?.id as string;
  
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('specifications'); 
  const [cashDeposit, setCashDeposit] = useState<string>('');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('');
  const [canInputMonthly, setCanInputMonthly] = useState<boolean>(false);
  const [termMonths, setTermMonths] = useState<number>(12);
  
  // Functions to validate and handle numeric input
  const handleCashDepositChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // Allow only numbers and decimal points
    const value = e.target.value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setCashDeposit(value);
    setCanInputMonthly(value.length > 0);
  };
  
  const handleMonthlyPaymentChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // Allow only numbers and decimal points
    const value = e.target.value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setMonthlyPayment(value);
  };
 
  useEffect(() => {
    if (carId) {
      fetch(`/api/cars/${carId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch car data');
          }
          return response.json();
        })
        .then(data => {
          setCar(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [carId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Car not found</div>
      </div>
    );
  }

  // Rest of the component remains largely the same, just using the fetched car data
  // ...
}
```

### Step 7: Update CarSlideshow Component

Let's update the CarSlideshow component to work with images from the database:

```typescript
// src/components/ui/CarSlideshow.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CarSlideshowProps {
  carId: string;
  make: string;
  model: string;
  imageUrls?: string[];
}

export default function CarSlideshow({ carId, make, model, imageUrls }: CarSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // If no imageUrls provided, use convention-based paths
  const images = imageUrls || Array.from({ length: 11 }, (_, i) => {
    const carNum = carId.replace(/[^0-9]/g, '') || '1';
    return `/car${carNum}/pov${i + 1}.jpg`;
  });

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="relative h-56 w-full overflow-hidden">
      {images.length > 0 && (
        <Image
          src={images[currentIndex]}
          alt={`${make} ${model}`}
          className="object-cover"
          layout="fill"
        />
      )}
      
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 text-white"
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 text-white"
        aria-label="Next image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
```

### Step 8: Update CarDetailSlideshow Component

```typescript
// src/components/ui/CarDetailSlideshow.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CarDetailSlideshowProps {
  carId: string;
  make: string;
  model: string;
  imageUrls?: string[];
}

export default function CarDetailSlideshow({ carId, make, model, imageUrls }: CarDetailSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // If no imageUrls provided, use convention-based paths
  const images = imageUrls || Array.from({ length: 11 }, (_, i) => {
    const carNum = carId.replace(/[^0-9]/g, '') || '1';
    return `/car${carNum}/pov${i + 1}.jpg`;
  });

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="relative h-full w-full">
      {images.length > 0 && (
        <Image
          src={images[currentIndex]}
          alt={`${make} ${model}`}
          className="object-cover object-center"
          layout="fill"
          priority
        />
      )}
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full ${
              currentIndex === index ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-3 rounded-full text-white"
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-3 rounded-full text-white"
        aria-label="Next image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
```

## Recommendation Summary

### Best Data Fetching Method

For this luxury car platform, I recommend a hybrid approach that combines:

1. **Server Components with Direct Prisma Queries** - For the main listing pages:
   - Best performance and SEO
   - Simplest implementation without extra API hops
   - Suitable for the buy/rent pages where data is read-only

2. **API Routes for Client Components** - For interactive pages:
   - Necessary for client-side interactivity (forms, filters, etc.)
   - Good for car details pages with financing calculators
   - Essential for admin operations

### Implementation Steps

1. ✅ **Create a Prisma singleton** in `lib/prisma.ts`
2. ✅ **Define TypeScript interfaces** in `types/cars.ts`
3. ✅ **Convert Buy and Rent pages to server components** with direct Prisma queries
4. ✅ **Create API routes** for client component data needs
5. ✅ **Update car detail pages** to use the API routes
6. ✅ **Update UI components** to work with database data

### File Structure to Maintain

```
src/
├── app/
│   ├── api/
│   │   ├── cars/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   └── rentals/
│   │       ├── [id]/
│   │       │   └── route.ts
│   │       └── route.ts
│   ├── buy/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   └── rent/
│       ├── [id]/
│       │   └── page.tsx
│       └── page.tsx
├── components/
│   └── ui/
│       ├── CarSlideshow.tsx
│       └── CarDetailSlideshow.tsx
├── lib/
│   └── prisma.ts
└── types/
    └── cars.ts
```

### Next Steps

After implementing this database connection approach, the next stages of development will include:

1. Admin dashboard for car management
2. User authentication
3. Quote generation
4. Trade-in processing
5. Payment integration

By following this implementation guide, you'll have a solid foundation for building out the rest of the luxury car platform.
