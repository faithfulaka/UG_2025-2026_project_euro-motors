'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Gallery from '@/components/ui/Gallery';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't show navbar, gallery, or footer on login or registration pages
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} overflow-x-hidden`}>
        <div className="flex flex-col min-h-screen">
          {!isAuthPage && <Navbar />}
          <main className="flex-1 w-full max-w-[100vw] mx-auto overflow-x-hidden">
            {children}
          </main>
          {!isAuthPage && <Gallery />}
          {!isAuthPage && <Footer />}
        </div>
      </body>
    </html>
  );
}