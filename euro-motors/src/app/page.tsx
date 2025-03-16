import Image from 'next/image';
//import Link from 'next/link';
import HomeSlideshow from '@/components/ui/HomeSlideshow';

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
      {/* Section with Slideshow */}
      <HomeSlideshow />

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
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center text-black">GALLERY</h2>
          <div className="grid grid-cols-3 gap-4">
            {galleryImages.map((image) => (
              <div key={image.id} className="aspect-[4/3] relative overflow-hidden">
                <Image 
                  src={image.src} 
                  alt={image.alt} 
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}