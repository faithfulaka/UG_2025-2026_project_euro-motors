//src/components/layout/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';


export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setUser] = useState<null | { name: string; email: string }>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  
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
        <div className="hidden md:flex items-center space-x-12"> {/* Increased spacing */}
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

        {/* Logout Button */}
        {!loading && (
          <button 
            onClick={handleLogout}
            className="hidden md:block bg-white text-red-600 border border-red-600 rounded-md px-5 py-3 text-lg font-semibold hover:bg-red-600 hover:text-white transition duration-300"
          >
            Logout
          </button>
        )}

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
        <div className="md:hidden bg-white py-6 px-6 mt-2 space-y-5"> {/* More spacing */}
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
