
export default function Footer() {
  return (
    <footer className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Us Section */}
          <div id="contact-us">
            <h3 className="text-2xl font-semibold mb-6 text-black">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-600 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-black">+447746583510</span>
              </div>
              
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-600 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-black">info@euro-motors.com</span>
              </div>
              
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-600 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-black">
                  54 London Road, LE2 0QL<br />
                  Leicester, United Kingdom
                </div>
              </div>
            </div>
          </div>

          {/* Brands We Offer */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-black">Brands We Offer</h3>
            <div className="grid grid-cols-3 gap-y-4">
              <span className="text-black">Ferrari</span>
              <span className="text-black">Lamborghini</span>
              <span className="text-black">Land Rover</span>
              <span className="text-black">Mercedes</span>
              <span className="text-black">Porsche</span>
              <span className="text-black">Rolls Royce</span>
              <span className="text-black">Aston Martin</span>
              <span className="text-black">Audi</span>
              <span className="text-black">BMW</span>
            </div>
          </div>

          {/* Our Locations */}
          <div id="locations">
            <h3 className="text-2xl font-semibold mb-6 text-black">Our Locations</h3>
            <p className="text-black mb-4">
              EuroMotors Luxury Automobiles Trading LLC,<br />
              54 London Road, LE2 0QL<br />
              Leicester, United Kingdom
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-10 mt-6 border-t border-gray-200 text-black">
          <p>© {new Date().getFullYear()} Euro Motors Luxury Automobiles. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}