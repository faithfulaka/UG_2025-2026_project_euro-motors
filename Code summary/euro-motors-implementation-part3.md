# Euro Motors Luxury Car Dealership - Implementation Part 3

## More Form Components

### 1. RegisterForm Component (src/components/auth/RegisterForm.tsx)
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Password strength validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      setIsLoading(false);
      return;
    }

    try {
      await register(name, email, password);
      // Redirect happens in the register function
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred during registration');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Your name"
            required
          />
        </div>

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
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 8 characters and include uppercase, lowercase, and numbers
          </p>
        </div>

        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gray-900 text-white py-3 px-4 rounded-md hover:bg-gray-800 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link href="/login" className="text-gray-700 hover:underline">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
```

## Database Files

### 1. Prisma Schema (prisma/schema.prisma)
```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id              String           @id @default(cuid())
  name            String?
  email           String           @unique
  emailVerified   DateTime?
  password        String
  image           String?
  role            Role             @default(USER)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  accounts        Account[]
  orders          Order[]
  rentals         Rental[]
  sessions        Session[]
  tradeInRequests TradeInRequest[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId], map: "Account_userId_fkey")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId], map: "Session_userId_fkey")
}

model SaleCar {
  id           String         @id @default(cuid())
  make         String
  model        String
  year         Int
  color        String
  mileage      Int
  fuelType     String
  transmission String
  price        Float
  isAvailable  Boolean        @default(true)
  features     Json
  description  String         @db.Text
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  orders       Order[]
  images       SaleCarImage[]
}

model SaleCarImage {
  id        String   @id @default(cuid())
  url       String
  carId     String
  isMain    Boolean  @default(false)
  createdAt DateTime @default(now())
  saleCar   SaleCar  @relation(fields: [carId], references: [id], onDelete: Cascade)

  @@index([carId], map: "SaleCarImage_carId_fkey")
}

model RentalCar {
  id              String           @id @default(cuid())
  make            String
  model           String
  year            Int
  color           String
  mileage         Int
  fuelType        String
  transmission    String
  rentalPriceHour Float
  rentalPriceDay  Float
  rentalPriceWeek Float
  isAvailable     Boolean          @default(true)
  features        Json
  description     String           @db.Text
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  rentals         Rental[]
  images          RentalCarImage[]
}

model RentalCarImage {
  id        String    @id @default(cuid())
  url       String
  carId     String
  isMain    Boolean   @default(false)
  createdAt DateTime  @default(now())
  rentalCar RentalCar @relation(fields: [carId], references: [id], onDelete: Cascade)

  @@index([carId], map: "RentalCarImage_carId_fkey")
}

model Order {
  id              String          @id @default(cuid())
  userId          String
  carId           String
  amount          Float
  paymentStatus   PaymentStatus   @default(PENDING)
  orderStatus     OrderStatus     @default(PROCESSING)
  paymentMethod   String?
  paymentIntentId String?         @unique
  financingOption Boolean         @default(false)
  financingTerm   Int?
  tradeInIncluded Boolean         @default(false)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  car             SaleCar         @relation(fields: [carId], references: [id])
  user            User            @relation(fields: [userId], references: [id])
  tradeInRequest  TradeInRequest?

  @@index([carId], map: "Order_carId_fkey")
  @@index([userId], map: "Order_userId_fkey")
}

model Rental {
  id              String         @id @default(cuid())
  userId          String
  carId           String
  startDate       DateTime
  endDate         DateTime
  rentalDuration  RentalDuration
  totalAmount     Float
  paymentStatus   PaymentStatus  @default(PENDING)
  rentalStatus    RentalStatus   @default(RESERVED)
  paymentMethod   String?
  paymentIntentId String?        @unique
  isSplitPayment  Boolean        @default(false)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  coRenters       CoRenter[]
  car             RentalCar      @relation(fields: [carId], references: [id])
  user            User           @relation(fields: [userId], references: [id])

  @@index([carId], map: "Rental_carId_fkey")
  @@index([userId], map: "Rental_userId_fkey")
}

