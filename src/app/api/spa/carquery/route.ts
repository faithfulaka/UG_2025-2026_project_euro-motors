// src/app/api/spa/carquery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { carQueryService } from '@/lib/services';

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
      const raw = await carQueryService.getMakes();
      suggestions = raw.map(m => ({
        value: m,
        label: m,
        displayName: m,
        source: 'carquery',
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
      const raw = await carQueryService.getModels(make);
      suggestions = raw.map(m => ({
        value: m,
        label: m,
        displayName: m,
        source: 'carquery',
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
      const raw = await carQueryService.getYears(make, model);
      suggestions = raw.map(y => {
        const s = String(y);
        return {
          value: s,
          label: s,
          displayName: s,
          source: 'carquery',
          type: 'year'
        };
      });
      break;
    }

    case 'cardata': {
      if (!make || !model || !year) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_INPUT', message: 'Make, model & year required' } },
          { status: 400 }
        );
      }
      const trims = await carQueryService.getCarData(make, model, year);
      suggestions = trims.map(trim => {
        const display = trim.model_trim || trim.model_name;
        return {
          value: display,
          label: display,
          displayName: display,
          source: 'carquery',
          type: 'trim'
        };
      });
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
    source: 'carquery',
    cached: false,
    timestamp: new Date().toISOString()
  });
}