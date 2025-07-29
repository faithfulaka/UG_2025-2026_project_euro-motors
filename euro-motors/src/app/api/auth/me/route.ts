// src/app/api/auth/me/route.ts 
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

interface JWTPayload {
  userId: string;
  email: string;
}

interface CustomJWTError extends Error {
  name: string;
  message: string;
  expiredAt?: Date;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [AUTH ME] Endpoint called');
    
    // Try to get token from cookie first
    const cookieToken = request.cookies.get('token')?.value;
    
    // Try authorization header as fallback
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    const token = cookieToken || headerToken;
    
    console.log('🍪 [AUTH ME] Cookie token exists:', !!cookieToken);
    console.log('📋 [AUTH ME] Header token exists:', !!headerToken);
    
    if (!token) {
      console.log('❌ [AUTH ME] No token found');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify and decode the token with proper error handling
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      console.log('🔓 [AUTH ME] Token decoded for userId:', decoded.userId);
    } catch (jwtError: unknown) {
      // FIXED: Proper TypeScript error handling
      const error = jwtError as CustomJWTError;
      console.log('❌ [AUTH ME] JWT verification failed:', error.message);
      
      let errorMessage = 'Invalid token';
      if (error.name === 'TokenExpiredError') {
        errorMessage = 'Token expired';
      } else if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Malformed token';
      } else if (error.name === 'NotBeforeError') {
        errorMessage = 'Token not active';
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        code: error.name 
      }, { status: 401 });
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      console.log('❌ [AUTH ME] User not found in database for userId:', decoded.userId);
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Fetch what this user is interested in buying
    const buyInterests = await prisma.quote.findMany({
      where: { userId: user.id },
      include: { car: true },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch what this user is interested in renting
    const rentInterests = await prisma.rental.findMany({
      where: { userId: user.id },
      include: { car: true },
      orderBy: { createdAt: 'desc' }
    });

    console.log('✅ [AUTH ME] User authenticated:', user.email, 'Role:', user.role);
    console.log('🎯 [AUTH ME] Is Admin:', user.role === 'ADMIN');

    return NextResponse.json({
      user,
      buyInterests,
      rentInterests
    });
    
  } catch (error: unknown) {
    console.error('❌ [AUTH ME] Error:', error);
    
    // FIXED: Proper unknown error handling
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 });
  }
}