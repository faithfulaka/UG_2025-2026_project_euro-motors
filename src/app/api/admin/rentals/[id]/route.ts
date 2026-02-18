// src/app/api/admin/rentals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { rentalStatus, paymentStatus } = body;

    const updateData: any = {};
    if (rentalStatus) updateData.rentalStatus = rentalStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const rental = await prisma.rental.update({
      where: { id },
      data: updateData,
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
      }
    });

    return NextResponse.json({
      success: true,
      data: rental,
      message: 'Rental updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating rental:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update rental',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}
