// src/lib/services/new-apis/vehicle-data-aggregator.ts
// Comprehensive aggregator focusing on Static Data and Pricing Data
import { edmundsService } from './edmunds-api';
import { marketCheckService } from './marketcheck-api';
import { cisAutomotiveService } from './cis-automotive-api';
import { carDataService } from './car-data-api';
import { carApi2Service } from './car-api2';

export interface ComprehensiveVehicleData {
  // Basic Information
  basic: {
    make: string;
    model: string;
    year: number;
    trim?: string;
    vin?: string;
    source: string[];
  };
  
  // STATIC DATA - Physical Specifications
  static: {
    // Exterior Specifications
    exterior: {
      bodyType: string;
      doors: number;
      colors?: string[];
      dimensions: {
        length?: number;
        width?: number;
        height?: number;
        wheelbase?: number;
        groundClearance?: number;
      };
      wheels: {
        wheelSize?: string;
        tireSize?: string;
        wheelType?: string;
      };
      features?: string[];
    };
    
    // Interior Specifications
    interior: {
      seatingCapacity: number;
      upholstery?: string;
      colors?: string[];
      dimensions: {
        cargoVolume?: number;
        passengerVolume?: number;
        frontHeadroom?: number;
        frontLegroom?: number;
        rearHeadroom?: number;
        rearLegroom?: number;
      };
      features?: string[];
      infotainment?: string[];
      comfortFeatures?: string[];
    };
    
    // Performance Specifications
    performance: {
      engine: {
        type: string;
        cylinders: number;
        displacement: number;
        horsepower: number;
        torque: number;
        fuelType: string;
        configuration?: string;
      };
      transmission: {
        type: string;
        speeds?: number;
        drivetrain: string;
      };
      acceleration: {
        zeroTo60?: number;
        quarterMile?: number;
        topSpeed?: number;
      };
      fuelEconomy: {
        city: number;
        highway: number;
        combined: number;
        tankCapacity?: number;
        range?: number;
      };
      handling: {
        turningRadius?: number;
        suspensionType?: string;
        brakeType?: string;
      };
    };
    
    // Weight and Capacity
    capacity: {
      curbWeight?: number;
      grossWeight?: number;
      payloadCapacity?: number;
      towingCapacity?: number;
      maxCargoCapacity?: number;
    };
    
    // Safety Features
    safety: {
      rating?: number;
      nhtsa?: {
        overall?: number;
        frontalCrash?: number;
        sideBarrier?: number;
        rollover?: number;
      };
      iihs?: {
        overall?: string;
        smallOverlap?: string;
        moderateOverlap?: string;
        side?: string;
        roofStrength?: string;
      };
      features?: string[];
      airbags?: number;
      assistFeatures?: string[];
    };
  };
  
  // PRICING DATA - Comprehensive Pricing Information
  pricing: {
    // New Car Pricing
    new: {
      baseMSRP?: number;
      invoicePrice?: number;
      destination?: number;
      totalMSRP?: number;
      fairMarketPrice?: number;
      dealerPrice?: number;
    };
    
    // Used Car Pricing
    used: {
      tradeInValue?: number;
      privatePartyValue?: number;
      dealerRetailValue?: number;
      certifiedPreOwnedPrice?: number;
      averageListingPrice?: number;
    };
    
    // Market Statistics
    market: {
      averagePrice?: number;
      medianPrice?: number;
      priceRange?: {
        min: number;
        max: number;
      };
      daysOnMarket?: number;
      inventoryCount?: number;
      priceDrops?: number;
      demandScore?: number;
    };
    
    // Historical Pricing
    history?: Array<{
      date: string;
      price: number;
      type: string;
      source?: string;
    }>;
    
    // Regional Pricing
    regional?: {
      nationalAverage?: number;
      regionalAverage?: number;
      localAverage?: number;
      priceTrend?: 'increasing' | 'stable' | 'decreasing';
    };
  };
}

