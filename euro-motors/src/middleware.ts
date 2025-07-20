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
  '/_next',
  '/favicon.ico',
  '/api/auth/callback',
  '/api/auth/verify-email',
  '/api/auth/verify-email/callback',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/terms',
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