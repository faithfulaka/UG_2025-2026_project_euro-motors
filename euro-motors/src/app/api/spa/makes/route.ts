// src/app/api/spa/makes/route.ts - COMPLETE FIXED FILE

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/carquery';
import { SPAMakesResponse } from '@/types/spa';

// In-memory cache for makes (30 minutes TTL)
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
let makesCache: {
  data: string[];
  timestamp: number;
  source: 'carquery' | 'database' | 'combined';
} | null = null;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') as 'carquery' | 'database' | 'combined' || 'combined';
    const query = searchParams.get('q') || ''; // For filtering/searching
    
    console.log(`🔍 SPA Makes API called - Source: ${source}, Query: "${query}"`);

    // Check cache first
    if (makesCache && (Date.now() - makesCache.timestamp < CACHE_TTL) && source === makesCache.source) {
      console.log('✅ Returning cached makes data');
      
      let filteredMakes = makesCache.data;
      if (query) {
        filteredMakes = makesCache.data.filter(make => 
          make.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      const response: SPAMakesResponse = {
        success: true,
        makes: filteredMakes,
        source: makesCache.source,
        cached: true,
        timestamp: new Date().toISOString()
      };
      
      return NextResponse.json(response);
    }

    let allMakes: string[] = [];
    let finalSource: 'carquery' | 'database' | 'combined' = source;

    if (source === 'database') {
      // Get makes from database only
      allMakes = await getDatabaseMakes();
      finalSource = 'database';
      
    } else if (source === 'carquery') {
      // Get makes from CarQuery API only
      allMakes = await getCarQueryMakes();
      finalSource = 'carquery';
      
    } else {
      // Combined approach (default)
      const [dbMakes, cqMakes] = await Promise.allSettled([
        getDatabaseMakes(),
        getCarQueryMakes()
      ]);
      
      const dbResult = dbMakes.status === 'fulfilled' ? dbMakes.value : [];
      const cqResult = cqMakes.status === 'fulfilled' ? cqMakes.value : [];
      
      // Combine and deduplicate
      const combinedSet = new Set([...dbResult, ...cqResult]);
      allMakes = Array.from(combinedSet).sort();
      finalSource = 'combined';
      
      console.log(`📊 Combined makes - DB: ${dbResult.length}, CarQuery: ${cqResult.length}, Combined: ${allMakes.length}`);
    }

    // Filter if query provided
    if (query) {
      allMakes = allMakes.filter(make => 
        make.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Update cache
    makesCache = {
      data: allMakes,
      timestamp: Date.now(),
      source: finalSource
    };

    const response: SPAMakesResponse = {
      success: true,
      makes: allMakes,
      source: finalSource,
      cached: false,
      timestamp: new Date().toISOString()
    };

    const executionTime = Date.now() - startTime;
    console.log(`✅ SPA Makes API completed in ${executionTime}ms - Returned ${allMakes.length} makes`);
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ SPA Makes API error:', error);
    
    const response: SPAMakesResponse = {
      success: false,
      makes: [],
      source: 'database',
      cached: false,
      timestamp: new Date().toISOString(),
      error: {
        code: 'MAKES_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch makes',
        source: 'spa-makes-api'
      }
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// Get makes from database
async function getDatabaseMakes(): Promise<string[]> {
  try {
    const [buyMakes, rentalMakes] = await Promise.all([
      prisma.buyCar.findMany({
        select: { make: true },
        distinct: ['make']
      }),
      prisma.rentalCar.findMany({
        select: { make: true },
        distinct: ['make']
      })
    ]);

    const allMakes = [...new Set([
      ...buyMakes.map(car => car.make),
      ...rentalMakes.map(car => car.make)
    ])].sort();

    console.log(`🗄️ Database makes: ${allMakes.length}`);
    return allMakes;
    
  } catch (error) {
    console.error('❌ Database makes error:', error);
    return [];
  }
}

// Get makes from CarQuery API
async function getCarQueryMakes(): Promise<string[]> {
  try {
    const makes = await carQueryService.getMakes();
    console.log(`🔍 CarQuery makes: ${makes.length}`);
    return makes;
    
  } catch (error) {
    console.error('❌ CarQuery makes error:', error);
    return [];
  }
}

// Optional: POST method for cache invalidation (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'clear_cache') {
      makesCache = null;
      console.log('🧹 Makes cache cleared');
      
      return NextResponse.json({
        success: true,
        message: 'Makes cache cleared successfully'
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('❌ POST Makes API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}