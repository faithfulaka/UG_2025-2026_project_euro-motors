# Euro Motors Luxury Car Dealership - Implementation Part 4

## Project Overview Recap

Euro Motors is a luxury car dealership website built with Next.js, TypeScript, and Tailwind CSS. The application includes features for both buying and renting luxury vehicles, with user authentication, car listings, detailed car pages, and trade-in functionality.

## Core Components Developed

### 1. CarSlideshow Component

This component displays a slideshow of car images with navigation controls and indicators. It's used in both the buy and rent listing pages.

```typescript
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CarSlideshowProps {
  carId: string;
  make: string;
  model: string;
  imageCount?: number;
}

export default function CarSlideshow({ carId, make, model, imageCount = 11 }: CarSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isManual, setIsManual] = useState(false);

  // Create image paths array - using the car folder structure:
  // public/car1/pov1.jpg through public/car1/pov11.jpg
  const imagePaths = Array.from({ length: imageCount }, (_, i) => 
    `/car${carId}/pov${i + 1}.jpg`
  );

  // Auto slide functionality with pause when clicking manually
  useEffect(() => {
    if (isManual) return; // Pause auto-slide when user manually navigates

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % imagePaths.length);
    }, 5000); // Auto-slide every 5 seconds

    return () => clearInterval(interval);
  }, [imagePaths.length, isManual]);

  // Functions to handle navigation
  const goToNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsManual(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imagePaths.length);
    setTimeout(() => setIsManual(false), 5000); // Resume auto-slide after 5 sec
  };

  const goToPrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsManual(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + imagePaths.length) % imagePaths.length);
    setTimeout(() => setIsManual(false), 5000); // Resume auto-slide after 5 sec
  };

  const goToSlide = (index: number) => {
    setIsManual(true);
    setCurrentIndex(index);
    setTimeout(() => setIsManual(false), 5000); // Resume auto-slide after 5 sec
  };

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-t-lg">
      {/* Slides */}
      <div className="h-full relative">
        {imagePaths.map((src, index) => (
          <div
            key={src}
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
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-transparent p-2 z-40 cursor-pointer"
        aria-label="Previous slide"
      >
        <div className="relative w-10 h-10">
          <Image src="/images/homeslide/Left.svg" alt="Previous" width={40} height={40} />
        </div>
      </button>

      <button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-transparent p-2 z-40 cursor-pointer"
        aria-label="Next slide"
      >
        <div className="relative w-10 h-10">
          <Image src="/images/homeslide/Right.svg" alt="Next" width={40} height={40} />
        </div>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-40">
        {imagePaths.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              currentIndex === index ? 'bg-red-600' : 'bg-transparent border border-red-600'
            } transition-all duration-300`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
}
```

### 2. CarDetailSlideshow Component

A variation of the CarSlideshow component specifically for the individual car detail pages, with a taller display area and optimized for filling the entire space.

```typescript
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CarDetailSlideshowProps {
  carId: string;
  make: string;
  model: string;
  imageCount?: number;
}

