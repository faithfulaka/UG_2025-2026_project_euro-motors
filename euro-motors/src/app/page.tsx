import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  // Sample car data
  const featuredCars = [
    { id: 1, make: 'Ferrari', model: 'SF90', color: 'Red', image: '/api/placeholder/400/300' },
    { id: 2, make: 'McLaren', model: '720S', color: 'Blue', image: '/api/placeholder/400/300' },
    { id: 3, make: 'Lamborghini', model: 'Aventador', color: 'Green', image: '/api/placeholder/400/300' },
    { id: 4, make: 'Porsche', model: '911 GT3', color: 'Black', image: '/api/placeholder/400/300' },
    { id: 5, make: 'Aston Martin', model: 'DBS', color: 'Silver', image: '/api/placeholder/400/300' },
    { id: 6, make: 'Bentley', model: 'Continental GT', color: 'White', image: '/api/placeholder/400/300' },
    { id: 7, make: 'Range Rover', model: 'SV Autobiography', color: 'Black', image: '/api/placeholder/400/300' },
    { id: 8, make: 'Mercedes', model: 'G63 AMG', color: 'Black', image: '/api/placeholder/400/300' },
    { id: 9, make: 'BMW', model: 'M8 Competition', color: 'Red', image: '/api/placeholder/400/300' },
  ];

  // Brand logos
  const brands = [
    'Ferrari', 'Lamborghini', 'Land Rover', 'Mercedes', 'Porsche', 
    'Rolls Royce', 'Aston Martin', 'Audi', 'BMW'
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px]">
        {/* Replace with your actual hero image */}
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            <Image 
              src="/api/placeholder/1600/800" 
              alt="Ferrari" 
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto h-full flex items-center px-4">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Euro Motors - Luxury Automobiles
            </h1>
            <p className="text-xl text-white mb-8">
              Euro Motors is one of the leading luxury car dealers in Europe specializing in the most exclusive and desirable luxury cars for sale.
            </p>
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
      </section>

      {/* Brand Logos */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {brands.map((brand, index) => (
              <div key={index} className="w-20 h-20 flex items-center justify-center">
                {/* Replace with actual brand logos */}
                <div className="text-sm text-center text-gray-500">{brand}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center uppercase">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredCars.map((car) => (
              <div key={car.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                <div className="relative h-64">
                  <Image 
                    src={car.image} 
                    alt={`${car.make} ${car.model}`} 
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold">{car.make} {car.model}</h3>
                  <p className="text-gray-600">{car.color}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}