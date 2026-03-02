//src/app/page.tsx
import HomeSlideshow from '@/components/ui/HomeSlideshow';
import Image from 'next/image';
import Link from 'next/link';
import FeaturedCars from '@/components/ui/FeaturedCars';


export default function HomePage() {
  return (
    <div>
      {/* Hero Slideshow */}
      <HomeSlideshow />

      {/* Featured Cars Section */}
      <FeaturedCars />

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Services</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Experience the finest in luxury automotive — from purchasing your dream car to flexible rentals and seamless trade-ins.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/buy" className="group">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center hover:shadow-lg hover:border-red-200 transition h-full">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5 group-hover:bg-red-200 transition">
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1h2m6 0h4l2-8H7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Buy</h3>
                <p className="text-gray-500 text-sm">Browse our curated collection of luxury vehicles. From Bentley to Rolls Royce — find your perfect car.</p>
              </div>
            </Link>
            <Link href="/rent" className="group">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center hover:shadow-lg hover:border-red-200 transition h-full">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-5 group-hover:bg-purple-200 transition">
                  <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Rent</h3>
                <p className="text-gray-500 text-sm">Hourly, daily or weekly luxury rentals. Perfect for events, business, or simply experiencing the extraordinary.</p>
              </div>
            </Link>
            <Link href="/trade-in" className="group">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center hover:shadow-lg hover:border-red-200 transition h-full">
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5 group-hover:bg-amber-200 transition">
                  <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Trade In</h3>
                <p className="text-gray-500 text-sm">Get an AI-powered valuation for your current vehicle and apply it towards the purchase of your next luxury car.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Choose Euro Motors</h2>
            <p className="text-gray-500 max-w-xl mx-auto">We deliver an unmatched luxury experience backed by trust, expertise, and premium service.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Certified Vehicles', desc: 'Every car undergoes rigorous multi-point inspections.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { title: 'Flexible Financing', desc: 'Tailored payment plans to suit your budget.', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { title: 'Concierge Service', desc: 'White-glove delivery and personalized support.', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
              { title: 'Trade-In Welcome', desc: 'Fair AI-powered valuations for your current vehicle.', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Logos */}
      <section className="py-16 bg-white pb-36">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="w-full">
              <Image
                src="/images/brands.jpg"
                alt="Luxury Car Brands"
                width={5600}
                height={1200}
                priority
                className="w-full h-auto object-fill"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience Luxury?</h2>
          <p className="text-gray-300 mb-8 max-w-lg mx-auto">Whether you want to buy, rent, or trade in — Euro Motors makes your luxury car dreams a reality.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/buy"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Browse Collection
            </Link>
            <Link
              href="/register"
              className="inline-block border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}