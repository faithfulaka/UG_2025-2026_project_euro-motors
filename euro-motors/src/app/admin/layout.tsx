// src/app/admin/layout.ts
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

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
          <div className="text-2xl font-semibold mb-4">Loading Admin Dashboard...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-4">Please Login</div>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-4">Access Denied</div>
          <div className="text-gray-600 mb-4">You need admin privileges to access this page.</div>
          <div className="text-sm text-gray-500 mb-4">Current role: {user.role}</div>
          <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/cars', label: 'Cars', icon: '🚗' },
    { href: '/admin/rentals', label: 'Rentals', icon: '🔑' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/quotes', label: 'Quotes', icon: '💰' },
    { href: '/admin/trade-ins', label: 'Trade-Ins', icon: '🔄' },
    { href: '/admin/supercar-pricing', label: 'SPA Tool', icon: '🚘' },
    { href: '/admin/reports', label: 'Reports', icon: '📈' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ADMIN-ONLY TOP NAVIGATION - NO USER NAVBAR */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <div className="flex items-center">
                {/* Logo that switches to test user */}
                <button
                  onClick={() => {
                    // Log out current admin and redirect to login with test user auto-fill
                    router.push('/api/auth/logout');
                    setTimeout(() => {
                      router.push('/login?user=test');
                    }, 100);
                  }}
                  className="text-xl font-bold text-gray-900 hover:text-blue-600 transition"
                  title="Click to switch to test user"
                >
                  Euro Motors Admin
                </button>
              </div>
              
              {/* Admin Navigation */}
              <div className="hidden md:flex space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Admin User Info */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.name || user.email}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                ADMIN
              </span>
              <button
                onClick={() => router.push('/api/auth/logout')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <div className="md:hidden bg-white border-b">
        <div className="px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}

// 3. FIX: TypeScript Error Handling Pattern
interface CustomError extends Error {
  code?: string;
  statusCode?: number;
}

// Generic error handler function
export function handleError(error: unknown): CustomError {
  if (error instanceof Error) {
    return error as CustomError;
  }
  
  // If error is not an Error instance, create one
  return new Error(String(error)) as CustomError;
}

// Usage example in API routes:
export function safeApiHandler(handler: () => Promise<Response>) {
  return async (): Promise<Response> => {
    try {
      return await handler();
    } catch (error) {
      const customError = handleError(error);
      console.error('API Error:', customError.message);
      
      return new Response(
        JSON.stringify({ 
          error: customError.message || 'An unexpected error occurred' 
        }),
        { 
          status: customError.statusCode || 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}

