# Euro Motors Luxury Car Dealership - Implementation Part 5

## More Page Implementations and Component Refinements

### 1. Project Structure Update

The project structure has been updated to better organize components and features:

```
euro-motors/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── logout/
│   │   │   │   ├── me/
│   │   │   │   └── register/
│   │   │   ├── cars/
│   │   │   ├── payments/
│   │   │   ├── rentals/
│   │   │   └── trade-in/
│   │   ├── buy/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx    # Car detail page
│   │   │   ├── checkout/
│   │   │   └── page.tsx        # Buy listing page
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── register/
│   │   ├── rent/
│   │   │   ├── [id]/
│   │   │   ├── checkout/
│   │   │   └── page.tsx        # Rent listing page
│   │   ├── trade-in/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Homepage
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── cars/
│   │   │   ├── CarCard.tsx
│   │   │   ├── CarDetails.tsx
│   │   │   ├── CarFilters.tsx
│   │   │   └── CarList.tsx
│   │   ├── layout/
│   │   │   ├── Footer.tsx     # Footer component
│   │   │   ├── Navbar.tsx     # Navigation bar
│   │   │   └── Sidebar.tsx    # Sidebar component
│   │   ├── providers/
│   │   │   └── SessionProvider.tsx
│   │   ├── rental/
│   │   │   ├── RentalCalendar.tsx
│   │   │   ├── RentalForm.tsx
│   │   │   └── SplitPaymentForm.tsx
│   │   ├── trade-in/
│   │   │   ├── TradeInForm.tsx
│   │   │   ├── TradeInModal.tsx
│   │   │   └── TradeInStatus.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── CarDetailSlideshow.tsx  # Car slideshow for detail page
│   │       ├── CarSlideshow.tsx        # Car slideshow for listings
│   │       ├── Gallery.tsx             # Gallery component
│   │       ├── HomeSlideshow.tsx       # Homepage slideshow
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Pagination.tsx
│   │       └── TermSlider.tsx          # Custom term slider component
│   ├── context/
│   ├── lib/
│   ├── models/
│   └── styles/
├── public/
├── prisma/
└── various config files (package.json, tsconfig.json, etc.)
```

### 2. New TermSlider Component

A custom TermSlider component has been created to provide an enhanced user experience for selecting finance terms. This component includes:

```typescript
// components/ui/TermSlider.tsx
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

The TermSlider component features:

- Interactive, draggable slider for selecting finance terms
- Support for specific month increments (12, 24, 36, 48, 60 months)
- Proper touch and mouse event handling for maximum compatibility
- Accessible design with proper ARIA labels and keyboard navigation
- Visual feedback during interaction (scaling, cursor changes)
- Performance optimized with useCallback for memoized functions
- TypeScript integration for type safety

### 3. Updated Rent Page

The Rent page has been updated to match the structure of the Buy page, displaying rental cars with their specifications and rental rates:

```typescript
'use client';

import Link from 'next/link';
import CarSlideshow from '@/components/ui/CarSlideshow';

