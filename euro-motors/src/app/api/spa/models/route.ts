// src/app/api/spa/models/route.ts - Real CarQuery Models API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/carquery';
import { SPAModelsResponse } from '@/types/spa';

// Cache for models (per make, 30 minutes TTL)
const CACHE_TTL = 30 * 60 * 1000; 
const modelsCache = new Map<string, {
  data: string[];
  timestamp: number;
  source: 'carquery' | 'database' | 'combined';
}>();

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const make = searchParams.get('make') || '';
    const source = (searchParams.get('source') as 'carquery' | 'database' | 'combined') ?? 'combined';
    const query = searchParams.get('q') || ''; // For filtering models
    
    if (!make) {
      return NextResponse.json({
        success: false,
        models: [],
        make: '',
        source: 'database',
        cached: false,
        timestamp: new Date().toISOString(),
        error: {
          code: 'MISSING_MAKE',
          message: 'Make parameter is required',
          source: 'spa-models-api'
        }
      } as SPAModelsResponse, { status: 400 });
    }

    console.log(`🔍 SPA Models API called - Make: "${make}", Source: ${source}, Query: "${query}"`);

    // Check cache
    const cacheKey = `${make}-${source}`;
    const cached = modelsCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log(`✅ Returning cached models for ${make}`);
      
      let filteredModels = cached.data;
      if (query) {
        filteredModels = cached.data.filter(model => 
          model.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      const response: SPAModelsResponse = {
        success: true,
        models: filteredModels,
        make,
        source: cached.source,
        cached: true,
        timestamp: new Date().toISOString()
      };
      
      return NextResponse.json(response);
    }

    let allModels: string[] = [];
    let finalSource: 'carquery' | 'database' | 'combined' = source;

    if (source === 'database') {
      // Get models from database only
      allModels = await getDatabaseModels(make);
      finalSource = 'database';
      
    } else if (source === 'carquery') {
      // Get models from CarQuery API only
      allModels = await getCarQueryModels(make);
      finalSource = 'carquery';
      
    } else {
      // Combined approach (default)
      const [dbModels, cqModels] = await Promise.allSettled([
        getDatabaseModels(make),
        getCarQueryModels(make)
      ]);
      
      const dbResult = dbModels.status === 'fulfilled' ? dbModels.value : [];
      const cqResult = cqModels.status === 'fulfilled' ? cqModels.value : [];
      
      // Combine and deduplicate, prioritizing database models
      const combinedSet = new Set([...dbResult, ...cqResult]);
      allModels = Array.from(combinedSet).sort();
      finalSource = 'combined';
      
      console.log(`📊 Combined models for ${make} - DB: ${dbResult.length}, CarQuery: ${cqResult.length}, Combined: ${allModels.length}`);
    }

    // Filter if query provided
    if (query) {
      allModels = allModels.filter(model => 
        model.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Update cache
    modelsCache.set(cacheKey, {
      data: allModels,
      timestamp: Date.now(),
      source: finalSource
    });

    const response: SPAModelsResponse = {
      success: true,
      models: allModels,
      make,
      source: finalSource,
      cached: false,
      timestamp: new Date().toISOString()
    };

    const executionTime = Date.now() - startTime;
    console.log(`✅ SPA Models API completed in ${executionTime}ms - Returned ${allModels.length} models for ${make}`);
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ SPA Models API error:', error);
    
    // Fix: searchParams is not defined here, use empty string for make
    const response: SPAModelsResponse = {
      success: false,
      models: [],
      make: '',
      source: 'database',
      cached: false,
      timestamp: new Date().toISOString(),
      error: {
        code: 'MODELS_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch models',
        source: 'spa-models-api'
      }
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// Get models from database for specific make
async function getDatabaseModels(make: string): Promise<string[]> {
  try {
    const [buyModels, rentalModels] = await Promise.all([
      prisma.buyCar.findMany({
        where: { 
          make: { 
            contains: make
           
          }
        },
        select: { model: true },
        distinct: ['model']
      }),
      prisma.rentalCar.findMany({
        where: { 
          make: { 
            contains: make
           
          }
        },
        select: { model: true },
        distinct: ['model']
      })
    ]);

    const allModels = [...new Set([
      ...buyModels.map(car => car.model),
      ...rentalModels.map(car => car.model)
    ])].sort();

    console.log(`🗄️ Database models for ${make}: ${allModels.length}`);
    return allModels;
    
  } catch (error) {
    console.error(`❌ Database models error for ${make}:`, error);
    return [];
  }
}

async function getCarQueryModels(make: string): Promise<string[]> {
  try {
    const result = await carQueryService.getModels(make);
    if ('error' in result) {
      console.error(`❌ CarQuery models error for ${make}:`, result.error);
      return [];
    }
    if ('data' in result) {
      console.log(`🔍 CarQuery models for ${make}: ${result.data.length}`);
      return result.data;
    }
    console.error(`❌ Unexpected CarQuery models result for ${make}:`, result);
    return [];
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`❌ CarQuery models error for ${make}:`, err);
      return [];
    }
  }

// POST method for cache management
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'clear_cache') {
      const make = body.make;
      
      if (make) {
        // Clear cache for specific make
        const keysToDelete = Array.from(modelsCache.keys()).filter(key => key.startsWith(make));
        keysToDelete.forEach(key => modelsCache.delete(key));
        console.log(`🧹 Models cache cleared for ${make}`);
      } else {
        // Clear all cache
        modelsCache.clear();
        console.log('🧹 All models cache cleared');
      }
      
      return NextResponse.json({
        success: true,
        message: make ? `Models cache cleared for ${make}` : 'All models cache cleared'
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('❌ POST Models API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
