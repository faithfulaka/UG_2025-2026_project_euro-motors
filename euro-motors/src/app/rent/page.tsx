'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CarSlideshow from '@/components/ui/CarSlideshow';

export default function RentPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // For demo purposes, using mock data
  const mockCars = [
    {
      id: '1',
      make: 'Ferrari',
      model: '488 GTB',
      year: 2022,
      color: 'Red',
      hourlyRate: 120,
      dailyRate: 1200,
      weeklyRate: 7000,
    },
    {
      id: '2',
      make: 'Lamborghini',
      model: 'Huracan',
      year: 2022,
      color: 'Blue',
      hourlyRate: 100,
      dailyRate: 1000,
      weeklyRate: 6000,
    },
    {
      id: '3',
      make: 'Rolls Royce',
      model: 'Ghost',
      year: 2023,
      color: 'Black',
      hourlyRate: 150,
      dailyRate: 1500,
      weeklyRate: 9000,
    }
  ];

  useEffect(() => {
    async function fetchCars() {
      setLoading(true);
      try {
        // In a real app, you would fetch data from API
        // const response = await fetch('/api/rentals');
        // const data = await response.json();
        // setCars(data);
        setCars(mockCars);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An error occurred while fetching rental cars');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCars();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Luxury Cars For Rent</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCars.map((car) => (
            <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
              {/* Replace static image with slideshow component */}
              <CarSlideshow carId={car.id} make={car.make} model={car.model} type="rent" />
              
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{car.make} {car.model}</h2>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">{car.year}</span>
                  <span className="text-gray-600">{car.color}</span>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hourly:</span>
                    <span>£{car.hourlyRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily:</span>
                    <span>£{car.dailyRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weekly:</span>
                    <span>£{car.weeklyRate}</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Link 
                    href={`/rent/${car.id}`}
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
  );
}