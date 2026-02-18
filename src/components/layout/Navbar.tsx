//src/components/layout/Navbar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCar } from '@/context/CarContext';


export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [, setUser] = useState<null | { name: string; email: string }>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { cartItems } = useCar();
  const cartRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  // Close cart when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setCartOpen(false);
      }
    }

    if (cartOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [cartOpen]);

  const isActive = (path: string) => {
    return pathname === path ? 'text-red-600 font-bold' : 'text-gray-800';
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-white py-4 px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo - Increased Size */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logos/logo.svg"
            alt="Euro Motors Logo"
            width={240}
            height={110}
            priority
            className="hover:opacity-80 transition-opacity"
          />
        </Link>

        {/* Desktop Navigation - Increased Spacing & Font Size */}
        <div className="hidden md:flex items-center space-x-12">
          <Link href="/buy" className={`text-lg font-semibold ${isActive('/buy')} hover:text-red-600 transition duration-300`}>
            Buy
          </Link>
          <Link href="/rent" className={`text-lg font-semibold ${isActive('/rent')} hover:text-red-600 transition duration-300`}>
            Rent
          </Link>
          <button 
            onClick={() => scrollToSection('contact-us')} 
            className="text-lg font-semibold text-gray-800 hover:text-red-600 transition duration-300"
          >
            Contact Us
          </button>
          <button 
            onClick={() => scrollToSection('locations')} 
            className="text-lg font-semibold text-gray-800 hover:text-red-600 transition duration-300"
          >
            Locations
          </button>
          <Link href="/about-us" className={`text-lg font-semibold ${isActive('/about-us')} hover:text-red-600 transition duration-300`}>
            About Us
          </Link>
        </div>

        {/* Cart Button with Dropdown */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="relative" ref={cartRef}>
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="relative p-2 text-gray-800 hover:text-red-600 transition duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8m10 0l2-8m-8 8h8m0 0a2 2 0 100-4 2 2 0 000 4zm4 0a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* Cart Dropdown */}
            {cartOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-black">Shopping Cart</h3>
                </div>
                {cartItems.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Your cart is empty
                  </div>
                ) : (
                  <>
                    <div className="max-h-64 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-semibold text-black">{item.carMake} {item.carModel}</p>
                              <p className="text-sm text-gray-600">Type: {item.type}</p>
                              {item.rentalDates && (
                                <p className="text-sm text-gray-600">
                                  Duration: {item.rentalDates.duration}
                                </p>
                              )}
                            </div>
                            <p className="font-semibold text-black">£{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-200 flex gap-2">
                      <button 
                        onClick={() => {
                          router.push('/checkout');
                          setCartOpen(false);
                        }}
                        className="flex-1 text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                      >
                        Checkout
                      </button>
                      <button 
                        className="flex-1 text-center border border-gray-300 text-gray-800 py-2 rounded hover:bg-gray-100 transition"
                        onClick={() => setCartOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Logout Button */}
          {!loading && (
            <button 
              onClick={handleLogout}
              className="bg-white text-red-600 border border-red-600 rounded-md px-5 py-3 text-lg font-semibold hover:bg-red-600 hover:text-white transition duration-300"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu - Bigger & Bolder */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white py-6 px-6 mt-2 space-y-5">
          <Link 
            href="/buy" 
            className="block text-lg font-semibold text-gray-800 hover:text-red-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            Buy
          </Link>
          <Link 
            href="/rent" 
            className="block text-lg font-semibold text-gray-800 hover:text-red-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            Rent
          </Link>
          <button 
            onClick={() => {
              scrollToSection('contact-us');
              setMobileMenuOpen(false);
            }}
            className="block text-lg font-semibold text-gray-800 hover:text-red-600 text-left w-full"
          >
            Contact Us
          </button>
          <button 
            onClick={() => {
              scrollToSection('locations');
              setMobileMenuOpen(false);
            }}
            className="block text-lg font-semibold text-gray-800 hover:text-red-600 text-left w-full"
          >
            Locations
          </button>
          <Link 
            href="/about-us" 
            className="block text-lg font-semibold text-gray-800 hover:text-red-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            About Us
          </Link>
          
          {/* Mobile Cart Section */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-lg font-semibold text-gray-800 mb-3">Cart ({cartItems.length})</p>
            {cartItems.length === 0 ? (
              <p className="text-gray-600">Your cart is empty</p>
            ) : (
              <>
                {cartItems.map((item) => (
                  <div key={item.id} className="text-sm text-gray-800 mb-2 pb-2 border-b">
                    <p className="font-semibold">{item.carMake} {item.carModel}</p>
                    <p>Type: {item.type}</p>
                    <p>£{item.price}</p>
                  </div>
                ))}
                <Link 
                  href="/buy/checkout"
                  className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mt-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Checkout
                </Link>
              </>
            )}
          </div>

          <button 
            onClick={handleLogout}
            className="block text-lg font-semibold text-red-600 hover:text-red-700 text-left w-full"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
