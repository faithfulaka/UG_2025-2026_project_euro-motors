# Euro Motors Luxury Car Dealership - Implementation Part 2

## More API Routes

### 1. Register API (src/app/api/auth/register/route.ts)
```typescript
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Input validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER', // Default role
      },
    });

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
```

### 2. Logout API (src/app/api/auth/logout/route.ts)
```typescript
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  // Clear the token cookie
  response.cookies.set({
    name: 'token',
    value: '',
    expires: new Date(0),
    path: '/',
  });
  
  return response;
}
```

### 3. Me API (src/app/api/auth/me/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get token from request cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Verify token
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
    const { payload } = await jwtVerify(token, secretKey);

    // Get user from database (excluding password)
    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  } finally {
    await prisma.$disconnect();
  }
}
```

### 4. Trade-In API (src/app/api/trade-in/route.ts)
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.make || !body.model || !body.year || !body.color || !body.mileage || !body.condition || !body.carId || !body.userId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Create a new trade-in request - first check if there's already an order
    let order = await prisma.order.findFirst({
      where: {
        userId: body.userId,
        carId: body.carId,
        orderStatus: 'PROCESSING',
      },
    });

    // If no order exists, create one
    if (!order) {
      // Get the car to get its price
      const car = await prisma.saleCar.findUnique({
        where: { id: body.carId },
      });

      if (!car) {
        return NextResponse.json({ message: 'Car not found' }, { status: 404 });
      }

      order = await prisma.order.create({
        data: {
          userId: body.userId,
          carId: body.carId,
          amount: car.price,
          tradeInIncluded: true,
        },
      });
    } else {
      // Update the order to include trade-in
      await prisma.order.update({
        where: { id: order.id },
        data: { tradeInIncluded: true },
      });
    }

    // Create trade-in request
    const tradeInRequest = await prisma.tradeInRequest.create({
      data: {
        orderId: order.id,
        userId: body.userId,
        make: body.make,
        model: body.model,
        year: body.year,
        color: body.color,
        mileage: body.mileage,
        condition: body.condition,
        previousOwners: body.previousOwners || 1,
        accidentHistory: body.accidentHistory || false,
        // Calculate a very basic estimated value (this would be much more complex in a real system)
        estimatedValue: calculateEstimatedValue(body),
      },
    });

    return NextResponse.json({ 
      message: 'Trade-in request submitted successfully',
      tradeInRequest 
    }, { status: 201 });
  } catch (error) {
    console.error('Error in trade-in API:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'An error occurred while processing the trade-in request' }, { status: 500 });
  }
}

// Very simple estimator function - in a real app this would be much more sophisticated
function calculateEstimatedValue(carData: any): number {
  // Base value determined by make, model and year
  let baseValue = 10000;
  
  // Adjust for year (newer cars are worth more)
  const currentYear = new Date().getFullYear();
  const age = currentYear - carData.year;
  const ageMultiplier = Math.max(0.6, 1 - (age * 0.05)); // 5% depreciation per year, minimum of 60% of base
  
  // Adjust for mileage (lower is better)
  const mileageMultiplier = Math.max(0.7, 1 - (carData.mileage / 100000 * 0.3)); // 30% depreciation at 100k miles
  
  // Adjust for condition
  let conditionMultiplier = 0.8; // Default for "Good"
  switch (carData.condition) {
    case 'Excellent':
      conditionMultiplier = 1.0;
      break;
    case 'Good':
      conditionMultiplier = 0.8;
      break;
    case 'Fair':
      conditionMultiplier = 0.6;
      break;
    case 'Poor':
      conditionMultiplier = 0.4;
      break;
  }
  
  // Adjust for accident history
  const accidentMultiplier = carData.accidentHistory ? 0.8 : 1.0;
  
  // Calculate final estimated value
  const estimatedValue = baseValue * ageMultiplier * mileageMultiplier * conditionMultiplier * accidentMultiplier;
  
  // Round to nearest hundred
  return Math.round(estimatedValue / 100) * 100;
}
```

## Pages Implementation

