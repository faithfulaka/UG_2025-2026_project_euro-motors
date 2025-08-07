// src/lib/services/new-apis/index.ts - SIMPLIFIED to only use CarQuery
import { carQueryService } from './carquery-api';
import { maximumDataAggregator } from './maximum-data-aggregator';

// Export only working services
export { carQueryService } from './carquery-api';
export { maximumDataAggregator } from './maximum-data-aggregator';

// Unified service for SPA tool - ONLY USING CARQUERY
export const unifiedCarService = {
  // Get vehicle data using CarQuery (the only working API)
  async getVehicleData(make: string, model: string, year: number, options?: any) {
    return maximumDataAggregator.getMaximumVehicleData(make, model, year, options);
  },
  
  // Get suggestions from CarQuery
  async getSuggestions(type: 'make' | 'model' | 'year', params?: any) {
    if (type === 'make') {
      const makes = await maximumDataAggregator.getAllMakes();
      return Array.from(makes.entries()).map(([value, sources]) => ({
        value,
        label: value,
        source: sources.join(', ')
      }));
    } else if (type === 'model' && params?.make) {
      const models = await maximumDataAggregator.getAllModels(params.make);
      return Array.from(models.entries()).map(([value, sources]) => ({
        value,
        label: value,
        source: sources.join(', ')
      }));
    } else if (type === 'year' && params?.make && params?.model) {
      // Get years from CarQuery trims
      const trims = await carQueryService.getTrims(params.make, params.model);
      const years = new Set<number>();
      
      trims.forEach((trim: any) => {
        if (trim.model_year) {
          const year = parseInt(trim.model_year);
          if (year > 1900 && year <= new Date().getFullYear() + 1) {
            years.add(year);
          }
        }
      });
      
      return Array.from(years)
        .sort((a, b) => b - a)
        .map(year => ({
          value: year.toString(),
          label: year.toString(),
          source: 'CarQuery'
        }));
    }
    
    return [];
  },
  
  // Search vehicles using CarQuery
  async searchVehicles(make: string, model: string, year?: number) {
    const carQueryResults = await carQueryService.searchVehicles({
      make,
      model,
      year
    });
    
    if (carQueryResults && carQueryResults.length > 0) {
      return {
        listings: carQueryResults,
        stats: null,
        source: 'CarQuery'
      };
    }
    
    // Fallback to basic data
    const vehicleData = await maximumDataAggregator.getMaximumVehicleData(
      make, 
      model, 
      year || new Date().getFullYear()
    );
    
    return {
      listings: [],
      stats: null,
      vehicleData,
      source: 'CarQuery'
    };
  },
  
  // Get market data - not available from CarQuery
  async getMarketData(make: string, model: string, year?: number) {
    return null; // CarQuery doesn't provide market data
  },
  
  // Get pricing data - not available from CarQuery
  async getPricing(make: string, model: string, year: number, options?: any) {
    return {}; // CarQuery doesn't provide pricing
  },
  
  // Find dealers - not available from CarQuery
  async findDealers(make: string, options?: any) {
    return []; // CarQuery doesn't provide dealer info
  }
};
