// src/app/api/spa/search/route.ts - COMPLETE FIXED FILE

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/carquery';
import { autotraderScraper } from '@/lib/scrapers/autotrader';
import { manufacturerScraper } from '@/lib/spa-services/manufacturer-scrapers';
import { SPASearchResponse, ComprehensiveSPAData, SPASearchParams } from '@/types/spa';

// Rate limiting and caching
const COMPREHENSIVE_SEARCH_CACHE = new Map<string, {
  data: ComprehensiveSPAData;
  timestamp: number;
}>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes for search results

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const searchParams: SPASearchParams = await request.json();
    const { make, model, year, dataSource = 'comprehensive' } = searchParams;

    if (!make || !model) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: 'Make and model are required',
          source: 'spa-search-api'
        },
        meta: {
          searchQuery: searchParams,
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          version: '2.0.0'
        }
      } as SPASearchResponse, { status: 400 });
    }

    console.log(`🔍 Enhanced SPA Search: ${make} ${model} ${year || 'any'} (Source: ${dataSource})`);

    // Check cache for comprehensive searches
    if (dataSource === 'comprehensive') {
      const cacheKey = `${make}-${model}-${year || 'any'}`;
      const cached = COMPREHENSIVE_SEARCH_CACHE.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        console.log('✅ Returning cached comprehensive search result');
        
        return NextResponse.json({
          success: true,
          data: cached.data,
          meta: {
            searchQuery: searchParams,
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            version: '2.0.0'
          }
        } as SPASearchResponse);
      }
    }

    let responseData: ComprehensiveSPAData | null = null;

    // Route to appropriate search method
    switch (dataSource) {
      case 'database':
        responseData = await searchDatabase(make, model, year);
        break;
        
      case 'carquery':
        responseData = await searchCarQuery(make, model, year);
        break;
        
      case 'manufacturer':
        responseData = await searchManufacturer(make, model, year);
        break;
        
      case 'market':
        responseData = await searchMarketData(make, model, year);
        break;
        
      case 'comprehensive':
      default:
        responseData = await comprehensiveSearch(make, model, year);
        break;
    }

    if (!responseData) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NO_DATA_FOUND',
          message: `No data found for ${make} ${model} ${year || ''}`,
          source: 'spa-search-api',
          details: {
            suggestion: 'Try different spelling or check if the car exists',
            availableDataSources: ['database', 'carquery', 'manufacturer', 'market', 'comprehensive']
          }
        },
        meta: {
          searchQuery: searchParams,
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          version: '2.0.0'
        }
      } as SPASearchResponse, { status: 404 });
    }

    // Cache comprehensive results
    if (dataSource === 'comprehensive') {
      const cacheKey = `${make}-${model}-${year || 'any'}`;
      COMPREHENSIVE_SEARCH_CACHE.set(cacheKey, {
        data: responseData,
        timestamp: Date.now()
      });
    }

    const executionTime = Date.now() - startTime;
    console.log(`✅ Enhanced SPA Search completed in ${executionTime}ms`);

    return NextResponse.json({
      success: true,
      data: responseData,
      meta: {
        searchQuery: searchParams,
        executionTime,
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }
    } as SPASearchResponse);

  } catch (error) {
    console.error('❌ Enhanced SPA search error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: error instanceof Error ? error.message : 'Search failed',
        source: 'spa-search-api'
      },
      meta: {
        searchQuery: {} as SPASearchParams,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }
    } as SPASearchResponse, { status: 500 });
  }
}

