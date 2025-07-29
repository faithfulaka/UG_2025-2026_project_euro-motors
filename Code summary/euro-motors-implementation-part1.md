# Euro Motors Luxury Car Dealership - Implementation Part 1

## Project Overview
- Luxury car dealership website with buying and rental sections
- Authentication system with JWT and NextAuth
- Main features: Authentication, car listings, individual car pages, trade-in functionality

## File Structure
```
euro-motors/
├── public/
│   ├── images/
│   │   ├── gallery/       # Car gallery images (component1.jpg through component12.jpg)
│   │   └── homeslide/     # Homepage slideshow images
│   └── logos/
│       └── logo.svg       # Euro Motors logo
├── src/
│   ├── app/
│   │   ├── login/         # Login page
│   │   │   └── page.tsx
│   │   ├── register/      # Register page
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── buy/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── rent/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── about-us/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── register/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── logout/
│   │   │   │   │   └── route.ts
│   │   │   │   └── me/
│   │   │   │       └── route.ts
│   │   │   ├── cars/
│   │   │   ├── rentals/
│   │   │   └── trade-in/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── providers/
│   │   │   └── SessionProvider.tsx
│   │   ├── trade-in/
│   │   │   └── TradeInModal.tsx
│   │   └── ui/
│   │       └── Logo.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   └── prisma.ts
│   └── middleware.ts
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

## Core Files Implementation

### 1. Session Provider (src/components/providers/SessionProvider.tsx)
```typescript
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { Session } from 'next-auth';

export default function SessionProvider({ 
  children,
  session 
}: { 
  children: ReactNode;
  session: Session | null;
}) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
```

### 2. Auth Configuration (src/lib/auth.ts)
```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'USER' | 'ADMIN';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'next-auth-secret',
};
```

### 3. Middleware (src/middleware.ts)
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Public routes that should be accessible without authentication
const publicRoutes = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/me',
  '/_next', // Allow next.js resources
  '/favicon.ico'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  try {
    // Verify the token
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
    await jwtVerify(token, secretKey);
    
    // Token is valid, let the request through
    return NextResponse.next();
  } catch {
    // Token verification failed - redirect to login
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    
    // Clear the invalid token
    const response = NextResponse.redirect(url);
    response.cookies.set({
      name: 'token',
      value: '',
      expires: new Date(0),
      path: '/',
    });
    
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.ico|.*\\.jpg|.*\\.png|.*\\.svg).*)'],
};
```

### 4. Root Layout (src/app/layout.tsx)
```typescript
'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't show navbar on login or registration pages
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <html lang="en">
      <body className={inter.className}>
        {!isAuthPage && <Navbar />}
        <main>{children}</main>
        {!isAuthPage && <Footer />}
      </body>
    </html>
  );
}
```

### 5. Navbar Component (src/components/layout/Navbar.tsx)
```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setUser] = useState<null | { name: string; email: string }>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  
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
          {!imageError ? (
            <Image 
              src="/logos/logo.svg" 
              alt="Euro Motors Logo" 
              width={160}  // Increased size
              height={55}  // Increased size
              onError={() => setImageError(true)}
              priority
            />
          ) : (
            <span className="font-bold text-2xl"> {/* Increased text size */}
              <span className="text-red-600">EURO</span>
              <span className="text-gray-800">MOTORS</span>
            </span>
          )}
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
```

### 6. Footer Component (src/components/layout/Footer.tsx)
```typescript
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Contact Us Section */}
          <div id="contact-us">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">Contact Us</h3>
            <div className="space-y-2">
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +447746583510
              </p>
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@euro-motors.com
              </p>
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                54 London Road, LE2 0QL<br />
                Leicester, United Kingdom
              </p>
            </div>
          </div>

          {/* Brands We Offer */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">Brands We Offer</h3>
            <div className="grid grid-cols-3 gap-4">
              <span className="text-sm">Ferrari</span>
              <span className="text-sm">Lamborghini</span>
              <span className="text-sm">Land Rover</span>
              <span className="text-sm">Mercedes</span>
              <span className="text-sm">Porsche</span>
              <span className="text-sm">Rolls Royce</span>
              <span className="text-sm">Aston Martin</span>
              <span className="text-sm">Audi</span>
              <span className="text-sm">BMW</span>
            </div>
          </div>

          {/* Our Locations */}
          <div id="locations">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">Our Locations</h3>
            <p className="text-sm mb-2">
              EuroMotors Luxury Automobiles Trading LLC,<br />
              54 London Road, LE2 0QL<br />
              Leicester, United Kingdom
            </p>
          </div>
        </div>

        {/* Brand Logos */}
        <div className="flex flex-wrap justify-center gap-6 py-6 border-t border-b border-gray-200">
          {['Ferrari', 'Lamborghini', 'Land Rover', 'Mercedes', 'Porsche', 'Rolls Royce', 'Aston Martin', 'Audi', 'BMW'].map((brand) => (
            <div key={brand} className="w-12 h-12 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
              {/* Replace with actual brand logos */}
              <div className="text-xs text-center">{brand}</div>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center pt-6 text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Euro Motors Luxury Automobiles. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

### 7. Home Slideshow Component (src/components/HomeSlideshow.tsx)
```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SlideData {
  id: number;
  image: string;
  title: string;
  description: string;
}

