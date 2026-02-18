import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(
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

    // Delete image from database
    const deletedCount = await (prisma[imageModel as keyof typeof prisma] as any).deleteMany({
      where: {
        url: imageUrl,
        carId: carId,
      },
    });

    if (deletedCount.count === 0) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Try to delete from filesystem if it's a local file
    if (!imageUrl.startsWith('http')) {
      try {
        const filePath = path.join(process.cwd(), 'public', imageUrl.replace(/^\//, ''));
        await fs.unlink(filePath);
      } catch (fsError) {
        // File might not exist locally, that's okay
        console.warn('Could not delete local file:', imageUrl);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
