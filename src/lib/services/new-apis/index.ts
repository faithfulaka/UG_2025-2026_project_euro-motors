// src/lib/services/new-apis/index.ts
export * from './edmunds-api';
export * from './marketcheck-api';
export * from './cis-automotive-api';
export * from './car-data-api';

// Combined service object for easy access
import { edmundsService } from './edmunds-api';
import { marketCheckService } from './marketcheck-api';
import { cisAutomotiveService } from './cis-automotive-api';
import { carDataService } from './car-data-api';

export const newAPIServices = {
  edmunds: edmundsService,
  marketCheck: marketCheckService,
  cisAutomotive: cisAutomotiveService,
  carData: carDataService,
};

// Unified service methods for SPA tool integration
export const unifiedCarService = {
  // Make suggestions from multiple sources
  async getMakes(): Promise<Array<{ value: string; label: string; source: string }>> {
    const results = await Promise.allSettled([
      edmundsService.getMakes(),
      marketCheckService.getAvailableMakes(),
      cisAutomotiveService.getAvailableMakes(),
      carDataService.getMakes(),
    ]);

    const makeSet = new Set<string>();
    const makes: Array<{ value: string; label: string; source: string }> = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const sources = ['edmunds', 'marketcheck', 'cis', 'cardata'];
        const source = sources[index];
        
        result.value.forEach((make: any) => {
          const makeName = typeof make === 'string' ? make : make.name || make.make_display;
          if (!makeSet.has(makeName)) {
            makeSet.add(makeName);
            makes.push({
              value: makeName,
              label: makeName,
              source,
            });
          }
        });
      }
    });

    return makes.sort((a, b) => a.label.localeCompare(b.label));
  },

  // Model suggestions from multiple sources
  async getModels(make: string): Promise<Array<{ value: string; label: string; source: string }>> {
    const results = await Promise.allSettled([
      edmundsService.getModels(make.toLowerCase()),
      marketCheckService.getAvailableModels(make),
      cisAutomotiveService.getAvailableModels(make),
      carDataService.getModels(make),
    ]);

    const modelSet = new Set<string>();
    const models: Array<{ value: string; label: string; source: string }> = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const sources = ['edmunds', 'marketcheck', 'cis', 'cardata'];
        const source = sources[index];
        
        result.value.forEach((model: any) => {
          const modelName = typeof model === 'string' ? model : model.name || model.model_name;
          if (!modelSet.has(modelName)) {
            modelSet.add(modelName);
            models.push({
              value: modelName,
              label: modelName,
              source,
            });
          }
        });
      }
    });

    return models.sort((a, b) => a.label.localeCompare(b.label));
  },

  // Year suggestions
  async getYears(make: string, model: string): Promise<Array<{ value: string; label: string; source: string }>> {
    const results = await Promise.allSettled([
      carDataService.getYears(),
    ]);

    const years: Array<{ value: string; label: string; source: string }> = [];

    if (results[0].status === 'fulfilled') {
      results[0].value.forEach((year: number) => {
        years.push({
          value: year.toString(),
          label: year.toString(),
          source: 'cardata',
        });
      });
    }

    return years.sort((a, b) => parseInt(b.value) - parseInt(a.value));
  },

  // Comprehensive vehicle search across all APIs
  async searchVehicles(make: string, model: string, year?: number) {
    const results = await Promise.allSettled([
      edmundsService.getVehicleSpecs(make, model, year || 2024),
      marketCheckService.searchByMakeModelYear(make, model, year),
      cisAutomotiveService.searchVehicles({ make, model, year }),
      carDataService.searchCars(make, model, year),
    ]);

    return {
      edmunds: results[0].status === 'fulfilled' ? results[0].value : null,
      marketCheck: results[1].status === 'fulfilled' ? results[1].value : [],
      cisAutomotive: results[2].status === 'fulfilled' ? results[2].value : [],
      carData: results[3].status === 'fulfilled' ? results[3].value : [],
    };
  },

  // Get market statistics
  async getMarketData(make: string, model: string, year?: number) {
    const marketStats = await marketCheckService.getMarketStats(make, model, year);
    return {
      marketCheck: marketStats,
    };
  },

  // Find dealers
  async findDealers(make: string, location?: { zip?: string; city?: string; state?: string }) {
    const dealers = await cisAutomotiveService.getDealersByBrand(make, location);
    return dealers;
  },
};