/**
 * Aggregate comprehensive vehicle data from all available APIs
 * Focuses on Static Data (physical specs) and Pricing Data
 */
export async function getComprehensiveVehicleData(
  make: string,
  model: string,
  year: number,
  options?: {
    vin?: string;
    trim?: string;
    zip?: string;
    mileage?: number;
    condition?: string;
  }
): Promise<ComprehensiveVehicleData> {
  console.log(`🚀 Aggregating comprehensive data for ${year} ${make} ${model}`);
  
  // Parallel fetch from all APIs
  const [edmundsData, marketCheckData, cisData, carData, carApi2Data, carApi2Trims, carApi2Market] = await Promise.allSettled([
    // Edmunds - Official specs and MSRP
    edmundsService.getVehicleSpecs(make, model, year),
    
    // MarketCheck - Market pricing and statistics
    marketCheckService.getMarketStats(make, model, year),
    
    // CIS Automotive - Dealer pricing and inventory
    cisAutomotiveService.searchVehicles({ make, model, year }),
    
    // Car Data - Comprehensive specifications
    carDataService.getComprehensiveCarData(make, model, year),
    
    // Car API2 - VIN decoding or vehicle data
    options?.vin 
      ? carApi2Service.decodeVIN(options.vin)
      : carApi2Service.getVehicleData(make, model, year, options?.trim),
    
    // Car API2 - Trim data for additional specs
    carApi2Service.getTrims(make, model, year),
    
    // Car API2 - Market value data
    carApi2Service.getMarketValue(make, model, year, options?.mileage, options?.condition, options?.zip)
  ]);
  
  // Initialize result structure
  const result: ComprehensiveVehicleData = {
    basic: {
      make,
      model,
      year,
      trim: options?.trim,
      vin: options?.vin,
      source: []
    },
    static: {
      exterior: {
        bodyType: '',
        doors: 0,
        dimensions: {},
        wheels: {},
        features: []
      },
      interior: {
        seatingCapacity: 0,
        dimensions: {},
        features: [],
        infotainment: [],
        comfortFeatures: []
      },
      performance: {
        engine: {
          type: '',
          cylinders: 0,
          displacement: 0,
          horsepower: 0,
          torque: 0,
          fuelType: ''
        },
        transmission: {
          type: '',
          drivetrain: ''
        },
        acceleration: {},
        fuelEconomy: {
          city: 0,
          highway: 0,
          combined: 0
        },
        handling: {}
      },
      capacity: {},
      safety: {
        features: [],
        assistFeatures: []
      }
    },
    pricing: {
      new: {},
      used: {},
      market: {},
      history: [],
      regional: {}
    }
  };
  
  // Process Edmunds data (Official specs and MSRP)
  if (edmundsData.status === 'fulfilled' && edmundsData.value) {
    const data = edmundsData.value;
    result.source.push('Edmunds');
    
    // Static Data from Edmunds
    result.static.exterior.bodyType = data.bodyType || result.static.exterior.bodyType;
    result.static.exterior.dimensions = {
      ...result.static.exterior.dimensions,
      length: data.dimensions?.length,
      width: data.dimensions?.width,
      height: data.dimensions?.height,
      wheelbase: data.dimensions?.wheelbase
    };
    
    result.static.performance.engine = {
      ...result.static.performance.engine,
      type: data.engine?.type || '',
      cylinders: data.engine?.cylinders || 0,
      displacement: data.engine?.displacement || 0,
      horsepower: data.engine?.horsepower || 0,
      torque: data.engine?.torque || 0,
      fuelType: data.engine?.fuelType || ''
    };
    
    result.static.performance.transmission.type = data.transmission || '';
    result.static.performance.transmission.drivetrain = data.drivetrain || '';
    
    result.static.performance.fuelEconomy = {
      city: data.mpg?.city || 0,
      highway: data.mpg?.highway || 0,
      combined: data.mpg?.combined || 0
    };
    
    result.static.capacity.curbWeight = data.weight;
    
    // Pricing Data from Edmunds
    result.pricing.new.baseMSRP = data.price?.msrp;
    result.pricing.new.invoicePrice = data.price?.invoice;
  }
  
  // Process MarketCheck data (Market pricing and statistics)
  if (marketCheckData.status === 'fulfilled' && marketCheckData.value) {
    const data = marketCheckData.value;
    result.source.push('MarketCheck');
    
    // Pricing Data from MarketCheck
    if (data.stats) {
      result.pricing.market = {
        averagePrice: data.stats.mean_price,
        medianPrice: data.stats.median_price,
        priceRange: {
          min: data.stats.min_price,
          max: data.stats.max_price
        },
        daysOnMarket: data.stats.mean_days_on_market,
        inventoryCount: data.stats.total_count,
        priceDrops: data.stats.price_drops_count
      };
    }
    
    result.pricing.used.averageListingPrice = data.stats?.mean_price;
  }
  
  // Process CIS Automotive data (Dealer data)
  if (cisData.status === 'fulfilled' && cisData.value && cisData.value.length > 0) {
    result.source.push('CIS Automotive');
    
    // Extract dealer pricing if available
    const dealerPrices = cisData.value.map((v: any) => v.price).filter((p: any) => p);
    if (dealerPrices.length > 0) {
      result.pricing.new.dealerPrice = Math.min(...dealerPrices);
    }
  }
  
  // Process Car Data API (Comprehensive specs)
  if (carData.status === 'fulfilled' && carData.value) {
    const data = carData.value;
    result.source.push('Car Data');
    
    // Static Data from Car Data API
    if (data.specifications) {
      result.static.exterior.bodyType = data.specifications.body_type || result.static.exterior.bodyType;
      result.static.exterior.doors = data.specifications.doors || result.static.exterior.doors;
      
      result.static.interior.seatingCapacity = data.specifications.seats || result.static.interior.seatingCapacity;
      
      result.static.performance.engine.cylinders = data.specifications.cylinders || result.static.performance.engine.cylinders;
      result.static.performance.engine.displacement = data.specifications.displacement || result.static.performance.engine.displacement;
      result.static.performance.engine.horsepower = data.specifications.horsepower || result.static.performance.engine.horsepower;
      
      result.static.performance.transmission.type = data.specifications.transmission || result.static.performance.transmission.type;
      result.static.performance.transmission.drivetrain = data.specifications.drivetrain || result.static.performance.transmission.drivetrain;
    }
  }
  
  // Process Car API2 data (VIN decode or vehicle data)
  if (carApi2Data.status === 'fulfilled' && carApi2Data.value) {
    const data = carApi2Data.value;
    result.source.push('Car API2');
    
    // Update basic info
    result.basic.trim = data.trim || result.basic.trim;
    result.basic.vin = data.vin || result.basic.vin;
    
    // Static Data from Car API2
    result.static.exterior.bodyType = data.body_type || result.static.exterior.bodyType;
    result.static.exterior.doors = data.doors || result.static.exterior.doors;
    
    if (data.specifications) {
      // Exterior dimensions
      if (data.specifications.dimensions) {
        result.static.exterior.dimensions = {
          ...result.static.exterior.dimensions,
          ...data.specifications.dimensions
        };
      }
      
      // Interior specifications
      if (data.specifications.interior) {
        result.static.interior = {
          ...result.static.interior,
          seatingCapacity: data.specifications.interior.seating_capacity || result.static.interior.seatingCapacity,
          dimensions: {
            ...result.static.interior.dimensions,
            cargoVolume: data.specifications.interior.cargo_volume,
            passengerVolume: data.specifications.interior.passenger_volume
          },
          features: data.specifications.interior.interior_features || []
        };
      }
      
      // Performance specifications
      if (data.specifications.performance) {
        result.static.performance.engine.horsepower = data.specifications.performance.horsepower || result.static.performance.engine.horsepower;
        result.static.performance.engine.torque = data.specifications.performance.torque || result.static.performance.engine.torque;
        
        result.static.performance.acceleration = {
          zeroTo60: data.specifications.performance.acceleration_0_60,
          topSpeed: data.specifications.performance.top_speed
        };
        
        result.static.performance.fuelEconomy = {
          city: data.specifications.performance.fuel_economy_city || result.static.performance.fuelEconomy.city,
          highway: data.specifications.performance.fuel_economy_highway || result.static.performance.fuelEconomy.highway,
          combined: data.specifications.performance.fuel_economy_combined || result.static.performance.fuelEconomy.combined
        };
      }
      
      // Weight and capacity
      if (data.specifications.weight) {
        result.static.capacity = {
          ...result.static.capacity,
          ...data.specifications.weight
        };
      }
      
      // Safety features
      if (data.specifications.safety) {
        result.static.safety = {
          ...result.static.safety,
          rating: data.specifications.safety.safety_rating,
          features: data.specifications.safety.safety_features || [],
          airbags: data.specifications.safety.airbags
        };
      }
    }
    
    // Pricing Data from Car API2
    if (data.pricing) {
      result.pricing.new.baseMSRP = data.pricing.base_msrp || result.pricing.new.baseMSRP;
      result.pricing.new.invoicePrice = data.pricing.invoice_price || result.pricing.new.invoicePrice;
      result.pricing.new.fairMarketPrice = data.pricing.fair_market_value;
      result.pricing.new.dealerPrice = data.pricing.dealer_price;
      
      result.pricing.used.certifiedPreOwnedPrice = data.pricing.certified_pre_owned_price;
      result.pricing.used.tradeInValue = data.pricing.trade_in_value;
      result.pricing.used.privatePartyValue = data.pricing.private_party_value;
      
      if (data.pricing.pricing_history) {
        result.pricing.history = data.pricing.pricing_history;
      }
    }
  }
  
  // Process Car API2 Trims data
  if (carApi2Trims.status === 'fulfilled' && carApi2Trims.value && carApi2Trims.value.trims) {
    const trims = carApi2Trims.value.trims;
    
    // Find matching trim or use first one for additional data
    const trimData = options?.trim 
      ? trims.find((t: any) => t.name === options.trim) || trims[0]
      : trims[0];
    
    if (trimData) {
      result.static.exterior.features = [...(result.static.exterior.features || []), ...(trimData.features || [])];
      result.pricing.new.baseMSRP = trimData.msrp || result.pricing.new.baseMSRP;
      result.pricing.new.invoicePrice = trimData.invoice || result.pricing.new.invoicePrice;
    }
  }
  
  // Process Car API2 Market Value data
  if (carApi2Market.status === 'fulfilled' && carApi2Market.value) {
    const marketData = carApi2Market.value;
    
    if (marketData.values) {
      result.pricing.used.tradeInValue = marketData.values.trade_in || result.pricing.used.tradeInValue;
      result.pricing.used.privatePartyValue = marketData.values.private_party || result.pricing.used.privatePartyValue;
      result.pricing.used.dealerRetailValue = marketData.values.dealer_retail || result.pricing.used.dealerRetailValue;
    }
    
    if (marketData.regional) {
      result.pricing.regional = {
        nationalAverage: marketData.regional.national,
        regionalAverage: marketData.regional.regional,
        localAverage: marketData.regional.local,
        priceTrend: marketData.regional.trend
      };
    }
  }
  
  // Clean up empty arrays and undefined values
  if (result.static.exterior.features?.length === 0) delete result.static.exterior.features;
  if (result.static.interior.features?.length === 0) delete result.static.interior.features;
  if (result.pricing.history?.length === 0) delete result.pricing.history;
  
  console.log(`✅ Aggregated data from ${result.source.length} sources:`, result.source);
  
  return result;
}

