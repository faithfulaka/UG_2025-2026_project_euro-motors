// src/lib/services/new-apis/maximum-data-aggregator.ts
// SIMPLIFIED: Using ONLY CarQuery API since it's the only one actually working
import { carQueryService } from './carquery-api';

export interface MaximumVehicleData {
  // Basic Information
  basic: {
    make: string;
    model: string;
    year: number;
    trim?: string;
    bodyType?: string;
    vehicleClass?: string;
    country?: string;
  };
  
  // Engine & Performance
  engine: {
    description?: string;
    horsepower?: number;
    torque?: string;
    displacement?: string;
    cylinders?: string;
    valves?: string;
    fuelType?: string;
    fuelSystem?: string;
    compression?: string;
    bore?: string;
    stroke?: string;
  };
  
  // Transmission & Drivetrain
  transmission: {
    type?: string;
    speeds?: string;
  };
  
  drivetrain: {
    type?: string;
  };
  
  // Dimensions & Weight
  dimensions: {
    length?: string;
    width?: string;
    height?: string;
    wheelbase?: string;
    weight?: string;
    doors?: number;
    seats?: number;
    cargoVolume?: string;
    groundClearance?: string;
  };
  
  // Performance
  performance: {
    topSpeed?: string;
    acceleration060?: string;
    quarterMile?: string;
  };
  
  // Fuel Economy
  fuelEconomy: {
    city?: number;
    highway?: number;
    combined?: number;
    tankCapacity?: string;
    co2?: string;
  };
  
  // Colors - Keep for compatibility but will be empty
  colors: {
    exterior?: string[];
    interior?: string[];
  };
  
  // Pricing - Keep for compatibility but will be empty
  pricing: {
    baseMSRP?: number;
    invoice?: number;
    listPrice?: number;
    salePrice?: number;
  };
  
  // Wheels & Brakes
  wheels?: {
    frontTireSize?: string;
    rearTireSize?: string;
    frontRimSize?: string;
    rearRimSize?: string;
  };
  
  brakes?: {
    front?: string;
    rear?: string;
  };
  
  // Data Sources
  sources: string[];
}

/**
 * Get vehicle data using CarQuery API (the only one that actually works)
 */