model CoRenter {
  id              String        @id @default(cuid())
  rentalId        String
  email           String
  name            String?
  paymentAmount   Float
  paymentStatus   PaymentStatus @default(PENDING)
  paymentIntentId String?       @unique
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  rental          Rental        @relation(fields: [rentalId], references: [id], onDelete: Cascade)

  @@index([rentalId], map: "CoRenter_rentalId_fkey")
}

model TradeInRequest {
  id              String         @id @default(cuid())
  orderId         String         @unique
  userId          String
  make            String
  model           String
  year            Int
  color           String
  mileage         Int
  condition       String
  estimatedValue  Float?
  actualValue     Float?
  status          TradeInStatus  @default(PENDING)
  previousOwners  Int?
  accidentHistory Boolean?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  images          TradeInImage[]
  order           Order          @relation(fields: [orderId], references: [id])
  user            User           @relation(fields: [userId], references: [id])

  @@index([userId], map: "TradeInRequest_userId_fkey")
}

model TradeInImage {
  id             String         @id @default(cuid())
  url            String
  tradeInId      String
  createdAt      DateTime       @default(now())
  tradeInRequest TradeInRequest @relation(fields: [tradeInId], references: [id], onDelete: Cascade)

  @@index([tradeInId], map: "TradeInImage_tradeInId_fkey")
}

enum Role {
  USER
  ADMIN
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum OrderStatus {
  PROCESSING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

enum RentalStatus {
  RESERVED
  ACTIVE
  COMPLETED
  CANCELLED
}

enum RentalDuration {
  HOURLY
  DAILY
  WEEKLY
}

enum TradeInStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED
}
```

### 2. Database Seed Script (prisma/seed.ts)
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@euromotors.com' },
    update: {},
    create: {
      email: 'admin@euromotors.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('User123!', 10);
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
    },
  });

  // Create sale cars
  const saleCars = [
    {
      make: 'Ferrari',
      model: 'SF90',
      year: 2023,
      color: 'Red',
      mileage: 1200,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      price: 450000,
      isAvailable: true,
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control']
      },
      description: 'The Ferrari SF90 Stradale is Ferrari's first production plug-in hybrid. The car\'s name encapsulates the true significance of all that has been achieved in terms of performance.'
    },
    {
      make: 'Lamborghini',
      model: 'Aventador',
      year: 2022,
      color: 'Green',
      mileage: 2500,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      price: 380000,
      isAvailable: true,
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control']
      },
      description: 'The Lamborghini Aventador is a mid-engine sports car produced by the Italian automotive manufacturer Lamborghini.'
    },
    {
      make: 'Aston Martin',
      model: 'DBS Superleggera',
      year: 2023,
      color: 'Silver',
      mileage: 1800,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      price: 320000,
      isAvailable: true,
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control']
      },
      description: 'The Aston Martin DBS Superleggera is a high-performance grand tourer produced by British luxury car manufacturer Aston Martin.'
    }
  ];

  for (const car of saleCars) {
    const createdCar = await prisma.saleCar.create({
      data: car
    });

    // Add sample images for each car
    await prisma.saleCarImage.createMany({
      data: [
        {
          url: '/images/gallery/component1.jpg',
          carId: createdCar.id,
          isMain: true
        },
        {
          url: '/images/gallery/component2.jpg',
          carId: createdCar.id,
          isMain: false
        },
        {
          url: '/images/gallery/component3.jpg',
          carId: createdCar.id,
          isMain: false
        }
      ]
    });
  }

  // Create rental cars
  const rentalCars = [
    {
      make: 'Ferrari',
      model: '488 GTB',
      year: 2022,
      color: 'Red',
      mileage: 5000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      rentalPriceHour: 120,
      rentalPriceDay: 1200,
      rentalPriceWeek: 7000,
      isAvailable: true,
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control']
      },
      description: 'The Ferrari 488 GTB is a mid-engine sports car produced by the Italian automobile manufacturer Ferrari.'
    },
    {
      make: 'Lamborghini',
      model: 'Huracan',
      year: 2022,
      color: 'Blue',
      mileage: 3500,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      rentalPriceHour: 100,
      rentalPriceDay: 1000,
      rentalPriceWeek: 6000,
      isAvailable: true,
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control']
      },
      description: 'The Lamborghini Huracán is a sports car manufactured by Italian automotive manufacturer Lamborghini.'
    },
    {
      make: 'Rolls Royce',
      model: 'Ghost',
      year: 2023,
      color: 'Black',
      mileage: 2000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      rentalPriceHour: 150,
      rentalPriceDay: 1500,
      rentalPriceWeek: 9000,
      isAvailable: true,
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control']
      },
      description: 'The Rolls-Royce Ghost is a full-sized luxury car manufactured by Rolls-Royce Motor Cars.'
    }
  ];

  for (const car of rentalCars) {
    const createdCar = await prisma.rentalCar.create({
      data: car
    });

    // Add sample images for each rental car
    await prisma.rentalCarImage.createMany({
      data: [
        {
          url: '/images/gallery/component4.jpg',
          carId: createdCar.id,
          isMain: true
        },
        {
          url: '/images/gallery/component5.jpg',
          carId: createdCar.id,
          isMain: false
        },
        {
          url: '/images/gallery/component6.jpg',
          carId: createdCar.id,
          isMain: false
        }
      ]
    });
  }

  console.log('Database seeding completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Configuration Files

### 1. Next.js Config (next.config.ts)
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
```

### 2. Environment Variables (.env.local)
```
# Database connection
DATABASE_URL="mysql://username:password@localhost:3306/euromotors"

# Authentication
JWT_SECRET="your-secret-key-here-make-it-complex-and-unique"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="another-secret-key-for-nextauth"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Package.json
```json
{
  "name": "euro-motors",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.9.1",
    "bcryptjs": "^2.4.3",
    "jose": "^5.2.0",
    "jsonwebtoken": "^9.0.2",
    "next": "14.1.0",
    "next-auth": "^4.24.5",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.1.0",
    "postcss": "^8",
    "prisma": "^5.9.1",
    "tailwindcss": "^3.3.0",
    "ts-node": "^10.9.2",
    "typescript": "^5"
  }
}
```

### 4. TypeScript Config (tsconfig.json)
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 5. Tailwind Config (tailwind.config.js)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-red': '#d32f2f',
      },
    },
  },
  plugins: [],
};
```

