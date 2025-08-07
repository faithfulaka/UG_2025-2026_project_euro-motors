// src/lib/services/new-apis/comprehensive-aggregator.ts
// Intelligently combines data from all APIs without redundancy
import { carDataService } from './car-data-api';
import { cisAutomotiveService } from './cis-automotive-api';
import { carApi2Service } from './car-api2';
import { marketCheckService } from './marketcheck-api';

export interface ComprehensiveVehicleData {
  // Basic Information (combined from all sources)
  basic: {
    make: string;
    model: string;
    year: number;
    trim?: string;
    vin?: string;
    bodyType?: string;
    vehicleType?: string;
  };
  
  // Static Data (Physical Specifications)
  specifications: {
    // Engine (combined from Car API2 and others)
    engine: {
      description?: string;
      cylinders?: number;
      displacement?: string;
      horsepower?: number;
      torque?: number;
      fuelType?: string;
    };
    
    // Transmission & Drivetrain
    transmission?: string;
    drivetrain?: string;
    
    // Dimensions & Capacity
    doors?: number;
    seats?: number;
    
    // Fuel Economy (from Car API2 mileages)
    fuelEconomy?: {
      city?: number;
      highway?: number;
      combined?: number;
    };
    
    // Colors (from Car API2)
    availableColors?: {
      exterior: string[];
      interior: string[];
    };
  };
  
  // Pricing Data (combined from CIS and MarketCheck)
  pricing: {
    // MSRP from Car API2 trims
    msrp?: number;
    invoice?: number;
    
    // CIS Pricing
    valuation?: number;
    listPrice?: number;
    salePrice?: number;
    
    // Market Data from MarketCheck
    marketStats?: {
      averagePrice: number;
      medianPrice: number;
      minPrice: number;
      maxPrice: number;
      averageMiles: number;
      averageDaysOnMarket: number;
      totalListings: number;
    };
    
    // Price confidence
    priceRange?: string;
    confidence?: 'high' | 'medium' | 'low';
  };
  
  // Market Listings (from MarketCheck)
  listings?: Array<{
    id: string;
    price: number;
    miles: number;
    color?: string;
    dealer?: string;
    location?: string;
    daysOnMarket?: number;
  }>;
  
  // Data Sources (track which APIs provided data)
  sources: string[];
}

/**
 * Aggregate comprehensive vehicle data from all APIs
 * Intelligently combines data without redundancy
 */
export async function getComprehensiveVehicleData(
  make: string,
  model: string,
  year: number,
  options?: {
    trim?: string;
    vin?: string;
    zip?: string;
    mileage?: number;
    condition?: string;
  }
): Promise<ComprehensiveVehicleData> {
  console.log(`🚀 Aggregating data for ${year} ${make} ${model}`);
  
  const sources: string[] = [];
  
  // Parallel fetch from all APIs
  const [
    carDataResults,
    carApi2Trims,
    carApi2Mileage,
    carApi2Colors,
    carApi2Bodies,
    cisPricing,
    marketCheckResults
  ] = await Promise.allSettled([
    // Car Data API
    carDataService.getCars({ make, model, year, limit: 10 }),
    
    // Car API2 - Multiple endpoints
    carApi2Service.getTrims(make, model, year),
    carApi2Service.getMileages(make, model, year),
    Promise.all([
      carApi2Service.getExteriorColors(make, model, year),
      carApi2Service.getInteriorColors(make, model, year)
    ]),
    carApi2Service.getBodies(make, model, year),
    
    // CIS Automotive Pricing
    cisAutomotiveService.getComprehensivePricing(make, model, year, {
      trim: options?.trim,
      mileage: options?.mileage,
      condition: options?.condition,
      zip: options?.zip
    }),
    
    // MarketCheck Search
    marketCheckService.searchVehicles({
      make,
      model,
      year,
      trim: options?.trim,
      zip: options?.zip,
      radius: 100,
      rows: 25
    })
  ]);
  
  // Initialize result
  const result: ComprehensiveVehicleData = {
    basic: {
      make,
      model,
      year,
      trim: options?.trim,
      vin: options?.vin
    },
    specifications: {
      engine: {}
    },
    pricing: {},
    sources: []
  };
  
  // Process Car Data API results
  if (carDataResults.status === 'fulfilled' && carDataResults.value.length > 0) {
    sources.push('CarData');
    const carData = carDataResults.value[0];
    result.basic.bodyType = carData.type;
  }
  
  // Process Car API2 Trims
  if (carApi2Trims.status === 'fulfilled' && carApi2Trims.value.length > 0) {
    sources.push('CarAPI2');
    
    // Find matching trim or use first one
    const trim = options?.trim 
      ? carApi2Trims.value.find(t => t.name.toLowerCase().includes(options.trim!.toLowerCase())) || carApi2Trims.value[0]
      : carApi2Trims.value[0];
    
    if (trim) {
      result.basic.trim = trim.name;
      result.specifications.engine.description = trim.engine;
      result.specifications.transmission = trim.transmission;
      result.specifications.drivetrain = trim.drivetrain;
      result.pricing.msrp = trim.msrp;
      result.pricing.invoice = trim.invoice;
    }
  }
  
  // Process Car API2 Mileage
  if (carApi2Mileage.status === 'fulfilled' && carApi2Mileage.value) {
    result.specifications.fuelEconomy = {
      city: carApi2Mileage.value.city,
      highway: carApi2Mileage.value.highway,
      combined: carApi2Mileage.value.combined
    };
  }
  
  // Process Car API2 Colors
  if (carApi2Colors.status === 'fulfilled' && carApi2Colors.value) {
    const [exterior, interior] = carApi2Colors.value;
    if (exterior.length > 0 || interior.length > 0) {
      result.specifications.availableColors = {
        exterior: exterior || [],
        interior: interior || []
      };
    }
  }
  
  // Process Car API2 Bodies
  if (carApi2Bodies.status === 'fulfilled' && carApi2Bodies.value.length > 0) {
    if (!result.basic.bodyType) {
      result.basic.bodyType = carApi2Bodies.value[0];
    }
  }
  
  // Process CIS Pricing
  if (cisPricing.status === 'fulfilled' && cisPricing.value) {
    sources.push('CIS');
    const pricing = cisPricing.value;
    
    if (pricing.valuation) result.pricing.valuation = pricing.valuation;
    if (pricing.listPrice) result.pricing.listPrice = pricing.listPrice;
    if (pricing.salePrice) result.pricing.salePrice = pricing.salePrice;
  }
  
  // Process MarketCheck Results
  if (marketCheckResults.status === 'fulfilled' && marketCheckResults.value) {
    sources.push('MarketCheck');
    const marketData = marketCheckResults.value;
    
    if (marketData.stats) {
      result.pricing.marketStats = {
        averagePrice: marketData.stats.price.mean,
        medianPrice: marketData.stats.price.median,
        minPrice: marketData.stats.price.min,
        maxPrice: marketData.stats.price.max,
        averageMiles: marketData.stats.miles.mean,
        averageDaysOnMarket: marketData.stats.dom.mean,
        totalListings: marketData.num_found
      };
      
      // Set price range
      result.pricing.priceRange = `$${marketData.stats.price.min.toLocaleString()} - $${marketData.stats.price.max.toLocaleString()}`;
      
      // Set confidence based on number of listings
      if (marketData.num_found > 20) {
        result.pricing.confidence = 'high';
      } else if (marketData.num_found > 5) {
        result.pricing.confidence = 'medium';
      } else {
        result.pricing.confidence = 'low';
      }
    }
    
    // Add top listings
    if (marketData.listings && marketData.listings.length > 0) {
      result.listings = marketData.listings.slice(0, 10).map(listing => ({
        id: listing.id,
        price: listing.price,
        miles: listing.miles,
        color: listing.exterior_color,
        dealer: listing.dealer.name,
        location: `${listing.dealer.city}, ${listing.dealer.state}`,
        daysOnMarket: listing.dom
      }));
    }
  }
  
  // Deduplicate sources
  result.sources = [...new Set(sources)];
  
  // Clean up undefined values
  if (Object.keys(result.specifications.engine).length === 0) {
    delete result.specifications.engine;
  }
  if (!result.specifications.fuelEconomy?.city && !result.specifications.fuelEconomy?.highway) {
    delete result.specifications.fuelEconomy;
  }
  
  console.log(`✅ Aggregated data from ${result.sources.length} sources:`, result.sources);
  
  return result;
}

