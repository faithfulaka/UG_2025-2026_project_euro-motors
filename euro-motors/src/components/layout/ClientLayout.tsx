'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Gallery from '@/components/ui/Gallery';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't show navbar, gallery, or footer on login or registration pages
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && <Navbar />}
      <main className="flex-1 w-full max-w-[100vw] mx-auto overflow-x-hidden">
        {children}
      </main>
      {!isAuthPage && <Gallery />}
      {!isAuthPage && <Footer />}
    </div>
  );
}