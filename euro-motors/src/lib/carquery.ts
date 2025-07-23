// src/lib/carquery.ts - Enhanced CarQuery Service with Rate Limiting
export interface CarQueryResponse {
  Makes?: Array<{make_id: string; make_display: string; make_is_common: string}>;
  Models?: Array<{model_name: string; model_make_id: string}>;
  Trims?: Array<{
    model_id: string;
    model_make_id: string;
    model_name: string;
    model_trim: string;
    model_year: string;
    model_body: string;
    model_engine_position: string;
    model_engine_cc: string;
    model_engine_cyl: string;
    model_engine_type: string;
    model_engine_valves_per_cyl: string;
    model_engine_power_ps: string;
    model_engine_power_rpm: string;
    model_engine_torque_nm: string;
    model_engine_torque_rpm: string;
    model_engine_bore_mm: string;
    model_engine_stroke_mm: string;
    model_engine_compression: string;
    model_engine_fuel: string;
    model_top_speed_kph: string;
    model_0_to_100_kph: string;
    model_drive: string;
    model_transmission_type: string;
    model_seats: string;
    model_doors: string;
    model_weight_kg: string;
    model_length_mm: string;
    model_width_mm: string;
    model_height_mm: string;
    model_wheelbase_mm: string;
    model_lkm_hwy: string;
    model_lkm_mixed: string;
    model_lkm_city: string;
    model_fuel_cap_l: string;
    model_sold_in_us: string;
    model_co2: string;
    model_make_display: string;
  }>;
}

interface CarQueryError {
  success: false;
  error: {
    code: string;
    message: string;
    retryAfter?: number;
  };
}

interface CarQuerySuccess<T> {
  success: true;
  data: T;
  cached: boolean;
  timestamp: string;
}

type CarQueryResult<T> = CarQuerySuccess<T> | CarQueryError;

class CarQueryService {
  private baseUrl = 'https://www.carqueryapi.com/api/0.3/';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private requestCount = 0;
  private requestWindow = Date.now();
  
  // Rate limiting: 100 requests per hour
  private readonly RATE_LIMIT = 100;
  private readonly RATE_WINDOW = 60 * 60 * 1000; // 1 hour
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds

  private async apiCall(endpoint: string, params: Record<string, string> = {}): Promise<CarQueryResult<any>> {
    try {
      // Check rate limiting
      const now = Date.now();
      if (now - this.requestWindow > this.RATE_WINDOW) {
        this.requestCount = 0;
        this.requestWindow = now;
      }

      if (this.requestCount >= this.RATE_LIMIT) {
        const retryAfter = Math.ceil((this.RATE_WINDOW - (now - this.requestWindow)) / 1000);
        return {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'CarQuery API rate limit exceeded',
            retryAfter
          }
        };
      }

      // Check cache
      const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && (now - cached.timestamp < this.CACHE_TTL)) {
        console.log(`✅ CarQuery cache hit: ${cacheKey}`);
        return {
          success: true,
          data: cached.data,
          cached: true,
          timestamp: new Date().toISOString()
        };
      }

