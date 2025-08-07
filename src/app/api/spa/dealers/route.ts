// src/app/api/spa/dealers/route.ts - Dealer information using CIS Automotive API
import { NextRequest, NextResponse } from 'next/server';
import { newAPIServices } from '@/lib/services/new-apis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'search';
  const make = searchParams.get('make');
  const dealerID = searchParams.get('dealerID');
  const zip = searchParams.get('zip');
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const radius = parseInt(searchParams.get('radius') || '25');

  const startTime = Date.now();

  try {
    let results: any = {};

    switch (action) {
      case 'search': {
        if (!make) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'INVALID_PARAMS',
              message: 'Make parameter is required for dealer search'
            }
          }, { status: 400 });
        }

        const location = { zip, city, state, radius };
        const dealers = await newAPIServices.cisAutomotive.getDealersByBrand(make, location);

        results = {
          action: 'search',
          searchParams: { make, location },
          dealers,
          count: dealers.length,
          summary: {
            totalDealers: dealers.length,
            states: Array.from(new Set(dealers.map(d => d.address?.state))).filter(Boolean),
            services: Array.from(new Set(dealers.flatMap(d => d.services || []))),
            averageRating: dealers
              .filter(d => d.ratings?.overall)
              .reduce((sum, d) => sum + (d.ratings?.overall || 0), 0) / 
              dealers.filter(d => d.ratings?.overall).length || 0
          }
        };
        break;
      }

      case 'details': {
        if (!dealerID) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'INVALID_PARAMS',
              message: 'DealerID parameter is required for dealer details'
            }
          }, { status: 400 });
        }

        const [dealerInfo, inventory, reviews] = await Promise.allSettled([
          newAPIServices.cisAutomotive.getDealerByID(dealerID),
          newAPIServices.cisAutomotive.getDealerInventory(dealerID, { limit: 20 }),
          newAPIServices.cisAutomotive.getDealerReviews(dealerID)
        ]);

        results = {
          action: 'details',
          dealerID,
          dealer: dealerInfo.status === 'fulfilled' ? dealerInfo.value : null,
          inventory: {
            status: inventory.status,
            vehicles: inventory.status === 'fulfilled' ? inventory.value : [],
            count: inventory.status === 'fulfilled' ? inventory.value?.length || 0 : 0
          },
          reviews: {
            status: reviews.status,
            data: reviews.status === 'fulfilled' ? reviews.value : null
          }
        };
        break;
      }

      case 'inventory': {
        if (!dealerID) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'INVALID_PARAMS',
              message: 'DealerID parameter is required for inventory'
            }
          }, { status: 400 });
        }

        const filters = {
          make: searchParams.get('filterMake') || undefined,
          model: searchParams.get('filterModel') || undefined,
          condition: searchParams.get('condition') as 'new' | 'used' | 'certified' || undefined,
          priceMin: searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!) : undefined,
          priceMax: searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : undefined,
          limit: parseInt(searchParams.get('limit') || '25')
        };

        const inventory = await newAPIServices.cisAutomotive.getDealerInventory(dealerID, filters);

        results = {
          action: 'inventory',
          dealerID,
          filters,
          inventory,
          count: inventory.length,
          summary: {
            totalVehicles: inventory.length,
            conditions: Array.from(new Set(inventory.map(v => v.condition))),
            makes: Array.from(new Set(inventory.map(v => v.make))),
            priceRange: {
              min: Math.min(...inventory.map(v => v.price).filter(p => p > 0)),
              max: Math.max(...inventory.map(v => v.price).filter(p => p > 0)),
              average: inventory.reduce((sum, v) => sum + v.price, 0) / inventory.length
            },
            fuelTypes: Array.from(new Set(inventory.map(v => v.engine?.fuelType).filter(Boolean)))
          }
        };
        break;
      }

      case 'nearby': {
        if (!make || (!zip && !city && !state)) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'INVALID_PARAMS',
              message: 'Make and location (zip, city, or state) are required'
            }
          }, { status: 400 });
        }

        const location = { zip, city, state };
        const dealers = await newAPIServices.cisAutomotive.findNearestDealers(make, location, radius);

        results = {
          action: 'nearby',
          searchParams: { make, location, radius },
          dealers: dealers.slice(0, 10), // Limit to top 10 nearest
          count: dealers.length,
          summary: {
            nearestDealer: dealers[0] || null,
            averageDistance: 'N/A', // Would need coordinates calculation
            servicesAvailable: Array.from(new Set(dealers.flatMap(d => d.services || [])))
          }
        };
        break;
      }

      default: {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_ACTION',
            message: 'Valid actions are: search, details, inventory, nearby'
          }
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      meta: {
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        apiSource: 'CIS Automotive',
        version: '2.0.0'
      }
    });

  } catch (error) {
    console.error('Dealers API error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'DEALER_API_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch dealer information',
        details: 'Error occurred while accessing CIS Automotive API'
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
    const { action, params } = await request.json();

    if (!action) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: 'Action is required'
        }
      }, { status: 400 });
    }

    // Convert POST to GET request internally
    const searchParams = new URLSearchParams({
      action,
      ...Object.fromEntries(
        Object.entries(params || {}).map(([key, value]) => [key, String(value)])
      )
    });

    const url = new URL(request.url);
    const response = await fetch(
      `${url.origin}/api/spa/dealers?${searchParams}`,
      {
        method: 'GET',
        headers: request.headers
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Dealers POST API error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'POST_ERROR',
        message: 'Failed to process dealer request'
      }
    }, { status: 500 });
  }
}