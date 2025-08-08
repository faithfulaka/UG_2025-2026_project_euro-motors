// src/app/api/spa/suggestions/route.ts - Simplified single API approach with proper types
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import type { SPASuggestion, SPASuggestionResponse } from '@/types/spa';

// Cache for suggestions
const suggestionCache = new Map<string, { data: SPASuggestion[], timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes cache

// Type for CarQuery response
interface CarQueryMake {
  make_id: string;
  make_display: string;
  make_is_common?: string;
  make_country?: string;
}

interface CarQueryModel {
  model_name: string;
  model_make_id?: string;
}

interface CarQueryTrim {
  model_id?: string;
  model_make_id?: string;
  model_name?: string;
  model_trim?: string;
  model_year?: string;
  model_body?: string;
  model_engine_cc?: string;
  model_engine_cyl?: string;
  model_engine_type?: string;
  model_engine_power_ps?: string;
  model_drive?: string;
  model_transmission_type?: string;
}

interface CarQueryResponse {
  Makes?: CarQueryMake[];
  Models?: CarQueryModel[];
  Trims?: CarQueryTrim[];
}

// CarQuery API helper - ONLY API we use
async function fetchCarQueryData(params: Record<string, string>): Promise<CarQueryResponse | null> {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `https://www.carqueryapi.com/api/0.3/?${queryString}&callback=test`;
    
    const response = await axios.get(url, {
      timeout: 8000,
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
        return JSON.parse(match[1]) as CarQueryResponse;
      }
    }
    return data as CarQueryResponse;
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

    if (!type) {
      const errorResponse: SPASuggestionResponse = {
        success: false,
        suggestions: [],
        source: 'error',
        cached: false,
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const cacheKey = `${type}-${make || ''}-${model || ''}-${query}`;
    
    // Check cache
    const cached = suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      const cachedResponse: SPASuggestionResponse = {
        success: true,
        suggestions: cached.data,
        source: 'cache',
        cached: true,
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(cachedResponse);
    }

    let suggestions: SPASuggestion[] = [];

    switch (type) {
      case 'make': {
        const carQueryData = await fetchCarQueryData({ cmd: 'getMakes' });
        
        if (carQueryData?.Makes) {
          const filteredMakes = carQueryData.Makes
            .filter((makeItem: CarQueryMake) => {
              const makeName = makeItem.make_display || makeItem.make_id;
              return makeName && (!query || makeName.toLowerCase().includes(query.toLowerCase()));
            })
            .map((makeItem: CarQueryMake) => {
              const makeName = makeItem.make_display || makeItem.make_id;
              const suggestion: SPASuggestion = {
                value: makeName,
                label: makeName,
                displayName: makeName,
                source: 'carquery',
                type: 'make'
              };
              return suggestion;
            })
            .sort((a: SPASuggestion, b: SPASuggestion) => a.label.localeCompare(b.label));

          suggestions = filteredMakes.slice(0, 50);
        }
        break;
      }

      case 'model': {
        if (!make) {
          const errorResponse: SPASuggestionResponse = {
            success: false,
            suggestions: [],
            source: 'error',
            cached: false,
            timestamp: new Date().toISOString()
          };
          return NextResponse.json(errorResponse, { status: 400 });
        }

        const carQueryData = await fetchCarQueryData({ 
          cmd: 'getModels', 
          make: make.toLowerCase().replace(/\s+/g, '-')
        });
        
        if (carQueryData?.Models) {
          const filteredModels = carQueryData.Models
            .filter((modelItem: CarQueryModel) => {
              const modelName = modelItem.model_name;
              return modelName && (!query || modelName.toLowerCase().includes(query.toLowerCase()));
            })
            .map((modelItem: CarQueryModel) => {
              const suggestion: SPASuggestion = {
                value: modelItem.model_name,
                label: modelItem.model_name,
                displayName: modelItem.model_name,
                source: 'carquery',
                type: 'model'
              };
              return suggestion;
            })
            .sort((a: SPASuggestion, b: SPASuggestion) => a.label.localeCompare(b.label));

          suggestions = filteredModels.slice(0, 50);
        }
        break;
      }

      case 'year': {
        if (!make || !model) {
          const errorResponse: SPASuggestionResponse = {
            success: false,
            suggestions: [],
            source: 'error',
            cached: false,
            timestamp: new Date().toISOString()
          };
          return NextResponse.json(errorResponse, { status: 400 });
        }

        const carQueryData = await fetchCarQueryData({ 
          cmd: 'getTrims', 
          make: make.toLowerCase().replace(/\s+/g, '-'),
          model: model.toLowerCase().replace(/\s+/g, '-')
        });
        
        if (carQueryData?.Trims) {
          const yearSet = new Set<number>();
          
          carQueryData.Trims.forEach((trim: CarQueryTrim) => {
            if (trim.model_year) {
              const year = parseInt(trim.model_year);
              if (year > 1900 && year <= new Date().getFullYear() + 1) {
                yearSet.add(year);
              }
            }
          });

          suggestions = Array.from(yearSet)
            .filter(year => !query || year.toString().includes(query))
            .sort((a, b) => b - a) // Newest first
            .map(year => {
              const suggestion: SPASuggestion = {
                value: year.toString(),
                label: year.toString(),
                displayName: year.toString(),
                source: 'carquery',
                type: 'year'
              };
              return suggestion;
            })
            .slice(0, 30);
        }
        break;
      }
    }

    // Cache the results
    suggestionCache.set(cacheKey, { data: suggestions, timestamp: Date.now() });

    const response: SPASuggestionResponse = {
      success: true,
      suggestions,
      source: 'carquery',
      cached: false,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('Suggestions API error:', error);
    const errorResponse: SPASuggestionResponse = {
      success: false,
      suggestions: [],
      source: 'error',
      cached: false,
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
