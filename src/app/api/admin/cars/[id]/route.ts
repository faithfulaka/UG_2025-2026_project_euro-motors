// src/app/api/admin/cars/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { 
  parseBuyCar, 
  parseRentalCar, 
  buyCarInclude, 
  rentalCarInclude,
  enrichCarWithSPAData 
} from '@/lib/db-helpers';
import type { BuyCar, RentalCar } from '@/types/cars';
import type { SPASearchResponse } from '@/types/spa';

// Helper to extract ID from URL path
function extractIdFromPath(url: URL): string {
  const pathParts = url.pathname.split('/').filter(Boolean);
  return pathParts[pathParts.length - 1] || '';
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin user
    const isAdmin = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Admin access required'
          }
        }, 
        { status: 401 }
      );
    }
    
    const id = params.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'buy';
    
    if (type === 'buy') {
      // Fetch buy car with images
      const rawCar = await prisma.buyCar.findUnique({
        where: { id },
        include: buyCarInclude
      });
      
      if (!rawCar) {
        return NextResponse.json(
          { 
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Buy car not found'
            }
          },
          { status: 404 }
        );
      }
      
      // Parse JSON fields properly
      const parsedCar: BuyCar = parseBuyCar(rawCar);
      
      return NextResponse.json({
        success: true,
        data: parsedCar,
        timestamp: new Date().toISOString()
      });
      
    } else if (type === 'rent') {
      // Fetch rental car with images
      const rawCar = await prisma.rentalCar.findUnique({
        where: { id },
        include: rentalCarInclude
      });
      
      if (!rawCar) {
        return NextResponse.json(
          { 
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Rental car not found'
            }
          },
          { status: 404 }
        );
      }
      
      // Parse JSON fields properly
      const parsedCar: RentalCar = parseRentalCar(rawCar);
      
      return NextResponse.json({
        success: true,
        data: parsedCar,
        timestamp: new Date().toISOString()
      });
      
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: 'Invalid car type. Must be "buy" or "rent"'
          }
        },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch car',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin user
    const isAdmin = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Admin access required'
          }
        }, 
        { status: 401 }
      );
    }
    
    const id = params.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'buy';
    const data = await request.json();
    
    if (type === 'buy') {
      // Check if car exists
      const existingCar = await prisma.buyCar.findUnique({
        where: { id }
      });
      
      if (!existingCar) {
        return NextResponse.json(
          { 
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Buy car not found'
            }
          },
          { status: 404 }
        );
      }
      
      // Optionally enrich with SPA data if requested
      let enrichedData = { ...data };
      if (data.enrichWithSPA) {
        try {
          const spaResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/spa/search`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                make: data.make || existingCar.make,
                model: data.model || existingCar.model,
                year: (data.year || existingCar.year).toString(),
                source: 'comprehensive'
              })
            }
          );

          if (spaResponse.ok) {
            const spaResult: SPASearchResponse = await spaResponse.json();
            if (spaResult.success && spaResult.data) {
              enrichedData = await enrichCarWithSPAData(enrichedData, spaResult.data) as any;
            }
          }
        } catch (spaError) {
          console.error('Failed to enrich with SPA data:', spaError);
        }
      }
      
      // Update car in database
      const updatedCar = await prisma.buyCar.update({
        where: { id },
        data: {
          make: enrichedData.make,
          model: enrichedData.model,
          trim: enrichedData.trim || null,
          year: enrichedData.year,
          price: enrichedData.price,
          specifications: enrichedData.specifications,
          features: enrichedData.features,
          standardEquipment: enrichedData.standardEquipment || null,
          addedOptions: enrichedData.addedOptions || null,
          supercarData: enrichedData.supercarData || null,
          baseMSRP: enrichedData.baseMSRP || null,
          performanceData: enrichedData.performanceData || null,
          pricingData: enrichedData.pricingData || null,
          description: enrichedData.description,
          isAvailable: enrichedData.isAvailable
        },
        include: buyCarInclude
      });
      
      const parsedCar: BuyCar = parseBuyCar(updatedCar);
      
      return NextResponse.json({
        success: true,
        data: parsedCar,
        message: 'Buy car updated successfully',
        enriched: !!data.enrichWithSPA,
        timestamp: new Date().toISOString()
      });
      
    } else if (type === 'rent') {
      // Check if car exists
      const existingCar = await prisma.rentalCar.findUnique({
        where: { id }
      });
      
      if (!existingCar) {
        return NextResponse.json(
          { 
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Rental car not found'
            }
          },
          { status: 404 }
        );
      }
      
      // Update car in database
      const updatedCar = await prisma.rentalCar.update({
        where: { id },
        data: {
          make: data.make,
          model: data.model,
          trim: data.trim || null,
          year: data.year,
          hourlyRate: data.hourlyRate,
          dailyRate: data.dailyRate,
          weeklyRate: data.weeklyRate,
          specifications: data.specifications,
          features: data.features,
          supercarData: data.supercarData || null,
          baseMSRP: data.baseMSRP || null,
          performanceData: data.performanceData || null,
          description: data.description,
          isAvailable: data.isAvailable
        },
        include: rentalCarInclude
      });
      
      const parsedCar: RentalCar = parseRentalCar(updatedCar);
      
      return NextResponse.json({
        success: true,
        data: parsedCar,
        message: 'Rental car updated successfully',
        timestamp: new Date().toISOString()
      });
      
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: 'Invalid car type. Must be "buy" or "rent"'
          }
        },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error updating car:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update car',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin user
    const isAdmin = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Admin access required'
          }
        }, 
        { status: 401 }
      );
    }
    
    const id = params.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'buy';

    if (type === 'buy') {
      // Check if car exists
      const existingCar = await prisma.buyCar.findUnique({
        where: { id }
      });
      
      if (!existingCar) {
        return NextResponse.json(
          { 
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Buy car not found'
            }
          },
          { status: 404 }
        );
      }
      
      // Delete car (cascade will handle images)
      await prisma.buyCar.delete({
        where: { id }
      });
      
      return NextResponse.json({ 
        success: true,
        message: 'Buy car deleted successfully',
        timestamp: new Date().toISOString()
      });
      
    } else if (type === 'rent') {
      // Check if car exists
      const existingCar = await prisma.rentalCar.findUnique({
        where: { id }
      });
      
      if (!existingCar) {
        return NextResponse.json(
          { 
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Rental car not found'
            }
          },
          { status: 404 }
        );
      }
      
      // Delete car (cascade will handle images)
      await prisma.rentalCar.delete({
        where: { id }
      });
      
      return NextResponse.json({ 
        success: true,
        message: 'Rental car deleted successfully',
        timestamp: new Date().toISOString()
      });
      
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: 'Invalid car type. Must be "buy" or "rent"'
          }
        },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error deleting car:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete car',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}
