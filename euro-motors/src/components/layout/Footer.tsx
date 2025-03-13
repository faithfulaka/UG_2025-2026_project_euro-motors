import Link from 'next/link';
//import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-100 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Contact Us Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">Contact Us</h3>
            <div className="space-y-2">
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +447746583510
              </p>
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@euro-motors.com
              </p>
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                54 London Road, LE2 0QL<br />
                Leicester, United Kingdom
              </p>
            </div>
          </div>

          {/* Brands We Offer */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">Brands We Offer</h3>
            <div className="grid grid-cols-3 gap-4">
              <span className="text-sm">Ferrari</span>
              <span className="text-sm">Lamborghini</span>
              <span className="text-sm">Land Rover</span>
              <span className="text-sm">Mercedes</span>
              <span className="text-sm">Porsche</span>
              <span className="text-sm">Rolls Royce</span>
              <span className="text-sm">Aston Martin</span>
              <span className="text-sm">Audi</span>
              <span className="text-sm">BMW</span>
            </div>
          </div>

          {/* Our Locations */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">Our Locations</h3>
            <p className="text-sm mb-2">
              EuroMotors Luxury Automobiles Trading LLC,<br />
              54 London Road, LE2 0QL<br />
              Leicester, United Kingdom
            </p>
            <Link href="/locations" className="text-red-600 hover:underline text-sm">
              View all locations →
            </Link>
          </div>
        </div>

        {/* Brand Logos */}
        <div className="flex flex-wrap justify-center gap-6 py-6 border-t border-b border-gray-200">
          {['Ferrari', 'Lamborghini', 'Land Rover', 'Mercedes', 'Porsche', 'Rolls Royce', 'Aston Martin', 'Audi', 'BMW'].map((brand) => (
            <div key={brand} className="w-12 h-12 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
              {/* Replace with actual brand logos */}
              <div className="text-xs text-center">{brand}</div>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center pt-6 text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Euro Motors Luxury Automobiles. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}