export default function CarDetailSlideshow({ carId, make, model, imageCount = 11 }: CarDetailSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isManual, setIsManual] = useState(false);

  // Create image paths array - using the car folder structure:
  // public/car1/pov1.jpg through public/car1/pov11.jpg
  const imagePaths = Array.from({ length: imageCount }, (_, i) => 
    `/car${carId}/pov${i + 1}.jpg`
  );

  // Auto slide functionality with pause when clicking manually
  useEffect(() => {
    if (isManual) return; // Pause auto-slide when user manually navigates

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % imagePaths.length);
    }, 5000); // Auto-slide every 5 seconds

    return () => clearInterval(interval);
  }, [imagePaths.length, isManual]);

  // Functions to handle navigation
  const goToNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsManual(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imagePaths.length);
    setTimeout(() => setIsManual(false), 5000); // Resume auto-slide after 5 sec
  };

  const goToPrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsManual(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + imagePaths.length) % imagePaths.length);
    setTimeout(() => setIsManual(false), 5000); // Resume auto-slide after 5 sec
  };

  const goToSlide = (index: number) => {
    setIsManual(true);
    setCurrentIndex(index);
    setTimeout(() => setIsManual(false), 5000); // Resume auto-slide after 5 sec
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Slides - making sure they fill both width and height */}
      <div className="h-full relative">
        {imagePaths.map((src, index) => (
          <div
            key={src}
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
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-transparent p-2 z-40 cursor-pointer"
        aria-label="Previous slide"
      >
        <div className="relative w-10 h-10">
          <Image src="/images/homeslide/Left.svg" alt="Previous" width={40} height={40} />
        </div>
      </button>

      <button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-transparent p-2 z-40 cursor-pointer"
        aria-label="Next slide"
      >
        <div className="relative w-10 h-10">
          <Image src="/images/homeslide/Right.svg" alt="Next" width={40} height={40} />
        </div>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-40">
        {imagePaths.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              currentIndex === index ? 'bg-red-600' : 'bg-transparent border border-red-600'
            } transition-all duration-300`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
}
```

### 3. Gallery Component

This component displays a grid of gallery images showcasing various luxury vehicles.

```typescript
import Image from 'next/image';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
}

interface GalleryProps {
  images?: GalleryImage[];
}

export default function Gallery({ images }: GalleryProps) {
  // Gallery images - defined within the component with default values
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
  
  // This ensures we display exactly 12 images in a 3x4 grid like the reference
  // Use provided images or default to the component's internal gallery images
  const displayImages = (images || galleryImages).slice(0, 12);
  
  return (
    <section className="w-full bg-white pt-20 pb-24">
      <div className="max-w-[1240px] mx-auto px-4">
        <h2 className="text-6xl font-semibold mb-6 text-black">GALLERY</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {displayImages.map((image) => (
          <div key={image.id} className="relative aspect-[3/2] overflow-hidden">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 hover:scale-110"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
```

## Main Pages Implementation

### 1. Updated Root Layout

The root layout has been updated to include the Gallery component at the bottom of all non-authentication pages:

```typescript
'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Gallery from '@/components/ui/Gallery';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't show navbar, gallery, or footer on login or registration pages
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} overflow-x-hidden`}>
        <div className="flex flex-col min-h-screen">
          {!isAuthPage && <Navbar />}
          <main className="flex-1 w-full max-w-[100vw] mx-auto overflow-x-hidden">
            {children}
          </main>
          {!isAuthPage && <Gallery />}
          {!isAuthPage && <Footer />}
        </div>
      </body>
    </html>
  );
}
```

### 2. Updated HomePage Component

The HomePage component has been simplified to use a single image for brand logos instead of individual brand names:

```typescript
import HomeSlideshow from '@/components/ui/HomeSlideshow';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div>
      {/* Hero Slideshow */}
      <HomeSlideshow />

      {/* Brand Logos - Single Image */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <Image 
                src="/images/brands.jpg" 
                alt="Luxury Car Brands" 
                width={2800} 
                height={300} 
                className="w-full object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

### 3. Updated Buy Page

The Buy page has been completely redesigned to use the CarSlideshow component and display car specifications in a consistent layout:

```typescript
'use client';

import Link from 'next/link';
import CarSlideshow from '@/components/ui/CarSlideshow';

export default function BuyPage() {
  // Updated with accurate car information and correct order
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
      price: 169990,
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
      price: 380000,
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
      price: 175000,
      bodyType: 'Coupe',
      transmission: 'Automatic',
      horsePower: 542,
      engine: '4.0L V8 Twin-Turbo',
      fuelType: 'Petrol'
    }
  ];

  return (
    <div className="bg-white">
      <div className="py-12 bg-white  pt-20 pb-36">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-black">Luxury Cars For Sale</h1>
          
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
