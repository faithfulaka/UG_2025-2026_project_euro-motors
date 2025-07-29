# Euro Motors Implementation Guide

## Project Overview

Euro Motors is a luxury car dealership platform with the following features:
- **Car Purchase**: Users can browse and buy luxury cars
- **Car Rental**: Users can rent luxury vehicles for hourly, daily, or weekly periods
- **Trade-in System**: Users can trade in their current vehicle when purchasing a new one
- **Admin Dashboard**: Administrators can manage inventory, users, and handle quotes
- **Authentication**: User registration, login, and role-based permissions
- **Quote System**: Users receive quotes for purchases and rentals by email
- **Stripe Integration**: Secure payment processing for rentals and purchases

## Project Structure

```
euro-motors/
├── .env                      # Environment variables
├── .gitignore                # Git ignore file
├── eslint.config.mjs         # ESLint configuration
├── next-env.d.ts             # Next.js TypeScript declarations
├── next.config.ts            # Next.js configuration
├── package.json              # Project dependencies
├── postcss.config.mjs        # PostCSS configuration
├── prisma/                   # Prisma ORM files
│   ├── schema.prisma         # Database schema definition
│   └── seed.js               # Database seed script
├── public/                   # Static assets
│   ├── car1/                 # Images for car1 (pov1.jpg to pov11.jpg)
│   ├── car2/                 # Images for car2 (pov1.jpg to pov11.jpg)
│   ├── car3/                 # Images for car3 (pov1.jpg to pov11.jpg)
│   └── images/               # Other static images
│       ├── brands.jpg        # Car brands image
│       ├── gallery/          # Gallery images
│       ├── homeslide/        # Homepage slideshow images
│       ├── bodytype.svg      # Body type icon
│       ├── engine.svg        # Engine icon
│       ├── fueltype.svg      # Fuel type icon
│       ├── horsepower.svg    # Horsepower icon
│       ├── milage.svg        # Mileage icon
│       └── transmission.svg  # Transmission icon
├── src/                      # Source code
│   ├── app/                  # Next.js application routes
│   │   ├── admin/            # Admin pages
│   │   │   ├── cars/         # Car management pages
│   │   │   │   ├── [id]/     # Edit car by ID
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── add/      # Add new car
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx  # Car listing for admin
│   │   │   ├── dashboard/    # Admin dashboard
│   │   │   │   └── page.tsx
│   │   │   ├── rentals/      # Rental management
│   │   │   │   └── page.tsx
│   │   │   ├── trade-in/     # Trade-in requests
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx      # Main admin page
│   │   ├── api/              # API routes
│   │   │   ├── admin/        # Admin API endpoints
│   │   │   │   ├── cars/     # Car management API
│   │   │   │   │   ├── [id]/ # Single car operations
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── route.ts
│   │   │   │   ├── dashboard/# Dashboard data
│   │   │   │   │   └── route.ts
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   │   ├── login/    # Login endpoint
│   │   │   │   │   └── route.ts
│   │   │   │   ├── logout/   # Logout endpoint
│   │   │   │   │   └── route.ts
│   │   │   │   ├── me/       # Current user info
│   │   │   │   │   └── route.ts
│   │   │   │   └── register/ # Registration endpoint
│   │   │   │       └── route.ts
│   │   │   ├── cars/         # Car API endpoints
│   │   │   │   ├── [id]/     # Single car API
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts  # All cars API
│   │   │   ├── payments/     # Payment processing
│   │   │   │   └── route.ts
│   │   │   ├── quotes/       # Quote generation
│   │   │   │   ├── [id]/     # Single quote
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts  # Create quote
│   │   │   ├── rentals/      # Rental endpoints
│   │   │   │   ├── [id]/     # Single rental
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts  # All rentals
│   │   │   └── trade-in/     # Trade-in API
│   │   │       ├── [id]/     # Single trade-in
│   │   │       │   └── route.ts
│   │   │       └── route.ts  # Create trade-in
│   │   ├── buy/              # Buy car pages
│   │   │   ├── [id]/         # Single car purchase page
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx      # Car listings for purchase
│   │   ├── dashboard/        # User dashboard
│   │   │   └── page.tsx
│   │   ├── login/            # Login page
│   │   │   └── page.tsx
│   │   ├── register/         # Registration page
│   │   │   └── page.tsx
│   │   ├── rent/             # Rental pages
│   │   │   ├── [id]/         # Single car rental page
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx      # Car listings for rent
│   │   ├── trade-in/         # Trade-in pages
│   │   │   └── page.tsx      # Trade-in form
│   │   ├── globals.css       # Global CSS
│   │   ├── layout.tsx        # Root layout with providers
│   │   └── page.tsx          # Homepage
│   ├── components/           # React components
│   │   ├── admin/            # Admin components
│   │   │   ├── CarBuyForm.tsx  # Add/edit buy car form
│   │   │   ├── CarListTable.tsx # Car list table for admin
│   │   │   ├── CarRentForm.tsx # Add/edit rental car form
│   │   │   └── DashboardStats.tsx # Admin dashboard stats
│   │   ├── auth/             # Authentication components
│   │   │   ├── LoginForm.tsx # Login form
│   │   │   └── RegisterForm.tsx # Registration form
│   │   ├── cars/             # Car components
│   │   │   ├── CarCard.tsx   # Car card component
│   │   │   ├── CarDetails.tsx # Car detail view
│   │   │   ├── CarFilters.tsx # Search filters
│   │   │   └── CarList.tsx   # List of cars
│   │   ├── layout/           # Layout components
│   │   │   ├── Footer.tsx    # Footer component
│   │   │   ├── Navbar.tsx    # Navigation bar
│   │   │   └── Sidebar.tsx   # Sidebar for admin
│   │   ├── providers/        # Context providers
│   │   │   └── SessionProvider.tsx # Auth session provider
│   │   ├── rental/           # Rental components
│   │   │   ├── RentalCalendar.tsx # Rental calendar
│   │   │   ├── RentalForm.tsx # Rental form
│   │   │   └── SplitPaymentForm.tsx # Split payment
│   │   ├── trade-in/         # Trade-in components
│   │   │   ├── TradeInForm.tsx # Trade-in form
│   │   │   ├── TradeInModal.tsx # Trade-in modal
│   │   │   └── TradeInStatus.tsx # Trade-in status
│   │   └── ui/               # UI components
│   │       ├── CarDetailSlideshow.tsx # Car detail slideshow
│   │       ├── CarSlideshow.tsx # Car slideshow
│   │       ├── Gallery.tsx    # Image gallery
│   │       ├── HomeSlideshow.tsx # Homepage slideshow
│   │       └── TermSlider.tsx # Term slider component
│   ├── context/              # React context
│   │   ├── AuthContext.tsx   # Authentication context
│   │   └── CartContext.tsx   # Shopping cart context
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── cars.ts           # Car data utilities
│   │   ├── prisma.ts         # Prisma client
│   │   └── utils.ts          # General utilities
│   ├── models/               # Data models (if not using TS interfaces)
│   ├── styles/               # Additional styles
│   │   └── tailwind.css      # Tailwind utility styles
│   └── types/                # TypeScript type definitions
│       ├── admin.ts          # Admin-related types
│       ├── cars.ts           # Car-related types
│       └── index.ts          # Common types
└── tsconfig.json             # TypeScript configuration
```

