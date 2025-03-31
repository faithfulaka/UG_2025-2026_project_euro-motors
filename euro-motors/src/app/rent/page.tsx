'use client';

import Link from 'next/link';
import CarSlideshow from '@/components/ui/CarSlideshow';

export default function RentPage() {
  // Using the same mock cars as the buy page, but with rental rates added
  const mockCars = [
    {
      id: '1',
      make: 'Bentley',
      model: 'Bentayga V8',
      trim: 'BLACK EDITION',
      year: 2022,
      isNew: true,
      color: 'Pearl White',
      mileage: 0,
      hourlyRate: 150,
      dailyRate: 1500,
      weeklyRate: 9000,
      bodyType: 'SUV',
      transmission: 'Automatic',
      horsePower: 542,
      engine: '4.0L V8 Biturbo',
      fuelType: 'Petrol'
    },
    {
      id: '2',
      make: 'Rolls Royce',
      model: 'Cullinan V12',
      trim: 'BLACK BADGE',
      year: 2022,
      isNew: true,
      color: 'Dark Grey',
      mileage: 0,
      hourlyRate: 200,
      dailyRate: 2000,
      weeklyRate: 12000,
      bodyType: 'SUV',
      transmission: 'Automatic',
      horsePower: 591,
      engine: '6.75L V12',
      fuelType: 'Petrol'
    },
    {
      id: '3',
      make: 'Bentley',
      model: 'Continental GT V8',
      trim: 'Continental GT V8',
      year: 2022,
      isNew: true,
      color: 'Blue',
      mileage: 0,
      hourlyRate: 160,
      dailyRate: 1600,
      weeklyRate: 9600,
      bodyType: 'Coupe',
      transmission: 'Automatic',
      horsePower: 542,
      engine: '4.0L V8 Twin-Turbo',
      fuelType: 'Petrol'
    }
  ];

  return (
    <div className="bg-white">
      <div className="py-12 bg-white pt-20 pb-36">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-black">Luxury Cars For Rent</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCars.map((car) => (
              <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                {/* CarSlideshow with simplified props */}
                <CarSlideshow 
                  carId={car.id} 
                  make={car.make} 
                  model={car.model} 
                />
                
                <div className="p-4 bg-white">
                  <h2 className="text-xl font-semibold mb-2 text-black">{car.make} {car.model}</h2>
                  <p className="text-gray-600 text-sm mb-2">{car.trim}</p>
                  <div className="flex justify-between mb-4">
                    <span className="text-black">{car.year} {car.isNew ? '(Brand new)' : ''}</span>
                    <span className="text-black">{car.mileage > 0 ? `${car.mileage.toLocaleString()} miles` : 'New'}</span>
                  </div>
                  
                  {/* Rental rates section - unique to the rent page */}
                  <div className="mb-4 border-t border-gray-100 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-600">Hourly:</span>
                      <span className="font-medium text-black">£{car.hourlyRate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-600">Daily:</span>
                      <span className="font-medium text-black">£{car.dailyRate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-600">Weekly:</span>
                      <span className="font-medium text-black">£{car.weeklyRate}</span>
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
    </div>
  );
}