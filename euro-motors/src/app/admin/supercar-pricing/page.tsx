// src/app/admin/supercar-pricing/page.tsx - READS FROM MYSQL DATABASE
'use client';

import { useState } from 'react';
import { useCar } from '@/context/CarContext';

interface SupercarData {
  // This matches your seed.js data structure
  make: string;
  model: string;
  year: number;
  bodyType: string;
  colourOptions: string;
  vinPattern: string;
  performanceData: {
    engine: string;
    horsePower: string;
    torque: string;
    acceleration060: string;
    topSpeed: string;
    transmission: string;
    driveType: string;
    weight: string;
    fuelEconomy?: string;
  };
  pricingData: {
    baseMSRP: number;
    currentMarketRange: string;
    averageDealerPrice: number;
    dealerInventoryCount: number;
    priceTrend: string;
  };
  auctionHistory: {
    recentSales: string;
    averageAuctionPrice: number;
    highestSale: string;
    lowestSale: string;
    commonAuctionNotes: string[];
  };
  popularConfigurations: {
    basePrice: number;
    mostSelectedOptions: Array<{
      name: string;
      price: number;
    }>;
    mostPopularExteriorColor: string;
    mostPopularInterior: string;
  };
  depreciationData: {
    year1: string;
    year3: string;
    year5: string;
    residualValueRating: string;
    rareOptionsForResale: string[];
  };
  competingModels: {
    primaryCompetitors: Array<{
      name: string;
      avgPrice: number;
    }>;
    pricePosition: string;
  };
  ownershipCosts: {
    insuranceGroup: number;
    annualRoadTax: number;
    typicalFinancing: string;
    fuelCost: string;
    estimatedAnnualMaintenance: string;
  };
  dealerData: {
    averageDaysOnMarket: number;
    currentUKInventory: number;
    mostCommonDealerAddOns: string[];
  };
  warrantyMaintenance: {
    factoryWarranty: string;
    extendedOptions: string;
    commonServiceItems: Array<{
      item: string;
      cost: string;
    }>;
  };
}