## Core Implementations

### Database Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "./node_modules/@prisma/client"  
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id              String           @id @default(cuid())
  name            String?
  email           String           @unique
  password        String
  role            Role             @default(USER)
  stripeCustomerId String?         // Store Stripe customer ID for returning users
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  quotes          Quote[]
  rentals         Rental[]
  sessions        Session[]
  tradeInRequests TradeInRequest[]
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model BuyCar {
  id               String        @id @default(cuid())
  make             String
  model            String
  trim             String?
  year             Int
  price            Float         // Average dealer price from scraper
  specifications   Json          // Enhanced structured specifications from scraper
  features         Json          // Interior, exterior, safety features
  standardEquipment Json?        // Standard equipment list
  addedOptions     Json?         // Added options list  
  description      String        @db.Text
  isAvailable      Boolean       @default(true)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  images           BuyCarImage[]
  quotes           Quote[]
}

model BuyCarImage {
  id        String   @id @default(cuid())
  url       String
  carId     String
  isMain    Boolean  @default(false)
  imageType String?  // e.g., "exterior", "interior", "engine", etc.
  buyCar    BuyCar   @relation(fields: [carId], references: [id], onDelete: Cascade)

  @@index([carId])
}

model RentalCar {
  id               String           @id @default(cuid())
  make             String
  model            String
  trim             String?
  year             Int
  hourlyRate       Float
  dailyRate        Float
  weeklyRate       Float
  specifications   Json             // Enhanced structured specifications
  features         Json             // Interior, exterior, safety features
  description      String           @db.Text
  isAvailable      Boolean          @default(true)
  stripeProductId  String?          // Stripe product ID for this rental car
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  images           RentalCarImage[]
  rentals          Rental[]
}

model RentalCarImage {
  id        String    @id @default(cuid())
  url       String
  carId     String
  isMain    Boolean   @default(false)
  imageType String?   // e.g., "exterior", "interior", "engine", etc.
  rentalCar RentalCar @relation(fields: [carId], references: [id], onDelete: Cascade)

  @@index([carId])
}

model Quote {
  id              String         @id @default(cuid())
  userId          String
  carId           String
  amount          Float
  financingOption Boolean        @default(false)
  financingTerm   Int?
  monthlyPayment  Float?
  cashDeposit     Float?
  tradeInIncluded Boolean        @default(false)
  quoteStatus     QuoteStatus    @default(PENDING)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  car             BuyCar         @relation(fields: [carId], references: [id])
  user            User           @relation(fields: [userId], references: [id])
  tradeInRequest  TradeInRequest?

  @@index([carId])
  @@index([userId])
}

model Rental {
  id               String         @id @default(cuid())
  userId           String
  carId            String
  startDate        DateTime
  endDate          DateTime
  rentalDuration   RentalDuration
  totalAmount      Float
  paymentStatus    PaymentStatus  @default(PENDING)
  rentalStatus     RentalStatus   @default(RESERVED)
  isSplitPayment   Boolean        @default(false)
  stripePaymentIntentId String?   // Main renter's payment intent
  stripeSessionId  String?        // Main checkout session ID
  paymentMethod    String?        // Payment method used
  depositAmount    Float?         // Security deposit amount
  depositRefunded  Boolean?       // Whether deposit was refunded
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  coRenters        CoRenter[]
  car              RentalCar      @relation(fields: [carId], references: [id])
  user             User           @relation(fields: [userId], references: [id])

  @@index([carId])
  @@index([userId])
}

model CoRenter {
  id                  String        @id @default(cuid())
  rentalId            String
  email               String
  name                String?
  paymentAmount       Float
  paymentStatus       PaymentStatus @default(PENDING)
  stripePaymentIntentId String?     // Co-renter's payment intent
  stripeSessionId     String?       // Co-renter's checkout session
  paymentMethod       String?       // Payment method used
  invitationSent      Boolean       @default(false)
  invitationAccepted  Boolean       @default(false)
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
  rental              Rental        @relation(fields: [rentalId], references: [id], onDelete: Cascade)

  @@index([rentalId])
}

