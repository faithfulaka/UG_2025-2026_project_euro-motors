// src/app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify admin user
    const isAdmin = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get real stats from database
    const [
      totalUsers,
      carsForSale,
      carsForRent
    ] = await Promise.all([
      prisma.user.count(),
      prisma.buyCar.count(),
      prisma.rentalCar.count()
    ]);

    const stats = {
      totalUsers,
      totalOrders: 0, // Will implement later
      totalRentals: 0, // Will implement later
      totalTradeIns: 0, // Will implement later
      pendingOrders: 0,
      pendingRentals: 0,
      pendingTradeIns: 0,
      carsForSale,
      carsForRent,
      monthlyRevenue: 0, // Will implement later
      popularMakes: [
        { make: 'Bentley', count: 2 },
        { make: 'Rolls Royce', count: 1 },
      ],
      recentActivity: [
        {
          id: '1',
          type: 'spa-search' as const,
          description: 'SPA tool ready for comprehensive vehicle data',
          timestamp: new Date(),
          details: { carMake: 'System', status: 'Ready' }
        },
      ],
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}