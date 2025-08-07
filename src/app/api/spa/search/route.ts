// src/app/api/spa/search/route.ts - FIXED VERSION

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/services';
import getWikipediaSummary from '@/lib/services/wikipedia-api';
import { getAuctionHistory } from '@/lib/services/ebay-api';
import { getMotorsPricing } from '@/lib/services/motors-api';
import { getClassicValuerData } from '@/lib/services/classicvaluer-api';
import { getAutoExpressForecast } from '@/lib/services/autoexpress-api';
import type { ComprehensiveSPAData, SPASearchResponse, SPASearchParams, MarketData } from '@/types/spa';
import { PerformanceData, PricingData } from '@/types/cars';

async function handleSearch(
  source: string,
  make: string,
  model: string,
  year: string
): Promise<SPASearchResponse> {
  const startTime = Date.now();
  
  try {
    // Initialize search params
    const searchParams: SPASearchParams = {
      make,
      model,
      year: year ? parseInt(year) : undefined,
      dataSource: source as any || 'comprehensive'
    };

    // Fetch data from various sources
    const [
      carQueryData,
      dbEntries,
      auctionData,
      motorsData,
      classicData,
      autoExpressData,
      wikiData
    ] = await Promise.all([
      source !== 'database' ? carQueryService.getCarData(make, model, year) : null,
      source === 'database' || source === 'comprehensive' 
        ? prisma.buyCar.findMany({ 
            where: { make, model, year: Number(year) },
            include: { images: true }
          }) 
        : [],
      getAuctionHistory(make, model, year),
      getMotorsPricing(make, model, year),
      getClassicValuerData(make, model, year),
      getAutoExpressForecast(make, model, year),
      getWikipediaSummary(make, model).catch(() => ({ summary: '', image: '' }))
    ]);

    // Parse CarQuery data into proper types
    const basicSpecifications = carQueryData ? {
      make,
      model,
      year: parseInt(year),
      bodyType: carQueryData.model_body || '',
      engine: `${carQueryData.model_engine_cc}cc ${carQueryData.model_engine_type}`,
      engineCC: carQueryData.model_engine_cc,
      cylinders: carQueryData.model_engine_cyl,
      doors: parseInt(carQueryData.model_doors) || 0,
      seats: parseInt(carQueryData.model_seats) || 0,
      drivetrain: carQueryData.model_drive,
      transmission: carQueryData.model_transmission_type,
      fuelType: carQueryData.model_engine_fuel || undefined
    } : undefined;

    // Parse performance data
    const performanceData:  PerformanceData | undefined = carQueryData ? {
      engine: `${carQueryData.model_engine_cc}cc ${carQueryData.model_engine_type}`,
      horsePower: carQueryData.model_engine_power_ps || 'N/A',
      torque: carQueryData.model_engine_torque_nm ? `${carQueryData.model_engine_torque_nm} Nm` : 'N/A',
      acceleration060: carQueryData.model_0_to_100_kph ? `${carQueryData.model_0_to_100_kph}s` : 'N/A',
      topSpeed: carQueryData.model_top_speed_kph ? `${carQueryData.model_top_speed_kph} km/h` : 'N/A',
      transmission: carQueryData.model_transmission_type || 'N/A',
      driveType: carQueryData.model_drive || 'N/A',
      weight: carQueryData.model_weight_kg ? `${carQueryData.model_weight_kg} kg` : 'N/A',
      fuelEconomy: carQueryData.model_lkm_mixed ? `${carQueryData.model_lkm_mixed} L/100km` : undefined
    } : undefined;

    // Calculate pricing data from all sources
    const allPrices: number[] = [
      ...dbEntries.map(car => car.price),
      ...(auctionData?.prices || []),
      ...(motorsData?.prices || []),
      ...(classicData?.price ? [classicData.price] : [])
    ].filter(p => p && p > 0);

    const pricingData: PricingData | undefined = allPrices.length > 0 ? {
      baseMSRP: dbEntries[0]?.baseMSRP || undefined,
      currentMarketRange: allPrices.length > 0 
        ? `£${Math.min(...allPrices).toLocaleString()} - £${Math.max(...allPrices).toLocaleString()}`
        : 'N/A',
      averageDealerPrice: allPrices.reduce((a, b) => a + b, 0) / allPrices.length,
      dealerInventoryCount: motorsData?.inventoryCount || dbEntries.length,
      priceTrend: autoExpressData?.trend || 'stable',
      priceDistribution: allPrices.length > 0 ? {
        min: Math.min(...allPrices),
        max: Math.max(...allPrices),
        median: allPrices.sort((a, b) => a - b)[Math.floor(allPrices.length / 2)]
      } : undefined
    } : undefined;

    // Construct market data
    const marketData: MarketData | undefined = motorsData ? {
      listings: motorsData.listings || [],
      averagePrice: motorsData.averagePrice || 0,
      priceRange: motorsData.priceRange || '',
      inventoryCount: motorsData.inventoryCount || 0,
      priceDistribution: motorsData.priceDistribution,
      dataSource: 'motors.co.uk',
      searchParams: { make, model, year: parseInt(year) },
      timestamp: new Date().toISOString()
    } : undefined;

    // Aggregate popular options from database entries
    const popularOptions = dbEntries.length > 0 ? 
      dbEntries
        .flatMap(car => car.addedOptions || [])
        .reduce((acc: any[], option: any) => {
          const existing = acc.find(o => o.name === option);
          if (existing) {
            existing.frequency = (existing.frequency || 1) + 1;
          } else {
            acc.push({ 
              name: option, 
              frequency: 1, 
              source: 'database' as const 
            });
          }
          return acc;
        }, [])
        .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
        .slice(0, 10)
      : undefined;

    // Build comprehensive SPA data
    const comprehensiveData: ComprehensiveSPAData = {
      make,
      model,
      year: parseInt(year),
      bodyType: basicSpecifications?.bodyType,
      trim: dbEntries[0]?.trim || undefined,
      basicSpecifications,
      performanceData,
      pricingData,
      marketData,
      popularOptions,
      dataSources: {
        database: dbEntries.length > 0,
        carQuery: !!carQueryData,
        manufacturer: false, // Would need manufacturer API integration
        market: !!motorsData
      },
      dataSource: source,
      searchQuery: searchParams,
      timestamp: new Date().toISOString(),
      cacheExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    return {
      success: true,
      data: comprehensiveData,
      meta: {
        searchQuery: searchParams,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };

  } catch (error) {
    console.error('SPA Search Error:', error);
    
    return {
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to perform search',
        retryable: true
      },
      meta: {
        searchQuery: { make, model, year: parseInt(year), dataSource: source as any },
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }
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
          searchQuery: { make, model, year: year ? parseInt(year) : undefined, dataSource: source as any },
          executionTime: 0,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      },
      { status: 400 }
    );
  }

  const result = await handleSearch(source, make, model, year);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const { source = 'comprehensive', make, model, year } = await req.json();

  if (!make || !model) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: 'Make and model are required'
        },
        meta: {
          searchQuery: { make, model, year: year ? parseInt(year) : undefined, dataSource: source },
          executionTime: 0,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      },
      { status: 400 }
    );
  }

  const result = await handleSearch(source, make, model, year);
  return NextResponse.json(result);
}