## Setup Instructions

### Project Setup and Running Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd euro-motors
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the project root with the content provided in the Environment Variables section.

4. **Setup the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Create database and run migrations
   npx prisma migrate dev --name init

   # Seed the database with initial data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Create image directories**
   ```bash
   mkdir -p public/images/gallery
   mkdir -p public/images/homeslide
   mkdir -p public/logos
   ```

7. **Place images in the correct directories**
   - Place your logo at `public/logos/logo.svg`
   - Place car gallery images in `public/images/gallery/` named as component1.jpg through component12.jpg
   - Place slideshow images in `public/images/homeslide/` named as slide1.jpg, slide2.jpg, and slide3.jpg

### Login Credentials

- **Admin User**
  - Email: admin@euromotors.com
  - Password: Admin123!

- **Regular User**
  - Email: user@example.com
  - Password: User123!

## Future Enhancements

1. **Image Management**
   - Implement Cloudinary for better image optimization and management
   - Add image uploading for trade-in requests

2. **Payment Processing**
   - Integrate Stripe for payment processing
   - Implement split payment functionality for rentals

3. **Dashboard Improvements**
   - Add more detailed admin analytics
   - Create user profile management system

4. **Search and Filtering**
   - Add advanced search and filtering for cars
   - Implement sorting options

5. **Notifications**
   - Add email notifications for order status updates
   - Add in-app notifications for admin approvals

6. **Trade-In API Integration**
   - Integrate with external valuation APIs for more accurate trade-in values
