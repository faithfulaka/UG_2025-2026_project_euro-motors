# Luxury Car Platform - Implementation Summary (Part 6)

## Project Overview

We're building a luxury car platform with the following key features:
- Buy and rent luxury cars
- Admin management of car inventory 
- User authentication
- Car details and specifications
- Trade-in functionality
- Quote generation
- Payment processing

## Current Implementation Status

### Database Structure
We have a complete database schema implemented in Prisma with the following main models:
- `User` - Customer and admin accounts
- `BuyCar` - Cars available for purchase
- `RentalCar` - Cars available for rental
- `Quote` - Purchase quotes for users
- `Rental` - Rental bookings
- `TradeInRequest` - Trade-in vehicle information
- Supporting models for images, co-renters, etc.

### File Structure
The project is structured as follows:
```
project/
├── prisma/
│   ├── schema.prisma - Database schema definition
│   └── seed.ts - Initial data seeding script
├── public/
│   └── car1/ - Car images (pov1-pov11)
│   └── car2/ - Car images (pov1-pov11)
│   └── car3/ - Car images (pov1-pov11)
├── src/
│   ├── app/
│   │   ├── admin/ - Admin dashboard
│   │   ├── api/
│   │   │   ├── auth/ - Authentication endpoints
│   │   │   ├── cars/ - Car management endpoints
│   │   │   ├── rentals/ - Rental management
│   │   │   ├── payments/ - Payment processing
│   │   │   └── trade-in/ - Trade-in processing
│   │   ├── buy/ - Car purchase pages
│   │   ├── rent/ - Car rental pages
│   │   ├── trade-in/ - Trade-in pages
│   │   ├── layout.tsx - Main layout component
│   │   └── page.tsx - Home page
│   ├── components/ - Reusable UI components
│   ├── context/ - React context providers
│   └── lib/
│       ├── auth.ts - Authentication utilities
│       ├── prisma.ts - Prisma client instance
│       └── utils.ts - Helper functions
```

### Current Pages
1. **Buy Page** - Currently using mock data to display cars for sale
2. **Car Details Page** - Shows detailed information about a specific car
3. **Rent Page** - Currently using mock data to display rental cars

### Backend Implementation
1. **Prisma Setup** - Database connection with proper schema
2. **Seed Script** - Initial data for development

## Migration from Mock Data to Database

### Current Implementation Issues
- Pages are using hard-coded mock data instead of fetching from the database
- Need to implement proper data fetching from MySQL via Prisma
- Need to update components to work with the database structure

### Data Structure
The database and mock data structures are compatible, with the main difference being:
- Database stores complex data as JSON strings that need parsing
- Images need to be referenced from the file system but linked in the database

## Next Steps: Implementing Database Fetching

### 1. Prisma Client Singleton

We need to establish a singleton pattern for the Prisma client to avoid multiple connections:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 2. Server Component Implementation for Buy Page

The Buy Page should be converted to a server component for direct database access:

```typescript
// src/app/buy/page.tsx
import Link from 'next/link';
import CarSlideshow from '@/components/ui/CarSlideshow';
import { prisma } from '@/lib/prisma';

export default async function BuyPage() {
  // Fetch cars directly from the database
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
                />
                
                <div className="p-4 bg-white">
                  <h2 className="text-xl font-semibold mb-2 text-black">{car.make} {car.model}</h2>
                  <p className="text-gray-600 text-sm mb-2">{car.trim}</p>
                  <div className="flex justify-between mb-4">
                    <span className="text-black">{car.year} {car.specifications.mileage === 0 ? '(Brand new)' : ''}</span>
                    <span className="text-black">{car.specifications.mileage > 0 ? `${car.specifications.mileage.toLocaleString()} miles` : 'New'}</span>
                  </div>
                  
                  {/* Specifications */}
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
                    
                    {/* More specifications... */}
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

### 3. Server Component Implementation for Rent Page

Similar to the Buy Page, but for rental cars:

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
                />
                
                <div className="p-4 bg-white">
                  <h2 className="text-xl font-semibold mb-2 text-black">{car.make} {car.model}</h2>
                  <p className="text-gray-600 text-sm mb-2">{car.trim}</p>
                  <div className="flex justify-between mb-4">
                    <span className="text-black">{car.year} {car.specifications.mileage === 0 ? '(Brand new)' : ''}</span>
                    <span className="text-black">{car.specifications.mileage > 0 ? `${car.specifications.mileage.toLocaleString()} miles` : 'New'}</span>
                  </div>
                  
                  {/* Rental rates section */}
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

### 4. API Routes for Car Details

For dynamic car detail pages, we'll create API endpoints:

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
    
    // Parse JSON strings to objects
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
    
    // Parse JSON strings to objects
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

### 5. Car Details Page Implementation

The Car Details page needs to be updated to fetch from the API:

```typescript
// src/app/buy/[id]/page.tsx - Client component wrapper
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CarDetailsContent from './CarDetailsContent';

export default function CarDetailsPage() {
  const params = useParams();
  const carId = params?.id as string;
  
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return <CarDetailsContent car={car} />;
}
```

### 6. CarSlideshow Component Update

Update the CarSlideshow component to work with database images:

```typescript
// src/components/ui/CarSlideshow.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CarSlideshowProps {
  carId: string;
  make: string;
  model: string;
}

export default function CarSlideshow({ carId, make, model }: CarSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  
  useEffect(() => {
    // For now, we'll use a convention-based approach for images
    // In the future, this could fetch image information from the API
    const imagePaths = Array.from({ length: 11 }, (_, i) => {
      const carFolder = `car${carId.replace(/[^0-9]/g, '')}`;
      return `/public/${carFolder}/pov${i + 1}.jpg`;
    });
    
    setImages(imagePaths);
  }, [carId]);

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

## TypeScript Interfaces for Car Data

To fix TypeScript errors, we need proper interfaces for our data:

```typescript
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

export interface CarImage {
  id: string;
  url: string;
  carId: string;
  isMain: boolean;
  imageType?: string;
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

## Database Connection Configuration

Ensure your database connection is properly set up:

1. Create a `.env` file with your MySQL connection string:

```
DATABASE_URL="mysql://username:password@localhost:3306/luxury_cars_db"
```

2. Install necessary dependencies:

```bash
npm install @prisma/client
npm install -D prisma
```

3. Initialize Prisma (if you haven't already):

```bash
npx prisma init
```

4. Generate Prisma client after schema updates:

```bash
npx prisma generate
```

5. Run database migrations:

```bash
npx prisma migrate dev --name init
```

6. Seed your database:

```bash
npx prisma db seed
```

## Summary of Implementation Approach

For this project, we're using a hybrid approach:

1. **Server Components** - For the main listing pages (Buy, Rent) to improve SEO and initial load performance
2. **API Routes** - For dynamic data fetching (car details, quotes, etc.)
3. **Client Components** - For interactive elements and forms

This provides the best balance of performance, SEO, and interactivity for this type of application.

In the next part, we'll implement:
- Admin functionality for managing cars
- User authentication
- Quote generation
- Trade-in processing
- Payment integration
