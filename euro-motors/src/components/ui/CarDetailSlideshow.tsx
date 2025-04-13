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