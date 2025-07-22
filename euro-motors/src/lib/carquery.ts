// src/lib/carquery.ts - ENHANCED CARQUERY SERVICE WITH REAL DATA
import { CarQueryAPIResponse, SPAServiceResponse, SPASuggestion } from '@/types/spa';

class EnhancedCarQueryService {
  private baseUrl = 'https://www.carqueryapi.com/api/0.3/';
  private cache = new Map<string, { data: any; expiresAt: number }>();
  private cacheTimeout = 30 * 60 * 1000; // 30 minutes

  // RATE LIMITING
  private rateLimiter = {
    requests: 0,
    resetTime: Date.now() + 60000, // Reset every minute
    maxRequests: 50 // Max 50 requests per minute
  };

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    
    if (now > this.rateLimiter.resetTime) {
      this.rateLimiter.requests = 0;
      this.rateLimiter.resetTime = now + 60000;
    }
    
    if (this.rateLimiter.requests >= this.rateLimiter.maxRequests) {
      const waitTime = this.rateLimiter.resetTime - now;
      console.log(`⏳ Rate limit hit, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.rateLimiter.requests = 0;
      this.rateLimiter.resetTime = Date.now() + 60000;
    }
    
    this.rateLimiter.requests++;
  }

  // CACHING HELPER
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.cacheTimeout
    });
  }

  // ENHANCED API CALL WITH ERROR HANDLING
  private async apiCall<T>(endpoint: string): Promise<SPAServiceResponse<T>> {
    const startTime = Date.now();
    const cacheKey = endpoint;
    
    // Check cache first
    const cached = this.getCached<T>(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached,
        processingTime: Date.now() - startTime,
        cached: true,
        cacheExpiresAt: new Date(this.cache.get(cacheKey)!.expiresAt).toISOString()
      };
    }

    try {
      await this.rateLimit();
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'User-Agent': 'Euro-Motors-SPA/1.0',
          'Accept': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: T = await response.json();
      
      // Cache the result
      this.setCache(cacheKey, data);

      return {
        success: true,
        data,
        processingTime: Date.now() - startTime,
        cached: false
      };
    } catch (error: any) {
      console.error(`🚨 CarQuery API Error (${endpoint}):`, error.message);
      
      return {
        success: false,
        error: {
          code: error.name === 'TypeError' ? 'NETWORK_ERROR' : 'API_LIMIT',
          message: error.message,
          recoverable: true,
          retryAfter: error.name === 'TypeError' ? 60 : 300 // Retry in 1min for network, 5min for API limits
        },
        processingTime: Date.now() - startTime,
        cached: false
      };
    }
  }

  // 🚗 GET ALL MAKES WITH SUGGESTIONS
  async getMakes(search?: string): Promise<SPAServiceResponse<SPASuggestion[]>> {
    const response = await this.apiCall<CarQueryAPIResponse>('?cmd=getMakes&format=json');
    
    if (!response.success || !response.data?.Makes) {
      return {
        success: false,
        error: {
          code: 'NO_DATA_FOUND',
          message: 'No makes data available from CarQuery',
          recoverable: true
        },
        processingTime: response.processingTime,
        cached: false
      };
    }

    let makes = response.data.Makes.map(make => ({
      type: 'make' as const,
      value: make.make_display,
      displayName: make.make_display,
      popular: make.make_is_common === '1'
    }));

    // Filter by search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      makes = makes.filter(make => 
        make.value.toLowerCase().includes(searchLower)
      );
    }

    // Sort: popular first, then alphabetical
    makes.sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.value.localeCompare(b.value);
    });

    return {
      success: true,
      data: makes.slice(0, 20), // Limit to top 20 results
      processingTime: response.processingTime,
      cached: response.cached
    };
  }

  // 🏷️ GET MODELS FOR SPECIFIC MAKE
  async getModels(make: string, search?: string): Promise<SPAServiceResponse<SPASuggestion[]>> {
    const endpoint = `?cmd=getModels&make=${encodeURIComponent(make)}&format=json`;
    const response = await this.apiCall<CarQueryAPIResponse>(endpoint);
    
    if (!response.success || !response.data?.Models) {
      return {
        success: false,
        error: {
          code: 'NO_DATA_FOUND',
          message: `No models found for ${make}`,
          recoverable: true
        },
        processingTime: response.processingTime,
        cached: false
      };
    }

    let models = response.data.Models.map(model => ({
      type: 'model' as const,
      value: model.model_name,
      displayName: model.model_name,
      popular: false
    }));

    // Filter by search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      models = models.filter(model => 
        model.value.toLowerCase().includes(searchLower)
      );
    }

    // Remove duplicates and sort
    const uniqueModels = Array.from(
      new Map(models.map(m => [m.value, m])).values()
    ).sort((a, b) => a.value.localeCompare(b.value));

    return {
      success: true,
      data: uniqueModels.slice(0, 15), // Limit to 15 results
      processingTime: response.processingTime,
      cached: response.cached
    };
  }

  // 📅 GET YEARS FOR SPECIFIC MAKE AND MODEL
  async getYears(make: string, model: string): Promise<SPAServiceResponse<SPASuggestion[]>> {
    const endpoint = `?cmd=getTrims&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&format=json`;
    const response = await this.apiCall<CarQueryAPIResponse>(endpoint);
    
    if (!response.success || !response.data?.Trims) {
      return {
        success: false,
        error: {
          code: 'NO_DATA_FOUND',
          message: `No years found for ${make} ${model}`,
          recoverable: true
        },
        processingTime: response.processingTime,
        cached: false
      };
    }

    // Extract unique years
    const yearSet = new Set<number>();
    response.data.Trims.forEach(trim => {
      const year = parseInt(trim.model_year);
      if (!isNaN(year) && year >= 1990 && year <= new Date().getFullYear() + 2) {
        yearSet.add(year);
      }
    });

    const years = Array.from(yearSet)
      .sort((a, b) => b - a) // Most recent first
      .map(year => ({
        type: 'year' as const,
        value: year.toString(),
        displayName: year.toString(),
        popular: year >= new Date().getFullYear() - 3 // Last 3 years are popular
      }));

    return {
      success: true,
      data: years,
      processingTime: response.processingTime,
      cached: response.cached
    };
  }

  // 🔍 GET COMPREHENSIVE CAR DATA
  async getCarData(make: string, model: string, year: number): Promise<SPAServiceResponse<any>> {
    const endpoint = `?cmd=getTrims&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}&format=json`;
    const response = await this.apiCall<CarQueryAPIResponse>(endpoint);
    
    if (!response.success || !response.data?.Trims || response.data.Trims.length === 0) {
      return {
        success: false,
        error: {
          code: 'NO_DATA_FOUND',
          message: `No data found for ${make} ${model} ${year}`,
          recoverable: true
        },
        processingTime: response.processingTime,
        cached: false
      };
    }

    const trim = response.data.Trims[0]; // Use first trim as primary data

    // Convert and normalize the data
    const carData = {
      vehicle: {
        make: trim.model_make_display || make,
        model: trim.model_name || model,
        year: parseInt(trim.model_year) || year,
        trim: trim.model_trim || null,
        bodyType: trim.model_body || null,
      },
      
      specifications: {
        engine: {
          type: trim.model_engine_type || 'Unknown',
          displacement: trim.model_engine_cc ? `${trim.model_engine_cc}cc` : undefined,
          cylinders: parseInt(trim.model_engine_cyl) || undefined,
          fuelType: 'Petrol', // Default for luxury cars
        },
        
        performance: {
          horsepower: parseInt(trim.model_engine_power_ps) || 0,
          horsepowerRPM: parseInt(trim.model_engine_power_rpm) || undefined,
          torque: parseInt(trim.model_engine_torque_nm) || 0,
          torqueRPM: trim.model_engine_torque_rpm || undefined,
          acceleration0to100: trim.model_0_to_100_kph ? parseFloat(trim.model_0_to_100_kph) : undefined,
          topSpeed: trim.model_top_speed_kph ? parseInt(trim.model_top_speed_kph) : undefined,
          topSpeedUnit: 'kph' as const,
        },
        
        drivetrain: {
          transmission: trim.model_transmission_type || 'Unknown',
          driveType: trim.model_drive || 'Unknown',
        },
        
        dimensions: {
          weight: trim.model_weight_kg ? parseInt(trim.model_weight_kg) : undefined,
          length: trim.model_length_mm ? parseInt(trim.model_length_mm) : undefined,
          width: trim.model_width_mm ? parseInt(trim.model_width_mm) : undefined,
          height: trim.model_height_mm ? parseInt(trim.model_height_mm) : undefined,
          wheelbase: trim.model_wheelbase_mm ? parseInt(trim.model_wheelbase_mm) : undefined,
        },
        
        efficiency: {
          fuelEconomyCombined: trim.model_lkm_mixed ? parseFloat(trim.model_lkm_mixed) : undefined,
          fuelTankCapacity: trim.model_fuel_cap_l ? parseFloat(trim.model_fuel_cap_l) : undefined,
          co2Emissions: trim.model_co2 ? parseInt(trim.model_co2) : undefined,
        }
      },
      
      dataSources: {
        carQuery: true,
        manufacturerOfficial: false,
        autotrader: false,
        carscom: false,
        classiccom: false,
        bringatrailer: false,
        edmunds: false,
        kbb: false
      },
      
      confidence: {
        specifications: 'high' as const,
        pricing: 'low' as const, // CarQuery doesn't provide pricing
        marketData: 'low' as const,
        overall: 'medium' as const
      }
    };

    return {
      success: true,
      data: carData,
      processingTime: response.processingTime,
      cached: response.cached
    };
  }

  // 🧹 CACHE MANAGEMENT
  clearCache(): void {
    this.cache.clear();
    console.log('✅ CarQuery cache cleared');
  }

  getCacheInfo() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
      rateLimiter: this.rateLimiter
    };
  }
}

// Export singleton instance
export const carQueryService = new EnhancedCarQueryService();