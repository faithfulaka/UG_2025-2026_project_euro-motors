'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'text-red-600' : 'text-gray-800';
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If not on homepage, navigate to homepage and then scroll
      window.location.href = `/#${id}`;
    }
  };

  return (
    <nav className="bg-white py-4 px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="font-bold text-xl">
            <span className="text-red-600">EURO</span>
            <span className="text-gray-800">MOTORS</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/buy" className={`${isActive('/buy')} hover:text-red-600 transition duration-300`}>
            Buy
          </Link>
          <Link href="/rent" className={`${isActive('/rent')} hover:text-red-600 transition duration-300`}>
            Rent
          </Link>
          <button 
            onClick={() => scrollToSection('contact-us')} 
            className="text-gray-800 hover:text-red-600 transition duration-300"
          >
            Contact Us
          </button>
          <button 
            onClick={() => scrollToSection('locations')} 
            className="text-gray-800 hover:text-red-600 transition duration-300"
          >
            Locations
          </button>
          <Link href="/about-us" className={`${isActive('/about-us')} hover:text-red-600 transition duration-300`}>
            About Us
          </Link>
        </div>

        {/* Login Button */}
        <Link 
          href="/login" 
          className="hidden md:block bg-white text-red-600 border border-red-600 rounded-md px-4 py-2 hover:bg-red-600 hover:text-white transition duration-300"
        >
          Login
        </Link>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white py-4 px-6 mt-2 space-y-4">
          <Link 
            href="/buy" 
            className="block text-gray-800 hover:text-red-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            Buy
          </Link>
          <Link 
            href="/rent" 
            className="block text-gray-800 hover:text-red-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            Rent
          </Link>
          <button 
            onClick={() => {
              scrollToSection('contact-us');
              setMobileMenuOpen(false);
            }}
            className="block text-gray-800 hover:text-red-600 text-left w-full"
          >
            Contact Us
          </button>
          <button 
            onClick={() => {
              scrollToSection('locations');
              setMobileMenuOpen(false);
            }}
            className="block text-gray-800 hover:text-red-600 text-left w-full"
          >
            Locations
          </button>
          <Link 
            href="/about-us" 
            className="block text-gray-800 hover:text-red-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            About Us
          </Link>
          <Link 
            href="/login" 
            className="block text-red-600 hover:text-red-700"
            onClick={() => setMobileMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}