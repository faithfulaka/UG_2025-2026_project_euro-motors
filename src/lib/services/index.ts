// src/lib/services/index.ts - Updated with restored working APIs
import { getMakes, getModels, getYears, getCarData } from './carquery-api';
import { unifiedCarService as newUnifiedCarService, newAPIServices } from './new-apis';
import { getOwnershipCosts } from './dvla-api';
import { getBaseMSRP } from './nhtsa-api';

/**
 * CarQuery service - Restored because it was working reliably
 */
export const carQueryService = {
  getMakes,
  getModels,
  getYears,
  getCarData,
};

/**
 * Main service for SPA - Hybrid approach using both working CarQuery and new APIs
 */
export const carService = {
  // Use working CarQuery for suggestions (fast and reliable)
  getMakes: () => carQueryService.getMakes(),
  getModels: (make: string) => carQueryService.getModels(make),
  getYears: (make: string, model: string) => carQueryService.getYears(make, model),
  getCarData: (make: string, model: string, year: string) => carQueryService.getCarData(make, model, year),
  
  // Use new APIs for comprehensive search when available
  searchVehicles: newUnifiedCarService.searchVehicles,
  getMarketData: newUnifiedCarService.getMarketData,
  findDealers: newUnifiedCarService.findDealers,
};

/**
 * Export new API services for when they're specifically needed
 */
export const apiServices = newAPIServices;

/**
 * Trade-in APIs (restored as requested for future trade-in functionality)
 */
export const tradeInServices = {
  dvla: {
    getOwnershipCosts,
  },
  nhtsa: {
    getBaseMSRP,
  },
};

/**
 * Export individual APIs for specific use cases
 */
export { carQueryService as carQuery };
export { getOwnershipCosts as dvlaAPI };
export { getBaseMSRP as nhtsaAPI };