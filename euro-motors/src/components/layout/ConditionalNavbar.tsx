// src/components/layout/ConditionalNavbar.tsx - SMART NAVBAR DISPLAY
'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const { user, loading, isAdmin } = useAuth();
  const pathname = usePathname();

  // Don't show navbar while loading
  if (loading) {
    return null;
  }

  // Don't show user navbar on these pages
  const excludedPaths = [
    '/login',
    '/register',
    '/admin' // Any admin path
  ];

  // Check if current path should exclude navbar
  const shouldExcludeNavbar = excludedPaths.some(path => {
    if (path === '/admin') {
      return pathname.startsWith('/admin');
    }
    return pathname === path;
  });

  // Don't show user navbar if:
  // 1. User is not logged in
  // 2. Current path is excluded (login, register, admin)
  // 3. User is admin (they get admin navbar instead)
  if (!user || shouldExcludeNavbar || isAdmin) {
    return null;
  }

  // Show user navbar for logged-in regular users on allowed pages
  return <Navbar />;
}