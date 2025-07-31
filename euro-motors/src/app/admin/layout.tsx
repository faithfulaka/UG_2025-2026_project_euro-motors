// src/app/admin/layout.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    console.log('🔍 Admin layout check - User:', user?.email, 'Role:', user?.role, 'IsAdmin:', isAdmin);
    
    if (!loading) {
      if (!user) {
        console.log('❌ No user in admin layout, redirecting to login');
        router.push('/login');
      } else if (!isAdmin) {
        console.log('❌ User is not admin, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('✅ Admin layout access granted');
      }
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading Admin Dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-4 text-gray-800">
            {!user ? 'Please Login' : 'Access Denied'}
          </div>
          {!user ? (
            <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
              Go to Login
            </Link>
          ) : (
            <div>
              <div className="text-gray-600 mb-4">You need admin privileges to access this page.</div>
              <div className="text-sm text-gray-500 mb-4">Current role: {user.role}</div>
              <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // FIXED: Organized navigation with better grouping
  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊', group: 'main' },
    { href: '/admin/supercar-pricing', label: 'SPA Tool', icon: '🚘', group: 'tools', highlight: true },
    { href: '/admin/cars', label: 'Cars', icon: '🚗', group: 'inventory' },
    { href: '/admin/rentals', label: 'Rentals', icon: '🔑', group: 'inventory' },
    { href: '/admin/users', label: 'Users', icon: '👥', group: 'management' },
    { href: '/admin/quotes', label: 'Quotes', icon: '💰', group: 'management' },
    { href: '/admin/trade-ins', label: 'Trade-Ins', icon: '🔄', group: 'management' },
    { href: '/admin/reports', label: 'Reports', icon: '📈', group: 'analytics' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️', group: 'system' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* FIXED ADMIN NAVBAR - Better Layout */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            
            {/* LEFT SIDE: Logo + Primary Nav */}
            <div className="flex items-center space-x-8">
              
              {/* Euro Motors Logo - Same as User Navbar but Smaller */}
              <Link href="/admin" className="flex items-center flex-shrink-0">
                {!imageError ? (
                  <Image 
                    src="/logos/logo.svg" 
                    alt="Euro Motors Logo" 
                    width={180}  // Smaller than user navbar (240 -> 180)
                    height={82}   // Smaller than user navbar (110 -> 82)
                    onError={() => setImageError(true)}
                    priority
                    className="hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <span className="font-bold text-lg"> {/* Smaller than user navbar */}
                    <span className="text-red-600">EURO</span>
                    <span className="text-gray-800">MOTORS</span>
                  </span>
                )}
              </Link>

              {/* PRIMARY NAVIGATION - Desktop Only */}
              <div className="hidden lg:flex items-center space-x-6">
                {navItems.filter(item => ['main', 'tools', 'inventory'].includes(item.group)).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : item.highlight
                        ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    } ${item.highlight ? 'ring-1 ring-blue-200' : ''}`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                    {item.highlight && (
                      <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                        NEW
                      </span>
                    )}
                  </Link>
                ))}
                
                {/* Secondary Nav Dropdown */}
                <div className="relative group">
                  <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                    <span className="mr-1">📋</span>
                    More
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      {navItems.filter(item => !['main', 'tools', 'inventory'].includes(item.group)).map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            isActive(item.href)
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="mr-3">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* RIGHT SIDE: Admin Info + Logout */}
            <div className="flex items-center space-x-4">
              
              {/* Admin Badge */}
              <div className="hidden md:flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {user.name || user.email}
                </span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  ADMIN
                </span>
              </div>

              {/* Logout Button - Same Style as User Navbar */}
              <button 
                onClick={handleLogout}
                className="bg-white text-red-600 border border-red-600 rounded-md px-4 py-2 text-sm font-semibold hover:bg-red-600 hover:text-white transition duration-300"
              >
                Logout
              </button>

              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU - Organized and Clean */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              
              {/* Admin Info - Mobile */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">{user.name || user.email}</div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  ADMIN
                </span>
              </div>

              {/* Navigation Items - Organized by Groups */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">Main</div>
                {navItems.filter(item => ['main', 'tools'].includes(item.group)).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : item.highlight
                        ? 'text-blue-600 hover:bg-blue-50'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                    {item.highlight && (
                      <span className="ml-auto bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                        NEW
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="space-y-1 pt-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">Inventory</div>
                {navItems.filter(item => item.group === 'inventory').map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="space-y-1 pt-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">Management</div>
                {navItems.filter(item => item.group === 'management').map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="space-y-1 pt-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">System</div>
                {navItems.filter(item => ['analytics', 'system'].includes(item.group)).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Logout */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 transition duration-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}