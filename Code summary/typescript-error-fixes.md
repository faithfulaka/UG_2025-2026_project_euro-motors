# TypeScript Error Fixes for Euro Motors Project

This document collects all the TypeScript errors encountered during development of the Euro Motors luxury car dealership project and provides solutions for each.

## Common TypeScript Errors and Solutions

### 1. Parameter Implicitly Has 'any' Type

#### Error:
```typescript
// src/app/api/rentals/route.ts
const parsedRentalCars = rentalCars.map(car => ({
  ...car,
  specifications: typeof car.specifications === 'string' 
    ? JSON.parse(car.specifications as string) 
    : car.specifications,
  features: typeof car.features === 'string' 
    ? JSON.parse(car.features as string) 
    : car.features
}));
```

**Error message:** "Parameter 'car' implicitly has an 'any' type."

#### Solution 1: Add explicit 'any' type annotation to parameters
```typescript
const parsedRentalCars = rentalCars.map((car: any) => ({
  ...car,
  specifications: typeof car.specifications === 'string' 
    ? JSON.parse(car.specifications as string) 
    : car.specifications,
  features: typeof car.features === 'string' 
    ? JSON.parse(car.features as string) 
    : car.features
}));
```

#### Solution 2: Create Prisma type definitions
```typescript
// src/types/prisma.ts
import { Prisma } from '@prisma/client';

// Define types for raw database results
export type PrismaBuyCar = Prisma.BuyCarGetPayload<{
  include: { images: true }
}>;

export type PrismaRentalCar = Prisma.RentalCarGetPayload<{
  include: { images: true }
}>;

// Then in your API route:
import { PrismaRentalCar } from '@/types/prisma';

const parsedRentalCars = rentalCars.map((car: PrismaRentalCar) => ({
  // ...
}));
```

#### Solution 3: Use type assertions
```typescript
const parsedRentalCars = rentalCars.map(car => {
  return {
    ...car,
    specifications: typeof car.specifications === 'string' 
      ? JSON.parse(car.specifications as string) 
      : car.specifications,
    features: typeof car.features === 'string' 
      ? JSON.parse(car.features as string) 
      : car.features
  } as ParsedRentalCar; // Using a custom interface
});
```

### 2. Property Does Not Exist on Type

#### Error:
```typescript
// src/app/buy/[id]/page.tsx
// When trying to access car.price but car is typed as Car instead of BuyCar
```

**Error message:** "Property 'price' does not exist on type 'Car'. Property 'price' does not exist on type 'RentalCar'."

#### Solution: Use the correct type

```typescript
// Import the correct type
import { BuyCar } from '@/types/cars';

// Use the correct type for the state
const [car, setCar] = useState<BuyCar | null>(null);

// Or use type assertion when setting car data
setCar(data as BuyCar);
```

### 3. Cannot Find Name/Declaration Error

#### Error:
```typescript
// src/app/buy/page.tsx
// Using variables that are not defined or importing types that aren't used
```

**Error messages:**
- "Cannot find name 'cars'."
- "'CarSpecifications' is declared but its value is never read."
- "'CarFeatures' is declared but its value is never read."
- "'carsData' is declared but its value is never read."
- "'parsedCars' is declared but its value is never read."

#### Solution for "Cannot find name":
```typescript
// Make sure the variable is defined before use
const cars = await prisma.buyCar.findMany({
  // query options
});

// Then use it
const parsedCars = cars.map((car: any) => ({ /* ... */ }));
```

#### Solution for "is declared but never read":
- Remove unused imports if they're truly not needed
- Or make sure you're actually using the variables in your component
- If needed for type references but not direct usage, you can disable the warning:

```typescript
// At the top of the file:
// @ts-ignore: imported for type checking
import { CarSpecifications, CarFeatures } from '@/types/cars';
```

### 4. Object is Possibly 'null'

#### Error:
```typescript
// src/app/buy/[id]/page.tsx
// When accessing properties on car, which might be null
```

**Error message:** "'car' is possibly 'null'."

#### Solution: Type guard pattern
```typescript
if (!car) {
  return <div>Car not found</div>;
}

// TypeScript now knows car is not null in this scope
return (
  <div>
    <h1>{car.make} {car.model}</h1>
    {/* All car properties can be accessed safely */}
  </div>
);
```

### 5. Cannot Find Namespace 'JSX'

#### Error:
```typescript
export default function CarDetailsPage(): JSX.Element {
  // Component code
}
```

**Error message:** "Cannot find namespace 'JSX'."

#### Solution 1: Import React
```typescript
import React from 'react';

export default function CarDetailsPage(): React.ReactElement {
  // Component code
}
```

#### Solution 2: Remove explicit return type
```typescript
export default function CarDetailsPage() {
  // Component code - TypeScript will infer the return type
}
```

### 6. File Is Not a Module

