// src/components/ui/CarSlideshow.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface CarSlideshowProps {
  carId: string;
  make: string;
  model: string;
  imageUrls?: string[];
}

export default function CarSlideshow({ carId, make, model, imageUrls }: CarSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  
  // No matter what format the carId is in, we need the number
  const carNumber = carId.replace(/\D/g, '') || '1';
  
  // If no imageUrls provided, use convention-based paths
  // Removed duplicate declaration of images

  const handleNextClick = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevClick = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  const normalizeUrl = (url: string) => url.startsWith('/') ? url : `/${url}`;

  const images = imageUrls
    ? imageUrls.map(normalizeUrl)
    : Array.from({ length: 11 }, (_, i) => `/car${carNumber}/pov${i + 1}.jpg`);
  
  console.log('Images:', images);
  


  return (
    <div className="relative h-64 w-full overflow-hidden">
      <Image
        src={images[currentIndex]}
        alt={`${make} ${model}`}
        width={800}
        height={600}
        className="object-cover"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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