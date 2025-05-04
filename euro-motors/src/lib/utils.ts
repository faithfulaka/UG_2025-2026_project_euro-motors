// src/lib/utils.ts
import { BuyCar, RentalCar } from '@/types';

export function parseJsonFields<T>(item: Record<string, any>, fields: string[]): T {
  const parsed = { ...item };
  
  for (const field of fields) {
    if (parsed[field] && typeof parsed[field] === 'string') {
      try {
        parsed[field] = JSON.parse(parsed[field]);
      } catch (error) {
        console.error(`Error parsing ${field}:`, error);
      }
    }
  }
  
  return parsed as T;
}

export function parseBuyCars(cars: Record<string, any>[]): BuyCar[] {
  return cars.map(car => 
    parseJsonFields<BuyCar>(car, ['specifications', 'features', 'standardEquipment', 'addedOptions'])
  );
}

export function parseRentalCars(cars: Record<string, any>[]): RentalCar[] {
  return cars.map(car => 
    parseJsonFields<RentalCar>(car, ['specifications', 'features'])
  );
}