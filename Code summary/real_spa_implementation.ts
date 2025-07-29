// 1. REAL CarQuery API Integration - src/lib/carquery.ts
export interface CarQueryResponse {
  Makes?: Array<{make_id: string; make_display: string; make_is_common: string}>;
  Models?: Array<{model_name: string; model_make_id: string}>;
  Trims?: Array<{
    model_id: string;
    model_make_id: string;
    model_name: string;
    model_trim: string;
    model_year: string;
    model_body: string;
    model_engine_position: string;
    model_engine_cc: string;
    model_engine_cyl: string;
    model_engine_type: string;
    model_engine_valves_per_cyl: string;
    model_engine_power_ps: string;
    model_engine_power_rpm: string;
    model_engine_torque_nm: string;
    model_engine_torque_rpm: string;
    model_engine_bore_mm: string;
    model_engine_stroke_mm: string;
    model_engine_compression: string;
    model_engine_fuel: string;
    model_top_speed_kph: string;
    model_0_to_100_kph: string;
    model_drive: string;
    model_transmission_type: string;
    model_seats: string;
    model_doors: string;
    model_weight_kg: string;
    model_length_mm: string;
    model_width_mm: string;
    model_height_mm: string;
    model_wheelbase_mm: string;
    model_lkm_hwy: string;
    model_lkm_mixed: string;
    model_lkm_city: string;
    model_fuel_cap_l: string;
    model_sold_in_us: string;
    model_co2: string;
    model_make_display: string;
  }>;
}

class CarQueryService {
  private baseUrl = 'https://www.carqueryapi.com/api/0.3/';

  async getMakes(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}?cmd=getMakes&format=json`);
      const data: CarQueryResponse = await response.json();
      
      return data.Makes?.map(make => make.make_display) || [];
    } catch (error) {
      console.error('CarQuery getMakes error:', error);
      return [];
    }
  }

  async getModels(make: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}?cmd=getModels&make=${encodeURIComponent(make)}&format=json`);
      const data: CarQueryResponse = await response.json();
      
      return data.Models?.map(model => model.model_name) || [];
    } catch (error) {
      console.error('CarQuery getModels error:', error);
      return [];
    }
  }

  async getTrims(make: string, model: string, year?: number): Promise<CarQueryResponse['Trims']> {
    try {
      let url = `${this.baseUrl}?cmd=getTrims&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&format=json`;
      if (year) {
        url += `&year=${year}`;
      }
      
      const response = await fetch(url);
      const data: CarQueryResponse = await response.json();
      
      return data.Trims || [];
    } catch (error) {
      console.error('CarQuery getTrims error:', error);
      return [];
    }
  }

  async getCarData(make: string, model: string, year: number): Promise<any> {
    const trims = await this.getTrims(make, model, year);
    if (trims.length === 0) return null;

    const trim = trims[0]; // Use first trim as primary data

    return {
      basicSpecifications: {
        make: trim.model_make_display,
        model: trim.model_name,
        year: parseInt(trim.model_year),
        bodyType: trim.model_body,
        engine: trim.model_engine_type,
        engineCC: trim.model_engine_cc,
        cylinders: trim.model_engine_cyl,
        doors: parseInt(trim.model_doors) || 4,
        seats: parseInt(trim.model_seats) || 5,
      },
      performanceData: {
        engine: trim.model_engine_type,
        horsePower: `${trim.model_engine_power_ps} PS @ ${trim.model_engine_power_rpm} RPM`,
        torque: `${trim.model_engine_torque_nm} Nm @ ${trim.model_engine_torque_rpm} RPM`,
        acceleration060: trim.model_0_to_100_kph ? `${(parseFloat(trim.model_0_to_100_kph) * 0.621371).toFixed(1)} seconds` : 'N/A',
        topSpeed: trim.model_top_speed_kph ? `${(parseFloat(trim.model_top_speed_kph) * 0.621371).toFixed(0)} mph` : 'N/A',
        transmission: trim.model_transmission_type,
        driveType: trim.model_drive,
        weight: `${trim.model_weight_kg} kg`,
        fuelEconomy: trim.model_lkm_mixed ? `${(100 / parseFloat(trim.model_lkm_mixed) * 2.352).toFixed(1)} mpg combined` : 'N/A'
      },
      dataSource: 'CarQuery API'
    };
  }
}

export const carQueryService = new CarQueryService();

// 2. REAL Web Scraping - src/lib/scrapers/autotrader.ts
import puppeteer from 'puppeteer';

class AutotraderScraper {
  private baseUrl = 'https://www.autotrader.co.uk';

