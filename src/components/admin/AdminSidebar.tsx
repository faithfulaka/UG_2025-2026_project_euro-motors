// src/components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: '📊',
      href: '/admin',
      exact: true,
    },
    {
      title: 'Cars for Sale',
      icon: '🚗',
      href: '/admin/cars/buy',
    },
    {
      title: 'Rental Cars',
      icon: '🔑',
      href: '/admin/cars/rent',
    },
    {
      title: 'Rentals',
      icon: '📋',
      href: '/admin/rentals',
    },
    {
      title: 'Orders/Quotes',
      icon: '📝',
      href: '/admin/orders',
    },
    {
      title: 'Trade-ins',
      icon: '🔄',
      href: '/admin/trade-ins',
    },
    {
      title: 'Users',
      icon: '👥',
      href: '/admin/users',
    },
    {
      title: 'SPA Tool',
      icon: '🚘',
      href: '/admin/supercar-pricing',
      badge: 'NEW',
    },
    {
      title: 'Reports',
      icon: '📈',
      href: '/admin/reports',
    },
    {
      title: 'Settings',
      icon: '⚙️',
      href: '/admin/settings',
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="w-64 bg-white text-gray-900 min-h-screen flex flex-col shadow-lg border-r border-gray-200">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/admin" className="flex items-center">
          <Image
            src="/logos/logo.svg"
            alt="Euro Motors Admin"
            width={200}
            height={80}
            priority
            className="hover:opacity-80 transition-opacity"
          />
        </Link>
        <p className="text-xs text-gray-500 mt-2 font-semibold tracking-wide">ADMIN PANEL</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                active
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  active 
                    ? 'bg-red-400 text-white' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-2 border-t border-gray-200">
        <Link
          href="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors font-medium"
        >
          <span className="text-lg">🏠</span>
          <span>View Site</span>
        </Link>
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