### 1. Home Page (src/app/page.tsx)
```typescript
import HomeSlideshow from '@/components/HomeSlideshow';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  // Brand logos
  const brands = [
    'Ferrari', 'Lamborghini', 'Land Rover', 'Mercedes', 'Porsche', 
    'Rolls Royce', 'Aston Martin', 'Audi', 'BMW'
  ];

  // Gallery images
  const galleryImages = [
    { id: 1, src: '/images/gallery/component1.jpg', alt: 'McLaren 570S' },
    { id: 2, src: '/images/gallery/component2.jpg', alt: 'Ferrari SF90' },
    { id: 3, src: '/images/gallery/component3.jpg', alt: 'Porsche 911 GT3' },
    { id: 4, src: '/images/gallery/component4.jpg', alt: 'Lamborghini Urus' },
    { id: 5, src: '/images/gallery/component5.jpg', alt: 'Rolls Royce Cullinan' },
    { id: 6, src: '/images/gallery/component6.jpg', alt: 'Aston Martin DBX' },
    { id: 7, src: '/images/gallery/component7.jpg', alt: 'BMW X7' },
    { id: 8, src: '/images/gallery/component8.jpg', alt: 'Range Rover' },
    { id: 9, src: '/images/gallery/component9.jpg', alt: 'Bentley Flying Spur' },
    { id: 10, src: '/images/gallery/component10.jpg', alt: 'Audi Q8' },
    { id: 11, src: '/images/gallery/component11.jpg', alt: 'Lexus RX' },
    { id: 12, src: '/images/gallery/component12.jpg', alt: 'BMW M8' }
  ];

  return (
    <div>
      {/* Hero Slideshow */}
      <HomeSlideshow />

      {/* Brand Logos */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {brands.map((brand, index) => (
              <div key={index} className="w-20 h-20 flex items-center justify-center">
                {/* Replace with actual brand logos */}
                <div className="text-sm text-center text-gray-500">{brand}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center uppercase">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleryImages.map((image) => (
              <div key={image.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                <div className="relative h-64">
                  <Image 
                    src={image.src} 
                    alt={image.alt} 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

### 2. About Us Page (src/app/about-us/page.tsx)
```typescript
import Image from 'next/image';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">About Euro Motors</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12">
          <div className="md:flex">
            <div className="md:w-1/2">
              <div className="relative h-64 md:h-full">
                <Image 
                  src="/images/gallery/component5.jpg" 
                  alt="Euro Motors Showroom" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="md:w-1/2 p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <p className="text-gray-700 mb-4">
                Euro Motors was established in 2010 with a vision to provide an unparalleled luxury car buying and renting experience in Europe. 
                What started as a small dealership has now grown into one of the most prestigious luxury automobile businesses in the region.
              </p>
              <p className="text-gray-700 mb-4">
                Our commitment to excellence, attention to detail, and passion for luxury automobiles have been the driving forces behind our success. 
                We pride ourselves on offering only the finest vehicles from the world's most prestigious manufacturers.
              </p>
              <p className="text-gray-700">
                Today, Euro Motors stands as a symbol of luxury, reliability, and exceptional service in the automotive industry.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-3">Our Mission</h3>
            <p className="text-gray-700">
              To provide our clients with the finest luxury automobiles and an exceptional customer experience that exceeds expectations at every touchpoint.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-3">Our Vision</h3>
            <p className="text-gray-700">
              To be the premier destination for luxury car enthusiasts, offering an unmatched selection of the world's most prestigious vehicles.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-3">Our Values</h3>
            <p className="text-gray-700">
              Excellence, integrity, passion, and customer satisfaction are the core values that guide every aspect of our business.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Euro Motors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Premium Selection</h3>
              <p className="text-gray-600">
                Only the finest vehicles from the world's most prestigious manufacturers.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Flexible Financing</h3>
              <p className="text-gray-600">
                Tailored financing solutions to meet your specific needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Vehicle Protection</h3>
              <p className="text-gray-600">
                Comprehensive protection plans for your peace of mind.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600">
                Dedicated staff with extensive knowledge of luxury vehicles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3. Login Page (src/app/login/page.tsx)
```typescript
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign In to Euro Motors</h1>
        <LoginForm />
      </div>
    </div>
  );
}
```

### 4. Register Page (src/app/register/page.tsx)
```typescript
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Create Your Euro Motors Account</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
```

