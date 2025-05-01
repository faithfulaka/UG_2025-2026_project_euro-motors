'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

// Interfaces are recommended for type safety and code completion
interface CarSlideshowProps {
  carId: string;
  make: string;
  model: string;
}

export default function CarSlideshow({ carId, make, model }: CarSlideshowProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    // Extract the number from the carID (e.g., "car1" -> "1", "rental2" -> "2")
    const carNumber = carId.replace(/\D/g, '');
    
    if (!carNumber) {
      console.error('Invalid car ID format');
      setLoading(false);
      setImageError(true);
      return;
    }
    
    // Create an array of image paths for this car
    const carImages = Array.from({ length: 11 }, (_, i) => 
      `/car${carNumber}/pov${i + 1}.jpg`
    );
    
    setImages(carImages);
    setLoading(false);
  }, [carId]);

  // Next image function
  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Previous image function
  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <div className="relative h-64 bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (imageError || images.length === 0) {
    return (
      <div className="relative h-64 bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-600">Image not available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-64 group">
      <Image
        src={images[currentIndex]}
        alt={`${make} ${model}`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        priority={currentIndex === 0}
        onError={() => setImageError(true)}
      />
      
      {/* Navigation arrows */}
      <button 
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={prevImage}
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      <button 
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={nextImage}
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