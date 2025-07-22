// src/app/api/spa/suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/carquery';
import { SPASuggestion } from '@/types/spa';

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
      // Get makes from database
      const dbMakes = await prisma.$queryRaw<{ make: string; count: number }[]>`
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

      // Add database makes
      suggestions = dbMakes.map(item => ({
        type: 'make' as const,
        value: item.make,
        displayName: item.make,
        count: item.count,
        popular: item.count > 1
      }));

      // Enhance with CarQuery API makes if we have few results
      if (suggestions.length < 10) {
        try {
          const carQueryResult = await carQueryService.getMakes(search);
          if (carQueryResult.success && carQueryResult.data) {
            // Merge CarQuery results (avoid duplicates)
            const existingMakes = new Set(suggestions.map(s => s.value.toLowerCase()));
            const newMakes = carQueryResult.data.filter(
              make => !existingMakes.has(make.value.toLowerCase())
            );
            
            suggestions = [...suggestions, ...newMakes].slice(0, 20);
          }
        } catch (error) {
          console.error('⚠️ CarQuery makes error:', error);
        }
      }

      console.log(`✅ Found ${suggestions.length} make suggestions`);
    }

    // 🏷️ GET MODELS (Database + CarQuery for specific make)
    else if (type === 'models' && make) {
      // Get models from database
      const dbModels = await prisma.$queryRaw<{ model: string; count: number; year: number }[]>`
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
      suggestions = dbModels.map(item => ({
        type: 'model' as const,
        value: item.model,
        displayName: `${item.model} (${item.year})`,
        count: item.count,
        popular: item.count > 0
      }));

      // Enhance with CarQuery API models
      if (suggestions.length < 10) {
        try {
          const carQueryResult = await carQueryService.getModels(make, search);
          if (carQueryResult.success && carQueryResult.data) {
            // Merge CarQuery results (avoid duplicates)
            const existingModels = new Set(suggestions.map(s => s.value.toLowerCase()));
            const newModels = carQueryResult.data
              .filter(model => !existingModels.has(model.value.toLowerCase()))
              .slice(0, 10);
            
            suggestions = [...suggestions, ...newModels].slice(0, 20);
          }
        } catch (error) {
          console.error('⚠️ CarQuery models error:', error);
        }
      }

      console.log(`✅ Found ${suggestions.length} model suggestions for ${make}`);
    }

    // 📅 GET YEARS (Database + CarQuery for specific make/model)
    else if (type === 'years' && make && model) {
      // Get years from database
      const dbYears = await prisma.$queryRaw<{ year: number; count: number }[]>`
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
      suggestions = dbYears.map(item => ({
        type: 'year' as const,
        value: item.year.toString(),
        displayName: `${item.year} (${item.count} available)`,
        count: item.count,
        popular: item.year >= new Date().getFullYear() - 3
      }));

      // Enhance with CarQuery API years if we have few results
      if (suggestions.length < 5) {
        try {
          const carQueryResult = await carQueryService.getYears(make, model);
          if (carQueryResult.success && carQueryResult.data) {
            // Merge CarQuery results (avoid duplicates)
            const existingYears = new Set(suggestions.map(s => s.value));
            const newYears = carQueryResult.data
              .filter(year => !existingYears.has(year.value))
              .slice(0, 8);
            
            suggestions = [...suggestions, ...newYears].slice(0, 15);
          }
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

  } catch (error: any) {
    console.error('🚨 SPA Suggestions Error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'SUGGESTIONS_FAILED',
        message: error.message || 'Failed to fetch suggestions',
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
      requests.map(async (req: any) => {
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

  } catch (error: any) {
    console.error('🚨 Batch Suggestions Error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'BATCH_FAILED',
        message: error.message || 'Batch request failed'
      }
    }, { status: 500 });
  }
}