### 5. Buy Page (src/app/buy/page.tsx)
```typescript
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function BuyPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // For demo purposes, using mock data
  const mockCars = [
    {
      id: '1',
      make: 'Ferrari',
      model: 'SF90',
      year: 2023,
      color: 'Red',
      mileage: 1200,
      price: 450000,
      mainImage: '/images/gallery/component2.jpg'
    },
    {
      id: '2',
      make: 'Lamborghini',
      model: 'Aventador',
      year: 2022,
      color: 'Green',
      mileage: 2500,
      price: 380000,
      mainImage: '/images/gallery/component4.jpg'
    },
    {
      id: '3',
      make: 'Aston Martin',
      model: 'DBS Superleggera',
      year: 2023,
      color: 'Silver',
      mileage: 1800,
      price: 320000,
      mainImage: '/images/gallery/component6.jpg'
    }
  ];

  useEffect(() => {
    async function fetchCars() {
      setLoading(true);
      try {
        // In a real app, you would fetch data from API
        // const response = await fetch('/api/cars');
        // const data = await response.json();
        // setCars(data);
        setCars(mockCars);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An error occurred while fetching cars');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCars();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Luxury Cars For Sale</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCars.map((car) => (
            <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
              <div className="relative h-64">
                <Image 
                  src={car.mainImage} 
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                  priority={car.id === '1'}
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{car.make} {car.model}</h2>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">{car.year}</span>
                  <span className="text-gray-600">{car.mileage.toLocaleString()} miles</span>
                </div>
                <div className="flex justify-between items-center">
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
  );
}
```

### 6. Rent Page (src/app/rent/page.tsx)
```typescript
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function RentPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // For demo purposes, using mock data
  const mockCars = [
    {
      id: '1',
      make: 'Ferrari',
      model: '488 GTB',
      year: 2022,
      color: 'Red',
      hourlyRate: 120,
      dailyRate: 1200,
      weeklyRate: 7000,
      mainImage: '/images/gallery/component2.jpg'
    },
    {
      id: '2',
      make: 'Lamborghini',
      model: 'Huracan',
      year: 2022,
      color: 'Blue',
      hourlyRate: 100,
      dailyRate: 1000,
      weeklyRate: 6000,
      mainImage: '/images/gallery/component4.jpg'
    },
    {
      id: '3',
      make: 'Rolls Royce',
      model: 'Ghost',
      year: 2023,
      color: 'Black',
      hourlyRate: 150,
      dailyRate: 1500,
      weeklyRate: 9000,
      mainImage: '/images/gallery/component5.jpg'
    }
  ];

  useEffect(() => {
    async function fetchCars() {
      setLoading(true);
      try {
        // In a real app, you would fetch data from API
        // const response = await fetch('/api/rentals');
        // const data = await response.json();
        // setCars(data);
        setCars(mockCars);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An error occurred while fetching rental cars');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCars();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Luxury Cars For Rent</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCars.map((car) => (
            <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
              <div className="relative h-64">
                <Image 
                  src={car.mainImage} 
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                  priority={car.id === '1'}
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{car.make} {car.model}</h2>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">{car.year}</span>
                  <span className="text-gray-600">{car.color}</span>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hourly:</span>
                    <span>£{car.hourlyRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily:</span>
                    <span>£{car.dailyRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weekly:</span>
                    <span>£{car.weeklyRate}</span>
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
  );
}
```

### 7. Car Detail Page (src/app/buy/[id]/page.tsx)
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import TradeInModal from '@/components/trade-in/TradeInModal';