  async searchCars(make: string, model: string, year?: number): Promise<any> {
    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Build search URL
      let searchUrl = `${this.baseUrl}/car-search?make=${encodeURIComponent(make)}`;
      if (model) searchUrl += `&model=${encodeURIComponent(model)}`;
      if (year) searchUrl += `&year-from=${year}&year-to=${year}`;
      
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Extract car listings
      const listings = await page.evaluate(() => {
        const cars = Array.from(document.querySelectorAll('[data-testid="trader-seller-listing"]'));
        
        return cars.slice(0, 10).map(car => {
          const titleElement = car.querySelector('h3');
          const priceElement = car.querySelector('[data-testid="search-listing-price"]');
          const specsElement = car.querySelector('.listing-key-specs');
          
          return {
            title: titleElement?.textContent?.trim() || '',
            price: priceElement?.textContent?.trim() || '',
            specs: specsElement?.textContent?.trim() || '',
            url: car.querySelector('a')?.href || ''
          };
        });
      });
      
      // Calculate price range
      const prices = listings
        .map(car => car.price.replace(/[^\d]/g, ''))
        .filter(price => price)
        .map(price => parseInt(price))
        .filter(price => !isNaN(price));
      
      const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      
      return {
        listings,
        marketData: {
          averagePrice: avgPrice,
          priceRange: `£${minPrice.toLocaleString()} - £${maxPrice.toLocaleString()}`,
          inventoryCount: listings.length,
          dataSource: 'Autotrader UK'
        }
      };
      
    } catch (error) {
      console.error('Autotrader scraping error:', error);
      return { listings: [], marketData: null };
    } finally {
      if (browser) await browser.close();
    }
  }
}

export const autotraderScraper = new AutotraderScraper();

// 3. REAL Manufacturer Configurator Scraper - src/lib/scrapers/porsche.ts
import puppeteer from 'puppeteer';

class PorscheConfiguratorScraper {
  private baseUrl = 'https://configurator.porsche.com/gbr/en_GB';

  async getCarPricing(model: string): Promise<any> {
    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      
      // Search for model
      const modelFound = await page.evaluate((searchModel) => {
        const modelCards = Array.from(document.querySelectorAll('[data-testid="model-card"]'));
        const targetCard = modelCards.find(card => 
          card.textContent?.toLowerCase().includes(searchModel.toLowerCase())
        );
        
        if (targetCard) {
          (targetCard as HTMLElement).click();
          return true;
        }
        return false;
      }, model);
      
      if (!modelFound) {
        return { error: 'Model not found in Porsche configurator' };
      }
      
      // Wait for configurator to load
      await page.waitForSelector('[data-testid="price-summary"]', { timeout: 10000 });
      
      // Extract pricing data
      const pricingData = await page.evaluate(() => {
        const basePrice = document.querySelector('[data-testid="base-price"]')?.textContent || '';
        const totalPrice = document.querySelector('[data-testid="total-price"]')?.textContent || '';
        
        // Extract options
        const options = Array.from(document.querySelectorAll('[data-testid="option-item"]')).map(option => {
          const name = option.querySelector('[data-testid="option-name"]')?.textContent || '';
          const price = option.querySelector('[data-testid="option-price"]')?.textContent || '';
          return { name: name.trim(), price: price.trim() };
        });
        
        return {
          basePrice: basePrice.trim(),
          totalPrice: totalPrice.trim(),
          options,
          dataSource: 'Porsche Configurator'
        };
      });
      
      return pricingData;
      
    } catch (error) {
      console.error('Porsche configurator error:', error);
      return { error: 'Failed to scrape Porsche configurator' };
    } finally {
      if (browser) await browser.close();
    }
  }
}

export const porscheConfiguratorScraper = new PorscheConfiguratorScraper();

// 4. UPDATED SPA API Route - src/app/api/spa/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/carquery';
import { autotraderScraper } from '@/lib/scrapers/autotrader';
import { porscheConfiguratorScraper } from '@/lib/scrapers/porsche';

