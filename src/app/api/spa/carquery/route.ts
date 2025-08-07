// src/app/api/spa/carquery/route.ts - Replaced with Unified API Services
import { NextRequest, NextResponse } from 'next/server';
import { unifiedCarService } from '@/lib/services/new-apis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const make   = searchParams.get('make')  || '';
  const model  = searchParams.get('model') || '';
  const year   = searchParams.get('year')  || '';

  let suggestions: Array<{
    value: string;
    label: string;
    displayName: string;
    source: string;
    type: 'make' | 'model' | 'year' | 'trim';
  }> = [];

  switch (action) {
    case 'makes': {
      const raw = await unifiedCarService.getMakes();
      suggestions = raw.map(m => ({
        value: m.value,
        label: m.label,
        displayName: m.label,
        source: m.source,
        type: 'make'
      }));
      break;
    }

    case 'models': {
      if (!make) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_INPUT', message: 'Make required' } },
          { status: 400 }
        );
      }
      const raw = await unifiedCarService.getModels(make);
      suggestions = raw.map(m => ({
        value: m.value,
        label: m.label,
        displayName: m.label,
        source: m.source,
        type: 'model'
      }));
      break;
    }

    case 'years': {
      if (!make || !model) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_INPUT', message: 'Make & model required' } },
          { status: 400 }
        );
      }
      const raw = await unifiedCarService.getYears(make, model);
      suggestions = raw.map(y => ({
        value: y.value,
        label: y.label,
        displayName: y.label,
        source: y.source,
        type: 'year'
      }));
      break;
    }

    case 'cardata': {
      if (!make || !model || !year) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_INPUT', message: 'Make, model & year required' } },
          { status: 400 }
        );
      }
      const searchResults = await unifiedCarService.searchVehicles(make, model, parseInt(year));
      
      // Extract trim information from different API sources
      const trims: string[] = [];
      
      // From Car Data API
      if (searchResults.carData) {
        searchResults.carData.forEach(vehicle => {
          if (vehicle.type) {
            trims.push(vehicle.type);
          }
        });
      }
      
      // From MarketCheck API
      if (searchResults.marketCheck) {
        searchResults.marketCheck.forEach(vehicle => {
          if (vehicle.build?.body_type) {
            trims.push(vehicle.build.body_type);
          }
        });
      }

      // From Edmunds API
      if (searchResults.edmunds?.bodyType) {
        trims.push(searchResults.edmunds.bodyType);
      }

      // Deduplicate trims
      const uniqueTrims = Array.from(new Set(trims));
      
      suggestions = uniqueTrims.map(trim => ({
        value: trim,
        label: trim,
        displayName: trim,
        source: 'unified_apis',
        type: 'trim'
      }));
      break;
    }

    default: {
      return NextResponse.json(
        { success: false, error: { code: 'UNKNOWN_ACTION', message: 'Unknown action' } },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    suggestions,
    source: 'unified_apis',
    cached: false,
    timestamp: new Date().toISOString(),
    meta: {
      action,
      make,
      model,
      year,
      apiSources: ['edmunds', 'marketcheck', 'cis_automotive', 'car_data'],
      version: '2.0.0'
    }
  });
}