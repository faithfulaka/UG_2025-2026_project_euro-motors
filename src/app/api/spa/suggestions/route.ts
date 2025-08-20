// src/app/api/spa/suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import type { SPASuggestion, SPASuggestionResponse } from '@/types/spa';

const suggestionCache = new Map<string, { data: SPASuggestion[], timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes cache

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

async function fetchCarQueryData(params: Record<string, string>): Promise<CarQueryResponse | null> {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `https://www.carqueryapi.com/api/0.3/?${queryString}&callback=test`;
    
    const response = await axios.get<string>(url, {
      timeout: 8000,
      headers: {
        'Accept': 'text/javascript',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    const data = response.data;
    if (typeof data === 'string') {
      const match = data.match(/test\((.*)\);?$/s);
      if (match && match[1]) {
        return JSON.parse(match[1]) as CarQueryResponse;
      }
    }
    return data as CarQueryResponse;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<SPASuggestionResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'make' | 'model' | 'year' | null;
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const query = searchParams.get('query') || '';

    if (!type) {
      return NextResponse.json({
        success: false,
        suggestions: [],
        source: 'error',
        cached: false,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const cacheKey = `${type}-${make || ''}-${model || ''}-${query}`;
    
    const cached = suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        suggestions: cached.data,
        source: 'cache',
        cached: true,
        timestamp: new Date().toISOString()
      });
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
              return {
                value: makeName,
                label: makeName,
                displayName: makeName,
                source: 'carquery' as const,
                type: 'make' as const
              };
            })
            .sort((a, b) => a.label.localeCompare(b.label));

          suggestions = filteredMakes.slice(0, 50);
        }
        break;
      }

      case 'model': {
        if (!make) {
          return NextResponse.json({
            success: false,
            suggestions: [],
            source: 'error',
            cached: false,
            timestamp: new Date().toISOString()
          }, { status: 400 });
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
              return {
                value: modelItem.model_name,
                label: modelItem.model_name,
                displayName: modelItem.model_name,
                source: 'carquery' as const,
                type: 'model' as const
              };
            })
            .sort((a, b) => a.label.localeCompare(b.label));

          suggestions = filteredModels.slice(0, 50);
        }
        break;
      }

      case 'year': {
        if (!make || !model) {
          return NextResponse.json({
            success: false,
            suggestions: [],
            source: 'error',
            cached: false,
            timestamp: new Date().toISOString()
          }, { status: 400 });
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
            .sort((a, b) => b - a)
            .map(year => {
              return {
                value: year.toString(),
                label: year.toString(),
                displayName: year.toString(),
                source: 'carquery' as const,
                type: 'year' as const
              };
            })
            .slice(0, 30);
        }
        break;
      }
    }

    suggestionCache.set(cacheKey, { data: suggestions, timestamp: Date.now() });

    return NextResponse.json({
      success: true,
      suggestions,
      source: 'carquery',
      cached: false,
      timestamp: new Date().toISOString()
    });

  } catch {
    return NextResponse.json({
      success: false,
      suggestions: [],
      source: 'error',
      cached: false,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
