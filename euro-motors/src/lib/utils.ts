// src/lib/utils.ts
import { BuyCar, RentalCar } from '@/types/cars'; 
//All imports in import declaration are unused.'RentalCar' is defined but never used
//All imports in import declaration are unused. 'BuyCar' is defined but never used

export function safeJsonParse<T = Record<string, unknown>>(
  value: string | object | null | undefined,
  fallback: T
): T {
  if (!value) return fallback;

  if (typeof value === 'object') return value as T;

  try {
    return JSON.parse(value) as T;
  } catch (parseError) {
    console.error('JSON parsing failed:', parseError);
    return fallback;
  }
}
