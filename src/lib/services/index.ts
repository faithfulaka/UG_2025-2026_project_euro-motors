// src/lib/services/index.ts - NEW VERSION WITH RELIABLE APIs ONLY
import { unifiedCarService, newAPIServices } from './new-apis';

/**
 * Main service exports - now using reliable APIs only
 */
export const carService = unifiedCarService;
export const apiServices = newAPIServices;

// Legacy exports for backward compatibility during transition
export const carQueryService = {
  getMakes: () => unifiedCarService.getMakes(),
  getModels: (make: string) => unifiedCarService.getModels(make),
  getYears: (make: string, model: string) => unifiedCarService.getYears(make, model),
  getCarData: (make: string, model: string, year: string) => 
    unifiedCarService.searchVehicles(make, model, parseInt(year)),
};