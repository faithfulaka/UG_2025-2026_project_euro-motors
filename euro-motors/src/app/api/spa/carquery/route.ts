// src/app/api/spa/carquery/route.ts 
import { NextRequest, NextResponse } from 'next/server';
import { carQueryService } from '@/lib/carquery';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');
    const search = searchParams.get('search');

    console.log(`🔍 CarQuery API Direct: action=${action}, make=${make}, model=${model}`);

    switch (action) {
      case 'makes':
        const makesResult = await carQueryService.getMakes(search || undefined);
        return NextResponse.json({
          success: makesResult.success,
          data: makesResult.data || [],
          cached: makesResult.cached,
          error: makesResult.error || null
        });

      case 'models':
        if (!make) {
          return NextResponse.json({
            success: false,
            error: { code: 'INVALID_INPUT', message: 'Make parameter required for models' }
          }, { status: 400 });
        }
        
        const modelsResult = await carQueryService.getModels(make, search || undefined);
        return NextResponse.json({
          success: modelsResult.success,
          data: modelsResult.data || [],
          cached: modelsResult.cached,
          error: modelsResult.error || null
        });

      case 'years':
        if (!make || !model) {
          return NextResponse.json({
            success: false,
            error: { code: 'INVALID_INPUT', message: 'Make and model parameters required for years' }
          }, { status: 400 });
        }
        
        const yearsResult = await carQueryService.getYears(make, model);
        return NextResponse.json({
          success: yearsResult.success,
          data: yearsResult.data || [],
          cached: yearsResult.cached,
          error: yearsResult.error || null
        });

      case 'cardata':
        if (!make || !model) {
          return NextResponse.json({
            success: false,
            error: { code: 'INVALID_INPUT', message: 'Make and model parameters required for car data' }
          }, { status: 400 });
        }
        
        const carDataResult = await carQueryService.getCarData(
          make, 
          model, 
          year ? parseInt(year) : new Date().getFullYear()
        );
        
        return NextResponse.json({
          success: carDataResult.success,
          data: carDataResult.data || null,
          cached: carDataResult.cached,
          error: carDataResult.error || null
        });

      default:
        return NextResponse.json({
          success: false,
          error: { 
            code: 'INVALID_INPUT', 
            message: 'Valid actions: makes, models, years, cardata' 
          }
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('🚨 CarQuery API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'API_ERROR',
        message: error.message || 'CarQuery API request failed',
        recoverable: true
      }
    }, { status: 500 });
  }
}

// POST method for batch requests
export async function POST(request: NextRequest) {
  try {
    const { requests } = await request.json();
    
    if (!Array.isArray(requests)) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Requests array required' }
      }, { status: 400 });
    }

    console.log(`📦 CarQuery Batch: ${requests.length} requests`);

    const results = await Promise.allSettled(
      requests.map(async (req: any) => {
        switch (req.action) {
          case 'makes':
            return await carQueryService.getMakes(req.search);
          case 'models':
            return await carQueryService.getModels(req.make, req.search);
          case 'years':
            return await carQueryService.getYears(req.make, req.model);
          case 'cardata':
            return await carQueryService.getCarData(req.make, req.model, req.year);
          default:
            throw new Error(`Invalid action: ${req.action}`);
        }
      })
    );

    return NextResponse.json({
      success: true,
      results: results.map(result => 
        result.status === 'fulfilled' ? result.value : { 
          success: false, 
          error: { message: result.reason.message } 
        }
      ),
      meta: {
        total: requests.length,
        successful: results.filter(r => r.status === 'fulfilled').length,
        failed: results.filter(r => r.status === 'rejected').length
      }
    });

  } catch (error: any) {
    console.error('🚨 CarQuery Batch Error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'BATCH_ERROR',
        message: error.message || 'Batch request failed'
      }
    }, { status: 500 });
  }
}