'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SlideData {
  id: number;
  image: string;
  title: string;
  description: string;
}

export default function HomeSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isManual, setIsManual] = useState(false);

  // Array of slide data
  const slides: SlideData[] = [
    {
      id: 1,
      image: '/images/homeslide/slide1.jpg',
      title: 'Euro Motors - Luxury Automobiles',
      description: 'Euro Motors is one of the leading luxury car dealers in Europe specializing in the most exclusive and desirable luxury cars for sale.',
    },
    {
      id: 2,
      image: '/images/homeslide/slide2.jpg',
      title: 'Exceptional Selection',
      description: "Discover our handpicked collection of the world's most prestigious luxury vehicles.",
    },
    {
      id: 3,
      image: '/images/homeslide/slide3.jpg',
      title: 'Unmatched Experience',
      description: 'Experience the pinnacle of automotive excellence with our premier selection of luxury vehicles.',
    },
  ];

  // Auto slide functionality with pause when clicking manually
  useEffect(() => {
    if (isManual) return; // Pause auto-slide when user manually navigates

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000); // Auto-slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length, isManual]);

  // Functions to handle navigation
  const goToNextSlide = () => {
    setIsManual(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    setTimeout(() => setIsManual(false), 5000); // Resume auto-slide after 5 sec
  };

  const goToPrevSlide = () => {
    setIsManual(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    setTimeout(() => setIsManual(false), 5000); // Resume auto-slide after 5 sec
  };

  const goToSlide = (index: number) => {
    setIsManual(true);
    setCurrentIndex(index);
    setTimeout(() => setIsManual(false), 5000); // Resume auto-slide after 5 sec
  };

  return (
    <div className="relative w-full min-h-[600px] overflow-hidden">
      {/* Slides */}
      <div className="h-full relative">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              index === currentIndex ? 'opacity-100 z-20' : 'opacity-0 z-10'
            }`}
             >
            <div className="relative w-full h-[600px]">
              <Image
                src={slide.image}
                alt={slide.title}
                width={1920}
                height={600}
                className="object-cover w-full h-full brightness-50"
                priority={slide.id === 1}
              />
            </div>


            {/* Text and Buttons - Left aligned and vertically centered */}
            <div className="absolute inset-0 bg-black bg-opacity-70 z-30 flex items-start h-full px-8 md:px-20 lg:px-36">
              <div className="max-w-xl mt-24 md:mt-36 lg:mt-44">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{slide.title}</h1>
                <p className="text-xl text-white mb-8">{slide.description}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/buy" className="bg-black text-white px-6 py-3 rounded text-center hover:bg-gray-900 transition duration-300">
                    VIEW STOCK
                  </Link>
                  <Link href="/rent" className="bg-black text-white px-6 py-3 rounded text-center hover:bg-gray-900 transition duration-300">
                    VIEW RENTALS
                  </Link>
                </div>
              </div>
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
        {slides.map((_, index) => (
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
