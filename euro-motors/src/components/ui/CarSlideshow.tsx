// src/components/ui/CarSlideshow.tsx
'use client';

import { useState, /*useEffect*/ } from 'react';
import Image from 'next/image';

interface CarSlideshowProps {
  carId: string;
  make: string;
  model: string;
  imageUrls?: string[];
}

export default function CarSlideshow({ carId, make, model, imageUrls }: CarSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Extract the number from the carID (e.g., "car1" -> "1")
  const carNumber = carId.replace(/\D/g, '');
  
  // If imageUrls are provided, use them; otherwise generate paths
  const images = imageUrls || Array.from({ length: 11 }, (_, i) => `/car${carNumber}/pov${i + 1}.jpg`);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="relative h-64 w-full overflow-hidden">
      {images.length > 0 && (
        <Image
          src={images[currentIndex]}
          alt={`${make} ${model}`}
          className="object-cover"
          fill
          priority
        />
      )}
      
      {/* Navigation buttons */}
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