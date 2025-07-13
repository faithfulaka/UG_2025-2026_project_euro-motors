// src/app/layout.tsx - FINAL VERSION (All Imports Fixed)
import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Gallery from '@/components/ui/Gallery';
import { AuthProvider } from '@/context/AuthContext';
import { CarProvider } from '@/context/CarContext';

// Proper Next.js 13+ font loading
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata = {
  title: 'Euro Motors - Luxury Car Sales & Rentals',
  description: 'Premium luxury car dealership offering sales and rental services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <body className={`${inter.className} overflow-x-hidden`}>
        <AuthProvider>
          <CarProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 w-full max-w-[100vw] mx-auto overflow-x-hidden">
                {children}
              </main>
              <Gallery />
              <Footer />
            </div>
          </CarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}