// Database search (enhanced)
// Database search (enhanced) - FIXED VERSION
async function searchDatabase(make: string, model: string, year?: number): Promise<ComprehensiveSPAData | null> {
  try {
    const buyCars = await prisma.buyCar.findMany({
      where: {
        make: { contains: make }, 
        model: { contains: model }, 
        ...(year && { year: year })
      },
      select: {
        id: true, make: true, model: true, year: true, price: true,
        baseMSRP: true, supercarData: true, performanceData: true, 
        pricingData: true, addedOptions: true, trim: true
      },
      take: 1
    });

    if (buyCars.length === 0) return null;

    const car = buyCars[0];
    let supercarData: { bodyType?: string } | null = null;
    let performanceData: {
      engine: string;
      horsePower: string;
      torque: string;
      acceleration060: string;
      topSpeed: string;
      transmission: string;
      driveType: string;
      weight: string;
      fuelEconomy?: string;
    } | null = null;
    let pricingData: {
      baseMSRP?: number;
      currentMarketRange: string;
      averageDealerPrice: number;
      dealerInventoryCount: number;
      priceTrend: string;
      priceDistribution?: {
        min: number;
        max: number;
        median: number;
      };
    } | null = null;
    let addedOptions: string[] = [];
    
    try {
      if (car.supercarData) {
        supercarData = typeof car.supercarData === 'string' 
          ? JSON.parse(car.supercarData) 
          : car.supercarData;
      }
      if (car.performanceData) {
        performanceData = typeof car.performanceData === 'string'
          ? JSON.parse(car.performanceData)
          : car.performanceData;
      }
      if (car.pricingData) {
        pricingData = typeof car.pricingData === 'string'
          ? JSON.parse(car.pricingData)
          : car.pricingData;
      }
      if (car.addedOptions) {
        addedOptions = typeof car.addedOptions === 'string'
          ? JSON.parse(car.addedOptions)
          : car.addedOptions;
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
    }

    // Fixed pricing data construction
    const finalPricingData: {
      baseMSRP?: number;
      currentMarketRange: string;
      averageDealerPrice: number;
      dealerInventoryCount: number;
      priceTrend: string;
      priceDistribution?: {
        min: number;
        max: number;
        median: number;
      };
    } = pricingData ? {
      // Convert null to undefined and only include if truthy
      ...(pricingData.baseMSRP !== null && pricingData.baseMSRP !== undefined && { baseMSRP: pricingData.baseMSRP }),
      currentMarketRange: pricingData.currentMarketRange,
      averageDealerPrice: pricingData.averageDealerPrice || car.price,
      dealerInventoryCount: pricingData.dealerInventoryCount || 1,
      priceTrend: pricingData.priceTrend || 'Stable',
      ...(pricingData.priceDistribution && { priceDistribution: pricingData.priceDistribution })
    } : {
      // Convert null baseMSRP to undefined
      ...(car.baseMSRP !== null && car.baseMSRP !== undefined && { baseMSRP: car.baseMSRP }),
      currentMarketRange: `£${Math.round(car.price * 0.95).toLocaleString()} - £${Math.round(car.price * 1.05).toLocaleString()}`,
      averageDealerPrice: car.price,
      dealerInventoryCount: 1,
      priceTrend: 'Database pricing'
    };

    return {
      make: car.make,
      model: car.model,
      year: car.year,
      trim: car.trim || undefined,
      bodyType: supercarData?.bodyType || 'Unknown',
      
      performanceData: performanceData || {
        engine: 'N/A',
        horsePower: 'N/A',
        torque: 'N/A',
        acceleration060: 'N/A',
        topSpeed: 'N/A',
        transmission: 'N/A',
        driveType: 'N/A',
        weight: 'N/A'
      },
      
      pricingData: finalPricingData,
      
      popularOptions: addedOptions.map(option => ({
        name: option,
        source: 'database' as const
      })),

      dataSources: {
        database: true,
        carQuery: false,
        manufacturer: false,
        market: false
      },
      
      dataSource: 'MySQL Database',
      searchQuery: { make, model, year, dataSource: 'database' },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Database search error:', error);
    return null;
  }
}

// CarQuery API search (enhanced)
async function searchCarQuery(make: string, model: string, year?: number): Promise<ComprehensiveSPAData | null> {
  try {
    const carData = await carQueryService.getCarData(make, model, year || 2022);
    
    if (!carData) return null;

    // Type-safe extraction of car data
    const typedCarData = carData as {
      basicSpecifications?: {
        make: string;
        model: string;
        year: number;
        bodyType: string;
        engine: string;
        engineCC?: string;
        cylinders?: string;
        doors: number;
        seats: number;
        drivetrain?: string;
        transmission?: string;
        fuelType?: string;
      };
      performanceData?: {
        engine: string;
        horsePower: string;
        torque: string;
        acceleration060: string;
        topSpeed: string;
        transmission: string;
        driveType: string;
        weight: string;
        fuelEconomy?: string;
      };
    };

    return {
      make,
      model,
      year: year || 2022,
      bodyType: typedCarData.basicSpecifications?.bodyType || 'Unknown',
      
      basicSpecifications: typedCarData.basicSpecifications,
      performanceData: typedCarData.performanceData,
      
      pricingData: {
        baseMSRP: 0, // CarQuery doesn't provide pricing
        currentMarketRange: 'N/A',
        averageDealerPrice: 0,
        dealerInventoryCount: 0,
        priceTrend: 'CarQuery API - No pricing data'
      },

      dataSources: {
        database: false,
        carQuery: true,
        manufacturer: false,
        market: false
      },
      
      dataSource: 'CarQuery API',
      searchQuery: { make, model, year, dataSource: 'carquery' },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('CarQuery search error:', error);
    return null;
  }
}

// Manufacturer search (real scrapers)
async function searchManufacturer(make: string, model: string, year?: number): Promise<ComprehensiveSPAData | null> {
  try {
    const manufacturerData = await manufacturerScraper.scrapeWithDelay(make, model);
    
    if (!manufacturerData || manufacturerData.error) return null;

    // Type-safe extraction of manufacturer data
    const typedManufacturerData = manufacturerData as {
      bodyType?: string;
      performanceData?: {
        engine: string;
        horsePower: string;
        torque: string;
        acceleration060: string;
        topSpeed: string;
        transmission: string;
        driveType: string;
        weight: string;
        fuelEconomy?: string;
      };
      pricingData?: {
        baseMSRP?: number;
        currentMarketRange: string;
        averageDealerPrice: number;
        dealerInventoryCount: number;
        priceTrend: string;
      };
      popularConfigurations?: {
        mostSelectedOptions?: Array<{ name: string; price?: number }>;
      };
      dataSource: string;
    };

    return {
      make,
      model,
      year: year || new Date().getFullYear(),
      bodyType: typedManufacturerData.bodyType || 'Unknown',
      
      performanceData: typedManufacturerData.performanceData,
      pricingData: typedManufacturerData.pricingData,
      
      manufacturerData: {
        make,
        model,
        year: year || new Date().getFullYear(),
        pricing: {
          basePrice: typedManufacturerData.pricingData?.baseMSRP || 0,
          currency: 'GBP',
          options: typedManufacturerData.popularConfigurations?.mostSelectedOptions?.map(opt => ({
            name: opt.name,
            price: opt.price || 0,
            currency: 'GBP'
          })) || []
        },
        dataSource: typedManufacturerData.dataSource,
        lastUpdated: new Date().toISOString()
      },
      
      popularOptions: typedManufacturerData.popularConfigurations?.mostSelectedOptions?.map(opt => ({
        name: opt.name,
        source: 'manufacturer' as const
      })) || [],

      dataSources: {
        database: false,
        carQuery: false,
        manufacturer: true,
        market: false
      },
      
      dataSource: typedManufacturerData.dataSource,
      searchQuery: { make, model, year, dataSource: 'manufacturer' },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Manufacturer search error:', error);
    return null;
  }
}

// Market data search (real scrapers)
async function searchMarketData(make: string, model: string, year?: number): Promise<ComprehensiveSPAData | null> {
  try {
    const marketResult = await autotraderScraper.searchCars(make, model, year);
    
    if (!marketResult.success || !marketResult.data) return null;

    const marketData = marketResult.data;

    return {
      make,
      model,
      year: year || 2022,
      
      pricingData: {
        baseMSRP: 0,
        currentMarketRange: marketData.priceRange,
        averageDealerPrice: marketData.averagePrice,
        dealerInventoryCount: marketData.inventoryCount,
        priceTrend: 'Based on current market listings'
      },
      
      marketData: {
        listings: marketData.listings,
        averagePrice: marketData.averagePrice,
        priceRange: marketData.priceRange,
        inventoryCount: marketData.inventoryCount,
        dataSource: marketData.dataSource,
        searchParams: { make, model, year },
        timestamp: marketData.timestamp
      },

      dataSources: {
        database: false,
        carQuery: false,
        manufacturer: false,
        market: true
      },
      
      dataSource: 'Autotrader UK Market Data',
      searchQuery: { make, model, year: year || undefined, dataSource: 'market' },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Market search error:', error);
    return null;
  }
}

// Comprehensive search combining all sources
async function comprehensiveSearch(make: string, model: string, year?: number): Promise<ComprehensiveSPAData | null> {
  try {
    console.log(`🚀 Starting comprehensive search for ${make} ${model} ${year || 'any'}`);
    
    const [databaseResult, carQueryResult, manufacturerResult, marketResult] = await Promise.allSettled([
      searchDatabase(make, model, year),
      searchCarQuery(make, model, year),
      searchManufacturer(make, model, year),
      searchMarketData(make, model, year)
    ]);

    // Extract successful results
    const dbData = databaseResult.status === 'fulfilled' ? databaseResult.value : null;
    const cqData = carQueryResult.status === 'fulfilled' ? carQueryResult.value : null;
    const mfgData = manufacturerResult.status === 'fulfilled' ? manufacturerResult.value : null;
    const marketData = marketResult.status === 'fulfilled' ? marketResult.value : null;

    // If no data from any source, return null
    if (!dbData && !cqData && !mfgData && !marketData) {
      return null;
    }

    // Fixed pricing data combination
    const combinedPricingData: {
      baseMSRP?: number;
      currentMarketRange: string;
      averageDealerPrice: number;
      dealerInventoryCount: number;
      priceTrend: string;
      priceDistribution?: {
        min: number;
        max: number;
        median: number;
      };
    } = {
      // Only include baseMSRP if it exists and is not null
      ...(
        (mfgData?.pricingData?.baseMSRP !== null && mfgData?.pricingData?.baseMSRP !== undefined) ||
        (dbData?.pricingData?.baseMSRP !== null && dbData?.pricingData?.baseMSRP !== undefined)
      ) && {
        baseMSRP: mfgData?.pricingData?.baseMSRP ?? dbData?.pricingData?.baseMSRP ?? 0
      },
      currentMarketRange: marketData?.pricingData?.currentMarketRange || 
                         dbData?.pricingData?.currentMarketRange || 'N/A',
      averageDealerPrice: marketData?.pricingData?.averageDealerPrice || 
                         dbData?.pricingData?.averageDealerPrice || 0,
      dealerInventoryCount: marketData?.pricingData?.dealerInventoryCount || 
                           dbData?.pricingData?.dealerInventoryCount || 0,
      priceTrend: marketData?.pricingData?.priceTrend || 
                 dbData?.pricingData?.priceTrend || 'Comprehensive analysis',
      // Include priceDistribution if available
      ...(marketData?.pricingData?.priceDistribution && { 
        priceDistribution: marketData.pricingData.priceDistribution 
      })
    };

    // Combine all data intelligently
    const combinedData: ComprehensiveSPAData = {
      make,
      model,
      year: year || dbData?.year || cqData?.year || 2022,
      bodyType: dbData?.bodyType || cqData?.bodyType || mfgData?.bodyType || 'Unknown',
      trim: dbData?.trim,

      // Use CarQuery for technical specs, fallback to database
      basicSpecifications: cqData?.basicSpecifications || dbData?.basicSpecifications,
      
      // Use database/manufacturer for performance data
      performanceData: dbData?.performanceData || mfgData?.performanceData || cqData?.performanceData,
      
      // Use the fixed pricing data
      pricingData: combinedPricingData,
      
      // Use manufacturer data if available
      manufacturerData: mfgData?.manufacturerData,
      
      // Use market data if available
      marketData: marketData?.marketData,
      
      // Combine popular options from all sources
      popularOptions: [
        ...(dbData?.popularOptions || []),
        ...(mfgData?.popularOptions || [])
      ],

      // Track which sources provided data
      dataSources: {
        database: !!dbData,
        carQuery: !!cqData,
        manufacturer: !!mfgData,
        market: !!marketData
      },
      
      dataSource: 'Comprehensive Multi-Source Aggregation',
      searchQuery: { make, model, year, dataSource: 'comprehensive' },
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Comprehensive search completed - Sources: DB:${!!dbData}, CQ:${!!cqData}, MFG:${!!mfgData}, MKT:${!!marketData}`);
    
    return combinedData;
    
  } catch (error) {
    console.error('Comprehensive search error:', error);
    return null;
  }
}

// Cache management endpoint
export async function DELETE() {  
  try {
    COMPREHENSIVE_SEARCH_CACHE.clear();
    console.log('🧹 SPA search cache cleared');
    
    return NextResponse.json({
      success: true,
      message: 'Search cache cleared successfully'
    });
    
  } catch (err) {  
    console.error('Cache clear error:', err);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}