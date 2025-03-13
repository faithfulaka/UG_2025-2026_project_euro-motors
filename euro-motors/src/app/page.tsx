import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  // Brand logos
  const brands = [
    'Ferrari', 'Lamborghini', 'Land Rover', 'Mercedes', 'Porsche', 
    'Rolls Royce', 'Aston Martin', 'Audi', 'BMW'
  ];

  // Gallery images
  const galleryImages = [
    { id: 1, src: '/images/gallery/component1.jpg', alt: 'McLaren 570S' },
    { id: 2, src: '/images/gallery/component2.jpg', alt: 'Ferrari SF90' },
    { id: 3, src: '/images/gallery/component3.jpg', alt: 'Porsche 911 GT3' },
    { id: 4, src: '/images/gallery/component4.jpg', alt: 'Lamborghini Urus' },
    { id: 5, src: '/images/gallery/component5.jpg', alt: 'Rolls Royce Cullinan' },
    { id: 6, src: '/images/gallery/component6.jpg', alt: 'Aston Martin DBX' },
    { id: 7, src: '/images/gallery/component7.jpg', alt: 'BMW X7' },
    { id: 8, src: '/images/gallery/component8.jpg', alt: 'Range Rover' },
    { id: 9, src: '/images/gallery/component9.jpg', alt: 'Bentley Flying Spur' },
    { id: 10, src: '/images/gallery/component10.jpg', alt: 'Audi Q8' },
    { id: 11, src: '/images/gallery/component11.jpg', alt: 'Lexus RX' },
    { id: 12, src: '/images/gallery/component12.jpg', alt: 'BMW M8' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px]">
        {/* Hero image */}
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            <Image 
              src="/images/gallery/component2.jpg" 
              alt="Ferrari SF90" 
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
              Euro Motors is one of leading luxury car dealers in Europe specializing in the most exclusive and desirable luxury cars for sale.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleryImages.map((image) => (
              <div key={image.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                <div className="relative h-64">
                  <Image 
                    src={image.src} 
                    alt={image.alt} 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}