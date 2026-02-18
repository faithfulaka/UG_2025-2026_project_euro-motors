// src/app/api/admin/gallery/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const image = await prisma.galleryImage.findUnique({
      where: { id: params.id },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete file from storage
    try {
      const filepath = join(process.cwd(), 'public', image.url);
      await unlink(filepath);
    } catch (err) {
      console.error('Error deleting file:', err);
      // Continue even if file deletion fails
    }

    // Delete from database
    await prisma.galleryImage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, alt, order, isActive } = body;

    const image = await prisma.galleryImage.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(alt && { alt }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
