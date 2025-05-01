import { BuyCar, RentalCar, CarFeatures, CarSpecifications } from '@/types';

export function parseJsonFields<T>(item: any, fields: string[]): T {
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

export function parseBuyCars(cars: any[]): BuyCar[] {
  return cars.map(car => 
    parseJsonFields<BuyCar>(car, ['specifications', 'features', 'standardEquipment', 'addedOptions'])
  );
}

export function parseRentalCars(cars: any[]): RentalCar[] {
  return cars.map(car => 
    parseJsonFields<RentalCar>(car, ['specifications', 'features'])
  );
}