// src/components/layout/ConditionalLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import ConditionalNavbar from './ConditionalNavbar';
import Footer from './Footer';
import Gallery from '@/components/ui/Gallery';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Check if we're on an admin route
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Only show navbar if not on admin route */}
      {!isAdminRoute && <ConditionalNavbar />}
      
      <main className="flex-1 w-full max-w-[100vw] mx-auto overflow-x-hidden">
        {children}
      </main>
      
      {/* Only show Gallery and Footer if not on admin route */}
      {!isAdminRoute && (
        <>
          <Gallery />
          <Footer />
        </>
      )}
    </div>
  );
}
