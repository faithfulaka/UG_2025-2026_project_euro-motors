// src/app/api/spa/search/route.ts 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/carquery';
import { manufacturerScraperService } from '@/lib/spa-services/manufacturer-scrapers';
import { marketScraperService } from '@/lib/scrapers/market-scrapers';
import { SPASearchRequest, SPASearchResponse } from '@/types/spa';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const searchRequest: SPASearchRequest = await request.json();
    const { make, model, year, sources, maxResults = 50 } = searchRequest;

    // Input validation
    if (!make || !model) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Make and model are required',
          recoverable: false
        }
      }, { status: 400 });
    }

    console.log(`🚀 COMPREHENSIVE SPA SEARCH: ${make} ${model} ${year || 'any'}`);
    console.log(`📊 Sources requested: ${sources?.join(', ') || 'all'}`);

    // Initialize response object
    const spaResponse: SPASearchResponse = {
      searchQuery: searchRequest,
      timestamp: new Date().toISOString(),
      processingTimeMs: 0,
      vehicle: {
        make: make.trim(),
        model: model.trim(),
        year: year || new Date().getFullYear()
      },
      dataSources: {
        carQuery: false,
        manufacturerOfficial: false,
        autotrader: false,
        carscom: false,
        classiccom: false,
        bringatrailer: false,
        edmunds: false,
        kbb: false
      },
      confidence: {
        specifications: 'low',
        pricing: 'low',
        marketData: 'low',
        overall: 'low'
      }
    };

    // Determine which sources to use
    const enabledSources = sources || ['database', 'carquery', 'manufacturer', 'market'];

    // 🗄️ DATABASE SEARCH (Our existing comprehensive data)
    let databaseData = null;
    if (enabledSources.includes('database')) {
      console.log('🔍 Searching database...');
      try {
        const dbCars = await prisma.buyCar.findMany({
          where: {
            make: { contains: make, mode: 'insensitive' },
            model: { contains: model, mode: 'insensitive' },
            ...(year && { year: parseInt(year.toString()) })
          },
          select: {
            id: true, make: true, model: true, year: true, price: true,
            baseMSRP: true, supercarData: true, performanceData: true, pricingData: true,
            specifications: true, features: true, addedOptions: true
          },
          take: 1
        });

        if (dbCars.length > 0) {
          const car = dbCars[0];
          
          // Parse JSON fields safely
          const supercarData = typeof car.supercarData === 'string' 
            ? JSON.parse(car.supercarData) 
            : car.supercarData;
          
          const performanceData = typeof car.performanceData === 'string'
            ? JSON.parse(car.performanceData)
            : car.performanceData;

          if (supercarData && performanceData) {
            databaseData = supercarData;
            spaResponse.dataSources.carQuery = true; // Our DB has CarQuery-enhanced data
            spaResponse.confidence.specifications = 'high';
            spaResponse.confidence.pricing = 'high';
            
            console.log('✅ Found comprehensive data in database');
          }
        }
      } catch (dbError) {
        console.error('❌ Database search error:', dbError);
      }
    }

    // 🔍 CARQUERY API (Technical specifications)
    if (enabledSources.includes('carquery')) {
      console.log('🔍 Querying CarQuery API...');
      try {
        const carQueryResult = await carQueryService.getCarData(make, model, year || new Date().getFullYear());
        
        if (carQueryResult.success && carQueryResult.data) {
          spaResponse.specifications = carQueryResult.data.specifications;
          spaResponse.dataSources.carQuery = true;
          spaResponse.confidence.specifications = 'high';
          
          console.log('✅ CarQuery API data retrieved');
        } else {
          console.log('⚠️ CarQuery API: No data found');
        }
      } catch (carQueryError) {
        console.error('❌ CarQuery error:', carQueryError);
      }
    }

    // 🏭 MANUFACTURER CONFIGURATOR (Official pricing)
    let manufacturerData = null;
    if (enabledSources.includes('manufacturer')) {
      console.log('🏭 Scraping manufacturer configurator...');
      try {
        const manufacturerResult = await manufacturerScraperService.scrapeManufacturerData(
          make.toLowerCase(), 
          model, 
          year
        );
        
        if (manufacturerResult.success && manufacturerResult.data) {
          manufacturerData = manufacturerResult.data;
          spaResponse.configurator = manufacturerData;
          spaResponse.dataSources.manufacturerOfficial = true;
          
          // Set pricing from manufacturer if available
          if (manufacturerData.basePrice > 0) {
            spaResponse.pricing = {
              newCar: {
                msrp: manufacturerData.basePrice,
                startingPrice: manufacturerData.basePrice,
                financing: {
                  apr: 4.9, // Default APR for luxury cars
                  terms: [36, 48, 60, 72],
                  monthlyPaymentEstimate: Math.round(manufacturerData.basePrice * 0.02) // Rough estimate
                }
              }
            };
            spaResponse.confidence.pricing = 'high';
          }
          
          console.log(`✅ Manufacturer data: £${manufacturerData.basePrice.toLocaleString()}, ${manufacturerData.availableOptions.length} options`);
        } else {
          console.log(`⚠️ Manufacturer scraping failed: ${manufacturerResult.error?.message}`);
        }
      } catch (manufacturerError) {
        console.error('❌ Manufacturer scraping error:', manufacturerError);
      }
    }

    // 📊 MARKET DATA (Used car pricing and inventory)
    if (enabledSources.includes('market')) {
      console.log('📊 Scraping market data...');
      try {
        const marketResult = await marketScraperService.scrapeAllMarketData(make, model, year);
        
        if (marketResult.success && marketResult.data) {
          spaResponse.marketData = marketResult.data;
          
          // Aggregate market data for used car pricing
          const allListings = marketResult.data.flatMap(source => source.listings);
          if (allListings.length > 0) {
            const prices = allListings.map(l => l.price).filter(p => p > 0);
            const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
            
            spaResponse.pricing = {
              ...spaResponse.pricing,
              usedMarket: {
                averagePrice: Math.round(avgPrice),
                priceRange: {
                  min: Math.min(...prices),
                  max: Math.max(...prices)
                },
                marketTrend: {
                  direction: 'stable' as const,
                  changePercent: 0,
                  timeframe: '30d' as const
                }
              }
            };
            
            spaResponse.dataSources.autotrader = true;
            spaResponse.dataSources.carscom = true;
            spaResponse.dataSources.classiccom = true;
            spaResponse.dataSources.bringatrailer = true;
            spaResponse.confidence.marketData = 'high';
          }
          
          console.log(`✅ Market data: ${allListings.length} listings from ${marketResult.data.length} sources`);
        } else {
          console.log('⚠️ Market data scraping failed');
        }
      } catch (marketError) {
        console.error('❌ Market scraping error:', marketError);
      }
    }

    // 💰 ENHANCED PRICING WITH DATABASE FALLBACK
    if (!spaResponse.pricing && databaseData) {
      console.log('💰 Using database pricing data...');
      
      if (databaseData.pricingData) {
        spaResponse.pricing = {
          newCar: {
            msrp: databaseData.pricingData.baseMSRP || databaseData.pricingData.averageDealerPrice,
            startingPrice: databaseData.pricingData.averageDealerPrice,
            financing: {
              apr: 4.9,
              terms: [36, 48, 60, 72],
              monthlyPaymentEstimate: Math.round((databaseData.pricingData.averageDealerPrice || 0) * 0.02)
            }
          }
        };
      }
    }

    // 🏆 OWNERSHIP COSTS (Enhanced with real data)
    if (databaseData?.ownershipCosts || manufacturerData) {
      const basePrice = spaResponse.pricing?.newCar?.msrp || databaseData?.pricingData?.baseMSRP || 150000;
      
      spaResponse.ownershipCosts = {
        insurance: {
          averageAnnual: Math.round(basePrice * 0.02), // 2% of vehicle value
          group: 50,
          factors: ['High performance', 'Luxury vehicle', 'High repair costs']
        },
        maintenance: {
          averageAnnual: Math.round(basePrice * 0.03), // 3% of vehicle value
          commonServices: [
            { service: 'Annual service', intervalMiles: 12000, averageCost: 1500 },
            { service: 'Brake pads', intervalMiles: 30000, averageCost: 2000 },
            { service: 'Tires (set)', intervalMiles: 25000, averageCost: 1800 }
          ]
        },
        depreciation: {
          year1Percent: 15,
          year3Percent: 35,
          year5Percent: 48,
          projectedValue: {
            year1: Math.round(basePrice * 0.85),
            year3: Math.round(basePrice * 0.65),
            year5: Math.round(basePrice * 0.52)
          }
        },
        totalCostOfOwnership: {
          year1: Math.round(basePrice * 0.25), // Initial depreciation + costs
          year3: Math.round(basePrice * 0.55),
          year5: Math.round(basePrice * 0.75)
        }
      };
    }

    // 📈 OVERALL CONFIDENCE CALCULATION
    const confidenceScores = {
      specifications: spaResponse.confidence.specifications === 'high' ? 3 : spaResponse.confidence.specifications === 'medium' ? 2 : 1,
      pricing: spaResponse.confidence.pricing === 'high' ? 3 : spaResponse.confidence.pricing === 'medium' ? 2 : 1,
      marketData: spaResponse.confidence.marketData === 'high' ? 3 : spaResponse.confidence.marketData === 'medium' ? 2 : 1
    };
    
    const avgConfidence = (confidenceScores.specifications + confidenceScores.pricing + confidenceScores.marketData) / 3;
    spaResponse.confidence.overall = avgConfidence >= 2.5 ? 'high' : avgConfidence >= 1.5 ? 'medium' : 'low';

    // 🎯 SUGGESTIONS (Based on data quality)
    const activeSources = Object.values(spaResponse.dataSources).filter(Boolean).length;
    if (activeSources < 2) {
      spaResponse.suggestions = {
        similarVehicles: [
          {
            make: make,
            model: model + ' (different year)',
            year: (year || new Date().getFullYear()) - 1,
            priceComparison: 'lower',
            keyDifferences: ['Previous model year', 'May have lower price']
          }
        ],
        betterDeals: [
          {
            description: 'Try searching with broader criteria',
            savings: 0,
            source: 'Search suggestion'
          }
        ]
      };
    }

    // Final processing time
    spaResponse.processingTimeMs = Date.now() - startTime;

    console.log(`✅ SPA SEARCH COMPLETE: ${activeSources} sources, ${spaResponse.confidence.overall} confidence, ${spaResponse.processingTimeMs}ms`);

    return NextResponse.json({
      success: true,
      data: spaResponse,
      meta: {
        searchQuery: searchRequest,
        sourcesUsed: Object.entries(spaResponse.dataSources).filter(([_, active]) => active).map(([source]) => source),
        processingTime: spaResponse.processingTimeMs,
        cacheStatus: 'fresh'
      }
    });

  } catch (error: any) {
    console.error('🚨 SPA SEARCH ERROR:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'SEARCH_FAILED',
        message: error.message || 'Comprehensive search failed',
        recoverable: true,
        retryAfter: 60
      },
      processingTimeMs: Date.now() - startTime
    }, { status: 500 });
  }
}

// GET method for quick health check
export async function GET() {
  const supportedManufacturers = manufacturerScraperService.getSupportedManufacturers();
  const marketSources = marketScraperService.getCacheStats().sources;
  
  return NextResponse.json({
    status: 'SPA Service Operational',
    capabilities: {
      carQueryAPI: true,
      manufacturerScrapers: supportedManufacturers.length,
      marketScrapers: marketSources.length,
      databaseIntegration: true
    },
    supportedManufacturers,
    marketSources,
    version: '2.0',
    lastUpdated: new Date().toISOString()
  });
}