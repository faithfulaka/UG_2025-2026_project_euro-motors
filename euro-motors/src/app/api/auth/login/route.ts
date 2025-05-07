// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Attempt login
    const result = await login(email, password);

    if (!result) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Set JWT token in HTTP-only cookie
    const { user, token } = result;
    
    cookies().set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Return user data (without password)
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    );
  }
}