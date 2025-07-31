// src/app/api/spa/carquery/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { carQueryService } from '@/lib/services';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const make   = searchParams.get('make')  || '';
  const model  = searchParams.get('model') || '';
  const year   = searchParams.get('year')  || '';

  switch (action) {
    case 'makes': {
      const makes = await carQueryService.getMakes();
      return NextResponse.json({ success: true, data: makes, cached: false, error: null });
    }
    case 'models': {
      if (!make) {
        return NextResponse.json({ success: false, error: { code: 'INVALID_INPUT', message: 'Make required' }}, { status: 400 });
      }
      const models = await carQueryService.getModels(make);
      return NextResponse.json({ success: true, data: models, cached: false, error: null });
    }
    case 'years': {
      if (!make || !model) {
        return NextResponse.json({ success: false, error: { code: 'INVALID_INPUT', message: 'Make & model required' }}, { status: 400 });
      }
      const years = await carQueryService.getYears(make, model);
      return NextResponse.json({ success: true, data: years, cached: false, error: null });
    }
    case 'cardata': {
      if (!make || !model) {
        return NextResponse.json({ success: false, error: { code: 'INVALID_INPUT', message: 'Make & model required' }}, { status: 400 });
      }
      const cardata = await carQueryService.getCarData(make, model, year);
      return NextResponse.json({ success: true, data: cardata, cached: false, error: null });
    }
    default:
      return NextResponse.json({ success: false, error: { code: 'UNKNOWN_ACTION', message: 'Unknown action' }}, { status: 400 });
  }
}