export default function HomeSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isManual, setIsManual] = useState(false);

  // Array of slide data
  const slides: SlideData[] = [
    {
      id: 1,
      image: '/images/homeslide/slide1.jpg',
      title: 'Euro Motors - Luxury Automobiles',
      description: 'Euro Motors is one of the leading luxury car dealers in Europe specializing in the most exclusive and desirable luxury cars for sale.',
    },
    {
      id: 2,
      image: '/images/homeslide/slide2.jpg',
      title: 'Exceptional Selection',
      description: "Discover our handpicked collection of the world's most prestigious luxury vehicles.",
    },
    {
      id: 3,
      image: '/images/homeslide/slide3.jpg',
      title: 'Unmatched Experience',
      description: 'Experience the pinnacle of automotive excellence with our premier selection of luxury vehicles.',
    },
  ];

  // Auto slide functionality with pause when clicking manually
  useEffect(() => {
    if (isManual) return; // Pause auto-slide when user manually navigates

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000); // Auto-slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length, isManual]);

  // Functions to handle navigation
  const goToNextSlide = () => {
    setIsManual(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    setTimeout(() => setIsManual(false), 5000); // Resume auto-slide after 5 sec
  };

  const goToPrevSlide = () => {
    setIsManual(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    setTimeout(() => setIsManual(false), 5000); // Resume auto-slide after 5 sec
  };

  const goToSlide = (index: number) => {
    setIsManual(true);
    setCurrentIndex(index);
    setTimeout(() => setIsManual(false), 5000); // Resume auto-slide after 5 sec
  };

  return (
    <div className="relative w-full min-h-[600px] overflow-hidden">
      {/* Slides */}
      <div className="h-full relative">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              index === currentIndex ? 'opacity-100 z-20' : 'opacity-0 z-10'
            }`}
             >
            <div className="relative w-full h-[600px]">
              <Image
                src={slide.image}
                alt={slide.title}
                width={1920}
                height={600}
                className="object-cover w-full h-full brightness-50"
                priority={slide.id === 1}
              />
            </div>


            {/* Text and Buttons - Left aligned and vertically centered */}
            <div className="absolute inset-0 bg-black bg-opacity-70 z-30 flex items-start h-full px-8 md:px-20 lg:px-36">
              <div className="max-w-xl mt-24 md:mt-36 lg:mt-44">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{slide.title}</h1>
                <p className="text-xl text-white mb-8">{slide.description}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/buy" className="bg-black text-white px-6 py-3 rounded text-center hover:bg-gray-900 transition duration-300">
                    VIEW STOCK
                  </Link>
                  <Link href="/rent" className="bg-black text-white px-6 py-3 rounded text-center hover:bg-gray-900 transition duration-300">
                    VIEW RENTALS
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-transparent p-2 z-40 cursor-pointer"
        aria-label="Previous slide"
      >
        <div className="relative w-10 h-10">
          <Image src="/images/homeslide/Left.svg" alt="Previous" width={40} height={40} />
        </div>
      </button>

      <button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-transparent p-2 z-40 cursor-pointer"
        aria-label="Next slide"
      >
        <div className="relative w-10 h-10">
          <Image src="/images/homeslide/Right.svg" alt="Next" width={40} height={40} />
        </div>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-40">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              currentIndex === index ? 'bg-red-600' : 'bg-transparent border border-red-600'
            } transition-all duration-300`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
}
```

### 8. Logo Component (src/components/ui/Logo.tsx)
```typescript
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <Link href="/" className={`block ${className}`}>
      <Image 
        src="/images/logo.jpg"
        alt="Euro Motors"
        width={120}
        height={40}
        className="object-contain"
      />
    </Link>
  );
}
```

### 9. Prisma Client (src/lib/prisma.ts)
```typescript
import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 10. Auth API Routes

#### Login API (src/app/api/auth/login/route.ts)
```typescript
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        } 
      },
      { status: 200 }
    );

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day in seconds
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
```
