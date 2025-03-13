import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// The paths that should be accessible only to authenticated users
const protectedPaths = [
  '/dashboard',
  '/admin',
  '/buy/checkout',
  '/rent/checkout',
  '/profile',
];

// The paths that should be accessible only to admin users
const adminPaths = [
  '/admin',
];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes or non-protected routes - no verification needed
  if (!protectedPaths.some(path => pathname.startsWith(path)) && 
      !adminPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // No token but trying to access protected route - redirect to login
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  try {
    // Verify the token
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
    const { payload } = await jwtVerify(token, secretKey);

    // Check admin access for admin routes
    if (adminPaths.some(path => pathname.startsWith(path)) && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }

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
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that should be accessible without authentication
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth/login|api/auth/register).*)',
  ],
};