// src/app/api/spa/test-apis/route.ts - Test endpoint for new reliable APIs
import { NextRequest, NextResponse } from 'next/server';
import { newAPIServices } from '@/lib/services/new-apis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const api = searchParams.get('api') || 'all';
  const make = searchParams.get('make') || 'BMW';
  const model = searchParams.get('model') || 'X5';
  const year = parseInt(searchParams.get('year') || '2023');

  const startTime = Date.now();

  try {
    let results: any = {};

    switch (api) {
      case 'edmunds': {
        results = {
          api: 'Edmunds',
          tests: {
            makes: await newAPIServices.edmunds.getMakes(),
            models: await newAPIServices.edmunds.getModels(make.toLowerCase()),
            vehicleSpecs: await newAPIServices.edmunds.getVehicleSpecs(make, model, year),
            searchResults: await newAPIServices.edmunds.searchVehicles({ make, model, year })
          }
        };
        break;
      }

      case 'marketcheck': {
        results = {
          api: 'MarketCheck',
          tests: {
            makes: await newAPIServices.marketCheck.getAvailableMakes(),
            models: await newAPIServices.marketCheck.getAvailableModels(make),
            searchResults: await newAPIServices.marketCheck.searchByMakeModelYear(make, model, year),
            marketStats: await newAPIServices.marketCheck.getMarketStats(make, model, year),
            featuredVehicles: await newAPIServices.marketCheck.getFeaturedVehicles(10)
          }
        };
        break;
      }

      case 'cis': {
        results = {
          api: 'CIS Automotive',
          tests: {
            makes: await newAPIServices.cisAutomotive.getAvailableMakes(),
            models: await newAPIServices.cisAutomotive.getAvailableModels(make),
            dealers: await newAPIServices.cisAutomotive.getDealersByBrand(make, { state: 'CA' }),
            vehicles: await newAPIServices.cisAutomotive.searchVehicles({ make, model, year }),
            dealerById: await newAPIServices.cisAutomotive.getDealerByID('29319') // Example dealer ID
          }
        };
        break;
      }

      case 'cardata': {
        results = {
          api: 'Car Data',
          tests: {
            makes: await newAPIServices.carData.getMakes(),
            models: await newAPIServices.carData.getModels(make),
            years: await newAPIServices.carData.getYears(),
            types: await newAPIServices.carData.getTypes(),
            searchResults: await newAPIServices.carData.searchCars(make, model, year),
            popularCars: await newAPIServices.carData.getPopularCars(10),
            comprehensiveData: await newAPIServices.carData.getComprehensiveCarData(make, model, year)
          }
        };
        break;
      }

      case 'all':
      default: {
        // Test all APIs with basic functionality
        const [edmundsTest, marketCheckTest, cisTest, carDataTest] = await Promise.allSettled([
          // Edmunds test
          Promise.all([
            newAPIServices.edmunds.getMakes(),
            newAPIServices.edmunds.getVehicleSpecs(make, model, year)
          ]),
          // MarketCheck test
          Promise.all([
            newAPIServices.marketCheck.getAvailableMakes(),
            newAPIServices.marketCheck.getMarketStats(make, model, year)
          ]),
          // CIS Automotive test
          Promise.all([
            newAPIServices.cisAutomotive.getAvailableMakes(),
            newAPIServices.cisAutomotive.getDealerByID('29319')
          ]),
          // Car Data test
          Promise.all([
            newAPIServices.carData.getMakes(),
            newAPIServices.carData.searchCars(make, model, year, { limit: 5 })
          ])
        ]);

        results = {
          summary: 'Testing all new reliable APIs',
          testParams: { make, model, year },
          results: {
            edmunds: {
              status: edmundsTest.status,
              data: edmundsTest.status === 'fulfilled' ? {
                makesCount: edmundsTest.value[0]?.length || 0,
                vehicleSpecs: edmundsTest.value[1] ? 'Found' : 'Not found'
              } : { error: edmundsTest.reason?.message },
              working: edmundsTest.status === 'fulfilled'
            },
            marketCheck: {
              status: marketCheckTest.status,
              data: marketCheckTest.status === 'fulfilled' ? {
                makesCount: marketCheckTest.value[0]?.length || 0,
                marketStats: marketCheckTest.value[1] ? 'Found' : 'Not found'
              } : { error: marketCheckTest.reason?.message },
              working: marketCheckTest.status === 'fulfilled'
            },
            cisAutomotive: {
              status: cisTest.status,
              data: cisTest.status === 'fulfilled' ? {
                makesCount: cisTest.value[0]?.length || 0,
                dealerTest: cisTest.value[1] ? 'Found dealer' : 'No dealer found'
              } : { error: cisTest.reason?.message },
              working: cisTest.status === 'fulfilled'
            },
            carData: {
              status: carDataTest.status,
              data: carDataTest.status === 'fulfilled' ? {
                makesCount: carDataTest.value[0]?.length || 0,
                searchResults: carDataTest.value[1]?.length || 0
              } : { error: carDataTest.reason?.message },
              working: carDataTest.status === 'fulfilled'
            }
          },
          workingApis: [
            edmundsTest.status === 'fulfilled' ? 'edmunds' : null,
            marketCheckTest.status === 'fulfilled' ? 'marketCheck' : null,
            cisTest.status === 'fulfilled' ? 'cisAutomotive' : null,
            carDataTest.status === 'fulfilled' ? 'carData' : null
          ].filter(Boolean),
          totalWorkingApis: [edmundsTest, marketCheckTest, cisTest, carDataTest]
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
        version: '2.0.0',
        note: 'All old unreliable APIs and scrapers have been removed. These are the new reliable APIs.'
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
        version: '2.0.0'
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { apis, make = 'BMW', model = 'X5', year = 2023 } = await request.json();

    if (!apis || !Array.isArray(apis)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: 'APIs array is required'
        }
      }, { status: 400 });
    }

    const results: any = {};

    for (const api of apis) {
      const url = new URL(request.url);
      const params = new URLSearchParams({
        api,
        make,
        model,
        year: year.toString()
      });

      const response = await fetch(
        `${url.origin}/api/spa/test-apis?${params}`,
        {
          method: 'GET',
          headers: request.headers
        }
      );

      if (response.ok) {
        const data = await response.json();
        results[api] = data.results;
      } else {
        results[api] = { error: 'Failed to test API' };
      }
    }

    return NextResponse.json({
      success: true,
      batchTest: true,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch API test error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'BATCH_TEST_ERROR',
        message: 'Failed to run batch API tests'
      }
    }, { status: 500 });
  }
}