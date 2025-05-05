'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CarSlideshowProps {
  carId: string;
  make: string;
  model: string;
}

export default function CarSlideshow({ carId, make, model }: CarSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  // No matter what format the carId is in, we need the number
  const carNumber = carId.replace(/\D/g, '');
  
  // Create a direct path to the image
  const imagePath = `/car${carNumber}/pov${currentIndex + 1}.jpg`;

  const handleNextClick = () => {
    setCurrentIndex((prev) => (prev + 1) % 11);
  };

  const handlePrevClick = () => {
    setCurrentIndex((prev) => (prev - 1 + 11) % 11);
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
        src={imagePath}
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
        {currentIndex + 1} / 11
      </div>
    </div>
  );
}
