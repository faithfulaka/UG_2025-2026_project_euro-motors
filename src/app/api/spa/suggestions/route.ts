// src/app/api/spa/suggestions/route.ts - FIXED with proper cascading and year filtering
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { SPASuggestion, SPASuggestionResponse } from '@/types/spa';

// Import axios for CarQuery API calls
import axios from 'axios';

// Cache for suggestions to reduce API calls
const suggestionCache = new Map<string, { data: SPASuggestion[], timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes cache

// CarQuery API helper
async function fetchCarQueryData(params: Record<string, string>): Promise<any> {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `https://www.carqueryapi.com/api/0.3/?${queryString}&callback=test`;
    
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'Accept': 'text/javascript',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    // Extract JSON from JSONP response
    const data = response.data;
    if (typeof data === 'string') {
      const match = data.match(/test\((.*)\);?$/s);
      if (match) {
        return JSON.parse(match[1]);
      }
    }
    return data;
  } catch (error) {
    console.error('CarQuery API error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'make' | 'model' | 'year' | null;
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const query = searchParams.get('query') || '';
    const source = searchParams.get('source') || 'web';

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
    
    // Check cache
    const cached = suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`✅ Returning cached ${type} suggestions`);
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
        console.log('🔍 Fetching makes...');
        const makeSet = new Set<string>();
        const makeMap = new Map<string, { count?: number; source: string }>();

        // Database makes (if requested)
        if (source === 'database' || source === 'all') {
          const dbMakes = await prisma.buyCar.findMany({
            select: { make: true },
            distinct: ['make'],
            orderBy: { make: 'asc' }
          });

          for (const car of dbMakes) {
            if (car.make && car.make.trim()) {
              makeSet.add(car.make);
              const existing = makeMap.get(car.make);
              makeMap.set(car.make, { 
                count: (existing?.count || 0) + 1, 
                source: 'database' 
              });
            }
          }
          console.log(`📊 Found ${dbMakes.length} makes in database`);
        }

        // CarQuery makes (primary source for web)
        if (source === 'web' || source === 'all') {
          const carQueryData = await fetchCarQueryData({ cmd: 'getMakes' });
          
          if (carQueryData?.Makes) {
            console.log(`📊 Found ${carQueryData.Makes.length} makes from CarQuery`);
            for (const makeItem of carQueryData.Makes) {
              const makeName = makeItem.make_display || makeItem.make_id;
              if (makeName && !makeSet.has(makeName)) {
                makeSet.add(makeName);
                makeMap.set(makeName, { source: 'carquery' });
              }
            }
          } else {
            // Fallback to popular makes
            console.log('⚠️ CarQuery unavailable, using fallback makes');
            const fallbackMakes = [
              'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'BMW', 'Bentley',
              'Bugatti', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge',
              'Ferrari', 'Fiat', 'Ford', 'GMC', 'Genesis', 'Honda', 'Hyundai',
              'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover',
              'Lexus', 'Lincoln', 'Lotus', 'Maserati', 'Mazda', 'McLaren',
              'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Porsche',
              'Ram', 'Rolls-Royce', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
            ];
            
            for (const makeName of fallbackMakes) {
              if (!makeSet.has(makeName)) {
                makeSet.add(makeName);
                makeMap.set(makeName, { source: 'fallback' });
              }
            }
          }
        }

        // Filter by query
        const filteredMakes = Array.from(makeSet).filter(make =>
          !query || make.toLowerCase().includes(query.toLowerCase())
        );

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
        }).sort((a, b) => a.label.localeCompare(b.label));

        console.log(`✅ Returning ${suggestions.length} make suggestions`);
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

        console.log(`🔍 Fetching models for ${make}...`);
        const modelSet = new Set<string>();
        const modelMap = new Map<string, { count?: number; source: string }>();

        // Database models
        if (source === 'database' || source === 'all') {
          const dbModels = await prisma.buyCar.findMany({
            where: { make },
            select: { model: true },
            distinct: ['model'],
            orderBy: { model: 'asc' }
          });

          for (const car of dbModels) {
            if (car.model && car.model.trim()) {
              modelSet.add(car.model);
              const existing = modelMap.get(car.model);
              modelMap.set(car.model, { 
                count: (existing?.count || 0) + 1, 
                source: 'database' 
              });
            }
          }
          console.log(`📊 Found ${dbModels.length} models in database for ${make}`);
        }

        // CarQuery models
        if (source === 'web' || source === 'all') {
          const carQueryData = await fetchCarQueryData({ 
            cmd: 'getModels', 
            make: make.toLowerCase().replace(/\s+/g, '-')
          });
          
          if (carQueryData?.Models) {
            console.log(`📊 Found ${carQueryData.Models.length} models from CarQuery for ${make}`);
            for (const modelItem of carQueryData.Models) {
              const modelName = modelItem.model_name;
              if (modelName && !modelSet.has(modelName)) {
                modelSet.add(modelName);
                modelMap.set(modelName, { source: 'carquery' });
              }
            }
          } else {
            console.log('⚠️ No models found from CarQuery');
          }
        }

        // Filter by query
        const filteredModels = Array.from(modelSet).filter(model =>
          !query || model.toLowerCase().includes(query.toLowerCase())
        );

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
        }).sort((a, b) => a.label.localeCompare(b.label));

        console.log(`✅ Returning ${suggestions.length} model suggestions for ${make}`);
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

        console.log(`🔍 Fetching years for ${make} ${model}...`);
        const yearSet = new Set<number>();
        const yearMap = new Map<number, { count?: number; source: string }>();

        // Database years
        if (source === 'database' || source === 'all') {
          const dbYears = await prisma.buyCar.findMany({
            where: { make, model },
            select: { year: true },
            distinct: ['year'],
            orderBy: { year: 'desc' }
          });

          for (const car of dbYears) {
            if (car.year && car.year > 1900 && car.year <= new Date().getFullYear() + 1) {
              yearSet.add(car.year);
              const existing = yearMap.get(car.year);
              yearMap.set(car.year, { 
                count: (existing?.count || 0) + 1, 
                source: 'database' 
              });
            }
          }
          console.log(`📊 Found ${dbYears.length} years in database for ${make} ${model}`);
        }

        // CarQuery years - get from trims which have actual year data
        if (source === 'web' || source === 'all') {
          const carQueryData = await fetchCarQueryData({ 
            cmd: 'getTrims', 
            make: make.toLowerCase().replace(/\s+/g, '-'),
            model: model.toLowerCase().replace(/\s+/g, '-')
          });
          
          if (carQueryData?.Trims && carQueryData.Trims.length > 0) {
            console.log(`📊 Found ${carQueryData.Trims.length} trims from CarQuery for ${make} ${model}`);
            
            // Extract years from trims
            for (const trim of carQueryData.Trims) {
              if (trim.model_year) {
                const year = parseInt(trim.model_year);
                if (year > 1900 && year <= new Date().getFullYear() + 1) {
                  yearSet.add(year);
                  if (!yearMap.has(year)) {
                    yearMap.set(year, { source: 'carquery' });
                  }
                }
              }
            }
            console.log(`📊 Extracted ${yearSet.size} unique years from CarQuery trims`);
          } else {
            console.log('⚠️ No trims/years found from CarQuery, trying alternative approach');
            
            // Try getting years from all trims of the make
            const makeTrims = await fetchCarQueryData({ 
              cmd: 'getTrims', 
              make: make.toLowerCase().replace(/\s+/g, '-')
            });
            
            if (makeTrims?.Trims) {
              // Filter trims that match the model
              const modelTrims = makeTrims.Trims.filter((trim: any) => 
                trim.model_name && 
                trim.model_name.toLowerCase() === model.toLowerCase()
              );
              
              for (const trim of modelTrims) {
                if (trim.model_year) {
                  const year = parseInt(trim.model_year);
                  if (year > 1900 && year <= new Date().getFullYear() + 1) {
                    yearSet.add(year);
                    if (!yearMap.has(year)) {
                      yearMap.set(year, { source: 'carquery' });
                    }
                  }
                }
              }
              console.log(`📊 Found ${yearSet.size} years from alternative CarQuery search`);
            }
          }
        }

        // If still no years, provide a reasonable range as fallback
        if (yearSet.size === 0 && source === 'web') {
          console.log('⚠️ No years found, using reasonable range as fallback');
          const currentYear = new Date().getFullYear();
          
          // Common production years for popular models
          const modelYearRanges: Record<string, [number, number]> = {
            // BMW models
            'X5': [1999, currentYear + 1],
            'X3': [2003, currentYear + 1],
            '3 Series': [1975, currentYear + 1],
            '5 Series': [1972, currentYear + 1],
            'M3': [1986, currentYear + 1],
            'M5': [1985, currentYear + 1],
            // Mercedes models
            'C-Class': [1993, currentYear + 1],
            'E-Class': [1993, currentYear + 1],
            'S-Class': [1972, currentYear + 1],
            // Default range
            'default': [Math.max(1990, currentYear - 30), currentYear + 1]
          };
          
          const range = modelYearRanges[model] || modelYearRanges['default'];
          for (let year = range[1]; year >= range[0]; year--) {
            yearSet.add(year);
            yearMap.set(year, { source: 'fallback' });
          }
        }

        // Filter by query
        const filteredYears = Array.from(yearSet).filter(year =>
          !query || year.toString().includes(query)
        );

        suggestions = filteredYears
          .sort((a, b) => b - a) // Sort years descending (newest first)
          .map(year => {
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

        console.log(`✅ Returning ${suggestions.length} year suggestions for ${make} ${model}`);
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

    // Limit results
    suggestions = suggestions.slice(0, 100);

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
    console.error('❌ Error fetching suggestions:', error);
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
