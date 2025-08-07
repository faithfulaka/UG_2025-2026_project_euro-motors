// src/app/api/spa/test-apis/route.ts - Updated with correct endpoints
import { NextRequest, NextResponse } from 'next/server';
import { newAPIServices } from '@/lib/services/new-apis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const api = searchParams.get('api') || 'all';
  const make = searchParams.get('make') || 'BMW';
  const model = searchParams.get('model') || 'X5';
  const year = parseInt(searchParams.get('year') || '2023');
  const vin = searchParams.get('vin');

  const startTime = Date.now();

  try {
    let results: any = {};

    switch (api) {
      case 'cardata': {
        results = {
          api: 'Car Data API',
          endpoints: {
            cars: await newAPIServices.carData.getCars({ make, model, year, limit: 5 }),
            types: await newAPIServices.carData.getTypes(),
            makes: await newAPIServices.carData.getMakes(),
            years: await newAPIServices.carData.getYears()
          }
        };
        break;
      }

      case 'cis': {
        results = {
          api: 'CIS Automotive',
          staticData: {
            brands: await newAPIServices.cisAutomotive.getBrands(),
            regions: await newAPIServices.cisAutomotive.getRegions(),
            models: await newAPIServices.cisAutomotive.getModels()
          },
          pricingData: await newAPIServices.cisAutomotive.getComprehensivePricing(make, model, year)
        };
        break;
      }

      case 'carapi2': {
        results = {
          api: 'Car API2',
          endpoints: {
            years: await newAPIServices.carApi2.getYears(),
            makes: await newAPIServices.carApi2.getMakes(),
            models: await newAPIServices.carApi2.getModels(make),
            trims: await newAPIServices.carApi2.getTrims(make, model, year),
            bodies: await newAPIServices.carApi2.getBodies(make, model, year),
            engines: await newAPIServices.carApi2.getEngines(make, model, year),
            exteriorColors: await newAPIServices.carApi2.getExteriorColors(make, model, year),
            interiorColors: await newAPIServices.carApi2.getInteriorColors(make, model, year),
            mileages: await newAPIServices.carApi2.getMileages(make, model, year),
            vinDecode: vin ? await newAPIServices.carApi2.decodeVIN(vin) : null
          }
        };
        break;
      }

      case 'marketcheck': {
        const searchResult = await newAPIServices.marketCheck.searchVehicles({
          make,
          model,
          year,
          rows: 10
        });
        
        results = {
          api: 'MarketCheck (Car Search API)',
          searchResults: {
            totalFound: searchResult?.num_found || 0,
            listings: searchResult?.listings || [],
            stats: searchResult?.stats || null
          },
          marketStats: await newAPIServices.marketCheck.getMarketStats(make, model, year)
        };
        break;
      }

      case 'comprehensive': {
        results = {
          api: 'Comprehensive Aggregator',
          vehicleData: await newAPIServices.aggregator.getComprehensiveVehicleData(
            make, model, year, { vin }
          ),
          suggestions: {
            makes: await newAPIServices.aggregator.getEnhancedSuggestions('make'),
            models: await newAPIServices.aggregator.getEnhancedSuggestions('model', { make }),
            years: await newAPIServices.aggregator.getEnhancedSuggestions('year')
          }
        };
        break;
      }

      case 'all':
      default: {
        // Test all APIs with minimal calls
        const [carDataTest, cisTest, carApi2Test, marketCheckTest] = await Promise.allSettled([
          // Car Data API
          newAPIServices.carData.getCars({ make, model, year, limit: 2 }),
          
          // CIS Automotive
          newAPIServices.cisAutomotive.getComprehensivePricing(make, model, year),
          
          // Car API2
          newAPIServices.carApi2.getTrims(make, model, year),
          
          // MarketCheck
          newAPIServices.marketCheck.searchVehicles({ make, model, year, rows: 5 })
        ]);

        results = {
          summary: 'Testing all APIs',
          testParams: { make, model, year },
          results: {
            carData: {
              status: carDataTest.status,
              working: carDataTest.status === 'fulfilled',
              carsFound: carDataTest.status === 'fulfilled' ? carDataTest.value.length : 0
            },
            cisAutomotive: {
              status: cisTest.status,
              working: cisTest.status === 'fulfilled',
              hasPricing: cisTest.status === 'fulfilled' && cisTest.value ? 
                !!(cisTest.value.valuation || cisTest.value.listPrice || cisTest.value.salePrice) : false
            },
            carApi2: {
              status: carApi2Test.status,
              working: carApi2Test.status === 'fulfilled',
              trimsFound: carApi2Test.status === 'fulfilled' ? carApi2Test.value.length : 0
            },
            marketCheck: {
              status: marketCheckTest.status,
              working: marketCheckTest.status === 'fulfilled',
              listingsFound: marketCheckTest.status === 'fulfilled' && marketCheckTest.value ? 
                marketCheckTest.value.listings.length : 0
            }
          },
          workingApis: [
            carDataTest.status === 'fulfilled' ? 'carData' : null,
            cisTest.status === 'fulfilled' ? 'cisAutomotive' : null,
            carApi2Test.status === 'fulfilled' ? 'carApi2' : null,
            marketCheckTest.status === 'fulfilled' ? 'marketCheck' : null
          ].filter(Boolean),
          totalWorkingApis: [carDataTest, cisTest, carApi2Test, marketCheckTest]
            .filter(test => test.status === 'fulfilled').length
        };
        break;
      }
    }

    return NextResponse.json({
      success: true,
      api,
      results,
      meta: {
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        version: '3.0.0',
        note: 'Using only specified endpoints. Edmunds removed.'
      }
    });

  } catch (error) {
    console.error('API test error:', error);
    return NextResponse.json({
      success: false,
      api,
      error: {
        code: 'TEST_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to test API endpoints'
      },
      meta: {
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      }
    }, { status: 500 });
  }
}