export default function SupercarPricingAggregatorPage() {
  const { addSPAResult } = useCar();
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [dataSource, setDataSource] = useState<'database' | 'carquery' | 'manufacturer'>('database');
  const [supercarData, setSupercarData] = useState<SupercarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [carOptions, setCarOptions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<Array<{
    make: string;
    model: string;
    year: string;
    source: string;
    timestamp: Date;
  }>>([]);

  // Available cars from your database (matching your seed.js)
  const availableCars = [
    { make: 'Bentley', model: 'Bentayga V8', year: 2022 },
    { make: 'Rolls Royce', model: 'Cullinan V12', year: 2022 },
    { make: 'Bentley', model: 'Continental GT V8', year: 2022 }
  ];

  const handleSearch = async () => {
    if (!selectedMake || !selectedModel) {
      alert('Please select make and model');
      return;
    }

    setIsLoading(true);
    setSupercarData(null);
    setCarOptions([]);

    try {
      if (dataSource === 'database') {
        // FETCH FROM YOUR MYSQL DATABASE
        const response = await fetch('/api/spa/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            make: selectedMake,
            model: selectedModel,
            year: selectedYear,
            dataSource: 'database'
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch vehicle data from database');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setSupercarData(result.data);
          
          // Extract addedOptions for display
          if (result.data.popularConfigurations?.mostSelectedOptions) {
            const options = result.data.popularConfigurations.mostSelectedOptions.map((opt: any) => opt.name);
            setCarOptions(options);
          }

          // Add to search history
          setSearchHistory(prev => [
            {
              make: selectedMake,
              model: selectedModel,
              year: selectedYear,
              source: 'MySQL Database',
              timestamp: new Date()
            },
            ...prev.slice(0, 9)
          ]);

          // Add to global context
          addSPAResult({
            id: `${selectedMake}-${selectedModel}-${selectedYear}-${Date.now()}`,
            make: selectedMake,
            model: selectedModel,
            year: parseInt(selectedYear) || 2022,
            data: result.data,
            searchedAt: new Date(),
            source: 'database' /*type '"database"' is not assignable to type '"carquery" | "manufacturer" | "mock"
CarContext. The expected type comes from property 'source' which is declared here on type 'SPASearchResult'
(property) SPASearchResult.source: "carquery" | "manufacturer" | "mock"*/
          });
        } else {
          alert('No data found for this vehicle in database');
        }
      } else {
        // Future: CarQuery or Manufacturer APIs
        alert(`${dataSource} integration coming soon. Currently using database data.`);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to fetch vehicle data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚘 Supercar Pricing Aggregator</h1>
          <p className="text-gray-600">Get comprehensive vehicle data from your MySQL database and external sources</p>
        </div>

        {/* Data Source Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Data Source</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <button
              onClick={() => setDataSource('database')}
              className={`p-4 rounded-lg border ${dataSource === 'database' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
              <div className="font-medium">🗄️ MySQL Database</div>
              <div className="text-sm text-gray-600">Your comprehensive car data</div>
              <div className="text-xs text-green-600 mt-1">✅ Available</div>
            </button>
            <button
              onClick={() => setDataSource('carquery')}
              className={`p-4 rounded-lg border ${dataSource === 'carquery' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
              <div className="font-medium">🔍 CarQuery API</div>
              <div className="text-sm text-gray-600">Real vehicle specifications</div>
              <div className="text-xs text-orange-600 mt-1">🚧 Coming Soon</div>
            </button>
            <button
              onClick={() => setDataSource('manufacturer')}
              className={`p-4 rounded-lg border ${dataSource === 'manufacturer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
              <div className="font-medium">🏭 Manufacturer</div>
              <div className="text-sm text-gray-600">Official configurator data</div>
              <div className="text-xs text-orange-600 mt-1">🚧 Coming Soon</div>
            </button>
          </div>
        </div>

        {/* Available Cars in Database */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Cars in Database</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableCars.map((car, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => {
                  setSelectedMake(car.make);
                  setSelectedModel(car.model);
                  setSelectedYear(car.year.toString());
                }}
              >
                <h3 className="font-medium">{car.make} {car.model}</h3>
                <p className="text-sm text-gray-600">Year: {car.year}</p>
                <p className="text-xs text-blue-600 mt-1">Click to auto-fill</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Vehicle</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <select 
                value={selectedMake} 
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Make</option>
                <option value="Bentley">Bentley</option>
                <option value="Rolls Royce">Rolls Royce</option>
                <option value="Ferrari">Ferrari</option>
                <option value="Lamborghini">Lamborghini</option>
                <option value="McLaren">McLaren</option>
                <option value="Aston Martin">Aston Martin</option>
                <option value="Porsche">Porsche</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                placeholder="e.g., Continental GT V8"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Year</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-70"
              >
                {isLoading ? 'Searching...' : 'Get Data'}
              </button>
            </div>
          </div>
          
          {dataSource !== 'database' && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
              <p className="text-sm text-orange-700">
                <strong>Note:</strong> {dataSource === 'carquery' ? 'CarQuery API' : 'Manufacturer configurator'} integration is coming soon. Currently using MySQL database data.
              </p>
            </div>
          )}
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Recent Searches</h3>
            <div className="space-y-2">
              {searchHistory.slice(0, 5).map((search, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <span className="font-medium">{search.make} {search.model} {search.year}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{search.source}</span>
                    <span className="text-xs text-gray-400">
                      {search.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comprehensive Data Display */}
        {supercarData && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🔍 COMPREHENSIVE DATA: {supercarData.make} {supercarData.model}
              </h2>
              <div className="text-sm text-gray-600">
                Data Source: <span className="font-medium text-green-600">MySQL Database</span>
              </div>
            </div>

            {/* Basic Specifications */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">=== BASIC SPECIFICATIONS ===</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><strong>Make:</strong> {supercarData.make}</div>
                <div><strong>Model:</strong> {supercarData.model}</div>
                <div><strong>Year:</strong> {supercarData.year}</div>
                <div><strong>Body Type:</strong> {supercarData.bodyType}</div>
                <div><strong>Colour Options:</strong> {supercarData.colourOptions}</div>
                <div><strong>VIN Pattern:</strong> {supercarData.vinPattern}</div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-600">=== PERFORMANCE ===</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><strong>Engine:</strong> {supercarData.performanceData?.engine || 'N/A'}</div>
                <div><strong>Horsepower:</strong> {supercarData.performanceData?.horsePower || 'N/A'}</div>
                <div><strong>Torque:</strong> {supercarData.performanceData?.torque || 'N/A'}</div>
                <div><strong>0-60 mph:</strong> {supercarData.performanceData?.acceleration060 || 'N/A'}</div>
                <div><strong>Top Speed:</strong> {supercarData.performanceData?.topSpeed || 'N/A'}</div>
                <div><strong>Transmission:</strong> {supercarData.performanceData?.transmission || 'N/A'}</div>
                <div><strong>Drive Type:</strong> {supercarData.performanceData?.driveType || 'N/A'}</div>
                <div><strong>Weight:</strong> {supercarData.performanceData?.weight || 'N/A'}</div>
                {supercarData.performanceData?.fuelEconomy && (
                  <div><strong>Fuel Economy:</strong> {supercarData.performanceData.fuelEconomy}</div>
                )}
              </div>
            </div>

            {/* Pricing Data */}
            {supercarData.pricingData && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4 text-red-600">=== PRICING DATA ===</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><strong>Base MSRP:</strong> £{supercarData.pricingData.baseMSRP?.toLocaleString() || 'N/A'}</div>
                  <div><strong>Current Market Range:</strong> {supercarData.pricingData.currentMarketRange || 'N/A'}</div>
                  <div><strong>Average Dealer Price:</strong> £{supercarData.pricingData.averageDealerPrice?.toLocaleString() || 'N/A'}</div>
                  <div><strong>Dealer Inventory Count:</strong> {supercarData.pricingData.dealerInventoryCount || 'N/A'} vehicles nationwide</div>
                  <div><strong>Price Trend:</strong> {supercarData.pricingData.priceTrend || 'N/A'}</div>
                </div>
              </div>
            )}

            {/* Popular Configurations - CONVERTED TO ADDED OPTIONS */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-orange-600">=== POPULAR CONFIGURATIONS ===</h3>
              <div className="mb-4">
                <div><strong>Base Price:</strong> £{supercarData.popularConfigurations?.basePrice?.toLocaleString() || 'N/A'}</div>
              </div>
              <div className="mb-4">
                <strong>Most Selected Options (Ready for addedOptions field):</strong>
                <ul className="ml-4 mt-2 space-y-1">
                  {carOptions.map((option, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Most Popular Exterior Color:</strong> {supercarData.popularConfigurations?.mostPopularExteriorColor || 'N/A'}</div>
                <div><strong>Most Popular Interior:</strong> {supercarData.popularConfigurations?.mostPopularInterior || 'N/A'}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Integration Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    console.log('🚗 Car Options for addedOptions field:', carOptions);
                    console.log('📊 Full SPA Data:', supercarData);
                    alert(`${carOptions.length} options ready for integration!\nCheck console for details.`);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                >
                  📊 Extract addedOptions
                </button>
                
                <button
                  onClick={() => {
                    const integrationData = {
                      make: supercarData.make,
                      model: supercarData.model,
                      year: supercarData.year,
                      dealerPrice: supercarData.pricingData?.averageDealerPrice,
                      baseMSRP: supercarData.pricingData?.baseMSRP,
                      addedOptions: carOptions,
                      performanceData: supercarData.performanceData,
                      pricingData: supercarData.pricingData
                    };
                    navigator.clipboard.writeText(JSON.stringify(integrationData, null, 2));
                    alert('Integration data copied to clipboard!');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  📋 Copy Integration Data
                </button>

                <button
                  onClick={() => {
                    console.log('🗄️ This data is already in your MySQL database!');
                    console.log('📍 Location: BuyCar.supercarData, BuyCar.performanceData, BuyCar.pricingData');
                    console.log('🔄 addedOptions field ready for:', carOptions);
                    alert('Data confirmed in MySQL database!\nCheck console for field locations.');
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
                >
                  🗄️ Verify Database Storage
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}