'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function BuyPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // For demo purposes, using mock data
  const mockCars = [
    {
      id: '1',
      make: 'Ferrari',
      model: 'SF90',
      year: 2023,
      color: 'Red',
      mileage: 1200,
      price: 450000,
      mainImage: '/images/gallery/component2.jpg'
    },
    {
      id: '2',
      make: 'Lamborghini',
      model: 'Aventador',
      year: 2022,
      color: 'Green',
      mileage: 2500,
      price: 380000,
      mainImage: '/images/gallery/component4.jpg'
    },
    {
      id: '3',
      make: 'Aston Martin',
      model: 'DBS Superleggera',
      year: 2023,
      color: 'Silver',
      mileage: 1800,
      price: 320000,
      mainImage: '/images/gallery/component6.jpg'
    }
  ];

  useEffect(() => {
    async function fetchCars() {
      setLoading(true);
      try {
        // In a real app, you would fetch data from API
        // const response = await fetch('/api/cars');
        // const data = await response.json();
        // setCars(data);
        setCars(mockCars);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An error occurred while fetching cars');
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
        <h1 className="text-3xl font-bold mb-8">Luxury Cars For Sale</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCars.map((car) => (
            <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
              <div className="relative h-64">
                <Image 
                  src={car.mainImage} 
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                  priority={car.id === '1'}
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{car.make} {car.model}</h2>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">{car.year}</span>
                  <span className="text-gray-600">{car.mileage.toLocaleString()} miles</span>
                </div>
                <div className="flex justify-between items-center">
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
      </div>
    </div>
  );
}