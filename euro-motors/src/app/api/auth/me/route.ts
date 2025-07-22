// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

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

    // Verify and decode the token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      console.log('🔓 [AUTH ME] Token decoded for userId:', decoded.userId);
    } catch (jwtError) {
      console.log('❌ [AUTH ME] JWT verification failed:', jwtError.message);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
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

    console.log('✅ [AUTH ME] User authenticated:', user.email, 'Role:', user.role);
    console.log('🎯 [AUTH ME] Is Admin:', user.role === 'ADMIN');

    return NextResponse.json({ user });
  } catch (error) {
    console.error('❌ [AUTH ME] Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}