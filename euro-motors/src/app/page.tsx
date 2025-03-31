import HomeSlideshow from '@/components/ui/HomeSlideshow';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div>
      {/* Hero Slideshow */}
      <HomeSlideshow />

      {/* Brand Logos - Single Image */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <Image 
                src="/images/brands.jpg" 
                alt="Luxury Car Brands" 
                width={1200} 
                height={200} 
                className="w-full object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}