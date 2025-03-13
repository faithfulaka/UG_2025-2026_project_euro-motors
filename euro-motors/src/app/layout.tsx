import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import SessionProvider from '@/components/providers/SessionProvider';
import { authOptions } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Euro Motors - Luxury Automobiles',
  description: 'Euro Motors is one of Europe\'s leading luxury car dealers specializing in the most exclusive and desirable luxury cars for sale.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}