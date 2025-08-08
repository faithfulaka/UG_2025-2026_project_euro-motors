// src/app/api/spa/carquery/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { carQueryService } from '@/lib/services/carquery-api';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const make = url.searchParams.get('make');
  const model = url.searchParams.get('model');
  const year = url.searchParams.get('year');

  if (!make || !model || !year) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'INVALID_PARAMS',
        message: 'Make, model, and year are required'
      }
    }, { status: 400 });
  }

  try {
    const result = await carQueryService.getCarData(make, model, parseInt(year));
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'API_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch data'
      }
    }, { status: 500 });
  }
}
