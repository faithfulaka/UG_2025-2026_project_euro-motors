// src/app/api/spa/manufacturer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { manufacturerScraperService } from '@/lib/spa-services/manufacturer-scrapers';

export async function POST(request: NextRequest) {
  try {
    const body: { manufacturer: string; model: string; year?: number } = await request.json();
    const { manufacturer, model, year } = body;
    
    if (!manufacturer || !model) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Manufacturer and model are required',
          recoverable: false
        }
      }, { status: 400 });
    }

    console.log(`🏭 Manufacturer Scraper API: ${manufacturer} ${model} ${year || 'current'}`);

    const result = await manufacturerScraperService.scrapeManufacturerData(
      manufacturer,
      model,
      year
    );
    
    return NextResponse.json({
      success: result.success,
      data: result.data || null,
      error: result.error || null,
      meta: {
        manufacturer,
        model,
        year: year || new Date().getFullYear(),
        processingTime: result.processingTime,
        cached: result.cached,
        supportedManufacturers: manufacturerScraperService.getSupportedManufacturers()
      }
    });

  } catch (error) {
    console.error('🚨 Manufacturer Scraper API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'SCRAPER_ERROR',
        message: 'Manufacturer scraper failed',
        recoverable: true,
        retryAfter: 300
      }
    }, { status: 500 });
  }
}

// GET method to list supported manufacturers
export async function GET() {
  try {
    const supportedManufacturers = manufacturerScraperService.getSupportedManufacturers();
    const cacheStats = manufacturerScraperService.getCacheStats();
    
    return NextResponse.json({
      success: true,
      supportedManufacturers,
      total: supportedManufacturers.length,
      cache: {
        size: cacheStats.size,
        manufacturers: cacheStats.manufacturers
      },
      capabilities: {
        realTimePricing: true,
        configuratorData: true,
        optionsExtraction: true,
        multiRegion: true
      }
    });

  } catch (error: any) {
    console.error('🚨 Manufacturer Info API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to get manufacturer info'
      }
    }, { status: 500 });
  }
}