// src/app/api/spa/search/route.ts - SIMPLIFIED to use only CarQuery
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { maximumDataAggregator } from '@/lib/services/new-apis/maximum-data-aggregator';
import type { ComprehensiveSPAData, SPASearchResponse, SPASearchParams } from '@/types/spa';
import type { PerformanceData, PricingData } from '@/types/cars';

async function handleSearch(
  source: string,
  make: string,
  model: string,
  year: string
): Promise<SPASearchResponse> {
  const startTime = Date.now();
  
  try {
    console.log(`🔍 Starting search: ${year} ${make} ${model}`);
    
    // Initialize search params
    const searchParams: SPASearchParams = {
      make,
      model,
      year: year ? parseInt(year) : undefined,
      dataSource: source as 'comprehensive' | 'database' | 'carquery' | 'manufacturer' | 'market'
    };

    // Get database entries
    const databaseCars = await prisma.buyCar.findMany({ 
      where: { make, model, year: Number(year) },
      include: { images: true }
    });

    // Get data from CarQuery (the only working API)
    const vehicleData = await maximumDataAggregator.getMaximumVehicleData(
      make,
      model,
      parseInt(year)
    );

    console.log('📊 Data retrieved from:', vehicleData.sources);

    // Build basic specifications
    const basicSpecifications = {
      make,
      model,
      year: parseInt(year),
      bodyType: vehicleData.basic.bodyType || 
                databaseCars[0]?.specifications?.bodyType || 
                'N/A',
      engine: vehicleData.engine.description || 
              databaseCars[0]?.specifications?.engine || 
              'N/A',
      engineCC: vehicleData.engine.displacement || 
                databaseCars[0]?.specifications?.engineCC || 
                'N/A',
      cylinders: vehicleData.engine.cylinders || 
                 databaseCars[0]?.specifications?.cylinders || 
                 'N/A',
      doors: vehicleData.dimensions.doors || 
             databaseCars[0]?.specifications?.doors || 
             0,
      seats: vehicleData.dimensions.seats || 
             databaseCars[0]?.specifications?.seats || 
             0,
      drivetrain: vehicleData.drivetrain.type || 
                  databaseCars[0]?.specifications?.driveType || 
                  'N/A',
      transmission: vehicleData.transmission.type || 
                   databaseCars[0]?.specifications?.transmission || 
                   'N/A',
      fuelType: vehicleData.engine.fuelType || 
               databaseCars[0]?.specifications?.fuelType || 
               'N/A'
    };

    // Build performance data
    const performanceData: PerformanceData = {
      engine: basicSpecifications.engine,
      horsePower: vehicleData.engine.horsepower?.toString() || 
                  databaseCars[0]?.specifications?.horsePower || 
                  'N/A',
      torque: vehicleData.engine.torque || 
              databaseCars[0]?.specifications?.torque || 
              'N/A',
      acceleration060: vehicleData.performance.acceleration060 || 
                      databaseCars[0]?.specifications?.acceleration60 || 
                      'N/A',
      topSpeed: vehicleData.performance.topSpeed || 
               databaseCars[0]?.specifications?.topSpeed || 
               'N/A',
      transmission: basicSpecifications.transmission,
      driveType: basicSpecifications.drivetrain,
      weight: vehicleData.dimensions.weight || 
             databaseCars[0]?.specifications?.weight || 
             'N/A',
      fuelEconomy: vehicleData.fuelEconomy.combined ? 
        `${vehicleData.fuelEconomy.combined} MPG combined` :
        (vehicleData.fuelEconomy.city && vehicleData.fuelEconomy.highway ? 
          `${vehicleData.fuelEconomy.city}/${vehicleData.fuelEconomy.highway} MPG (city/hwy)` :
          databaseCars[0]?.specifications?.fuelEconomy || undefined)
    };

    // Build pricing data (from database only since APIs don't provide it)
    const pricingData: PricingData | undefined = databaseCars[0]?.price ? {
      baseMSRP: databaseCars[0]?.baseMSRP || 0,
      currentMarketRange: 'N/A',
      averageDealerPrice: databaseCars[0]?.price || 0,
      dealerInventoryCount: databaseCars.length,
      priceTrend: undefined, // Remove priceTrend as it's causing type errors
      priceDistribution: undefined
    } : undefined;

    // Extract dimensions
    const dimensions = vehicleData.dimensions ? {
      length: vehicleData.dimensions.length,
      width: vehicleData.dimensions.width,
      height: vehicleData.dimensions.height,
      wheelbase: vehicleData.dimensions.wheelbase,
      weight: vehicleData.dimensions.weight
    } : undefined;

    // Colors (empty since no API provides this)
    const colors = {
      exterior: vehicleData.colors.exterior || [],
      interior: vehicleData.colors.interior || [],
      totalCombinations: 0
    };

    // Build comprehensive SPA data
    const comprehensiveData: ComprehensiveSPAData = {
      make,
      model,
      year: parseInt(year),
      bodyType: basicSpecifications.bodyType,
      trim: vehicleData.basic.trim || databaseCars[0]?.trim,
      basicSpecifications,
      performanceData,
      pricingData,
      dimensions,
      colors,
      fuelEconomy: vehicleData.fuelEconomy,
      // Data sources tracking
      dataSources: {
        database: databaseCars.length > 0,
        carQuery: vehicleData.sources.includes('CarQuery'),
        manufacturer: false, // Removed non-working APIs
        market: false // Removed non-working APIs
      },
      dataSource: source,
      searchQuery: searchParams,
      timestamp: new Date().toISOString(),
      cacheExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    console.log('✅ Data compiled:', {
      hasBasicSpecs: !!basicSpecifications,
      hasPerformance: !!performanceData,
      hasPricing: !!pricingData,
      hasDimensions: !!dimensions,
      dataSources: comprehensiveData.dataSources,
      totalDataPoints: countDataPoints(comprehensiveData)
    });

    return {
      success: true,
      data: comprehensiveData,
      meta: {
        searchQuery: searchParams,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        version: '3.0.0',
        dataPoints: countDataPoints(comprehensiveData),
        sources: vehicleData.sources
      }
    };

  } catch (error) {
    console.error('❌ SPA Search Error:', error);
    
    return {
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to perform search',
        retryable: true
      },
      meta: {
        searchQuery: { 
          make, 
          model, 
          year: parseInt(year), 
          dataSource: source as 'comprehensive' | 'database' | 'carquery' | 'manufacturer' | 'market'
        },
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      }
    };
  }
}