model TradeInRequest {
  id                     String        @id @default(cuid())
  quoteId                String        @unique
  userId                 String
  // Registration information
  registrationNumber     String        // Vehicle registration number for API lookup

  // DVLA API data
  make                   String?       // Manufacturer (from API)
  model                  String        // Model name
  colour                 String?       // Vehicle color (from API)
  fuelType               String?       // Fuel type (from API)
  engineCapacity         Int?          // Engine size in cc (from API)
  yearOfManufacture      Int?          // Year of manufacture (from API)
  monthOfFirstRegistration String?     // Month of first registration (from API)
  motStatus              String?       // MOT status (from API)
  taxStatus              String?       // Current tax status (from API)
  taxDueDate             DateTime?     // Tax due date (from API)
  co2Emissions           Int?          // CO2 emissions (from API)
  euroStatus             String?       // Euro emissions standard (from API)

  // User input fields
  mileage                Int           // Current odometer reading
  condition              String        // Excellent, Good, Fair, Poor
  conditionDetails       String?       // Additional condition details

  // Accident history
  accidentHistory        Boolean       // Yes/No for accident history
  numberOfAccidents      Int?          // Number of accidents if any

  // Service history & ownership
  previousOwners         Int           // Number of previous owners
  fullServiceHistory     Boolean?      // Yes/No for full service history

  // Features and condition
  hasModifications       Boolean?      // Any modifications to original spec
  interiorCondition      Int?          // Rating 1-5
  exteriorCondition      Int?          // Rating 1-5

  // Images
  images                 Json?         // Array of image URLs

  // Valuation
  estimatedValue         Float?        // Calculated estimated value
  actualValue            Float?        // Final valuation after admin review

  // Status
  status                 TradeInStatus @default(PENDING)
  adminNotes             String?       // Notes from admin review

  // Timestamps
  createdAt              DateTime      @default(now())
  updatedAt              DateTime      @updatedAt

  // Relations
  quote                  Quote         @relation(fields: [quoteId], references: [id])
  user                   User          @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([registrationNumber])
}

