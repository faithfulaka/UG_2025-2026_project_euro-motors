// src/app/api/spa/suggestions/route.ts - Hybrid approach with working CarQuery + new APIs
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/services';
import { unifiedCarService } from '@/lib/services/new-apis';
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
    const source = searchParams.get('source') || 'web'; // Default to web sources only

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

    const cacheKey = `${type}-${make || ''}-${model || ''}-${query}-${source}`;
    
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

    switch (type) {
      case 'make': {
        const makeSet = new Set<string>();
        const makeMap = new Map<string, { count?: number; source: string }>();

        // For database source, only get database makes
        if (source === 'database' || source === 'all') {
          const dbMakes = await prisma.buyCar.findMany({
            select: { make: true },
            distinct: ['make'],
            orderBy: { make: 'asc' }
          });

          dbMakes.forEach(car => {
            if (source === 'database' || !makeSet.has(car.make)) {
              makeSet.add(car.make);
              makeMap.set(car.make, { count: (makeMap.get(car.make)?.count || 0) + 1, source: 'database' });
            }
          });
        }

        // For web source or all, get CarQuery makes (primary reliable source)
        if (source === 'web' || source === 'all') {
          try {
            const carQueryMakes = await carQueryService.getMakes();
            carQueryMakes.forEach(make => {
              if (!makeSet.has(make)) {
                makeSet.add(make);
                makeMap.set(make, { source: 'carquery' });
              }
            });
          } catch (error) {
            console.error('CarQuery error:', error);
          }
        }

        // Filter by query if provided
        const filteredMakes = Array.from(makeSet).filter(make =>
          !query || make.toLowerCase().includes(query.toLowerCase())
        );

        // Create suggestions with proper source info
        suggestions = filteredMakes.map(make => {
          const info = makeMap.get(make);
          return {
            value: make,
            label: make,
            count: info?.count,
            source: info?.source || 'unknown',
            type: 'make',
            displayName: make,
            popular: info?.count ? info.count > 2 : false
          };
        });

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

        const modelSet = new Set<string>();
        const modelMap = new Map<string, { count?: number; source: string }>();

        // For database source, only get database models
        if (source === 'database' || source === 'all') {
          const dbModels = await prisma.buyCar.findMany({
            where: { make },
            select: { model: true },
            distinct: ['model'],
            orderBy: { model: 'asc' }
          });

          dbModels.forEach(car => {
            if (source === 'database' || !modelSet.has(car.model)) {
              modelSet.add(car.model);
              modelMap.set(car.model, { count: (modelMap.get(car.model)?.count || 0) + 1, source: 'database' });
            }
          });
        }

        // For web source or all, get CarQuery models (primary reliable source)
        if (source === 'web' || source === 'all') {
          try {
            const carQueryModels = await carQueryService.getModels(make);
            carQueryModels
              .filter(model => !/^(Category:|List of)/i.test(model))
              .forEach(model => {
                if (!modelSet.has(model)) {
                  modelSet.add(model);
                  modelMap.set(model, { source: 'carquery' });
                }
              });
          } catch (error) {
            console.error('CarQuery error:', error);
          }
        }

        // Filter by query if provided
        const filteredModels = Array.from(modelSet).filter(model =>
          !query || model.toLowerCase().includes(query.toLowerCase())
        );

        // Create suggestions
        suggestions = filteredModels.map(model => {
          const info = modelMap.get(model);
          return {
            value: model,
            label: model,
            count: info?.count,
            source: info?.source || 'unknown',
            type: 'model',
            displayName: model,
            popular: info?.count ? info.count > 2 : false
          };
        });

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

        const yearSet = new Set<number>();
        const yearMap = new Map<number, { count?: number; source: string }>();

        // For database source, only get database years
        if (source === 'database' || source === 'all') {
          const dbYears = await prisma.buyCar.findMany({
            where: { make, model },
            select: { year: true },
            distinct: ['year'],
            orderBy: { year: 'desc' }
          });

          dbYears.forEach(car => {
            if (source === 'database' || !yearSet.has(car.year)) {
              yearSet.add(car.year);
              yearMap.set(car.year, { count: (yearMap.get(car.year)?.count || 0) + 1, source: 'database' });
            }
          });
        }

        // For web source or all, get CarQuery years (primary reliable source)
        if (source === 'web' || source === 'all') {
          try {
            const carQueryYears = await carQueryService.getYears(make, model);
            carQueryYears.forEach(year => {
              if (!yearSet.has(year)) {
                yearSet.add(year);
                yearMap.set(year, { source: 'carquery' });
              }
            });
          } catch (error) {
            console.error('CarQuery error:', error);
          }
        }

        // Filter by query if provided
        const filteredYears = Array.from(yearSet).filter(year =>
          !query || year.toString().includes(query)
        );

        // Create suggestions
        suggestions = filteredYears.map(year => {
          const info = yearMap.get(year);
          return {
            value: year.toString(),
            label: year.toString(),
            count: info?.count,
            source: info?.source || 'unknown',
            type: 'year',
            displayName: year.toString(),
            popular: info?.count ? info.count > 1 : false
          };
        });

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
    suggestions = suggestions.slice(0, 50); // Increased limit for better coverage

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