export async function getMaximumVehicleData(
  make: string,
  model: string,
  year: number,
  options?: {
    trim?: string;
    region?: string;
  }
): Promise<MaximumVehicleData> {
  console.log(`🚀 Getting vehicle data for ${year} ${make} ${model} from CarQuery`);
  
  const result: MaximumVehicleData = {
    basic: { make, model, year },
    engine: {},
    transmission: {},
    drivetrain: {},
    dimensions: {},
    performance: {},
    fuelEconomy: {},
    colors: { exterior: [], interior: [] },
    pricing: {},
    sources: []
  };
  
  try {
    // Get comprehensive data from CarQuery
    const specs = await carQueryService.getVehicleSpecs(make, model, year);
    
    if (specs) {
      result.sources.push('CarQuery');
      
      // Basic info
      if (specs.bodyType) result.basic.bodyType = specs.bodyType;
      if (specs.trim) result.basic.trim = specs.trim;
      if (specs.makeCountry) result.basic.country = specs.makeCountry;
      
      // Engine data
      if (specs.engine) {
        result.engine.displacement = specs.engine.displacement;
        result.engine.cylinders = specs.engine.cylinders;
        result.engine.valves = specs.engine.valves;
        result.engine.fuelType = specs.engine.fuelType;
        result.engine.fuelSystem = specs.engine.fuelSystem;
        result.engine.compression = specs.engine.compression;
        result.engine.bore = specs.engine.bore;
        result.engine.stroke = specs.engine.stroke;
        
        if (specs.engine.power?.hp) {
          result.engine.horsepower = specs.engine.power.hp;
        }
        if (specs.engine.torque?.nm) {
          result.engine.torque = `${specs.engine.torque.nm} Nm`;
        } else if (specs.engine.torque?.lbft) {
          result.engine.torque = `${specs.engine.torque.lbft} lb-ft`;
        }
        
        // Create engine description
        if (result.engine.displacement && result.engine.cylinders) {
          result.engine.description = `${result.engine.displacement} ${result.engine.cylinders} Cylinder`;
        }
      }
      
      // Transmission
      if (specs.transmission) {
        result.transmission.type = specs.transmission.type;
        result.transmission.speeds = specs.transmission.speeds;
      }
      
      // Drivetrain
      if (specs.drivetrain) {
        result.drivetrain.type = specs.drivetrain;
      }
      
      // Dimensions
      if (specs.dimensions) {
        result.dimensions.length = specs.dimensions.length;
        result.dimensions.width = specs.dimensions.width;
        result.dimensions.height = specs.dimensions.height;
        result.dimensions.wheelbase = specs.dimensions.wheelbase;
        result.dimensions.weight = specs.dimensions.weight;
        result.dimensions.cargoVolume = specs.dimensions.cargoVolume;
        result.dimensions.groundClearance = specs.dimensions.groundClearance;
      }
      
      // Capacity
      if (specs.capacity) {
        result.dimensions.doors = specs.capacity.doors;
        result.dimensions.seats = specs.capacity.seats;
        result.fuelEconomy.tankCapacity = specs.capacity.fuelCapacity;
      }
      
      // Performance
      if (specs.performance) {
        if (specs.performance.topSpeed?.mph) {
          result.performance.topSpeed = `${specs.performance.topSpeed.mph} mph`;
        } else if (specs.performance.topSpeed?.kph) {
          result.performance.topSpeed = `${specs.performance.topSpeed.kph} kph`;
        }
        
        if (specs.performance.acceleration?.zeroTo60Mph) {
          result.performance.acceleration060 = `${specs.performance.acceleration.zeroTo60Mph}s`;
        } else if (specs.performance.acceleration?.zeroTo100Kph) {
          result.performance.acceleration060 = `${specs.performance.acceleration.zeroTo100Kph}s (0-100kph)`;
        }
        
        if (specs.performance.acceleration?.quarterMile) {
          result.performance.quarterMile = specs.performance.acceleration.quarterMile;
        }
      }
      
      // Fuel Economy
      if (specs.fuelEconomy) {
        if (specs.fuelEconomy.city?.mpg) result.fuelEconomy.city = specs.fuelEconomy.city.mpg;
        if (specs.fuelEconomy.highway?.mpg) result.fuelEconomy.highway = specs.fuelEconomy.highway.mpg;
        if (specs.fuelEconomy.combined?.mpg) result.fuelEconomy.combined = specs.fuelEconomy.combined.mpg;
        if (specs.fuelEconomy.co2) result.fuelEconomy.co2 = specs.fuelEconomy.co2;
      }
      
      // Wheels & Brakes
      if (specs.wheels) {
        result.wheels = {
          frontTireSize: specs.wheels.frontTireSize,
          rearTireSize: specs.wheels.rearTireSize,
          frontRimSize: specs.wheels.frontRimSize,
          rearRimSize: specs.wheels.rearRimSize
        };
      }
      
      if (specs.brakes) {
        result.brakes = {
          front: specs.brakes.front,
          rear: specs.brakes.rear
        };
      }
    }
  } catch (error) {
    console.error('Error fetching CarQuery data:', error);
  }
  
  // Add fallback source indicator
  if (result.sources.length === 0) {
    result.sources.push('Database');
  }
  
  console.log(`✅ Retrieved data from: ${result.sources.join(', ')}`);
  
  return result;
}

/**
 * Get ALL available makes from CarQuery
 */
export async function getAllMakes(): Promise<Map<string, string[]>> {
  const makesMap = new Map<string, string[]>();
  
  try {
    const makes = await carQueryService.getMakes();
    makes.forEach(make => {
      if (make.name) {
        makesMap.set(make.name, ['CarQuery']);
      }
    });
  } catch (error) {
    console.error('Error fetching makes:', error);
  }
  
  return makesMap;
}

/**
 * Get ALL available models for a make from CarQuery
 */
export async function getAllModels(make: string): Promise<Map<string, string[]>> {
  const modelsMap = new Map<string, string[]>();
  
  try {
    const models = await carQueryService.getModels(make);
    models.forEach(model => {
      if (model.name) {
        modelsMap.set(model.name, ['CarQuery']);
      }
    });
  } catch (error) {
    console.error('Error fetching models:', error);
  }
  
  return modelsMap;
}

export const maximumDataAggregator = {
  getMaximumVehicleData,
  getAllMakes,
  getAllModels
};
