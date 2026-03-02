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
    // Try to get token from cookie first
    const cookieToken = request.cookies.get('token')?.value;
    // Fallback to Authorization header
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = cookieToken || headerToken;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify JWT
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (jwtError: unknown) {
      const error = jwtError as CustomJWTError;
      
      let errorMessage = 'Invalid token';
      if (error.name === 'TokenExpiredError') errorMessage = 'Token expired';
      else if (error.name === 'JsonWebTokenError') errorMessage = 'Malformed token';
      else if (error.name === 'NotBeforeError') errorMessage = 'Token not active';
      
      return NextResponse.json(
        { error: errorMessage, code: error.name },
        { status: 401 }
      );
    }
    
    // Load user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      const response = NextResponse.json({ error: 'User not found' }, { status: 401 });
      response.cookies.set({
        name: 'token',
        value: '',
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }

    // Load buy & rent interests
    const buyInterests = await prisma.quote.findMany({
      where: { userId: user.id },
      include: { car: true },
      orderBy: { createdAt: 'desc' }
    });
    const rentInterests = await prisma.rental.findMany({
      where: { userId: user.id },
      include: { car: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ user, buyInterests, rentInterests });
  } catch (error: unknown) {
    console.error('❌ [AUTH ME] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}