export async function POST(request: NextRequest) {
  try {
    const { make, model, year, dataSource } = await request.json();

    if (!make || !model) {
      return NextResponse.json(
        { error: 'Make and model are required' },
        { status: 400 }
      );
    }

    console.log(`🔍 SPA Search: ${make} ${model} ${year || 'any'} (Source: ${dataSource})`);

    let responseData = null;

    // Choose data source
    switch (dataSource) {
      case 'database':
        responseData = await searchDatabase(make, model, year);
        break;
        
      case 'carquery':
        responseData = await searchCarQuery(make, model, year);
        break;
        
      case 'manufacturer':
        responseData = await searchManufacturer(make, model, year);
        break;
        
      case 'market':
        responseData = await searchMarketData(make, model, year);
        break;
        
      default:
        // Comprehensive search - combine all sources
        responseData = await comprehensiveSearch(make, model, year);
    }

    if (!responseData) {
      return NextResponse.json(
        { 
          error: `No data found for ${make} ${model}`,
          suggestion: 'Try different spelling or check if the car exists'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      meta: {
        searchQuery: { make, model, year },
        dataSource,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ SPA search error:', error);
    return NextResponse.json(
      { error: 'Failed to search vehicle data' },
      { status: 500 }
    );
  }
}

// Database search (existing)
async function searchDatabase(make: string, model: string, year?: number) {
  const buyCars = await prisma.buyCar.findMany({
    where: {
      make: { contains: make },
      model: { contains: model },
      ...(year && { year: parseInt(year.toString()) })
    },
    select: {
      id: true, make: true, model: true, year: true, price: true,
      baseMSRP: true, supercarData: true, performanceData: true, pricingData: true
    }
  });

  if (buyCars.length === 0) return null;

  const car = buyCars[0];
  let supercarData = null;
  
  try {
    if (car.supercarData) {
      supercarData = typeof car.supercarData === 'string' 
        ? JSON.parse(car.supercarData) 
        : car.supercarData;
    }
  } catch (parseError) {
    console.error('JSON parsing error:', parseError);
  }

  return supercarData || {
    make: car.make,
    model: car.model,
    year: car.year,
    dataSource: 'MySQL Database'
  };
}

// CarQuery API search
async function searchCarQuery(make: string, model: string, year?: number) {
  const carData = await carQueryService.getCarData(make, model, year || 2022);
  return carData;
}

// Manufacturer configurator search
async function searchManufacturer(make: string, model: string, year?: number) {
  // Route to appropriate manufacturer scraper
  switch (make.toLowerCase()) {
    case 'porsche':
      return await porscheConfiguratorScraper.getCarPricing(model);
    default:
      return {
        error: `Manufacturer configurator not available for ${make}`,
        availableManufacturers: ['Porsche']
      };
  }
}

// Market data search
async function searchMarketData(make: string, model: string, year?: number) {
  const marketData = await autotraderScraper.searchCars(make, model, year);
  return marketData;
}

// Comprehensive search combining all sources
async function comprehensiveSearch(make: string, model: string, year?: number) {
  try {
    const [databaseData, carQueryData, marketData] = await Promise.allSettled([
      searchDatabase(make, model, year),
      searchCarQuery(make, model, year),
      searchMarketData(make, model, year)
    ]);

    // Combine results from all sources
    const combinedData = {
      make,
      model,
      year: year || 2022,
      
      // Use CarQuery for technical specs
      basicSpecifications: carQueryData.status === 'fulfilled' && carQueryData.value 
        ? carQueryData.value.basicSpecifications 
        : null,
        
      performanceData: carQueryData.status === 'fulfilled' && carQueryData.value 
        ? carQueryData.value.performanceData 
        : null,
        
      // Use market data for pricing
      pricingData: marketData.status === 'fulfilled' && marketData.value?.marketData
        ? {
            averageDealerPrice: marketData.value.marketData.averagePrice,
            currentMarketRange: marketData.value.marketData.priceRange,
            dealerInventoryCount: marketData.value.marketData.inventoryCount,
            priceTrend: 'Based on current market data'
          }
        : null,
        
      // Use database for additional enrichment
      databaseEnrichment: databaseData.status === 'fulfilled' && databaseData.value
        ? databaseData.value
        : null,
        
      dataSources: {
        database: databaseData.status === 'fulfilled' && !!databaseData.value,
        carQuery: carQueryData.status === 'fulfilled' && !!carQueryData.value,
        marketData: marketData.status === 'fulfilled' && !!marketData.value
      },
      
      dataSource: 'Comprehensive Multi-Source Aggregation'
    };

    return combinedData;
    
  } catch (error) {
    console.error('Comprehensive search error:', error);
    return null;
  }
}

// 5. ENHANCED SPA Frontend - src/app/admin/supercar-pricing/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCar } from '@/context/CarContext';

export default function SupercarPricingPage() {
  const { addSPAResult } = useCar();
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [dataSource, setDataSource] = useState<'database' | 'carquery' | 'manufacturer' | 'market' | 'comprehensive'>('comprehensive');
  const [supercarData, setSupercarData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auto-complete data
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [makeDropdownOpen, setMakeDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  // Load available makes on component mount
  useEffect(() => {
    async function loadMakes() {
      try {
        const response = await fetch('/api/spa/makes');
        if (response.ok) {
          const data = await response.json();
          setAvailableMakes(data.makes || []);
        }
      } catch (error) {
        console.error('Failed to load makes:', error);
      }
    }
    
    loadMakes();
  }, []);

  // Load models when make changes
  useEffect(() => {
    async function loadModels() {
      if (!selectedMake) {
        setAvailableModels([]);
        return;
      }
      
      try {
        const response = await fetch(`/api/spa/models?make=${encodeURIComponent(selectedMake)}`);
        if (response.ok) {
          const data = await response.json();
          setAvailableModels(data.models || []);
        }
      } catch (error) {
        console.error('Failed to load models:', error);
      }
    }
    
    loadModels();
  }, [selectedMake]);

  const handleSearch = async () => {
    if (!selectedMake || !selectedModel) {
      setError('Please select make and model');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSupercarData(null);

    try {
      const response = await fetch('/api/spa/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: selectedMake,
          model: selectedModel,
          year: selectedYear,
          dataSource: dataSource
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      if (data.success && data.data) {
        setSupercarData(data.data);
        
        // Add to context for global access
        addSPAResult({
          id: `${selectedMake}-${selectedModel}-${selectedYear}-${Date.now()}`,
          make: selectedMake,
          model: selectedModel,
          year: parseInt(selectedYear) || 2022,
          data: data.data,
          searchedAt: new Date(),
          source: dataSource
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚘 Supercar Pricing Aggregator</h1>
          <p className="text-gray-600">Get comprehensive vehicle data from multiple real sources</p>
        </div>

        {/* Data Source Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Data Source</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <button
              onClick={() => setDataSource('comprehensive')}
              className={`p-4 rounded-lg border ${dataSource === 'comprehensive' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
              <div className="font-medium">🔍 Comprehensive</div>
              <div className="text-sm text-gray-600">All sources combined</div>
              <div className="text-xs text-green-600 mt-1">✅ Recommended</div>
            </button>
            
            <button
              onClick={() => setDataSource('carquery')}
              className={`p-4 rounded-lg border ${dataSource === 'carquery' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
              <div className="font-medium">🔍 CarQuery API</div>
              <div className="text-sm text-gray-600">Technical specifications</div>
              <div className="text-xs text-green-600 mt-1">✅ Live API</div>
            </button>
            
            <button
              onClick={() => setDataSource('manufacturer')}
              className={`p-4 rounded-lg border ${dataSource === 'manufacturer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
              <div className="font-medium">🏭 Manufacturer</div>
              <div className="text-sm text-gray-600">Official pricing</div>
              <div className="text-xs text-green-600 mt-1">✅ Real Scrapers</div>
            </button>
            
            <button
              onClick={() => setDataSource('market')}
              className={`p-4 rounded-lg border ${dataSource === 'market' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
              <div className="font-medium">📊 Market Data</div>
              <div className="text-sm text-gray-600">Current listings</div>
              <div className="text-xs text-green-600 mt-1">✅ Live Scraping</div>
            </button>
            
            <button
              onClick={() => setDataSource('database')}
              className={`p-4 rounded-lg border ${dataSource === 'database' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
              <div className="font-medium">💾 Database</div>
              <div className="text-sm text-gray-600">Local data only</div>
              <div className="text-xs text-gray-600 mt-1">📦 Fallback</div>
            </button>
          </div>
        </div>

        {/* Enhanced Search Form with Auto-complete */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Vehicle</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Make Dropdown with Auto-complete */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <input
                type="text"
                value={selectedMake}
                onChange={(e) => {
                  setSelectedMake(e.target.value);
                  setMakeDropdownOpen(true);
                }}
                onFocus={() => setMakeDropdownOpen(true)}
                placeholder="Type to search makes..."
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {makeDropdownOpen && availableMakes.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                  {availableMakes
                    .filter(make => make.toLowerCase().includes(selectedMake.toLowerCase()))
                    .slice(0, 10)
                    .map((make, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedMake(make);
                          setMakeDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      >
                        {make}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Model Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setModelDropdownOpen(true);
                }}
                onFocus={() => setModelDropdownOpen(true)}
                placeholder="Type to search models..."
                disabled={!selectedMake}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              {modelDropdownOpen && availableModels.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                  {availableModels
                    .filter(model => model.toLowerCase().includes(selectedModel.toLowerCase()))
                    .slice(0, 10)
                    .map((model, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedModel(model);
                          setModelDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      >
                        {model}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Year Dropdown - only enabled when make and model selected */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={!selectedMake || !selectedModel}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Year</option>
                {Array.from({ length: 6 }, (_, i) => 2024 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isLoading || !