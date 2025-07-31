//src/app/rent/page.tsx
import Link from 'next/link';
import CarSlideshow from '@/components/ui/CarSlideshow';
import { prisma } from '@/lib/prisma';
import { RentalCar } from '@/types/cars';

export default async function RentPage() {
  // Fetch rental cars from database
  const cars = await prisma.rentalCar.findMany({
    where: { isAvailable: true },
    include: { images: true }
  });

  // Parse JSON fields stored in database
  type RawRentalCar = Omit<RentalCar, 'baseMSRP' | 'specifications' | 'features' | 'supercarData' | 'performanceData' | 'stripeProductId'> & {
    baseMSRP?: number | null;
    specifications?: unknown;
    features?: unknown;
    supercarData?: unknown;
    performanceData?: unknown;
    stripeProductId?: string | null;
  };
  const parsedCars = cars.map((car: RawRentalCar) => ({
    ...car,
    specifications: typeof car.specifications === 'string'
      ? (car.specifications ? JSON.parse(car.specifications) : {})
      : (car.specifications ?? {}),
    features: typeof car.features === 'string'
      ? (car.features ? JSON.parse(car.features) : {})
      : (car.features ?? {}),
    supercarData: typeof car.supercarData === 'string'
      ? (car.supercarData ? JSON.parse(car.supercarData) : undefined)
      : (car.supercarData ?? undefined),
    performanceData: typeof car.performanceData === 'string'
      ? (car.performanceData ? JSON.parse(car.performanceData) : undefined)
      : (car.performanceData ?? undefined),
    baseMSRP: car.baseMSRP === null ? undefined : car.baseMSRP,
    stripeProductId: car.stripeProductId === null ? undefined : car.stripeProductId
  })) as RentalCar[];


  return (
    <div className="bg-white">
      <div className="py-12 bg-white pt-20 pb-36">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-black">Luxury Cars For Rent</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parsedCars.map((car) => (
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
                    <span className="text-black">{car.year}</span>
                    <span className="text-black">{car.specifications.mileage > 0 ? `${car.specifications.mileage.toLocaleString()} miles` : 'New'}</span>
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