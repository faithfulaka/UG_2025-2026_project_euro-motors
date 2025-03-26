import HomeSlideshow from '@/components/ui/HomeSlideshow';
import Gallery from '@/components/ui/Gallery';


export default function HomePage() {
  // Brand logos
  const brands = [
    'Ferrari', 'Lamborghini', 'Land Rover', 'Mercedes', 'Porsche', 
    'Rolls Royce', 'Aston Martin', 'Audi', 'BMW'
  ];

  return (
    <div>
      {/* Hero Slideshow */}
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

      {/* Gallery Section - using the Gallery component with internal images */}
      <Gallery />
    </div>
  );
}