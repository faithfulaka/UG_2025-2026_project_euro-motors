// src/app/api/admin/reports/route.ts
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

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get sales data
    const salesData = await prisma.quote.findMany({
      where: {
        createdAt: { gte: startOfMonth, lte: endOfMonth },
        quoteStatus: 'RESERVED'
      },
      include: {
        car: {
          select: {
            make: true,
            model: true,
          }
        }
      }
    });

    // Get rental data
    const rentalData = await prisma.rental.findMany({
      where: {
        createdAt: { gte: startOfMonth, lte: endOfMonth },
        paymentStatus: 'PAID'
      },
      include: {
        car: {
          select: {
            make: true,
            model: true,
          }
        }
      }
    });

    // Get trade-in data
    const tradeInData = await prisma.tradeInRequest.findMany({
      where: {
        createdAt: { gte: startOfMonth, lte: endOfMonth }
      }
    });

    const reports = {
      sales: {
        total: salesData.length,
        revenue: salesData.reduce((sum, q) => sum + q.amount, 0),
        data: salesData
      },
      rentals: {
        total: rentalData.length,
        revenue: rentalData.reduce((sum, r) => sum + r.totalAmount, 0),
        data: rentalData
      },
      tradeIns: {
        total: tradeInData.length,
        averageValue: tradeInData.length > 0 
          ? tradeInData.reduce((sum, t) => sum + (t.estimatedValue || 0), 0) / tradeInData.length 
          : 0,
        data: tradeInData
      }
    };

    return NextResponse.json({
      success: true,
      data: reports,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch reports',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}
