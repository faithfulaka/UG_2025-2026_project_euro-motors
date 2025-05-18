import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Define a proper type for the token payload
interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export async function verifyToken(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // Check if token has expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

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

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(plainPassword: string, hashedPassword: string) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// Use proper type instead of 'any'
export function generateToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}