function countDataPoints(data: any): number {
  let count = 0;
  
  function traverse(obj: any) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (value !== null && value !== undefined && value !== '' && value !== 'N/A') {
          if (Array.isArray(value)) {
            count += value.length;
          } else if (typeof value === 'object') {
            traverse(value);
          } else {
            count++;
          }
        }
      }
    }
  }
  
  traverse(data);
  return count;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const source = url.searchParams.get('source') ?? 'comprehensive';
  const make = url.searchParams.get('make') ?? '';
  const model = url.searchParams.get('model') ?? '';
  const year = url.searchParams.get('year') ?? '';

  if (!make || !model) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: 'Make and model are required'
        },
        meta: {
          searchQuery: { 
            make, 
            model, 
            year: year ? parseInt(year) : undefined, 
            dataSource: source as 'comprehensive' | 'database' | 'carquery' | 'manufacturer' | 'market'
          },
          executionTime: 0,
          timestamp: new Date().toISOString(),
          version: '3.0.0'
        }
      },
      { status: 400 }
    );
  }

  const result = await handleSearch(source, make, model, year);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { source = 'comprehensive', make, model, year } = body;

  if (!make || !model) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: 'Make and model are required'
        },
        meta: {
          searchQuery: { 
            make, 
            model, 
            year: year ? parseInt(year) : undefined, 
            dataSource: source as 'comprehensive' | 'database' | 'carquery' | 'manufacturer' | 'market'
          },
          executionTime: 0,
          timestamp: new Date().toISOString(),
          version: '3.0.0'
        }
      },
      { status: 400 }
    );
  }

  const result = await handleSearch(source, make, model, year);
  return NextResponse.json(result);
}