#### Error:
```typescript
// When trying to import from Prisma Client types
import { BuyCar } from '@prisma/client';
```

**Error message:** "File '/node_modules/@prisma/client/default.d.ts' is not a module."

#### Solution: Create custom type definitions
```typescript
// src/types/prisma.ts
import { Prisma } from '@prisma/client';

// Define types for raw database results
export type PrismaBuyCar = Prisma.BuyCarGetPayload<{
  include: { images: true }
}>;

// Then import from your own types:
import { PrismaBuyCar } from '@/types/prisma';
```

## Comprehensive API Route Solutions

### src/app/api/cars/route.ts

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cars = await prisma.buyCar.findMany({
      where: { isAvailable: true },
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    });

    // Type assertion approach
    const parsedCars = cars.map((car: any) => {
      return {
        ...car,
        specifications: typeof car.specifications === 'string' 
          ? JSON.parse(car.specifications as string) 
          : car.specifications,
        features: typeof car.features === 'string' 
          ? JSON.parse(car.features as string) 
          : car.features,
        standardEquipment: car.standardEquipment 
          ? (typeof car.standardEquipment === 'string' 
              ? JSON.parse(car.standardEquipment as string) 
              : car.standardEquipment)
          : [],
        addedOptions: car.addedOptions 
          ? (typeof car.addedOptions === 'string' 
              ? JSON.parse(car.addedOptions as string) 
              : car.addedOptions) 
          : []
      };
    });

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

### src/app/api/rentals/route.ts

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rentalCars = await prisma.rentalCar.findMany({
      where: { isAvailable: true },
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON using type assertion
    const parsedRentalCars = rentalCars.map((car: any) => ({
      ...car,
      specifications: typeof car.specifications === 'string' 
        ? JSON.parse(car.specifications as string) 
        : car.specifications,
      features: typeof car.features === 'string' 
        ? JSON.parse(car.features as string) 
        : car.features
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

## Comprehensive Component Solutions

### src/app/buy/[id]/page.tsx

```typescript
'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CarDetailSlideshow from '@/components/ui/CarDetailSlideshow';
import TermSlider from '@/components/ui/TermSlider';
import { BuyCar } from '@/types/cars';  

export default function CarDetailsPage() {  // No explicit return type
  const params = useParams();
  const carId = params?.id as string;
  
  const [car, setCar] = useState<BuyCar | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('features'); 
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

  // Type guard approach - early returns ensure car is not null
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

  // TypeScript now knows car cannot be null here
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      {/* Rest of your component using car directly */}
      <h1>{car.make} {car.model}</h1>
    </div>
  );
}
```

### src/app/buy/page.tsx

```typescript
import Link from 'next/link';
import CarSlideshow from '@/components/ui/CarSlideshow';
import { prisma } from '@/lib/prisma';
import { BuyCar } from '@/types/cars';

export default async function BuyPage() {
  // Fetch cars directly from the database
  const cars = await prisma.buyCar.findMany({
    where: {
      isAvailable: true
    },
    include: {
      images: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Parse JSON strings to objects with explicit any type
  const parsedCars = cars.map((car: any) => ({
    ...car,
    specifications: typeof car.specifications === 'string' 
      ? JSON.parse(car.specifications as string) 
      : car.specifications,
    features: typeof car.features === 'string' 
      ? JSON.parse(car.features as string) 
      : car.features,
    standardEquipment: car.standardEquipment 
      ? (typeof car.standardEquipment === 'string' 
          ? JSON.parse(car.standardEquipment as string) 
          : car.standardEquipment)
      : [],
    addedOptions: car.addedOptions 
      ? (typeof car.addedOptions === 'string' 
          ? JSON.parse(car.addedOptions as string) 
          : car.addedOptions)
      : []
  })) as BuyCar[];

  // Use parsedCars in component to avoid "never read" error
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
                  imageUrls={car.images.map((img: any) => img.url)}
                />
                
                {/* Rest of component */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Best Practices for Handling TypeScript Errors

1. **Use Type Guards for Null Checks**: TypeScript's control flow analysis recognizes that `if (!variable)` checks guarantee the variable is not null in the subsequent code.

2. **Explicit 'any' for Quick Fixes**: When you need a quick fix, add `(param: any)` to function parameters, especially in callbacks like array methods.

3. **Create Custom Type Definitions**: For complex types like Prisma results, create your own interfaces or type aliases for better type safety.

4. **Use Type Assertions Judiciously**: The `as` keyword can help TypeScript understand your intent when you know more about the type than it does.

5. **Be Consistent with Nullable Properties**: Make sure your type definitions consistently use the same pattern for nullable properties (either `string | null` or `string | undefined`).

6. **Remove Unused Imports**: Clean up your imports to avoid "declared but never read" warnings.

7. **Use Return Type Inference**: Let TypeScript infer component return types rather than explicitly typing them, unless you have a specific reason to enforce a type.
