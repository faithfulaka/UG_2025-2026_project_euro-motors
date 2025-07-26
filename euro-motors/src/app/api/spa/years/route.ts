// src/app/api/spa/years/route.ts - NEW MISSING FILE

import { NextRequest, NextResponse } from 'next/server';
import { carQueryService } from '@/lib/carquery';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const source = searchParams.get('source') || 'combined';

    if (!make || !model) {
      return NextResponse.json({
        success: false,
        years: [],
        error: {
          code: 'MISSING_PARAMS',
          message: 'Make and model parameters are required'
        }
      }, { status: 400 });
    }

    console.log(`🔍 SPA Years API: ${make} ${model} (source: ${source})`);

    let years: number[] = [];

    if (source === 'database') {
      // Proxy to suggestions API for database years
      const suggestionsUrl = new URL(`${request.nextUrl.origin}/api/spa/suggestions`);
      suggestionsUrl.searchParams.set('type', 'years');
      suggestionsUrl.searchParams.set('make', make);
      suggestionsUrl.searchParams.set('model', model);

      const suggestionsResponse = await fetch(suggestionsUrl.toString());
      
      if (suggestionsResponse.ok) {
        const suggestionsData = await suggestionsResponse.json();
        if (suggestionsData.success && suggestionsData.data) {
          years = suggestionsData.data
            .map((item: { value: string }) => parseInt(item.value))
            .filter((year: number) => !isNaN(year))
            .sort((a: number, b: number) => b - a); // Most recent first
        }
      }
    } else {
      // Use CarQuery for other sources
      try {
        years = await carQueryService.getYears(make, model);
      } catch (error) {
        console.error('CarQuery years error:', error);
        // Fallback to common years
        const currentYear = new Date().getFullYear();
        years = Array.from({ length: 6 }, (_, i) => currentYear - i);
      }
    }

    // If no years found, provide fallback
    if (years.length === 0) {
      const currentYear = new Date().getFullYear();
      years = Array.from({ length: 6 }, (_, i) => currentYear - i);
    }

    console.log(`✅ Found ${years.length} years for ${make} ${model}`);

    return NextResponse.json({
      success: true,
      years,
      make,
      model,
      source,
      cached: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Years API error:', error);
    
    return NextResponse.json({
      success: false,
      years: [],
      error: {
        code: 'YEARS_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch years'
      }
    }, { status: 500 });
  }
}