      // Build URL
      const url = new URL(this.baseUrl);
      url.searchParams.set('cmd', endpoint);
      url.searchParams.set('format', 'json');
      
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });

      console.log(`🔍 CarQuery API call: ${endpoint}`, params);
      
      // Make request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': process.env.SCRAPER_USER_AGENT || 'EuroMotors-SPA/1.0',
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);
      this.requestCount++;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CarQueryResponse = await response.json();

      // Cache successful response
      this.cache.set(cacheKey, {
        data,
        timestamp: now
      });

      return {
        success: true,
        data,
        cached: false,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('CarQuery API error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: {
              code: 'TIMEOUT',
              message: 'CarQuery API request timed out',
              retryAfter: 30
            }
          };
        }
        
        if (error.message.includes('429')) {
          return {
            success: false,
            error: {
              code: 'API_RATE_LIMITED',
              message: 'CarQuery API returned rate limit error',
              retryAfter: 300 // 5 minutes
            }
          };
        }
      }

      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Unknown CarQuery error'
        }
      };
    }
  }

  async getMakes(): Promise<string[]> {
    try {
      const result = await this.apiCall('getMakes');
      
      if (!result.success) {
        console.error('CarQuery getMakes error:', result.error);
        return [];
      }

      if (!result.data.Makes || !Array.isArray(result.data.Makes)) {
        console.warn('CarQuery getMakes: No makes data');
        return [];
      }

      const makes = result.data.Makes
        .map((make: any) => make.make_display)
        .filter((make: string) => make && make.trim())
        .sort();

      console.log(`✅ CarQuery getMakes: ${makes.length} makes retrieved`);
      return makes;

    } catch (error) {
      console.error('CarQuery getMakes error:', error);
      return [];
    }
  }

  async getModels(make: string): Promise<string[]> {
    try {
      if (!make || !make.trim()) {
        console.warn('CarQuery getModels: Empty make provided');
        return [];
      }

      const result = await this.apiCall('getModels', { make: make.trim() });
      
      if (!result.success) {
        console.error('CarQuery getModels error:', result.error);
        return [];
      }

      if (!result.data.Models || !Array.isArray(result.data.Models)) {
        console.warn(`CarQuery getModels: No models data for ${make}`);
        return [];
      }

      const models = result.data.Models
        .map((model: any) => model.model_name)
        .filter((model: string) => model && model.trim())
        .sort();

      console.log(`✅ CarQuery getModels for ${make}: ${models.length} models retrieved`);
      return models;

    } catch (error) {
      console.error('CarQuery getModels error:', error);
      return [];
    }
  }

  async getTrims(make: string, model: string, year?: number): Promise<CarQueryResponse['Trims']> {
    try {
      if (!make || !model) {
        console.warn('CarQuery getTrims: Missing make or model');
        return [];
      }

      const params: Record<string, string> = {
        make: make.trim(),
        model: model.trim()
      };

      if (year) {
        params.year = year.toString();
      }

      const result = await this.apiCall('getTrims', params);
      
      if (!result.success) {
        console.error('CarQuery getTrims error:', result.error);
        return [];
      }

      if (!result.data.Trims || !Array.isArray(result.data.Trims)) {
        console.warn(`CarQuery getTrims: No trims data for ${make} ${model} ${year || 'any'}`);
        return [];
      }

      console.log(`✅ CarQuery getTrims for ${make} ${model} ${year || 'any'}: ${result.data.Trims.length} trims retrieved`);
      return result.data.Trims;

    } catch (error) {
      console.error('CarQuery getTrims error:', error);
      return [];
    }
  }

  async getYears(make: string, model: string): Promise<number[]> {
    try {
      const trims = await this.getTrims(make, model);
      
      if (!trims || trims.length === 0) {
        return [];
      }

      const years = [...new Set(
        trims
          .map(trim => parseInt(trim.model_year))
          .filter(year => !isNaN(year) && year > 1990 && year <= new Date().getFullYear() + 2)
      )].sort((a, b) => b - a); // Most recent first

      console.log(`✅ CarQuery getYears for ${make} ${model}: ${years.length} years found`);
      return years;

    } catch (error) {
      console.error('CarQuery getYears error:', error);
      return [];
    }
  }

  async getCarData(make: string, model: string, year: number): Promise<any> {
    try {
      const trims = await this.getTrims(make, model, year);
      
      if (!trims || trims.length === 0) {
        console.warn(`CarQuery getCarData: No data for ${make} ${model} ${year}`);
        return null;
      }

      // Use the first trim as primary data
      const trim = trims[0];

      // Convert and enhance the data
      const carData = {
        basicSpecifications: {
          make: trim.model_make_display,
          model: trim.model_name,
          year: parseInt(trim.model_year),
          bodyType: trim.model_body || 'Unknown',
          engine: trim.model_engine_type || 'Unknown',
          engineCC: trim.model_engine_cc,
          cylinders: trim.model_engine_cyl,
          doors: parseInt(trim.model_doors) || 4,
          seats: parseInt(trim.model_seats) || 5,
          drivetrain: trim.model_drive,
          transmission: trim.model_transmission_type,
          fuelType: trim.model_engine_fuel
        },
        
        performanceData: {
          engine: trim.model_engine_type || 'Unknown',
          horsePower: trim.model_engine_power_ps ? 
            `${trim.model_engine_power_ps} PS @ ${trim.model_engine_power_rpm || 'N/A'} RPM` : 
            'N/A',
          torque: trim.model_engine_torque_nm ? 
            `${trim.model_engine_torque_nm} Nm @ ${trim.model_engine_torque_rpm || 'N/A'} RPM` : 
            'N/A',
          acceleration060: trim.model_0_to_100_kph ? 
            `${(parseFloat(trim.model_0_to_100_kph) * 0.621371).toFixed(1)} seconds` : 
            'N/A',
          topSpeed: trim.model_top_speed_kph ? 
            `${(parseFloat(trim.model_top_speed_kph) * 0.621371).toFixed(0)} mph` : 
            'N/A',
          transmission: trim.model_transmission_type || 'Unknown',
          driveType: trim.model_drive || 'Unknown',
          weight: trim.model_weight_kg ? `${trim.model_weight_kg} kg` : 'N/A',
          fuelEconomy: trim.model_lkm_mixed ? 
            `${(100 / parseFloat(trim.model_lkm_mixed) * 2.352).toFixed(1)} mpg combined` : 
            'N/A'
        },
        
        dataSource: 'CarQuery API',
        availableTrims: trims.length,
        lastUpdated: new Date().toISOString()
      };

      console.log(`✅ CarQuery getCarData: Complete data for ${make} ${model} ${year}`);
      return carData;

    } catch (error) {
      console.error('CarQuery getCarData error:', error);
      return null;
    }
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 CarQuery cache cleared');
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  getRateLimitStatus(): { remaining: number; resetTime: number } {
    const now = Date.now();
    const windowReset = this.requestWindow + this.RATE_WINDOW;
    
    return {
      remaining: Math.max(0, this.RATE_LIMIT - this.requestCount),
      resetTime: windowReset
    };
  }
}

export const carQueryService = new CarQueryService();