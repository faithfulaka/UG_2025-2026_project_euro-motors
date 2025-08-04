//src/app/page.tsx
import HomeSlideshow from '@/components/ui/HomeSlideshow';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div>
      {/* Hero Slideshow */}
      <HomeSlideshow />

      {/* Brand Logos - Single Image with increased dimensions */}
      <section className="py-16 bg-white pb-36">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="w-full">
              <Image 
                src="/images/brands.jpg" 
                alt="Luxury Car Brands" 
                width={5600} 
                height={1200} 
                className="w-full h-auto object-fill"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}