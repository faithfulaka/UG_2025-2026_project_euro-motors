// src/components/ui/FeaturedCars.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface FeaturedCar {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  description: string;
  images: { url: string; isMain: boolean }[];
}

export default function FeaturedCars() {
  const [cars, setCars] = useState<FeaturedCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cars')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setCars(data.data.slice(0, 3)); // Show up to 3 featured cars
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Featured Vehicles</h2>
            <p className="text-gray-500">Discover our handpicked luxury selection</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-56 mb-4"></div>
                <div className="bg-gray-200 h-5 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (cars.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Featured Vehicles</h2>
          <p className="text-gray-500">Discover our handpicked luxury selection</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cars.map((car) => {
            const mainImage = car.images?.find(img => img.isMain) || car.images?.[0];
            return (
              <Link key={car.id} href={`/buy/${car.id}`} className="group">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-red-200 transition">
                  <div className="relative h-56 bg-gray-100 overflow-hidden">
                    {mainImage ? (
                      <Image
                        src={mainImage.url}
                        alt={`${car.make} ${car.model}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{car.year} {car.make} {car.model}</h3>
                    <p className="text-red-600 font-bold text-xl mb-2">£{car.price.toLocaleString()}</p>
                    <p className="text-gray-500 text-sm line-clamp-2">{car.description}</p>
                    <div className="mt-4 flex items-center text-red-600 text-sm font-medium group-hover:gap-2 transition-all">
                      View Details
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/buy"
            className="inline-block border-2 border-red-600 text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition"
          >
            View All Vehicles
          </Link>
        </div>
      </div>
    </section>
  );
}