export default function CarDetailsPage() {
  const { id } = useParams();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTradeInModal, setShowTradeInModal] = useState(false);

  useEffect(() => {
    async function fetchCarDetails() {
      setLoading(true);
      try {
        const response = await fetch(`/api/cars/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch car details');
        }
        const data = await response.json();
        setCar(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An error occurred while fetching car details');
        }
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      // In a real app, you would fetch data from API
      // fetchCarDetails();
      
      // For demo purposes, use mock data
      const mockCar = getMockCarById(id as string);
      if (mockCar) {
        setCar(mockCar);
        setLoading(false);
      } else {
        setError('Car not found');
        setLoading(false);
      }
    }
  }, [id]);

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/buy" className="text-red-600 hover:text-red-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Listings
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image Gallery */}
          <div className="relative h-96">
            <Image
              src={car.mainImage}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover"
            />
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{car.make} {car.model}</h1>
                <p className="text-gray-600">{car.year} • {car.mileage.toLocaleString()} miles</p>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-3xl font-bold text-red-600">
                  £{car.price.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-600">Make</p>
                  <p className="font-semibold">{car.make}</p>
                </div>
                <div>
                  <p className="text-gray-600">Model</p>
                  <p className="font-semibold">{car.model}</p>
                </div>
                <div>
                  <p className="text-gray-600">Year</p>
                  <p className="font-semibold">{car.year}</p>
                </div>
                <div>
                  <p className="text-gray-600">Color</p>
                  <p className="font-semibold">{car.color}</p>
                </div>
                <div>
                  <p className="text-gray-600">Mileage</p>
                  <p className="font-semibold">{car.mileage.toLocaleString()} miles</p>
                </div>
                <div>
                  <p className="text-gray-600">Fuel Type</p>
                  <p className="font-semibold">{car.fuelType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Transmission</p>
                  <p className="font-semibold">{car.transmission}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700">{car.description}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Interior</h3>
                  <ul className="space-y-1">
                    {car.features.interior.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Exterior</h3>
                  <ul className="space-y-1">
                    {car.features.exterior.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Safety</h3>
                  <ul className="space-y-1">
                    {car.features.safety.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href={`/buy/checkout?carId=${car.id}`}
                className="bg-red-600 text-white px-6 py-3 rounded text-center hover:bg-red-700 transition duration-300"
              >
                Buy Now
              </Link>
              <button
                onClick={() => setShowTradeInModal(true)}
                className="border border-red-600 text-red-600 px-6 py-3 rounded text-center hover:bg-red-50 transition duration-300"
              >
                Trade-In & Buy
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trade-In Modal */}
      <TradeInModal 
        isOpen={showTradeInModal}
        onClose={() => setShowTradeInModal(false)}
        carId={car.id}
        carPrice={car.price}
      />
    </div>
  );
}

// Mock data function
function getMockCarById(id: string) {
  const mockCars = [
    {
      id: '1',
      make: 'Ferrari',
      model: 'SF90',
      year: 2023,
      color: 'Red',
      mileage: 1200,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      price: 450000,
      mainImage: '/images/gallery/component2.jpg',
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control']
      },
      description: 'The Ferrari SF90 Stradale is Ferrari's first production plug-in hybrid. The car's name encapsulates the true significance of all that has been achieved in terms of performance. The reference to the 90th anniversary of the foundation of Scuderia Ferrari underscores the strong link that has always existed between Ferrari's track and road cars.'
    },
    {
      id: '2',
      make: 'Lamborghini',
      model: 'Aventador',
      year: 2022,
      color: 'Green',
      mileage: 2500,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      price: 380000,
      mainImage: '/images/gallery/component4.jpg',
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control']
      },
      description: 'The Lamborghini Aventador is a mid-engine sports car produced by the Italian automotive manufacturer Lamborghini. It is equipped with a 6.5-liter V12 engine and features distinctive scissor doors, adding to its exotic appearance.'
    },
    {
      id: '3',
      make: 'Aston Martin',
      model: 'DBS Superleggera',
      year: 2023,
      color: 'Silver',
      mileage: 1800,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      price: 320000,
      mainImage: '/images/gallery/component6.jpg',
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control']
      },
      description: 'The Aston Martin DBS Superleggera is a high-performance grand tourer produced by British luxury car manufacturer Aston Martin. The DBS Superleggera features an aluminum chassis and a carbon-fiber body, contributing to its lightweight design and exceptional handling.'
    }
  ];
  
  return mockCars.find(car => car.id === id);
}
```

### 8. Rental Car Detail Page (src/app/rent/[id]/page.tsx)
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function RentalCarDetailsPage() {
  const { id } = useParams();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rentalDuration, setRentalDuration] = useState<'hourly' | 'daily' | 'weekly'>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [coRenterEmails, setCoRenterEmails] = useState(['']);

  useEffect(() => {
    async function fetchCarDetails() {
      setLoading(true);
      try {
        const response = await fetch(`/api/rentals/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch rental car details');
        }
        const data = await response.json();
        setCar(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An error occurred while fetching rental car details');
        }
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      // In a real app, you would fetch data from API
      // fetchCarDetails();
      
      // For demo purposes, use mock data
      const mockCar = getMockRentalCarById(id as string);
      if (mockCar) {
        setCar(mockCar);
        setLoading(false);
      } else {
        setError('Rental car not found');
        setLoading(false);
      }
    }
  }, [id]);

  const handleAddCoRenter = () => {
    setCoRenterEmails([...coRenterEmails, '']);
  };

  const handleRemoveCoRenter = (index: number) => {
    const updatedEmails = [...coRenterEmails];
    updatedEmails.splice(index, 1);
    setCoRenterEmails(updatedEmails);
  };

  const handleCoRenterEmailChange = (index: number, value: string) => {
    const updatedEmails = [...coRenterEmails];
    updatedEmails[index] = value;
    setCoRenterEmails(updatedEmails);
  };

  const handleRentalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, submit the rental request to the API
    console.log({
      carId: id,
      rentalDuration,
      startDate,
      endDate,
      isSplitPayment,
      coRenterEmails: isSplitPayment ? coRenterEmails.filter(email => email.trim() !== '') : [],
    });
    
    // Redirect to checkout
    window.location.href = `/rent/checkout?carId=${id}&duration=${rentalDuration}&startDate=${startDate}&endDate=${endDate}&splitPayment=${isSplitPayment}`;
  };

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
        <div className="text-xl text-red-600">Rental car not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/rent" className="text-red-600 hover:text-red-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Rental Listings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Image Gallery */}
              <div className="relative h-96">
                <Image
                  src={car.mainImage}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2">{car.make} {car.model}</h1>
                  <p className="text-gray-600">{car.year} • {car.color}</p>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Specifications</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-600">Make</p>
                      <p className="font-semibold">{car.make}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Model</p>
                      <p className="font-semibold">{car.model}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Year</p>
                      <p className="font-semibold">{car.year}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Color</p>
                      <p className="font-semibold">{car.color}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fuel Type</p>
                      <p className="font-semibold">{car.fuelType}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Transmission</p>
                      <p className="font-semibold">{car.transmission}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Description</h2>
                  <p className="text-gray-700">{car.description}</p>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-800 mb-2">Interior</h3>
                      <ul className="space-y-1">
                        {car.features.interior.map((feature: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-2">Exterior</h3>
                      <ul className="space-y-1">
                        {car.features.exterior.map((feature: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-2">Safety</h3>
                      <ul className="space-y-1">
                        {car.features.safety.map((feature: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Rental Rates</h2>
              <div className="mb-4">
                <div className="flex justify-between py-2 border-b">
                  <span>Hourly Rate:</span>
                  <span className="font-semibold">£{car.hourlyRate}/hour</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Daily Rate:</span>
                  <span className="font-semibold">£{car.dailyRate}/day</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Weekly Rate:</span>
                  <span className="font-semibold">£{car.weeklyRate}/week</span>
                </div>
              </div>

              <form onSubmit={handleRentalSubmit} className="space-y-4">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Rental Duration
                  </label>
                  <select
                    id="duration"
                    value={rentalDuration}
                    onChange={(e) => setRentalDuration(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="splitPayment"
                      type="checkbox"
                      checked={isSplitPayment}
                      onChange={(e) => setIsSplitPayment(e.target.checked)}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="splitPayment" className="font-medium text-gray-700">Split Payment</label>
                    <p className="text-gray-500">Share the rental cost with friends</p>
                  </div>
                </div>

                {isSplitPayment && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Co-Renter Emails
                    </label>
                    {coRenterEmails.map((email, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => handleCoRenterEmailChange(index, e.target.value)}
                          placeholder="co-renter@example.com"
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        {coRenterEmails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCoRenter(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddCoRenter}
                      className="text-sm text-red-600 hover:text-red-800 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      Add Co-Renter
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-red-600 text-white px-6 py-3 rounded text-center hover:bg-red-700 transition duration-300"
                >
                  Reserve Now
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data function
function getMockRentalCarById(id: string) {
  const mockCars = [
    {
      id: '1',
      make: 'Ferrari',
      model: '488 GTB',
      year: 2022,
      color: 'Red',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      hourlyRate: 120,
      dailyRate: 1200,
      weeklyRate: 7000,
      mainImage: '/images/gallery/component2.jpg',
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control']
      },
      description: 'The Ferrari 488 GTB is a mid-engine sports car produced by the Italian automobile manufacturer Ferrari. Experience the thrill of driving this incredible machine with its twin-turbocharged V8 engine producing 660 horsepower.'
    },
    {
      id: '2',
      make: 'Lamborghini',
      model: 'Huracan',
      year: 2022,
      color: 'Blue',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      hourlyRate: 100,
      dailyRate: 1000,
      weeklyRate: 6000,
      mainImage: '/images/gallery/component4.jpg',
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control']
      },
      description: 'The Lamborghini Huracán is a sports car manufactured by Italian automotive manufacturer Lamborghini. Experience the incredible performance of its naturally aspirated V10 engine, delivering a thrilling driving experience.'
    },
    {
      id: '3',
      make: 'Rolls Royce',
      model: 'Ghost',
      year: 2023,
      color: 'Black',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      hourlyRate: 150,
      dailyRate: 1500,
      weeklyRate: 9000,
      mainImage: '/images/gallery/component5.jpg',
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control']
      },
      description: 'The Rolls-Royce Ghost is a full-sized luxury car manufactured by Rolls-Royce Motor Cars. Experience the height of automotive luxury with its exquisite craftsmanship, refined performance, and state-of-the-art technology.'
    }
  ];
  
  return mockCars.find(car => car.id === id);
}
```

### 9. TradeInModal Component (src/components/trade-in/TradeInModal.tsx)
```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface TradeInModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: string;
  carPrice: number;
}

export default function TradeInModal({ isOpen, onClose, carId, carPrice }: TradeInModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    mileage: 0,
    condition: 'Good',
    previousOwners: 1,
    accidentHistory: false,
  });

  // Condition options
  const conditionOptions = ['Excellent', 'Good', 'Fair', 'Poor'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'year' || name === 'mileage' || name === 'previousOwners') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // API call to submit trade-in request
      const response = await fetch('/api/trade-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          carId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit trade-in request');
      }

      // Close the modal and maybe redirect or show success message
      onClose();
      // Redirect to checkout with trade-in
      router.push(`/buy/checkout?carId=${carId}&tradeIn=true`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while submitting your trade-in request');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Trade-In Your Vehicle</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="mb-4 text-gray-600">
            Tell us about your current vehicle and we'll provide you with a trade-in estimate 
            that will be applied to your purchase.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                  Make *
                </label>
                <input
                  id="make"
                  name="make"
                  type="text"
                  value={formData.make}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  Model *
                </label>
                <input
                  id="model"
                  name="model"
                  type="text"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <input
                  id="year"
                  name="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                  Color *
                </label>
                <input
                  id="color"
                  name="color"
                  type="text"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
                  Mileage *
                </label>
                <input
                  id="mileage"
                  name="mileage"
                  type="number"
                  min="0"
                  value={formData.mileage}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                  Condition *
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  {conditionOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="previousOwners" className="block text-sm font-medium text-gray-700 mb-1">
                  Previous Owners
                </label>
                <input
                  id="previousOwners"
                  name="previousOwners"
                  type="number"
                  min="1"
                  value={formData.previousOwners}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center h-full pt-6">
                <input
                  id="accidentHistory"
                  name="accidentHistory"
                  type="checkbox"
                  checked={formData.accidentHistory}
                  onChange={handleChange}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="accidentHistory" className="ml-2 block text-sm text-gray-700">
                  Has accident history
                </label>
              </div>
            </div>

            {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {isLoading ? 'Submitting...' : 'Submit Trade-In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

### 10. Auth Context (src/context/AuthContext.tsx)
```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on page load
  useEffect(() => {
    async function loadUserFromSession() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to load user session:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserFromSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      router.push('/');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      router.push('/login');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## Form Components

### 1. LoginForm Component (src/components/auth/LoginForm.tsx)
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      // Redirect happens in the login function
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred during login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Your email"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Your password"
            required
          />
        </div>

        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gray-900 text-white py-3 px-4 rounded-md hover:bg-gray-800 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link href="/register" className="text-gray-700 hover:underline">
          Register Here
        </Link>
      </div>
    </div>
  );
}
```