/**
 * Get suggestions for make/model/year selection
 * Combines data from multiple APIs for comprehensive coverage
 */
export async function getEnhancedSuggestions(
  type: 'make' | 'model' | 'year',
  params?: { make?: string; model?: string }
): Promise<Array<{ value: string; label: string; source: string }>> {
  const suggestions = new Map<string, Set<string>>();
  
  if (type === 'make') {
    // Get makes from all APIs
    const [carDataMakes, carApi2Makes, cisBrands] = await Promise.allSettled([
      carDataService.getMakes(),
      carApi2Service.getMakes(),
      cisAutomotiveService.getBrands()
    ]);
    
    if (carDataMakes.status === 'fulfilled') {
      carDataMakes.value.forEach(make => {
        if (!suggestions.has(make)) suggestions.set(make, new Set());
        suggestions.get(make)!.add('CarData');
      });
    }
    
    if (carApi2Makes.status === 'fulfilled') {
      carApi2Makes.value.forEach(make => {
        if (!suggestions.has(make)) suggestions.set(make, new Set());
        suggestions.get(make)!.add('CarAPI2');
      });
    }
    
    if (cisBrands.status === 'fulfilled') {
      cisBrands.value.forEach(brand => {
        if (!suggestions.has(brand.name)) suggestions.set(brand.name, new Set());
        suggestions.get(brand.name)!.add('CIS');
      });
    }
  } else if (type === 'model' && params?.make) {
    // Get models from Car API2 (most comprehensive for models)
    const models = await carApi2Service.getModels(params.make);
    models.forEach(model => {
      if (!suggestions.has(model)) suggestions.set(model, new Set());
      suggestions.get(model)!.add('CarAPI2');
    });
  } else if (type === 'year') {
    // Get years from multiple sources
    const [carDataYears, carApi2Years] = await Promise.allSettled([
      carDataService.getYears(),
      carApi2Service.getYears()
    ]);
    
    const yearSet = new Set<number>();
    
    if (carDataYears.status === 'fulfilled') {
      carDataYears.value.forEach(year => yearSet.add(year));
    }
    
    if (carApi2Years.status === 'fulfilled') {
      carApi2Years.value.forEach(year => yearSet.add(year));
    }
    
    // Convert to suggestions
    Array.from(yearSet)
      .sort((a, b) => b - a)
      .forEach(year => {
        suggestions.set(year.toString(), new Set(['Multiple']));
      });
  }
  
  // Convert to array format
  return Array.from(suggestions.entries()).map(([value, sources]) => ({
    value,
    label: value,
    source: Array.from(sources).join(', ')
  })).sort((a, b) => a.label.localeCompare(b.label));
}

export const comprehensiveAggregator = {
  getComprehensiveVehicleData,
  getEnhancedSuggestions
};
