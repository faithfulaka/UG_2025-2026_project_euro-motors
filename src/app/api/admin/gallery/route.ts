// src/app/api/admin/gallery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const alt = formData.get('alt') as string;

    if (!file || !title || !alt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Read file data
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'images', 'gallery');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate filename
    const timestamp = Date.now();
    const filename = `gallery-${timestamp}-${file.name}`;
    const filepath = join(uploadDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Get the max order value
    const maxOrder = await prisma.galleryImage.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    // Create database record
    const galleryImage = await prisma.galleryImage.create({
      data: {
        title,
        alt,
        url: `/images/gallery/${filename}`,
        order: (maxOrder?.order || 0) + 1,
        isActive: true,
      },
    });

    return NextResponse.json(galleryImage);
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
