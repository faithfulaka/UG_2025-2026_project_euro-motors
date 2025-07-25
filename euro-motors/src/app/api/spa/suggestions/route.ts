// src/app/api/spa/suggestions/route.ts - COMPLETE FIXED FILE

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/carquery';

// Define SPASuggestion interface locally since it might be missing from types
interface SPASuggestion {
  type: 'make' | 'model' | 'year';
  value: string;
  displayName: string;
  count?: number;
  popular?: boolean;
}

// Cache for suggestions to improve performance
const suggestionsCache = new Map<string, { data: SPASuggestion[]; expiresAt: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'makes' | 'models' | 'years' | null;
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const search = searchParams.get('search') || '';

    if (!type) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Type parameter required' }
      }, { status: 400 });
    }

    console.log(`🔍 SPA Suggestions: ${type} (${search ? `search: "${search}"` : 'no search'})`);

    // Check cache first
    const cacheKey = `${type}-${make || ''}-${model || ''}-${search}`;
    const cached = suggestionsCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      console.log('⚡ Returning cached suggestions');
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
        source: 'cache'
      });
    }

    let suggestions: SPASuggestion[] = [];

    // 🚗 GET MAKES (Database + CarQuery)
    if (type === 'makes') {
      // Get makes from database with proper typing
      const dbMakesRaw = await prisma.$queryRaw<{ make: string; count: bigint }[]>`
        SELECT DISTINCT make, COUNT(*) as count
        FROM (
          SELECT make FROM BuyCar WHERE make LIKE ${`%${search}%`}
          UNION ALL
          SELECT make FROM RentalCar WHERE make LIKE ${`%${search}%`}
        ) combined
        GROUP BY make
        ORDER BY count DESC, make ASC
        LIMIT 15
      `;

      // Convert database results to suggestions
      suggestions = dbMakesRaw.map(item => ({
        type: 'make' as const,
        value: item.make,
        displayName: item.make,
        count: Number(item.count),
        popular: Number(item.count) > 0
      }));

      // Enhance with CarQuery API makes if we have few results
      if (suggestions.length < 10) {
        try {
          const carQueryMakes = await carQueryService.getMakes(search);
          // Merge CarQuery results (avoid duplicates)
          const existingMakes = new Set(suggestions.map(s => s.value.toLowerCase()));
          const newMakes: SPASuggestion[] = carQueryMakes
            .filter(make => !existingMakes.has(make.toLowerCase()))
            .map(make => ({
              type: 'make' as const,
              value: make,
              displayName: make,
              count: 0,
              popular: false
            }));
          
          suggestions = [...suggestions, ...newMakes].slice(0, 20);
        } catch (error) {
          console.error('⚠️ CarQuery makes error:', error);
        }
      }

      console.log(`✅ Found ${suggestions.length} make suggestions`);
    }

    // 🏷️ GET MODELS (Database + CarQuery for specific make)
    else if (type === 'models' && make) {
      // Get models from database with proper typing
      const dbModelsRaw = await prisma.$queryRaw<{ model: string; count: bigint; year: number }[]>`
        SELECT DISTINCT model, COUNT(*) as count, MAX(year) as year
        FROM (
          SELECT model, year FROM BuyCar WHERE make = ${make} AND model LIKE ${`%${search}%`}
          UNION ALL
          SELECT model, year FROM RentalCar WHERE make = ${make} AND model LIKE ${`%${search}%`}
        ) combined
        GROUP BY model
        ORDER BY count DESC, year DESC, model ASC
        LIMIT 15
      `;

      // Add database models
      suggestions = dbModelsRaw.map(item => ({
        type: 'model' as const,
        value: item.model,
        displayName: `${item.model} (${Number(item.year)})`,
        count: Number(item.count),
        popular: Number(item.count) > 0
      }));

      // Enhance with CarQuery API models
      if (suggestions.length < 10) {
        try {
          const carQueryModels = await carQueryService.getModels(make, search);
          // Merge CarQuery results (avoid duplicates)
          const existingModels = new Set(suggestions.map(s => s.value.toLowerCase()));
          const newModels: SPASuggestion[] = carQueryModels
            .filter(model => !existingModels.has(model.toLowerCase()))
            .slice(0, 10)
            .map(model => ({
              type: 'model' as const,
              value: model,
              displayName: model,
              count: 0,
              popular: false
            }));
          
          suggestions = [...suggestions, ...newModels].slice(0, 20);
        } catch (error) {
          console.error('⚠️ CarQuery models error:', error);
        }
      }

      console.log(`✅ Found ${suggestions.length} model suggestions for ${make}`);
    }

    // 📅 GET YEARS (Database + CarQuery for specific make/model)
    else if (type === 'years' && make && model) {
      // Get years from database with proper typing
      const dbYearsRaw = await prisma.$queryRaw<{ year: number; count: bigint }[]>`
        SELECT DISTINCT year, COUNT(*) as count
        FROM (
          SELECT year FROM BuyCar WHERE make = ${make} AND model = ${model}
          UNION ALL
          SELECT year FROM RentalCar WHERE make = ${make} AND model = ${model}
        ) combined
        GROUP BY year
        ORDER BY year DESC
        LIMIT 10
      `;

      // Add database years
      suggestions = dbYearsRaw.map(item => ({
        type: 'year' as const,
        value: Number(item.year).toString(),
        displayName: `${Number(item.year)} (${Number(item.count)} available)`,
        count: Number(item.count),
        popular: Number(item.year) >= new Date().getFullYear() - 3
      }));

      // Enhance with CarQuery API years if we have few results
      if (suggestions.length < 5) {
        try {
          const carQueryYears = await carQueryService.getYears(make, model);
          // Merge CarQuery results (avoid duplicates)
          const existingYears = new Set(suggestions.map(s => s.value));
          const newYears: SPASuggestion[] = carQueryYears
            .filter(year => !existingYears.has(year.toString()))
            .slice(0, 8)
            .map(year => ({
              type: 'year' as const,
              value: year.toString(),
              displayName: year.toString(),
              count: 0,
              popular: year >= new Date().getFullYear() - 3
            }));
          
          suggestions = [...suggestions, ...newYears].slice(0, 15);
        } catch (error) {
          console.error('⚠️ CarQuery years error:', error);
        }
      }

      console.log(`✅ Found ${suggestions.length} year suggestions for ${make} ${model}`);
    }

    // Invalid request
    else {
      return NextResponse.json({
        success: false,
        error: { 
          code: 'INVALID_INPUT', 
          message: type === 'models' ? 'Make parameter required for models' : 
                  type === 'years' ? 'Make and model parameters required for years' : 
                  'Invalid request parameters'
        }
      }, { status: 400 });
    }

    // Sort suggestions: popular first, then alphabetical
    suggestions.sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      if (a.count && b.count && a.count !== b.count) return b.count - a.count;
      return a.displayName.localeCompare(b.displayName);
    });

    // Cache the results
    suggestionsCache.set(cacheKey, {
      data: suggestions,
      expiresAt: Date.now() + CACHE_DURATION
    });

    // Clean old cache entries periodically
    if (suggestionsCache.size > 1000) {
      const now = Date.now();
      for (const [key, cached] of suggestionsCache.entries()) {
        if (cached.expiresAt < now) {
          suggestionsCache.delete(key);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: suggestions,
      cached: false,
      source: suggestions.some(s => s.count) ? 'database+carquery' : 'carquery',
      meta: {
        totalResults: suggestions.length,
        hasMore: suggestions.length >= 15,
        searchTerm: search,
        cacheKey
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch suggestions';
    console.error('🚨 SPA Suggestions Error:', errorMessage);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'SUGGESTIONS_FAILED',
        message: errorMessage,
        recoverable: true
      }
    }, { status: 500 });
  }
}

// POST method for batch suggestions (useful for preloading)
export async function POST(request: NextRequest) {
  try {
    const { requests } = await request.json();
    
    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Requests array required' }
      }, { status: 400 });
    }

    console.log(`📦 Batch suggestions request: ${requests.length} requests`);

    const results = await Promise.allSettled(
      requests.map(async (req: { type: string; make?: string; model?: string; search?: string }) => {
        const url = new URL(`http://localhost:3000/api/spa/suggestions`);
        url.searchParams.set('type', req.type);
        if (req.make) url.searchParams.set('make', req.make);
        if (req.model) url.searchParams.set('model', req.model);
        if (req.search) url.searchParams.set('search', req.search);

        const response = await GET(new NextRequest(url));
        return response.json();
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Batch complete: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      results: results.map(result => 
        result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
      ),
      meta: {
        totalRequests: requests.length,
        successful,
        failed
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Batch request failed';
    console.error('🚨 Batch Suggestions Error:', errorMessage);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'BATCH_FAILED',
        message: errorMessage
      }
    }, { status: 500 });
  }
}
