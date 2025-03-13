// src/app/page.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  // Sample featured car data - in a real app, this would come from an API or database
  const featuredCar = {
    name: 'Ferrari SF90 Stradale',
    image: '/ferrari.jpg', // Placeholder - you'll need to add this image to your public folder
    description: 'Euro Motors is one of Europe\'s leading luxury car dealers specializing in the most exclusive and desirable luxury cars for sale.'
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="relative">
        <div className="h-[70vh] w-full relative">
          {/* This would be replaced with your actual image */}
          <div className="absolute inset-0 bg-gray-900/40 z-10" />
          <div className="absolute inset-0 z-0 bg-gray-800">
            {/* In a real app, use Image component with an actual image */}
            <div className="w-full h-full bg-gradient-to-r from-gray-900 to-gray-800" />
          </div>
          <div className="absolute inset-0 flex items-center z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-white">
              <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
                Luxury Automobiles
              </h1>
              <p className="mt-4 text-xl sm:text-2xl max-w-xl">
                Discover the most exclusive and desirable luxury cars for sale and rent
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/buy" 
                  className="bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-md font-medium text-lg transition-colors"
                >
                  View Stock
                </Link>
                <Link 
                  href="/rent" 
                  className="bg-white hover:bg-gray-100 text-gray-900 py-3 px-8 rounded-md font-medium text-lg transition-colors"
                >
                  View Rentals
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Car */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Euro Motors - Luxury Automobiles</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              {featuredCar.description}
            </p>
          </div>

          <div className="mt-16">
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-xl">
              <div className="relative h-80 sm:h-96">
                {/* Replace with actual image */}
                <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">Featured Image</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900">{featuredCar.name}</h3>
                <div className="mt-4 flex justify-between items-center">
                  <Link 
                    href="/buy" 
                    className="text-red-600 hover:text-red-800 font-