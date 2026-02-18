import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params;
    const { imageUrl, carType } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Determine which model to use
    const isRentalCar = carType === 'rent';
    const imageModel = isRentalCar ? 'rentalCarImage' : 'buyCarImage';

    // Update all images for this car: set isMain = false for all, then true for the selected one
    await (prisma[imageModel as keyof typeof prisma] as any).updateMany(
      {
        where: { carId: carId },
        data: { isMain: false },
      }
    );

    await (prisma[imageModel as keyof typeof prisma] as any).updateMany(
      {
        where: { 
          carId: carId,
          url: imageUrl,
        },
        data: { isMain: true },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Main image updated successfully',
    });
  } catch (error) {
    console.error('Error updating main image:', error);
    return NextResponse.json(
      { error: 'Failed to update main image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
