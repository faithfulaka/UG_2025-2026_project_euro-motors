// src/lib/services/index.ts
import { getMakes, getModels, getYears, getCarData } from './carquery-api';

/**
 * CarQuery wrapper exposing all core methods
 */
export const carQueryService = {
  getMakes,
  getModels,
  getYears,
  getCarData,
};