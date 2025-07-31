// src/app/rent/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { RentalCar } from '@/types/cars';
import { useCar } from '@/context/CarContext';
import { useAuth } from '@/context/AuthContext';

export default function RentalCarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, addToRecentlyViewed } = useCar();
  const { user } = useAuth();
  
  const [car, setCar] = useState<RentalCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState<'HOURLY' | 'DAILY' | 'WEEKLY'>('DAILY');

  const carId = params.id as string;

  useEffect(() => {
    async function fetchCar() {
      if (!carId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/rentals/${carId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch car');
        }
        
        const carData = await response.json();
        setCar(carData);
        
        // Add to recently viewed
        addToRecentlyViewed(carId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load car');
      } finally {
        setLoading(false);
      }
    }

    fetchCar();
  }, [carId, addToRecentlyViewed]);

  const handleAddToCart = () => {
    if (!car || !startDate || !endDate) return;

    if (!user) {
      router.push('/login');
      return;
    }

    addToCart({
      type: 'rent',
      car,
      quantity: 1,
      rentalDates: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        duration
      }
    });

    alert('Added to cart!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Car Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The requested car could not be found.'}</p>
          <button
            onClick={() => router.push('/rent')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Rentals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="mb-4">
            <Image
              src={`/${car.images[selectedImage]?.url || 'car1/pov1.jpg'}`}
              alt={`${car.make} ${car.model}`}
              width={600}
              height={400}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {car.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`border-2 rounded ${
                  selectedImage === index ? 'border-blue-500' : 'border-gray-300'
                }`}
              >
                <Image
                  src={`/${image.url}`}
                  alt={`View ${index + 1}`}
                  width={100}
                  height={60}
                  className="w-full h-16 object-cover rounded"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {car.year} {car.make} {car.model}
          </h1>
          {car.trim && (
            <p className="text-xl text-gray-600 mb-4">{car.trim}</p>
          )}
          
          {/* Rental Rates */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Rental Rates</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-100 p-3 rounded">
                <div className="font-medium">Hourly</div>
                <div className="text-xl font-bold">£{car.hourlyRate.toLocaleString()}</div>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <div className="font-medium">Daily</div>
                <div className="text-xl font-bold">£{car.dailyRate.toLocaleString()}</div>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <div className="font-medium">Weekly</div>
                <div className="text-xl font-bold">£{car.weeklyRate.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Rental Form */}
          <div className="mb-6 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Book Rental</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Duration Type</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value as 'HOURLY' | 'DAILY' | 'WEEKLY')}
                className="w-full border rounded px-3 py-2"
              >
                <option value="HOURLY">Hourly</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!startDate || !endDate}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Add to Cart
            </button>
          </div>

          {/* Specifications */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Specifications</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><strong>Engine:</strong> {car.specifications.engine}</div>
              <div><strong>Power:</strong> {car.specifications.horsePower} hp</div>
              <div><strong>Transmission:</strong> {car.specifications.transmission}</div>
              <div><strong>Fuel Type:</strong> {car.specifications.fuelType}</div>
              <div><strong>Drive Type:</strong> {car.specifications.driveType}</div>
              <div><strong>Seats:</strong> {car.specifications.seats}</div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Features</h3>
            <div className="space-y-2">
              <div>
                <h4 className="font-medium">Interior:</h4>
                <p className="text-sm text-gray-600">{car.features.interior.join(', ')}</p>
              </div>
              <div>
                <h4 className="font-medium">Exterior:</h4>
                <p className="text-sm text-gray-600">{car.features.exterior.join(', ')}</p>
              </div>
              <div>
                <h4 className="font-medium">Safety:</h4>
                <p className="text-sm text-gray-600">{car.features.safety.join(', ')}</p>
              </div>
            </div>
          </div>

          <p className="text-gray-600">{car.description}</p>
        </div>
      </div>
    </div>
  );
}