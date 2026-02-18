// src/app/api/admin/rentals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 401 }
      );
    }

    const rentals = await prisma.rental.findMany({
      include: {
        car: {
          select: {
            make: true,
            model: true,
            year: true,
          }
        },
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        coRenters: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: rentals,
      count: rentals.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch rentals',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}