export default function RentPage() {
  // Using the same mock cars as the buy page, but with rental rates added
  const mockCars = [
    {
      id: '1',
      make: 'Bentley',
      model: 'Bentayga V8',
      trim: 'BLACK EDITION',
      year: 2022,
      isNew: true,
      color: 'Pearl White',
      mileage: 0,
      hourlyRate: 150,
      dailyRate: 1500,
      weeklyRate: 9000,
      bodyType: 'SUV',
      transmission: 'Automatic',
      horsePower: 542,
      engine: '4.0L V8 Biturbo',
      fuelType: 'Petrol'
    },
    {
      id: '2',
      make: 'Rolls Royce',
      model: 'Cullinan V12',
      trim: 'BLACK BADGE',
      year: 2022,
      isNew: true,
      color: 'Dark Grey',
      mileage: 0,
      hourlyRate: 200,
      dailyRate: 2000,
      weeklyRate: 12000,
      bodyType: 'SUV',
      transmission: 'Automatic',
      horsePower: 591,
      engine: '6.75L V12',
      fuelType: 'Petrol'
    },
    {
      id: '3',
      make: 'Bentley',
      model: 'Continental GT V8',
      trim: 'Continental GT V8',
      year: 2022,
      isNew: true,
      color: 'Blue',
      mileage: 0,
      hourlyRate: 160,
      dailyRate: 1600,
      weeklyRate: 9600,
      bodyType: 'Coupe',
      transmission: 'Automatic',
      horsePower: 542,
      engine: '4.0L V8 Twin-Turbo',
      fuelType: 'Petrol'
    }
  ];

  return (
    <div className="bg-white">
      <div className="py-12 bg-white pt-20 pb-36">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-black">Luxury Cars For Rent</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCars.map((car) => (
              <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                {/* CarSlideshow with simplified props */}
                <CarSlideshow 
                  carId={car.id} 
                  make={car.make} 
                  model={car.model} 
                />
                
                <div className="p-4 bg-white">
                  <h2 className="text-xl font-semibold mb-2 text-black">{car.make} {car.model}</h2>
                  <p className="text-gray-600 text-sm mb-2">{car.trim}</p>
                  <div className="flex justify-between mb-4">
                    <span className="text-black">{car.year} {car.isNew ? '(Brand new)' : ''}</span>
                    <span className="text-black">{car.mileage > 0 ? `${car.mileage.toLocaleString()} miles` : 'New'}</span>
                  </div>
                  
                  {/* Specifications using icon layout, same as buy page */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <div>
                        <div className="text-xs text-black">Body Type</div>
                        <div className="text-sm font-medium text-black">{car.bodyType}</div>
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
                        <div className="text-sm font-medium text-black">{car.transmission}</div>
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
                        <div className="text-sm font-medium text-black">{car.horsePower}hp</div>
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
                        <div className="text-sm font-medium text-black">{car.engine}</div>
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
                        <div className="text-sm font-medium text-black">{car.color}</div>
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
                        <div className="text-sm font-medium text-black">{car.fuelType}</div>
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

### 4. Enhanced Car Details Page

The car details page has been completely redesigned to include the CarDetailSlideshow component, structured specifications, and interactive finance calculators. The page is divided into several sections:

1. **Car Slideshow and Basic Information**
   - Features a full-height slideshow of car images
   - Displays car make, model, year, and price
   - Includes location information

2. **Quick Specifications**
   - Body Type, Transmission, Horse Power, Engine, Mileage, Fuel Type

3. **Payment Options**
   - Cash, Finance, and Trade-in options
   - Interactive finance calculator with cash deposit and monthly payment inputs
   - Term and mileage sliders

4. **Tabbed Content**
   - Features: Detailed car specifications
   - Standard Equipment: Driver convenience features
   - Added Options: Additional factory-installed features
   - Engine/Drivetrain/Suspension: Technical details
   - Finance Example: Detailed payment breakdown

The car details page also includes user input validation:
- Cash deposit and monthly payment fields accept only numeric inputs
- Monthly payment field is only enabled after cash deposit is entered
- Input fields display appropriate icons

The car details page has been enhanced with TypeScript integration and improved UI/UX features:

```typescript
'use client';

import { useState, useEffect, JSX } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CarDetailSlideshow from '@/components/ui/CarDetailSlideshow';
import TermSlider from '@/components/ui/TermSlider';


interface Car {
  id: string;
  make: string;
  model: string;
  trim?: string;
  year: number;
  isNew: boolean;
  color: string;
  interiorColor: string;
  mileage: number;
  fuelType: string;
  transmission: string;
  price: number;
  engine: string;
  horsePower: number;
  torque: string;
  topSpeed: string;
  acceleration100: string;
  acceleration60?: string;
  bodyType: string;
  driveType: string;
  seats: number;
  doors: number;
  wheelSize: string;
  brakeColor: string;
  weight: string;
  wheelbase: string;
  powerKW: string;
  powerPS: string;
  steeringType?: string;
  standardEquipment: string[];
  addedOptions: string[];
  mainImage: string;
  features: {
    interior: string[];
    exterior: string[];
    safety: string[];
  };
  description: string;
}

export default function CarDetailsPage(): JSX.Element {
  const params = useParams();
  const carId = params?.id as string;
  
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showTradeInModal, setShowTradeInModal] = useState<boolean>(false);
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
      // In a real app, you would fetch data from API
      // fetchCarDetails();
      
      // For demo purposes, use mock data
      const mockCar = getMockCarById(carId);
      if (mockCar) {
        setCar(mockCar);
        setLoading(false);
      } else {
        setError('Car not found');
        setLoading(false);
      }
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
            />
          </div>

          {/* Car basic information */}
          <div className="p-6 border-b border-black">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold">{car.make} {car.model}</h1>
                <p className="text-lg text-black mt-1">Model: {car.trim || car.model}</p>
                <p className="text-lg text-black">Year: {car.year} {car.isNew ? '(Brand new)' : ''}</p>
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
              <p className="font-semibold">{car.bodyType}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                  <path d="M7 12h10"></path>
                </svg>
              </div>
              <p className="text-sm text-black">Transmission</p>
              <p className="font-semibold">{car.transmission}</p>
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
              <p className="font-semibold">{car.horsePower}hp</p>
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
              <p className="font-semibold">{car.engine}</p>
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
              <p className="font-semibold">{car.mileage.toLocaleString()} miles</p>
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
              <p className="font-semibold">{car.fuelType}</p>
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
                    <div>{car.driveType || 'All Wheel Drive'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Steering Type:</div>
                    <div>{car.steeringType || 'Left Hand Drive (LHD)'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Exterior Colour:</div>
                    <div>{car.color}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Interior Colour:</div>
                    <div>{car.interiorColor || 'Red/Black'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Doors:</div>
                    <div>{car.doors || '4'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Seats:</div>
                    <div>{car.seats || '5'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Wheels:</div>
                    <div>{car.wheelSize || '22 Inch Ten Spoke'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Brake Calipers:</div>
                    <div>{car.brakeColor || 'Red'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">DRY WEIGHT:</div>
                    <div>{car.weight || '2410 KG'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">WHEELBASE:</div>
                    <div>{car.wheelbase || '2.995 M'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">MAXIMUM TORQUE:</div>
                    <div>{car.torque || '770 NM'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">MAXIMUM SPEED:</div>
                    <div>{car.topSpeed || '290 KM/H'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">0-100 KM/H:</div>
                    <div>{car.acceleration100 || 'APPROXIMATELY 4.0 S'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">0-60KM/H:</div>
                    <div>{car.acceleration60 || 'APPROXIMATELY 1.9 S'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Power (kW):</div>
                    <div>{car.powerKW || '404 kW'}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Power (PS):</div>
                    <div>{car.powerPS || '549 PS'}</div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'equipment' && (
              <div>
                <h2 className="text-2xl font-bold mb-8">Standard Equipment</h2>
                
                <h3 className="text-xl font-bold mb-4">Driver Convenience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-b border-black py-4 px-3">
                    Engine start/stop button
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Bentley Online services
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Bentley Teleservices
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Brake force display
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Digital Radio
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Oil level indicator
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Bentley Rear Entertainment
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    On board diagnostics
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Temperature Display
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Hands Free Tailgate
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'options' && (
              <div>
                <h2 className="text-2xl font-bold mb-8">Added Options</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-b border-black py-4 px-3">
                    Touring Specification
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Embroidered Bentley Emblems
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Bentley Dynamic Ride
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Gloss Black Matrix Style Grille to Lower Bumper Apertures
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Five Seat Comfort Specification
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Heated, Acoustic, IR Front Screen
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Sports Exhaust
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Jewel Fuel Filler Cap
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Naim For Bentley
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Heated, Duo Tone, 3 Spoke, Hide Trimmed Steering Wheel
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'suspension' && (
              <div>
                <h2 className="text-2xl font-bold mb-8">Engine/Drivetrain/Suspension</h2>
                
                <div className="border-b border-black py-4 px-3">
                  Drive Performance Control
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
                    <div>£169,990.00</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-600 bg-opacity-90 px-4 py-2 text-black">
                    <div>Cash deposit</div>
                    <div>£34,824.10</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-200 bg-opacity-90 px-4 py-2 text-black">
                    <div>Customer total deposit</div>
                    <div>£34,824.10</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-600 bg-opacity-90 px-4 py-2 text-black">
                    <div>Amount of credit</div>
                    <div>£135,165.90</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-200 bg-opacity-90 px-4 py-2 text-black">
                    <div>Optional final payment</div>
                    <div>£63,641.00</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-600 bg-opacity-90 px-4 py-2 text-black">
                    <div>Total amount payable</div>
                    <div>£213,080.86</div>
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

// Mock data function
function getMockCarById(id: string): Car | null {
  const mockCars: Car[] = [
    {
      id: '1',
      make: 'Bentley',
      model: 'Bentayga V8',
      trim: 'BLACK EDITION',
      year: 2022,
      isNew: true,
      color: 'Pearl White',
      interiorColor: 'Red/Black',
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      price: 169990,
      engine: '6.0 L V8 Biturbo',
      horsePower: 542,
      torque: '770 NM',
      topSpeed: '290 KM/H',
      acceleration100: 'APPROXIMATELY 4.0 S',
      acceleration60: 'APPROXIMATELY 1.9 S',
      bodyType: 'SUV',
      driveType: 'All Wheel Drive',
      seats: 5,
      doors: 4,
      wheelSize: '22 Inch Ten Spoke',
      brakeColor: 'Red',
      weight: '2410 KG',
      wheelbase: '2.995 M',
      powerKW: '404 kW',
      powerPS: '549 PS',
      standardEquipment: [
        'Engine start/stop button',
        'Bentley Online services',
        'Bentley Teleservices',
        'Brake force display',
        'Digital Radio',
        'Oil level indicator',
        'Bentley Rear Entertainment',
        'On board diagnostics',
        'Temperature Display',
        'Hands Free Tailgate',
      ],
      addedOptions: [
        'Touring Specification',
        'Bentley Dynamic Ride',
        'Five Seat Comfort Specification',
        'Sports Exhaust',
        'Naim For Bentley',
        'Embroidered Bentley Emblems',
        'Heated, Acoustic, IR Front Screen',
        'Jewel Fuel Filler Cap',
        'Heated, Duo Tone, 3 Spoke, Hide Trimmed Steering Wheel',
        'Deep Pile Overmats to Front and Rear',
      ],
      mainImage: '/images/gallery/component5.jpg',
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control'],
      },
      description:
        'The Bentley Bentayga V8 BLACK EDITION offers an unparalleled luxury SUV experience with its powerful 6.0L V8 Biturbo engine, delivering 542 horsepower and a top speed of 290 km/h. This brand new 2022 model features pearl white exterior with a striking red/black interior and comes with premium options including the Touring Specification and Naim audio system.',
    },
    {
      id: '3',
      make: 'Bentley',
      model: 'Continental GT V8',
      trim: 'Continental GT V8',
      year: 2022,
      isNew: true,
      color: 'Blue',
      interiorColor: 'Cream',
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      price: 175000,
      engine: '4.0L V8 Twin-Turbo',
      horsePower: 542,
      torque: '770 NM',
      topSpeed: '318 KM/H',
      acceleration100: 'APPROXIMATELY 3.9 S',
      bodyType: 'Coupe',
      driveType: 'All Wheel Drive',
      seats: 4,
      doors: 2,
      wheelSize: '21 Inch Five-Spoke',
      brakeColor: 'Red',
      weight: '2165 KG',
      wheelbase: '2.851 M',
      powerKW: '404 kW',
      powerPS: '542 PS',
      standardEquipment: [
        'Engine start/stop button',
        'Bentley Online services',
        'Bentley Teleservices',
        'Brake force display',
        'Digital Radio',
        'Oil level indicator',
        'Bentley Rear Entertainment',
        'On board diagnostics',
        'Temperature Display',
        'Adaptive Cruise Control',
      ],
      addedOptions: [
        'Touring Specification',
        'Bentley Dynamic Ride',
        'Sports Exhaust',
        'Naim For Bentley',
        'Rotating Display',
        'Mood Lighting',
        'City Specification',
        'Front Seat Comfort Specification',
        'Contrast Stitching',
        'Deep Pile Overmats',
      ],
      mainImage: '/images/gallery/component6.jpg',
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control'],
      },
      description:
        'The Bentley Continental GT V8 is the perfect grand tourer, combining breathtaking performance with exquisite luxury and cutting-edge technology. This 2022 model features a stunning blue exterior finish and a cream leather interior, delivering an unmatched driving experience with its powerful 4.0L V8 Twin-Turbo engine and sophisticated all-wheel drive system.',
    },
  ];

  return mockCars.find((car) => car.id === id) || null;
}




## UI/UX Improvements

Several UI/UX improvements have been implemented:

1. **Color Scheme**:
   - Black text for readability
   - Red accents for brand identity
   - White backgrounds for a clean, luxury feel
   - Changed gray borders to black for better contrast

2. **Typography**:
   - Consistent font sizes and weights
   - Proper spacing and alignment

3. **Responsive Design**:
   - Grid layouts that adapt to different screen sizes
   - Mobile-friendly components

4. **Interactive Elements**:
   - Enhanced TermSlider with improved dragging and interaction
   - Form validation for finance calculators
   - Tabbed interfaces for detailed information

5. **Visual Hierarchy**:
   - Clear section headings
   - Consistent card layouts
   - Proper use of white space

## Next Steps

The following items remain to be addressed:

1. **Authentication Integration**:
   - Connect login and register forms to the backend
   - Implement protected routes

2. **API Integration**:
   - Replace mock data with actual API calls
   - Implement error handling for API requests

3. **Payment Processing**:
   - Integrate payment gateway for purchases and rentals
   - Implement secure checkout process

4. **User Dashboard**:
   - Create user profile page
   - Implement order history and tracking

5. **Admin Panel**:
   - Develop car management interface
   - Create order processing workflows

## Conclusion

The Euro Motors luxury car dealership website has been significantly enhanced with improved UI/UX, consistent styling, and interactive components. The car listing pages now feature a consistent design language, with the Buy and Rent pages sharing the same layout but with content customized to their specific purposes.

The individual car detail pages have been completely redesigned to provide a comprehensive view of each vehicle, with detailed specifications, financing options, and high-quality image slideshows. The custom TermSlider component provides an enhanced user experience for selecting finance terms, with smooth dragging behavior and improved visual feedback.

The site's overall user experience has been improved with responsive design, interactive elements, and clear visual hierarchy. All components are now properly typed with TypeScript for better maintainability and type safety.