/**
 * Get vehicle suggestions for autocomplete
 * Enhanced with data from all APIs
 */
export async function getEnhancedSuggestions(type: 'make' | 'model' | 'year', params?: { make?: string; model?: string }) {
  console.log(`🔍 Getting enhanced ${type} suggestions`);
  
  const suggestions = new Set<string>();
  const sources: { [key: string]: string[] } = {};
  
  if (type === 'make') {
    // Fetch makes from all APIs in parallel
    const [edmunds, marketCheck, cis, carData, carApi2] = await Promise.allSettled([
      edmundsService.getMakes(),
      marketCheckService.getAvailableMakes(),
      cisAutomotiveService.getAvailableMakes(),
      carDataService.getMakes(),
      carApi2Service.getMakesAndModels()
    ]);
    
    // Process results
    if (edmunds.status === 'fulfilled' && edmunds.value) {
      edmunds.value.forEach((m: any) => {
        const makeName = m.name || m;
        suggestions.add(makeName);
        sources[makeName] = [...(sources[makeName] || []), 'Edmunds'];
      });
    }
    
    if (marketCheck.status === 'fulfilled' && marketCheck.value) {
      marketCheck.value.forEach((m: any) => {
        const makeName = m.name || m;
        suggestions.add(makeName);
        sources[makeName] = [...(sources[makeName] || []), 'MarketCheck'];
      });
    }
    
    if (cis.status === 'fulfilled' && cis.value) {
      cis.value.forEach((m: any) => {
        const makeName = m.name || m;
        suggestions.add(makeName);
        sources[makeName] = [...(sources[makeName] || []), 'CIS'];
      });
    }
    
    if (carData.status === 'fulfilled' && carData.value) {
      carData.value.forEach((m: any) => {
        const makeName = m.name || m;
        suggestions.add(makeName);
        sources[makeName] = [...(sources[makeName] || []), 'CarData'];
      });
    }
    
    if (carApi2.status === 'fulfilled' && carApi2.value?.makes) {
      carApi2.value.makes.forEach((m: any) => {
        suggestions.add(m.name);
        sources[m.name] = [...(sources[m.name] || []), 'CarAPI2'];
      });
    }
  } else if (type === 'model' && params?.make) {
    // Fetch models from all APIs
    const [edmunds, marketCheck, cis, carData] = await Promise.allSettled([
      edmundsService.getModels(params.make.toLowerCase()),
      marketCheckService.getAvailableModels(params.make),
      cisAutomotiveService.getAvailableModels(params.make),
      carDataService.getModels(params.make)
    ]);
    
    // Process results
    if (edmunds.status === 'fulfilled' && edmunds.value) {
      edmunds.value.forEach((m: any) => {
        const modelName = m.name || m;
        suggestions.add(modelName);
        sources[modelName] = [...(sources[modelName] || []), 'Edmunds'];
      });
    }
    
    if (marketCheck.status === 'fulfilled' && marketCheck.value) {
      marketCheck.value.forEach((m: any) => {
        const modelName = m.name || m;
        suggestions.add(modelName);
        sources[modelName] = [...(sources[modelName] || []), 'MarketCheck'];
      });
    }
    
    if (cis.status === 'fulfilled' && cis.value) {
      cis.value.forEach((m: any) => {
        const modelName = m.name || m;
        suggestions.add(modelName);
        sources[modelName] = [...(sources[modelName] || []), 'CIS'];
      });
    }
    
    if (carData.status === 'fulfilled' && carData.value) {
      carData.value.forEach((m: any) => {
        const modelName = m.name || m;
        suggestions.add(modelName);
        sources[modelName] = [...(sources[modelName] || []), 'CarData'];
      });
    }
  } else if (type === 'year') {
    // Generate year range
    const currentYear = new Date().getFullYear();
    for (let year = currentYear + 1; year >= 1990; year--) {
      suggestions.add(year.toString());
    }
  }
  
  // Convert to array with source info
  return Array.from(suggestions).map(value => ({
    value,
    label: value,
    sources: sources[value] || ['Generated']
  })).sort((a, b) => a.label.localeCompare(b.label));
}

export const vehicleDataAggregator = {
  getComprehensiveVehicleData,
  getEnhancedSuggestions
};
