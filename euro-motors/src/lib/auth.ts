// src/lib/auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function verifyToken(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return null;
    }

    // Verify token
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function verifyAdmin(request: NextRequest) {
  const user = await verifyToken(request);
  
  if (!user || user.role !== 'ADMIN') {
    return false;
  }
  
  return true;
}