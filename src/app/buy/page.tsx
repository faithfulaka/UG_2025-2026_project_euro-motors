'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CarSlideshow from '@/components/ui/CarSlideshow';
import BuyCarFilter from '@/components/ui/BuyCarFilter';
import { BuyCar } from '@/types/cars';

interface FilterData {
  make?: string;
  model?: string;
  year?: string;
  minPrice?: number;
  maxPrice?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
}

export default function BuyPage() {
  const [cars, setCars] = useState<BuyCar[]>([]);
  const [filteredCars, setFilteredCars] = useState<BuyCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterData>({});

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, cars]);

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/buy/cars');
      const data = await response.json();
      
      if (data.success) {
        setCars(data.cars);
        setFilteredCars(data.cars);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...cars];

    // Apply make filter
    if (filters.make) {
      filtered = filtered.filter(car => car.make === filters.make);
    }

    // Apply model filter
    if (filters.model) {
      filtered = filtered.filter(car => car.model === filters.model);
    }

    // Apply year filter
    if (filters.year) {
      filtered = filtered.filter(car => car.year.toString() === filters.year);
    }

    // Apply price filters
    if (filters.minPrice) {
      filtered = filtered.filter(car => car.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(car => car.price <= filters.maxPrice!);
    }

    // Apply body type filter
    if (filters.bodyType) {
      filtered = filtered.filter(car => car.specifications.bodyType === filters.bodyType);
    }

    // Apply fuel type filter
    if (filters.fuelType) {
      filtered = filtered.filter(car => car.specifications.fuelType === filters.fuelType);
    }

    // Apply transmission filter
    if (filters.transmission) {
      filtered = filtered.filter(car => car.specifications.transmission === filters.transmission);
    }

    setFilteredCars(filtered);
  };

  const handleFilterChange = (newFilters: FilterData) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="py-12 bg-white pt-20 pb-36">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-black">Luxury Cars For Sale</h1>
          
          {/* Filter Component */}
          <BuyCarFilter onFilter={handleFilterChange} className="mb-8" />
          
          {/* Results Count */}
          <div className="mb-6 text-gray-600">
            Showing {filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'}
            {Object.keys(filters).length > 0 && ` (filtered from ${cars.length} total)`}
          </div>

          {/* Cars Grid */}
          {filteredCars.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No cars match your filters.</p>
              <button
                onClick={() => setFilters({})}
                className="mt-4 text-blue-600 hover:text-blue-700 underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                  <CarSlideshow
                    carId={car.id}
                    make={car.make}
                    model={car.model}
                    imageUrls={car.images.map((img: { url: string }) => img.url)}
                  />
                  <div className="p-4 bg-white">
                    <h2 className="text-xl font-semibold mb-2 text-black">{car.make} {car.model}</h2>
                    <p className="text-gray-600 text-sm mb-2">{car.trim}</p>
                    <div className="flex justify-between mb-4">
                      <span className="text-black">{car.year}</span>
                      <span className="text-black">{car.specifications.mileage > 0 ? `${car.specifications.mileage.toLocaleString()} miles` : 'New'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-black">
                          {/* SVG Body Type */}
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
                          {/* SVG Transmission */}
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
                          {/* SVG Horse Power */}
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
                          {/* SVG Engine */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <div>
                          <div className="text-xs text-black">Engine</div>
                          <div className="text-sm font-medium text-black">{car.specifications.engine}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-black">
                          {/* SVG Color */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <div>
                          <div className="text-xs text-black">Color</div>
                          <div className="text-sm font-medium text-black">{car.specifications.color}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-black">
                          {/* SVG Fuel Type */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <div>
                          <div className="text-xs text-black">Fuel Type</div>
                          <div className="text-sm font-medium text-black">{car.specifications.fuelType}</div>
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
          )}
        </div>
      </div>
    </div>
  );
}