// For storing Stripe products configuration
model StripeProduct {
  id              String    @id
  name            String
  description     String?
  active          Boolean   @default(true)
  type            String    // "rental", "co-rental", "deposit", etc.
  defaultAmount   Float?
  currency        String    @default("GBP")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
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

enum QuoteStatus {
  PENDING
  GENERATED
  RESERVED
  CANCELLED
}

enum RentalStatus {
  RESERVED
  PAID
  PICKED_UP
  ACTIVE
  RETURNED
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

### Database Seed Script

```javascript
// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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

  // Clear existing car data to prevent duplicates on re-seed
  await prisma.buyCarImage.deleteMany({});
  await prisma.buyCar.deleteMany({});
  await prisma.rentalCarImage.deleteMany({});
  await prisma.rentalCar.deleteMany({});

  // Create purchase cars
  const buyCars = [
    {
      id: 'car1',
      make: 'Bentley',
      model: 'Bentayga V8',
      trim: 'BLACK EDITION',
      year: 2022,
      price: 169990,
      specifications: {
        color: 'Pearl White',
        interiorColor: 'Red/Black',
        mileage: 0,
        engine: '6.0 L V8 Biturbo',
        horsePower: 542,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'SUV',
        driveType: 'All Wheel Drive',
        seats: 5,
        doors: 4,
        topSpeed: '290 KM/H',
        acceleration100: 'APPROXIMATELY 4.0 S',
        powerKW: '404 kW',
        powerPS: '549 PS',
        torque: '770 NM',
        weight: '2410 KG',
        wheelbase: '2.995 M',
        wheelSize: '22 Inch Ten Spoke',
        brakeColor: 'Red'
      },
      features: {
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System',
          'Heated Seats'
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights',
          'Parking Sensors'
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control'
        ]
      },
      standardEquipment: [
        'Engine start/stop button',
        'Bentley Online services'
      ],
      addedOptions: [
        'Touring Specification',
        'Bentley Dynamic Ride'
      ],
      description: 'The Bentley Bentayga V8 BLACK EDITION luxury SUV experience.',
      isAvailable: true,
    },
    {
      id: 'car2',
      make: 'Rolls Royce',
      model: 'Cullinan V12',
      trim: 'BLACK BADGE',
      year: 2022,
      price: 380000,
      specifications: {
        color: 'Dark Grey',
        interiorColor: 'Black',
        mileage: 0,
        engine: '6.75L V12',
        horsePower: 591,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'SUV',
        driveType: 'All Wheel Drive',
        seats: 5,
        doors: 4,
        topSpeed: '250 KM/H',
        acceleration100: 'APPROXIMATELY 5.0 S',
        powerKW: '441 kW',
        powerPS: '600 PS',
        torque: '850 NM',
        weight: '2735 KG',
        wheelbase: '3.295 M',
        wheelSize: '22 Inch Part Polished',
        brakeColor: 'Black'
      },
      features: {
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System',
          'Heated and Ventilated Seats'
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights',
          'Panoramic Sunroof'
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control',
          'Lane Departure Warning'
        ]
      },
      standardEquipment: [
        'Spirit of Ecstasy controller',
        'Self-levelling air suspension'
      ],
      addedOptions: [
        'Rear Theatre Configuration',
        'Bespoke Audio'
      ],
      description: 'The Rolls Royce Cullinan V12 BLACK BADGE redefines luxury SUV performance.',
      isAvailable: true,
    },
    {
      id: 'car3',
      make: 'Bentley',
      model: 'Continental GT V8',
      trim: 'Continental GT V8',
      year: 2022,
      price: 175000,
      specifications: {
        color: 'Blue',
        interiorColor: 'Cream',
        mileage: 0,
        engine: '4.0L V8 Twin-Turbo',
        horsePower: 542,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'Coupe',
        driveType: 'All Wheel Drive',
        seats: 4,
        doors: 2,
        topSpeed: '318 KM/H',
        acceleration100: 'APPROXIMATELY 3.9 S',
        powerKW: '404 kW',
        powerPS: '542 PS',
        torque: '770 NM',
        weight: '2165 KG',
        wheelbase: '2.851 M',
        wheelSize: '21 Inch Five-Spoke',
        brakeColor: 'Red'
      },
      features: {
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System'
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights',
          'Parking Sensors'
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control'
        ]
      },
      standardEquipment: [
        'Engine start/stop button',
        'Bentley Online services'
      ],
      addedOptions: [
        'Touring Specification',
        'Bentley Dynamic Ride'
      ],
      description: 'The Bentley Continental GT V8 is the ultimate expression of power and elegance.',
      isAvailable: true,
    }
  ];

  for (const car of buyCars) {
    await prisma.buyCar.create({
      data: {
        ...car,
        specifications: JSON.stringify(car.specifications),
        features: JSON.stringify(car.features),
        standardEquipment: JSON.stringify(car.standardEquipment),
        addedOptions: JSON.stringify(car.addedOptions)
      }
    });
  }

  // Add image references for purchase cars
  for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= 11; j++) {
      await prisma.buyCarImage.create({
        data: {
          url: `car${i}/pov${j}.jpg`,
          carId: `car${i}`,
          isMain: j === 1
        }
      });
    }
  }

  // Create rental cars
  const rentalCars = [
    {
      id: 'rent1',
      make: 'Ferrari',
      model: '488 GTB',
      year: 2022,
      hourlyRate: 120,
      dailyRate: 1200,
      weeklyRate: 7000,
      specifications: {
        color: 'Red',
        interiorColor: 'Black',
        mileage: 5000,
        engine: '3.9L V8 Twin-Turbo',
        horsePower: 661,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'Coupe',
        driveType: 'Rear-Wheel Drive',
        seats: 2,
        doors: 2
      },
      features: {
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System'
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights'
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control'
        ]
      },
      description: 'The Ferrari 488 GTB is a mid-engine sports car produced by the Italian automobile manufacturer Ferrari.',
      isAvailable: true,
    },
    {
      id: 'rent2',
      make: 'Lamborghini',
      model: 'Huracan',
      year: 2022,
      hourlyRate: 100,
      dailyRate: 1000,
      weeklyRate: 6000,
      specifications: {
        color: 'Blue',
        interiorColor: 'Black',
        mileage: 3500,
        engine: '5.2L V10',
        horsePower: 602,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'Coupe',
        driveType: 'Rear-Wheel Drive',
        seats: 2,
        doors: 2
      },
      features: {
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System'
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights'
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control'
        ]
      },
      description: 'The Lamborghini Huracan is a high-performance sports car with a naturally aspirated V10 engine.',
      isAvailable: true,
    },
    {
      id: 'rent3',
      make: 'Rolls Royce',
      model: 'Ghost',
      year: 2023,
      hourlyRate: 150,
      dailyRate: 1500,
      weeklyRate: 9000,
      specifications: {
        color: 'Black',
        interiorColor: 'White',
        mileage: 2000,
        engine: '6.75L V12',
        horsePower: 563,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'Sedan',
        driveType: 'Rear-Wheel Drive',
        seats: 5,
        doors: 4
      },
      features: {
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System',
          'Rear Seat Entertainment'
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights'
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control',
          'Adaptive Cruise Control'
        ]
      },
      description: 'The Rolls-Royce Ghost is a luxury sedan known for its refined elegance and smooth ride.',
      isAvailable: true,
    }
  ];

  for (const car of rentalCars) {
    await prisma.rentalCar.create({
      data: {
        ...car,
        specifications: JSON.stringify(car.specifications),
        features: JSON.stringify(car.features)
      }
    });
  }

  // Add rental car images
  for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= 11; j++) {
      await prisma.rentalCarImage.create({
        data: {
          url: `car${i}/pov${j}.jpg`,
          carId: `rent${i}`,
          isMain: j === 1
        }
      });
    }
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

### Database Connection Singleton

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

### TypeScript Type Definitions

```typescript
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
```

### Component Implementations

#### CarSlideshow Component

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
  const [imageError, setImageError] = useState(false);
  
  // No matter what format the carId is in, we need the number
  const carNumber = carId.replace(/\D/g, '') || '1';
  
  // If no imageUrls provided, use convention-based paths
  const images = imageUrls || Array.from({ length: 11 }, (_, i) => {
    return `/car${carNumber}/pov${i + 1}.jpg`;
  });

  const handleNextClick = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevClick = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (imageError) {
    return (
      <div className="relative h-64 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-600">Image not available</span>
      </div>
    );
  }

  return (
    <div className="relative h-64 w-full overflow-hidden">
      <Image
        src={images[currentIndex]}
        alt={`${make} ${model}`}
        fill
        className="object-cover"
        onError={() => setImageError(true)}
      />
      
      {/* Navigation buttons */}
      <button
        onClick={handlePrevClick}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white"
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      <button
        onClick={handleNextClick}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white"
        aria-label="Next image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Image counter */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
```

#### CarDetailSlideshow Component

```typescript
// src/components/ui/CarDetailSlideshow.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CarDetailSlideshowProps {
  carId: string;
  make: string;
  model: string;
  imageUrls?: string[];
}

export default function CarDetailSlideshow({ carId, make, model, imageUrls }: CarDetailSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isManual, setIsManual] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Extract the number from the carID (e.g., "car1" -> "1")
  const carNumber = carId.replace(/\D/g, '') || '1'; // Fallback to '1' if extraction fails
  
  // If imageUrls are provided, use them; otherwise generate paths based on convention
  const images = imageUrls || Array.from({ length: 11 }, (_, i) => 
    `/car${carNumber}/pov${i + 1}.jpg`
  );

  // Auto slide functionality with pause when clicking manually
  useEffect(() => {
    if (isManual) return; // Pause auto-slide when user manually navigates

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Auto-slide every 5 seconds

    return () => clearInterval(interval);
  }, [images.length, isManual]);

  // Functions to handle navigation
  const goToNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsManual(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setTimeout(() => setIsManual(false), 5000); // Resume auto-slide after 5 sec
  };

  const goToPrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsManual(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    setTimeout(() => setIsManual(false), 5000); // Resume auto-slide after 5 sec
  };

  const goToSlide = (index: number) => {
    setIsManual(true);
    setCurrentIndex(index);
    setTimeout(() => setIsManual(false), 5000); // Resume auto-slide after 5 sec
  };

  const handleImageError = () => {
    console.error(`Image failed to load: ${images[currentIndex]}`);
    setImageError(true);
  };

  if (imageError) {
    return (
      <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-600">Image not available</span>
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 mt-2">
            Path: {images[currentIndex]}
            <br />
            Car ID: {carId}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Slides - making sure they fill both width and height */}
      <div className="h-full relative">
        {images.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              index === currentIndex ? 'opacity-100 z-20' : 'opacity-0 z-10'
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={src}
                alt={`${make} ${model} image ${index + 1}`}
                fill
                className="object-cover w-full h-full"
                priority={index === 0}
                onError={handleImageError}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 z-40 cursor-pointer rounded-full"
        aria-label="Previous slide"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="2" 
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 z-40 cursor-pointer rounded-full"
        aria-label="Next slide"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="2" 
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-40">
        {images.map((_, index) => (
          <button
            key={`indicator-${index}`}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              currentIndex === index ? 'bg-red-600' : 'bg-transparent border border-red-600'
            } transition-all duration-300`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
      
      {/* Image counter */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
```

### API Routes

#### API Routes for Cars

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

    // Parse JSON strings to objects
    const parsedCars = cars.map(car => ({
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

#### API Route for Single Car

```typescript
// src/app/api/cars/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params; // Proper destructuring
  
  try {
    const car = await prisma.buyCar.findUnique({
      where: { id },
      include: { images: true }
    });
    
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    
    // Parse JSON fields
    const result = {
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
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json({ error: 'Failed to fetch car' }, { status: 500 });
  }
}
```

#### API Routes for Rentals

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

#### API Route for Single Rental

```typescript
// src/app/api/rentals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
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
      specifications: typeof car.specifications === 'string' 
        ? JSON.parse(car.specifications as string) 
        : car.specifications,
      features: typeof car.features === 'string' 
        ? JSON.parse(car.features as string) 
        : car.features
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

### Page Implementations

#### Buy Page Implementation

```typescript
// src/app/buy/page.tsx - Server Component
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
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Parse JSON strings to objects
  const parsedCars = cars.map(car => ({
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
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <div>
                        <div className="text-xs text-black">Engine</div>
                        <div className="text-sm font-medium text-black">{car.specifications.engine}</div>
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

#### Car Details Page - Client Component

```typescript
// src/app/buy/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CarDetailSlideshow from '@/components/ui/CarDetailSlideshow';
import TermSlider from '@/components/ui/TermSlider';
import { BuyCar } from '@/types/cars';

export default function CarDetailsPage() {
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
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-4">
          <Link href="/buy" className="text-red-600 hover:text-red-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Listings
          </Link>
        </div>

        {/* Car header with slideshow */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="relative h-[650px] w-full">
            <CarDetailSlideshow
              carId={car.id} 
              make={car.make} 
              model={car.model} 
              imageUrls={car.images?.map(img => img.url)}
            />
          </div>

          {/* Car basic information */}
          <div className="p-6 border-b border-black">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold">{car.make} {car.model}</h1>
                <p className="text-lg text-black mt-1">Model: {car.trim || car.model}</p>
                <p className="text-lg text-black">Year: {car.year} {car.specifications.mileage === 0 ? '(Brand new)' : ''}</p>
                <div className="flex items-center mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-black mr-4">Birmingham</span>
                  
                  <div className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-black rounded-full mr-1"></span>
                    <span className="w-1.5 h-1.5 bg-black rounded-full mr-1"></span>
                    <span className="text-black">Home delivery available</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-3xl font-bold">£{car.price.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-6 border-b border-black">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 6l3 4h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1a3 3 0 0 1-3 3a3 3 0 0 1-3-3H9a3 3 0 0 1-3 3a3 3 0 0 1-3-3H2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1l3-4h10z"></path>
                  <circle cx="7" cy="17" r="2"></circle>
                  <circle cx="17" cy="17" r="2"></circle>
                </svg>
              </div>
              <p className="text-sm text-black">Body Type</p>
              <p className="font-semibold">{car.specifications.bodyType}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                  <path d="M7 12h10"></path>
                </svg>
              </div>
              <p className="text-sm text-black">Transmission</p>
              <p className="font-semibold">{car.specifications.transmission}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                  <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
                  <path d="M9 17h6"></path>
                  <path d="M9 13h6"></path>
                </svg>
              </div>
              <p className="text-sm text-black">Horse Power</p>
              <p className="font-semibold">{car.specifications.horsePower}hp</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M14.31 8l5.74 9.94"></path>
                  <path d="M9.69 8h10.61"></path>
                  <path d="M7.38 12l5.74-9.94"></path>
                  <path d="M7.38 12l5.74 9.94"></path>
                  <path d="M3.95 17.94l11.47-5.94"></path>
                  <path d="M3.95 6.06l11.47 5.94"></path>
                </svg>
              </div>
              <p className="text-sm text-black">Engine</p>
              <p className="font-semibold">{car.specifications.engine}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-7h-2c0-1-.5-1.5-1-2h0z"></path>
                  <path d="M2 9v1c0 1.1.9 2 2 2h1"></path>
                  <path d="M16 19h2a2 2 0 002-2v-3"></path>
                </svg>
              </div>
              <p className="text-sm text-black">Mileage</p>
              <p className="font-semibold">{car.specifications.mileage.toLocaleString()} miles</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 11h.01"></path>
                  <path d="M11 15h.01"></path>
                  <path d="M16 16h.01"></path>
                  <path d="M2 9a4 4 0 014-4h12a4 4 0 014 4v6a4 4 0 01-4 4H6a4 4 0 01-4-4V9z"></path>
                </svg>
              </div>
              <p className="text-sm text-black">Fuel Type</p>
              <p className="font-semibold">{car.specifications.fuelType}</p>
            </div>
          </div>
        </div>

        {/* Payment options */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">How would you like to pay?</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <button className="px-6 py-3 border border-black rounded-md font-medium hover:bg-gray-100 bg-gray-50">Trade in</button>
            <button className="px-6 py-3 border border-black rounded-md font-medium hover:bg-gray-100">Cash</button>
            <button className="px-6 py-3 border border-black rounded-md font-medium hover:bg-gray-100">Finance</button>    
          </div>

          <div className="space-y-6">
            <div>
              <div className="bg-gray-50 border border-black p-3 rounded-md">
                <div className="flex items-center">
                  <div className="text-black mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    value={cashDeposit} 
                    onChange={handleCashDepositChange} 
                    className="flex-1 w-full bg-transparent border-none outline-none text-black placeholder-black"
                    placeholder="Cash Deposit"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 border border-black p-3 rounded-md">
                <div className="flex items-center">
                  <div className="text-black mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    value={monthlyPayment} 
                    onChange={handleMonthlyPaymentChange} 
                    className="flex-1 w-full bg-transparent border-none outline-none text-black placeholder-black"
                    placeholder="Monthly Payment"
                    disabled={!canInputMonthly}
                  />
                </div>
              </div>
            </div>
  
            <TermSlider termMonths={termMonths} setTermMonths={setTermMonths} />

            <div className="flex justify-center mt-8">
              <button className="px-8 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800">
                Get a Quote
              </button>
            </div>
          </div>
        </div>

        {/* Tabbed content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b border-black overflow-x-auto">
            <button 
              onClick={() => setActiveSection('features')} 
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeSection === 'features' ? 'text-red-600 border-b-2 border-red-600' : 'text-black'}`}
            >
              Features
            </button>
            <button 
              onClick={() => setActiveSection('equipment')} 
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeSection === 'equipment' ? 'text-red-600 border-b-2 border-red-600' : 'text-black'}`}
            >
              Standard Equipment
            </button>
            <button 
              onClick={() => setActiveSection('options')} 
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeSection === 'options' ? 'text-red-600 border-b-2 border-red-600' : 'text-black'}`}
            >
              Added Options
            </button>
            <button 
              onClick={() => setActiveSection('suspension')} 
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeSection === 'suspension' ? 'text-red-600 border-b-2 border-red-600' : 'text-black'}`}
            >
              Engine/Drivetrain/Suspension
            </button>
            <button 
              onClick={() => setActiveSection('finance')} 
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeSection === 'finance' ? 'text-red-600 border-b-2 border-red-600' : 'text-black'}`}
            >
              Finance Example
            </button>
          </div>

          <div className="p-6">
            {activeSection === 'features' && (
              <div>
                <h2 className="text-2xl font-bold mb-8">Features</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Drive Type:</div>
                    <div>{car.specifications.driveType || 'All Wheel Drive'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Steering Type:</div>
                    <div>{car.specifications.steeringType || 'Left Hand Drive (LHD)'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Exterior Colour:</div>
                    <div>{car.specifications.color}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Interior Colour:</div>
                    <div>{car.specifications.interiorColor || 'Red/Black'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Doors:</div>
                    <div>{car.specifications.doors || '4'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Seats:</div>
                    <div>{car.specifications.seats || '5'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Wheels:</div>
                    <div>{car.specifications.wheelSize || '22 Inch Ten Spoke'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Brake Calipers:</div>
                    <div>{car.specifications.brakeColor || 'Red'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">DRY WEIGHT:</div>
                    <div>{car.specifications.weight || '2410 KG'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">WHEELBASE:</div>
                    <div>{car.specifications.wheelbase || '2.995 M'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">MAXIMUM TORQUE:</div>
                    <div>{car.specifications.torque || '770 NM'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">MAXIMUM SPEED:</div>
                    <div>{car.specifications.topSpeed || '290 KM/H'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">0-100 KM/H:</div>
                    <div>{car.specifications.acceleration100 || 'APPROXIMATELY 4.0 S'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">0-60KM/H:</div>
                    <div>{car.specifications.acceleration60 || 'APPROXIMATELY 1.9 S'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Power (kW):</div>
                    <div>{car.specifications.powerKW || '404 kW'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Power (PS):</div>
                    <div>{car.specifications.powerPS || '549 PS'}</div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'equipment' && (
              <div>
                <h2 className="text-2xl font-bold mb-8">Standard Equipment</h2>
                
                <h3 className="text-xl font-bold mb-4">Driver Convenience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {car.standardEquipment && car.standardEquipment.map((item, index) => (
                    <div key={`equipment-${index}`} className="border-b border-black py-4 px-3">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'options' && (
              <div>
                <h2 className="text-2xl font-bold mb-8">Added Options</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {car.addedOptions && car.addedOptions.map((option, index) => (
                    <div key={`option-${index}`} className="border-b border-black py-4 px-3">
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            )}


            {activeSection === 'suspension' && (
              <div>
                <h2 className="text-2xl font-bold mb-8">Engine/Drivetrain/Suspension</h2>
                
                <div className="border-b border-black py-4 px-3">
                  Drive Performance Control
                </div>
                <div className="border-b border-black py-4 px-3">
                  Adaptive Suspension
                </div>
                <div className="border-b border-black py-4 px-3">
                  Bentley Dynamic Ride
                </div>
                <div className="border-b border-black py-4 px-3">
                  Torque Vectoring by Brake
                </div>
              </div>
            )}

            {activeSection === 'finance' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Representative Example</h2>
                
                <div className="space-y-0.5 mb-8">
                  <div className="flex justify-between items-center bg-red-600 bg-opacity-90 px-4 py-2 text-black">
                    <div>48 monthly payments of</div>
                    <div>£2,387.62</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-200 bg-opacity-90 px-4 py-2 text-black">
                    <div>Total Price</div>
                    <div>£{car.price.toLocaleString()}</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-600 bg-opacity-90 px-4 py-2 text-black">
                    <div>Cash deposit</div>
                    <div>£{(car.price * 0.2).toLocaleString()}</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-200 bg-opacity-90 px-4 py-2 text-black">
                    <div>Customer total deposit</div>
                    <div>£{(car.price * 0.2).toLocaleString()}</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-600 bg-opacity-90 px-4 py-2 text-black">
                    <div>Amount of credit</div>
                    <div>£{(car.price * 0.8).toLocaleString()}</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-200 bg-opacity-90 px-4 py-2 text-black">
                    <div>Optional final payment</div>
                    <div>£{Math.round(car.price * 0.35).toLocaleString()}</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-600 bg-opacity-90 px-4 py-2 text-black">
                    <div>Total amount payable</div>
                    <div>£{Math.round(car.price * 1.25).toLocaleString()}</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-200 bg-opacity-90 px-4 py-2 text-black">
                    <div>Duration of agreement</div>
                    <div>49 months</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-600 bg-opacity-90 px-4 py-2 text-black">
                    <div>Fixed interest rate</div>
                    <div>10.39% p.a.</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-200 bg-opacity-90 px-4 py-2 text-black">
                    <div>APR (%)</div>
                    <div>10.9% APR</div>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">Terms and Conditions</h3>
                <p className="text-sm mb-8">
                  We are a credit broker, not a lender or an independent financial advisor. We can introduce you to a limited number of lenders & their finance products which may have different interest rates & charges. We may advise you on the products, subject to your personal circumstances, though you are not obliged to take our advice or recommendation. We do not charge you a fee. Whichever lender we introduce you to, we will receive commission from them (either a fixed fee or a fixed percentage of the amount you borrow). The lenders we work with could pay us commission at different rates. The amount of commission we receive does not affect the amount that you pay under your credit agreement. Finance subject to status. Guarantees may be required.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### Rent Page Implementation

```typescript
// src/app/rent/page.tsx - Server Component
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
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Parse JSON strings to objects
  const parsedCars = cars.map(car => ({
    ...car,
    specifications: typeof car.specifications === 'string' 
      ? JSON.parse(car.specifications as string) 
      : car.specifications,
    features: typeof car.features === 'string' 
      ? JSON.parse(car.features as string) 
      : car.features
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
                  
                  {/* Specifications grid */}
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
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <div>
                        <div className="text-xs text-black">Engine</div>
                        <div className="text-sm font-medium text-black">{car.specifications.engine}</div>
                      </div>
                    </div>
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

### Authentication Implementation

#### Login Form Component

```typescript
// src/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md bg-black py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Create a new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### Register Form Component

```typescript
// src/components/auth/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setIsLoading(true);

    try {
      await register(name, email, password);
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create a new account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Full Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">
                Confirm Password
              </label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md bg-black py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70"
              >
                {isLoading ? 'Creating account...' : 'Register'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### TermSlider Component

```typescript
// src/components/ui/TermSlider.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

const monthOptions = [12, 24, 36, 48, 60];

interface TermSliderProps {
  termMonths: number;
  setTermMonths: (months: number) => void;
}

const TermSlider: React.FC<TermSliderProps> = ({ termMonths, setTermMonths }) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getSliderPosition = useCallback((): number => {
    const index = monthOptions.indexOf(termMonths);
    return index !== -1 ? (index / (monthOptions.length - 1)) * 100 : 0;
  }, [termMonths]);

  const getClosestMonth = useCallback((position: number): number => {
    const index = Math.round((position / 100) * (monthOptions.length - 1));
    return monthOptions[Math.max(0, Math.min(monthOptions.length - 1, index))];
  }, []);

  const calculatePositionFromEvent = useCallback((clientX: number): number => {
    if (!sliderRef.current) return 0;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const position = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(0, Math.min(100, position));
  }, []);

  const handleTermChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(e.target.value);
    const newTerm = getClosestMonth(value);
    setTermMonths(newTerm);
  }, [getClosestMonth, setTermMonths]);

  const handleSliderMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    // For touch events, handle the initial position
    if ('touches' in e) {
      const position = calculatePositionFromEvent(e.touches[0].clientX);
      const newTerm = getClosestMonth(position);
      setTermMonths(newTerm);
    } else {
      const position = calculatePositionFromEvent(e.clientX);
      const newTerm = getClosestMonth(position);
      setTermMonths(newTerm);
    }
    
    // Set focus to the input for keyboard accessibility
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [calculatePositionFromEvent, getClosestMonth, setTermMonths]);

  const handleSliderMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    let clientX: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const position = calculatePositionFromEvent(clientX);
    const newTerm = getClosestMonth(position);
    setTermMonths(newTerm);
  }, [isDragging, calculatePositionFromEvent, getClosestMonth, setTermMonths]);

  useEffect(() => {
    // Add event listeners for mouse/touch movements while dragging
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleSliderMouseUp);
    document.addEventListener('touchend', handleSliderMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('mouseup', handleSliderMouseUp);
      document.removeEventListener('touchend', handleSliderMouseUp);
    };
  }, [isDragging, handleMouseMove, handleSliderMouseUp]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="font-medium text-black">Term:</div>
        <div className="font-semibold text-black">{termMonths} Months</div>
      </div>

      <div 
        ref={sliderRef}
        className="relative w-full h-32 cursor-pointer select-none px-4"
        onMouseDown={handleSliderMouseDown}
        onTouchStart={handleSliderMouseDown}
      >
        {/* Track background - entire area is clickable */}
        <div className="absolute w-full h-12 top-0 bg-transparent left-0"></div>
        
        {/* Visible track - positioned at top */}
        <div className="absolute w-full h-1.5 bg-gray-400 rounded-full top-6 left-0"></div>

        {/* Month markers and labels - markers on track, labels below */}
        {monthOptions.map((month, index) => {
          const isFirst = index === 0;
          const isLast = index === monthOptions.length - 1;
          
          // Adjust positions for first and last
          let position = (index / (monthOptions.length - 1)) * 100;
          if (isFirst) {
            position = 2; // Move first indicator to 2% (from left edge)
          } else if (isLast) {
            position = 98; // Move last indicator to 98% (from left edge)
          }
          
          return (
            <div
              key={index}
              className="absolute"
              style={{ left: `${position}%` }}
            >
              {/* Marker line - positioned right on the track */}
              <div className="w-0.5 h-3 bg-gray-400 absolute top-6"></div>
              
              {/* Month label - positioned well below the track and markers */}
              <div 
                className="text-sm font-medium absolute top-20 text-black whitespace-nowrap"
                style={{ 
                  transform: isFirst ? 'translateX(0)' : 
                             isLast ? 'translateX(-100%)' : 
                             'translateX(-50%)',
                }}
              >
                {month}
              </div>
              
              {/* Clickable area for each month */}
              <button
                className="absolute w-12 h-12 opacity-0 top-2"
                style={{ transform: 'translateX(-50%)' }}
                onClick={() => setTermMonths(month)}
                aria-label={`Set term to ${month} months`}
              />
            </div>
          );
        })}

        {/* Slider handle with larger touch target - positioned on the track */}
        <div
          className={`absolute w-12 h-12 flex items-center justify-center top-6 -translate-x-1/2 pointer-events-none ${
            isDragging ? 'scale-110' : ''
          }`}
          style={{ 
            left: `${
              termMonths === 12 ? 2 : 
              termMonths === 60 ? 98 :
              getSliderPosition()
            }%` 
          }}
        >
          <div className="w-7 h-7 bg-red-600 rounded-full shadow-md transition-all"></div>
        </div>

        {/* Hidden input for accessibility */}
        <input
          ref={inputRef}
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={getSliderPosition()}
          onChange={handleTermChange}
          className="absolute opacity-0 w-full left-0"
          aria-label="Select term in months"
        />
      </div>
    </div>
  );
};

export default TermSlider;
```

## Recommended Data Fetching Strategy

For the Euro Motors platform, we recommend a hybrid approach that combines:

### 1. Server Components with Direct Prisma Queries

Use server components for pages that primarily display data without substantial user interaction:

```typescript
// src/app/buy/page.tsx - Server Component
import { prisma } from '@/lib/prisma';

export default async function BuyPage() {
  // Fetch data directly from the database
  const cars = await prisma.buyCar.findMany({
    where: { isAvailable: true },
    include: { images: true }
  });
  
  // Parse and return
  // ...
}
```

**Benefits**:
- Better SEO (server-rendered content)
- Faster initial page load
- Direct database access without API overhead
- No additional client-side fetching

**Best for**:
- Listing pages (buy, rent)
- Static content
- SEO-critical pages

### 2. API Routes for Client Components

Use API routes for pages with complex interactivity:

```typescript
// src/app/api/cars/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Fetch car from database
  // ...
}

// Client component
const [car, setCar] = useState(null);

useEffect(() => {
  fetch(`/api/cars/${carId}`)
    .then(response => response.json())
    .then(data => setCar(data));
}, [carId]);
```

**Benefits**:
- Supports client-side state
- Enables interactive features
- Separates data fetching from UI components

**Best for**:
- Detail pages with interactive elements
- Forms and user input
- Admin interfaces
- Pages that need to react to user actions

### 3. Singleton Pattern for Prisma Client

To prevent multiple database connections, use a singleton pattern:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 4. TypeScript Type Safety

Ensure proper typing for database models and JSON parsing:

```typescript
// Parse JSON fields consistently
const parsedCar = {
  ...car,
  specifications: typeof car.specifications === 'string' 
    ? JSON.parse(car.specifications as string) 
    : car.specifications,
  // ...other fields
};
```

## Next Steps

Now that the core components and database integration are implemented, the next phases of development should focus on:

1. **Admin Dashboard Implementation**:
   - Complete car management interface
   - User management
   - Order and rental tracking
   - Trade-in approval system

2. **Authentication Enhancements**:
   - Implement JWT token refresh
   - Add role-based authorization
   - Add password reset functionality

3. **Payment Integration**:
   - Implement Stripe checkout
   - Manage split payments for rentals
   - Handle deposits and refunds

4. **Quote System**:
   - Implement quote generation
   - Email notifications
   - Quote management in admin dashboard

5. **Trade-In System**:
   - Complete the valuation engine
   - Image upload for trade-in vehicles
   - Trade-in approval workflow

## Conclusion

The improved Euro Motors implementation provides a solid foundation with:

1. A robust database schema and proper TypeScript interfaces
2. Efficient data fetching strategies (server components + API routes)
3. Interactive components (slideshows, forms, term slider)
4. Proper error handling and user feedback
5. Enhanced seed script with multiple test cars

This architecture will scale well as more features are added, with the hybrid approach optimizing for both performance and interactivity.
