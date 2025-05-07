// src/app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Verify admin user
  const isAdmin = await verifyAdmin(request);
  
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Fetch admin dashboard statistics
    const [
      totalUsers,
      carsForSale,
      carsForRent,
      totalOrders,
      totalRentals,
      totalTradeIns,
      pendingOrders,
      pendingRentals,
      pendingTradeIns
    ] = await Promise.all([
      // Total Users
      prisma.user.count(),
      
      // Cars For Sale
      prisma.buyCar.count({ 
        where: { isAvailable: true } 
      }),
      
      // Cars For Rent
      prisma.rentalCar.count({ 
        where: { isAvailable: true } 
      }),
      
      // Total Orders (Quotes)
      prisma.quote.count(),
      
      // Total Rentals
      prisma.rental.count(),
      
      // Total TradeIns
      prisma.tradeInRequest.count(),
      
      // Pending Orders
      prisma.quote.count({ 
        where: { quoteStatus: 'PENDING' } 
      }),
      
      // Pending Rentals
      prisma.rental.count({ 
        where: { rentalStatus: 'RESERVED' } 
      }),
      
      // Pending TradeIns
      prisma.tradeInRequest.count({ 
        where: { status: 'PENDING' } 
      }),
    ]);
    
    return NextResponse.json({
      totalUsers,
      carsForSale,
      carsForRent,
      totalOrders,
      totalRentals,
      totalTradeIns,
      pendingOrders,
      pendingRentals,
      pendingTradeIns
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}