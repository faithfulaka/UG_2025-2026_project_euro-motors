// src/app/api/admin/cars/upload-images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { verifyAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const carId = formData.get('carId') as string;
    const type = formData.get('type') as string || 'buy';

    if (!carId) {
      return NextResponse.json(
        { success: false, error: 'Car ID is required' },
        { status: 400 }
      );
    }

    // Verify car exists
    const car = type === 'buy' 
      ? await prisma.buyCar.findUnique({ where: { id: carId } })
      : await prisma.rentalCar.findUnique({ where: { id: carId } });

    if (!car) {
      return NextResponse.json(
        { success: false, error: 'Car not found' },
        { status: 404 }
      );
    }

    // Use a hash or the car ID itself for folder name
    // Since car IDs are CUIDs (like "clx123abc"), we'll use the full ID but sanitized
    // Or better: use a simple hash of the car ID to get a consistent folder name
    const crypto = await import('crypto');
    const carIdHash = crypto.createHash('md5').update(carId).digest('hex').substring(0, 8);
    const carDir = path.join(process.cwd(), 'public', `car${carIdHash}`);
    if (!existsSync(carDir)) {
      await mkdir(carDir, { recursive: true });
    }

    const uploadedImages: Array<{ url: string; isMain: boolean; imageType: string | null }> = [];
    let mainImageSet = false;
    let imageIndex = 1;

    // Process each uploaded image
    for (let i = 1; i <= 11; i++) {
      const imageFile = formData.get(`image${i}`) as File;
      if (!imageFile) continue;

      // Convert file to buffer
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save file as pov{imageIndex}.jpg (sequential numbering)
      const fileName = `pov${imageIndex}.jpg`;
      const filePath = path.join(carDir, fileName);
      await writeFile(filePath, buffer);

      // Determine if this is the main image (first image)
      const isMain = !mainImageSet && imageIndex === 1;
      if (isMain) mainImageSet = true;

      // Create image record in database - use the hashed car ID for folder name
      const imageUrl = `car${carIdHash}/${fileName}`;
      
      // Delete existing image with same index if updating
      if (type === 'buy') {
        // Delete old image at this index if exists
        await prisma.buyCarImage.deleteMany({
          where: {
            carId,
            url: { contains: `pov${imageIndex}.jpg` }
          }
        });
        
        await prisma.buyCarImage.create({
          data: {
            carId,
            url: imageUrl,
            isMain,
            imageType: isMain ? 'main' : 'gallery'
          }
        });
      } else {
        await prisma.rentalCarImage.deleteMany({
          where: {
            carId,
            url: { contains: `pov${imageIndex}.jpg` }
          }
        });
        
        await prisma.rentalCarImage.create({
          data: {
            carId,
            url: imageUrl,
            isMain,
            imageType: isMain ? 'main' : 'gallery'
          }
        });
      }

      uploadedImages.push({
        url: imageUrl,
        isMain,
        imageType: isMain ? 'main' : 'gallery'
      });
      
      imageIndex++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadedImages.length} image(s)`,
      images: uploadedImages
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
