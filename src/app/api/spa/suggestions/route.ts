// src/app/api/spa/suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/services';
import type { SPASuggestion, SPASuggestionResponse } from '@/types/spa';

// Cache for suggestions to reduce API calls
const suggestionCache = new Map<string, { data: SPASuggestion[], timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'make' | 'model' | 'year' | null;
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const query = searchParams.get('query') || '';

    if (!type) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMS',
            message: 'Type parameter is required (make, model, or year)'
          }
        },
        { status: 400 }
      );
    }

    const cacheKey = `${type}-${make || ''}-${model || ''}-${query}`;
    
    // Check cache first
    const cached = suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        suggestions: cached.data,
        source: 'cache',
        cached: true,
        timestamp: new Date().toISOString()
      } as SPASuggestionResponse);
    }

    let suggestions: SPASuggestion[] = [];
    let source = 'combined';

    switch (type) {
      case 'make': {
        // Get makes from multiple sources
        const [dbMakes, carQueryMakes] = await Promise.all([
          // Database makes
          prisma.buyCar.findMany({
            select: { make: true },
            distinct: ['make'],
            orderBy: { make: 'asc' }
          }),
          // CarQuery makes
          carQueryService.getMakes().catch(() => [])
        ]);

        // Combine and deduplicate
        const makeSet = new Set<string>();
        const makeMap = new Map<string, number>();

        // Add database makes with count
        dbMakes.forEach(car => {
          makeSet.add(car.make);
          makeMap.set(car.make, (makeMap.get(car.make) || 0) + 1);
        });

        // Add CarQuery makes
        carQueryMakes.forEach((make: string) => {
          makeSet.add(make);
        });

        // Filter by query if provided
        const filteredMakes = Array.from(makeSet).filter(make =>
          !query || make.toLowerCase().includes(query.toLowerCase())
        );

        // Create suggestions
        suggestions = filteredMakes.map(make => ({
          value: make,
          label: make,
          count: makeMap.get(make),
          source: makeMap.has(make) ? 'database' : 'carquery',
          type: 'make',
          displayName: make,
          popular: makeMap.get(make) ? makeMap.get(make)! > 2 : false
        }));

        break;
      }

      case 'model': {
        if (!make) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'INVALID_PARAMS',
                message: 'Make parameter is required for model suggestions'
              }
            },
            { status: 400 }
          );
        }

        // Get models from multiple sources
        const [dbModels, carQueryModels] = await Promise.all([
          // Database models for this make
          prisma.buyCar.findMany({
            where: { make },
            select: { model: true },
            distinct: ['model'],
            orderBy: { model: 'asc' }
          }),
          // CarQuery models
          carQueryService.getModels(make).catch(() => [])
        ]);

        // Combine and deduplicate
        const modelSet = new Set<string>();
        const modelMap = new Map<string, number>();

        // Add database models with count
        dbModels.forEach(car => {
          modelSet.add(car.model);
          modelMap.set(car.model, (modelMap.get(car.model) || 0) + 1);
        });

        // Add CarQuery models
        carQueryModels.forEach((model: string) => {
          modelSet.add(model);
        });

        // Filter by query if provided
        const filteredModels = Array.from(modelSet).filter(model =>
          !query || model.toLowerCase().includes(query.toLowerCase())
        );

        // Create suggestions
        suggestions = filteredModels.map(model => ({
          value: model,
          label: model,
          count: modelMap.get(model),
          source: modelMap.has(model) ? 'database' : 'carquery',
          type: 'model',
          displayName: model,
          popular: modelMap.get(model) ? modelMap.get(model)! > 2 : false
        }));

        break;
      }

      case 'year': {
        if (!make || !model) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'INVALID_PARAMS',
                message: 'Make and model parameters are required for year suggestions'
              }
            },
            { status: 400 }
          );
        }

        // Get years from multiple sources
        const [dbYears, carQueryYears] = await Promise.all([
          // Database years for this make/model
          prisma.buyCar.findMany({
            where: { make, model },
            select: { year: true },
            distinct: ['year'],
            orderBy: { year: 'desc' }
          }),
          // CarQuery years
          carQueryService.getYears(make, model).catch(() => [])
        ]);

        // Combine and deduplicate years
        const yearSet = new Set<number>();
        const yearMap = new Map<number, number>();

        // Add database years with count
        dbYears.forEach(car => {
          yearSet.add(car.year);
          yearMap.set(car.year, (yearMap.get(car.year) || 0) + 1);
        });

        // Add CarQuery years
        carQueryYears.forEach((year: string) => {
          const yearNum = parseInt(year);
          if (!isNaN(yearNum)) {
            yearSet.add(yearNum);
          }
        });

        // Filter by query if provided
        const filteredYears = Array.from(yearSet).filter(year =>
          !query || year.toString().includes(query)
        );

        // Create suggestions
        suggestions = filteredYears.map(year => ({
          value: year.toString(),
          label: year.toString(),
          count: yearMap.get(year),
          source: yearMap.has(year) ? 'database' : 'carquery',
          type: 'year',
          displayName: year.toString(),
          popular: yearMap.get(year) ? yearMap.get(year)! > 1 : false
        }));

        break;
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_TYPE',
              message: 'Invalid suggestion type'
            }
          },
          { status: 400 }
        );
    }

    // Sort suggestions: popular first, then alphabetically
    suggestions.sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      if (a.count && b.count) return b.count - a.count;
      return a.label.localeCompare(b.label);
    });

    // Limit results
    suggestions = suggestions.slice(0, 20);

    // Cache the results
    suggestionCache.set(cacheKey, { data: suggestions, timestamp: Date.now() });

    return NextResponse.json({
      success: true,
      suggestions,
      source,
      cached: false,
      timestamp: new Date().toISOString()
    } as SPASuggestionResponse);

  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json(
      {
        success: false,
        suggestions: [],
        source: 'error',
        cached: false,
        timestamp: new Date().toISOString(),
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch suggestions',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}

// POST endpoint for batch suggestions
export async function POST(request: NextRequest) {
  try {
    const { types, make, model } = await request.json();

    if (!types || !Array.isArray(types)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMS',
            message: 'Types array is required'
          }
        },
        { status: 400 }
      );
    }

    const results: Record<string, SPASuggestion[]> = {};

    for (const type of types) {
      const params = new URLSearchParams({ type });
      if (make) params.set('make', make);
      if (model) params.set('model', model);

      const response = await fetch(
        `${request.nextUrl.origin}/api/spa/suggestions?${params}`,
        {
          method: 'GET',
          headers: request.headers
        }
      );

      if (response.ok) {
        const data = await response.json();
        results[type] = data.suggestions || [];
      } else {
        results[type] = [];
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching batch suggestions:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BATCH_ERROR',
          message: 'Failed to fetch batch suggestions',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}
