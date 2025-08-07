// src/app/api/spa/search/route.ts - Updated with new reliable APIs
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unifiedCarService, newAPIServices } from '@/lib/services/new-apis';
import type { ComprehensiveSPAData, SPASearchResponse, SPASearchParams, MarketData } from '@/types/spa';
import type { PerformanceData, PricingData } from '@/types/cars';

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
      dataSource: source as 'comprehensive' | 'database' | 'carquery' | 'manufacturer' | 'market'
    };

    // Fetch data from various reliable sources
    const [
      apiSearchResults,
      dbEntries,
      marketStats,
      dealerInfo
    ] = await Promise.all([
      // Comprehensive search across all new APIs
      source !== 'database' ? unifiedCarService.searchVehicles(make, model, parseInt(year)) : null,
      // Database entries
      source === 'database' || source === 'comprehensive' 
        ? prisma.buyCar.findMany({ 
            where: { make, model, year: Number(year) },
            include: { images: true }
          }) 
        : [],
      // Market data from MarketCheck
      newAPIServices.marketCheck.getMarketStats(make, model, parseInt(year)).catch(() => null),
      // Dealer information
      newAPIServices.cisAutomotive.findNearestDealers(make, {}).catch(() => [])
    ]);

    // Process Edmunds data for specifications
    const edmundsData = apiSearchResults?.edmunds;
    const basicSpecifications = edmundsData ? {
      make,
      model,
      year: parseInt(year),
      bodyType: edmundsData.bodyType || '',
      engine: `${edmundsData.engine?.displacement || 'N/A'}L ${edmundsData.engine?.type || 'N/A'}`,
      engineCC: edmundsData.engine?.displacement?.toString() || undefined,
      cylinders: edmundsData.engine?.cylinders?.toString() || undefined,
      doors: 0, // Not provided in Edmunds API structure
      seats: 0, // Not provided in Edmunds API structure
      drivetrain: edmundsData.drivetrain || '',
      transmission: edmundsData.transmission || '',
      fuelType: edmundsData.engine?.fuelType || undefined
    } : undefined;

    // Process performance data from Edmunds
    const performanceData: PerformanceData | undefined = edmundsData ? {
      engine: `${edmundsData.engine?.displacement || 'N/A'}L ${edmundsData.engine?.type || 'N/A'}`,
      horsePower: edmundsData.engine?.horsepower?.toString() || 'N/A',
      torque: edmundsData.engine?.torque ? `${edmundsData.engine.torque} lb-ft` : 'N/A',
      acceleration060: 'N/A', // Not available in Edmunds response structure
      topSpeed: 'N/A', // Not available in Edmunds response structure
      transmission: edmundsData.transmission || 'N/A',
      driveType: edmundsData.drivetrain || 'N/A',
      weight: 'N/A', // Not available in Edmunds response structure
      fuelEconomy: edmundsData.mpg ? `${edmundsData.mpg.combined || 'N/A'} MPG combined` : undefined
    } : undefined;

    // Calculate pricing data from all sources
    const allPrices: number[] = [
      ...dbEntries.map(car => car.price),
      ...(apiSearchResults?.marketCheck || []).map(item => item.price),
      ...(edmundsData?.price?.msrp ? [edmundsData.price.msrp] : []),
    ].filter(p => p && p > 0);

    const baseMSRP = dbEntries[0]?.baseMSRP || 
                     edmundsData?.price?.msrp || 
                     (allPrices.length > 0 ? Math.min(...allPrices) : 0);

    const pricingData: PricingData | undefined = allPrices.length > 0 || marketStats ? {
      baseMSRP: baseMSRP || 0,
      currentMarketRange: marketStats ? 
        `£${marketStats.minPrice.toLocaleString()} - £${marketStats.maxPrice.toLocaleString()}` :
        (allPrices.length > 0 
          ? `£${Math.min(...allPrices).toLocaleString()} - £${Math.max(...allPrices).toLocaleString()}`
          : 'N/A'),
      averageDealerPrice: marketStats?.averagePrice || 
                         (allPrices.length > 0 ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length : 0),
      dealerInventoryCount: dbEntries.length,
      priceTrend: 'stable', // Default trend
      priceDistribution: allPrices.length > 0 ? {
        min: Math.min(...allPrices),
        max: Math.max(...allPrices),
        median: allPrices.sort((a, b) => a - b)[Math.floor(allPrices.length / 2)]
      } : undefined
    } : undefined;

    // Construct market data
    const marketData: MarketData | undefined = marketStats ? {
      listings: (apiSearchResults?.marketCheck || []).map(vehicle => ({
        title: vehicle.heading,
        price: vehicle.price.toString(),
        priceNumeric: vehicle.price,
        mileage: vehicle.miles?.toString(),
        year: vehicle.build?.year,
        location: `${vehicle.dealer?.city}, ${vehicle.dealer?.state}`,
        dealer: vehicle.dealer?.name,
        specs: `${vehicle.build?.engine} ${vehicle.build?.transmission}`,
        url: vehicle.vdp_url,
        imageUrl: vehicle.media?.photo_links?.[0]
      })),
      averagePrice: marketStats.averagePrice,
      priceRange: `£${marketStats.minPrice.toLocaleString()} - £${marketStats.maxPrice.toLocaleString()}`,
      inventoryCount: marketStats.totalListings,
      priceDistribution: {
        min: marketStats.minPrice,
        max: marketStats.maxPrice,
        median: marketStats.medianPrice,
        q1: marketStats.priceDistribution.q1,
        q3: marketStats.priceDistribution.q3
      },
      dataSource: 'MarketCheck API',
      searchParams: { make, model, year: parseInt(year) },
      timestamp: new Date().toISOString()
    } : undefined;

    // Aggregate popular options from database entries
    const popularOptions = dbEntries.length > 0 ? 
      dbEntries
        .flatMap(car => {
          const options = car.addedOptions;
          if (typeof options === 'string') {
            try {
              return JSON.parse(options) as string[];
            } catch {
              return [];
            }
          }
          return Array.isArray(options) ? options : [];
        })
        .reduce((acc: Array<{ name: string; frequency?: number; source: 'database' | 'market' | 'manufacturer' }>, option: string) => {
          const existing = acc.find(o => o.name === option);
          if (existing) {
            existing.frequency = (existing.frequency || 1) + 1;
          } else {
            acc.push({ 
              name: option, 
              frequency: 1, 
              source: 'database'
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
        carQuery: false, // No longer using CarQuery
        manufacturer: !!edmundsData, 
        market: !!marketStats
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
        version: '2.0.0' // Updated version with new APIs
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
        searchQuery: { 
          make, 
          model, 
          year: parseInt(year), 
          dataSource: source as 'comprehensive' | 'database' | 'carquery' | 'manufacturer' | 'market'
        },
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        version: '2.0.0'
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
          searchQuery: { 
            make, 
            model, 
            year: year ? parseInt(year) : undefined, 
            dataSource: source as 'comprehensive' | 'database' | 'carquery' | 'manufacturer' | 'market'
          },
          executionTime: 0,
          timestamp: new Date().toISOString(),
          version: '2.0.0'
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
          version: '2.0.0'
        }
      },
      { status: 400 }
    );
  }

  const result = await handleSearch(source, make, model, year);
  return NextResponse.json(result);
}