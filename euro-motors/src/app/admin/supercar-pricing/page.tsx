// src/app/admin/supercar-pricing/page.tsx 
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCar } from '@/context/CarContext';
import { SPASearchResponse, SPASuggestion } from '@/types/spa';

type DataSource = 'database' | 'carquery' | 'manufacturer' | 'market' | 'comprehensive';

export default function EnhancedSupercarPricingPage() {
  const { addSPAResult } = useCar();
  
  // Form state
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [dataSources, setDataSources] = useState<DataSource[]>(['comprehensive']);
  
  // Results and UI state
  const [searchResults, setSearchResults] = useState<SPASearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auto-complete state
  const [makeSuggestions, setMakeSuggestions] = useState<SPASuggestion[]>([]);
  const [modelSuggestions, setModelSuggestions] = useState<SPASuggestion[]>([]);
  const [yearSuggestions, setYearSuggestions] = useState<SPASuggestion[]>([]);
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  
  // Search history
  const [searchHistory, setSearchHistory] = useState<Array<{
    make: string;
    model: string;
    year: string;
    sources: DataSource[];
    timestamp: Date;
    confidence: string;
  }>>([]);
  
  // Real-time search capabilities
  const [supportedManufacturers, setSupportedManufacturers] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    loadSupportedManufacturers();
  }, []);

  // Debounced search function
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  // Load supported manufacturers
  const loadSupportedManufacturers = async () => {
    try {
      const response = await fetch('/api/spa/manufacturer');
      const data = await response.json();
      if (data.success) {
        setSupportedManufacturers(data.supportedManufacturers);
      }
    } catch (error) {
      console.error('Failed to load supported manufacturers:', error);
    }
  };

  // 🔍 REAL-TIME MAKE SUGGESTIONS
  const searchMakes = useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm.length < 1) {
        setMakeSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/spa/suggestions?type=makes&search=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        
        if (data.success) {
          setMakeSuggestions(data.data.slice(0, 10));
          setShowMakeDropdown(true);
        }
      } catch (error) {
        console.error('Make search error:', error);
      }
    }, 300),
    []
  );

  // 🏷️ REAL-TIME MODEL SUGGESTIONS
  const searchModels = useCallback(
    debounce(async (make: string, searchTerm: string) => {
      if (!make || searchTerm.length < 1) {
        setModelSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/spa/suggestions?type=models&make=${encodeURIComponent(make)}&search=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        
        if (data.success) {
          setModelSuggestions(data.data.slice(0, 10));
          setShowModelDropdown(true);
        }
      } catch (error) {
        console.error('Model search error:', error);
      }
    }, 300),
    []
  );

  // 📅 LOAD YEARS FOR SELECTED MAKE/MODEL
  const loadYears = useCallback(async (make: string, model: string) => {
    if (!make || !model) {
      setYearSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/spa/suggestions?type=years&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
      const data = await response.json();
      
      if (data.success) {
        setYearSuggestions(data.data);
      }
    } catch (error) {
      console.error('Year loading error:', error);
    }
  }, []);

  // Handle make input change
  const handleMakeChange = (value: string) => {
    setSelectedMake(value);
    setSelectedModel(''); // Reset model when make changes
    setSelectedYear(''); // Reset year when make changes
    setModelSuggestions([]);
    setYearSuggestions([]);
    
    if (value.trim()) {
      searchMakes(value);
    } else {
      setMakeSuggestions([]);
      setShowMakeDropdown(false);
    }
  };

  // Handle model input change
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    setSelectedYear(''); // Reset year when model changes
    setYearSuggestions([]);
    
    if (selectedMake && value.trim()) {
      searchModels(selectedMake, value);
    } else {
      setModelSuggestions([]);
      setShowModelDropdown(false);
    }
  };

  // Handle make selection
  const selectMake = (make: string) => {
    setSelectedMake(make);
    setSelectedModel('');
    setSelectedYear('');
    setShowMakeDropdown(false);
    setModelSuggestions([]);
    setYearSuggestions([]);
  };

  // Handle model selection
  const selectModel = (model: string) => {
    setSelectedModel(model);
    setSelectedYear('');
    setShowModelDropdown(false);
    
    // Load years for this make/model combination
    if (selectedMake) {
      loadYears(selectedMake, model);
    }
  };

  // Handle year selection
  const selectYear = (year: string) => {
    setSelectedYear(year);
    setShowYearDropdown(false);
  };

  // 🚀 COMPREHENSIVE SEARCH
  const handleSearch = async () => {
    if (!selectedMake || !selectedModel) {
      setError('Please select make and model');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const searchRequest = {
        make: selectedMake,
        model: selectedModel,
        year: selectedYear ? parseInt(selectedYear) : undefined,
        sources: dataSources,
        maxResults: 50
      };

      console.log('🔍 Starting comprehensive search:', searchRequest);

      const response = await fetch('/api/spa/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchRequest)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Search failed');
      }

      setSearchResults(data.data);

      // Add to search history
      setSearchHistory(prev => [
        {
          make: selectedMake,
          model: selectedModel,
          year: selectedYear,
          sources: dataSources,
          timestamp: new Date(),
          confidence: data.data.confidence.overall
        },
        ...prev.slice(0, 9) // Keep last 10 searches
      ]);

      // Add to global context
      addSPAResult({
        id: `${selectedMake}-${selectedModel}-${selectedYear}-${Date.now()}`,
        make: selectedMake,
        model: selectedModel,
        year: parseInt(selectedYear) || new Date().getFullYear(),
        data: data.data,
        searchedAt: new Date(),
        source: dataSources.includes('comprehensive') ? 'carquery' : dataSources[0] as any
      });

      console.log('✅ Search completed successfully');

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
          <p className="text-gray-600">Real-time comprehensive vehicle data from multiple live sources</p>
        </div>

        {/* Data Source Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Data Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <label className={`p-4 rounded-lg border cursor-pointer ${dataSources.includes('comprehensive') ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
              <input
                type="checkbox"
                checked={dataSources.includes('comprehensive')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setDataSources(['comprehensive']);
                  } else {
                    setDataSources(prev => prev.filter(s => s !== 'comprehensive'));
                  }
                }}
                className="mr-2"
              />
              <div className="font-medium">🔍 Comprehensive</div>
              <div className="text-sm text-gray-600">All sources combined</div>
              <div className="text-xs text-green-600 mt-1">✅ Recommended</div>
            </label>
            
            <label className={`p-4 rounded-lg border cursor-pointer ${dataSources.includes('carquery') ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
              <input
                type="checkbox"
                checked={dataSources.includes('carquery')}
                onChange={(e) => {
                  setDataSources(prev => 
                    e.target.checked 
                      ? [...prev.filter(s => s !== 'comprehensive'), 'carquery']
                      : prev.filter(s => s !== 'carquery')
                  );
                }}
                className="mr-2"
              />
              <div className="font-medium">🔍 CarQuery API</div>
              <div className="text-sm text-gray-600">Technical specifications</div>
              <div className="text-xs text-green-600 mt-1">✅ Live API</div>
            </label>
            
            <label className={`p-4 rounded-lg border cursor-pointer ${dataSources.includes('manufacturer') ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
              <input
                type="checkbox"
                checked={dataSources.includes('manufacturer')}
                onChange={(e) => {
                  setDataSources(prev => 
                    e.target.checked 
                      ? [...prev.filter(s => s !== 'comprehensive'), 'manufacturer']
                      : prev.filter(s => s !== 'manufacturer')
                  );
                }}
                className="mr-2"
              />
              <div className="font-medium">🏭 Manufacturer</div>
              <div className="text-sm text-gray-600">Official configurators</div>
              <div className="text-xs text-green-600 mt-1">✅ Real Scrapers</div>
            </label>
            
            <label className={`p-4 rounded-lg border cursor-pointer ${dataSources.includes('market') ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
              <input
                type="checkbox"
                checked={dataSources.includes('market')}
                onChange={(e) => {
                  setDataSources(prev => 
                    e.target.checked 
                      ? [...prev.filter(s => s !== 'comprehensive'), 'market']
                      : prev.filter(s => s !== 'market')
                  );
                }}
                className="mr-2"
              />
              <div className="font-medium">📊 Market Data</div>
              <div className="text-sm text-gray-600">Live market listings</div>
              <div className="text-xs text-green-600 mt-1">✅ Live Scraping</div>
            </label>
            
            <label className={`p-4 rounded-lg border cursor-pointer ${dataSources.includes('database') ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
              <input
                type="checkbox"
                checked={dataSources.includes('database')}
                onChange={(e) => {
                  setDataSources(prev => 
                    e.target.checked 
                      ? [...prev.filter(s => s !== 'comprehensive'), 'database']
                      : prev.filter(s => s !== 'database')
                  );
                }}
                className="mr-2"
              />
              <div className="font-medium">💾 Database</div>
              <div className="text-sm text-gray-600">Your comprehensive data</div>
              <div className="text-xs text-gray-600 mt-1">📦 Fallback</div>
            </label>
          </div>
          
          {dataSources.length === 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
              <p className="text-sm text-orange-700">Please select at least one data source.</p>
            </div>
          )}
        </div>

        {/* Enhanced Search Form with Real Auto-Complete */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Vehicle</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            
            {/* Make Field with Auto-Complete */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <input
                type="text"
                value={selectedMake}
                onChange={(e) => handleMakeChange(e.target.value)}
                onFocus={() => setShowMakeDropdown(makeSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowMakeDropdown(false), 200)}
                placeholder="Start typing make..."
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {showMakeDropdown && makeSuggestions.length > 0 && (
                <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {makeSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => selectMake(suggestion.value)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span className="font-medium">{suggestion.value}</span>
                      {suggestion.popular && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Popular</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Model Field with Auto-Complete */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                onFocus={() => setShowModelDropdown(modelSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowModelDropdown(false), 200)}
                placeholder={selectedMake ? "Start typing model..." : "Select make first"}
                disabled={!selectedMake}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              
              {showModelDropdown && modelSuggestions.length > 0 && (
                <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {modelSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => selectModel(suggestion.value)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                    >
                      <span className="font-medium">{suggestion.value}</span>
                      {suggestion.count && <span className="text-xs text-gray-500 ml-2">({suggestion.count} available)</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Year Dropdown - Conditional */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select 
                value={selectedYear} 
                onChange={(e) => selectYear(e.target.value)}
                disabled={!selectedMake || !selectedModel || yearSuggestions.length === 0}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">
                  {!selectedMake || !selectedModel ? "Select make & model first" : 
                   yearSuggestions.length === 0 ? "Loading years..." : "Select year"}
                </option>
                {yearSuggestions.map((suggestion, index) => (
                  <option key={index} value={suggestion.value}>
                    {suggestion.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isLoading || !selectedMake || !selectedModel || dataSources.length === 0}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Searching...' : 'Get Real Data'}
              </button>
            </div>
          </div>
          
          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Supported Manufacturers Info */}
        {supportedManufacturers.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">🏭 Supported Manufacturers ({supportedManufacturers.length})</h3>
            <div className="flex flex-wrap gap-2">
              {supportedManufacturers.map(manufacturer => (
                <span 
                  key={manufacturer}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {manufacturer}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">🕒 Recent Searches</h3>
            <div className="space-y-2">
              {searchHistory.slice(0, 5).map((search, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">{search.make} {search.model} {search.year}</span>
                    <span className="text-sm text-gray-500">
                      Sources: {search.sources.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      search.confidence === 'high' ? 'bg-green-100 text-green-800' :
                      search.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {search.confidence} confidence
                    </span>
                    <span className="text-xs text-gray-400">
                      {search.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comprehensive Results Display */}
        {searchResults && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🔍 COMPREHENSIVE DATA: {searchResults.vehicle.make} {searchResults.vehicle.model} {searchResults.vehicle.year}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Processing Time: <strong>{searchResults.processingTimeMs}ms</strong></span>
                <span>Confidence: <strong className={`${
                  searchResults.confidence.overall === 'high' ? 'text-green-600' :
                  searchResults.confidence.overall === 'medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{searchResults.confidence.overall.toUpperCase()}</strong></span>
                <span>Sources: <strong>{Object.values(searchResults.dataSources).filter(Boolean).length}</strong></span>
              </div>
            </div>

            {/* Data Sources Used */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">📊 DATA SOURCES USED</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(searchResults.dataSources).map(([source, active]) => (
                  <div key={source} className={`p-3 rounded-lg border ${active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center">
                      {active ? (
                        <span className="text-green-500 mr-2">✅</span>
                      ) : (
                        <span className="text-gray-400 mr-2">❌</span>
                      )}
                      <span className={`text-sm font-medium ${active ? 'text-green-700' : 'text-gray-500'}`}>
                        {source.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specifications */}
            {searchResults.specifications && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4 text-green-600">⚙️ TECHNICAL SPECIFICATIONS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Engine */}
                  {searchResults.specifications.engine && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Engine</h4>
                      <div className="space-y-1 text-sm">
                        <div><strong>Type:</strong> {searchResults.specifications.engine.type}</div>
                        {searchResults.specifications.engine.displacement && (
                          <div><strong>Displacement:</strong> {searchResults.specifications.engine.displacement}</div>
                        )}
                        {searchResults.specifications.engine.cylinders && (
                          <div><strong>Cylinders:</strong> {searchResults.specifications.engine.cylinders}</div>
                        )}
                        <div><strong>Fuel:</strong> {searchResults.specifications.engine.fuelType}</div>
                      </div>
                    </div>
                  )}

                  {/* Performance */}
                  {searchResults.specifications.performance && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Performance</h4>
                      <div className="space-y-1 text-sm">
                        <div><strong>Power:</strong> {searchResults.specifications.performance.horsepower} HP</div>
                        <div><strong>Torque:</strong> {searchResults.specifications.performance.torque} Nm</div>
                        {searchResults.specifications.performance.acceleration0to100 && (
                          <div><strong>0-100 km/h:</strong> {searchResults.specifications.performance.acceleration0to100}s</div>
                        )}
                        {searchResults.specifications.performance.topSpeed && (
                          <div><strong>Top Speed:</strong> {searchResults.specifications.performance.topSpeed} {searchResults.specifications.performance.topSpeedUnit}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Drivetrain */}
                  {searchResults.specifications.drivetrain && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Drivetrain</h4>
                      <div className="space-y-1 text-sm">
                        <div><strong>Transmission:</strong> {searchResults.specifications.drivetrain.transmission}</div>
                        <div><strong>Drive Type:</strong> {searchResults.specifications.drivetrain.driveType}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing Information */}
            {searchResults.pricing && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4 text-red-600">💰 PRICING DATA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* New Car Pricing */}
                  {searchResults.pricing.newCar && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">New Car Pricing</h4>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-green-600">
                          £{searchResults.pricing.newCar.msrp.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">MSRP (Manufacturer Suggested Retail Price)</div>
                        {searchResults.pricing.newCar.financing && (
                          <div className="mt-4 p-3 bg-blue-50 rounded">
                            <div className="text-sm">
                              <div><strong>Estimated Financing:</strong> {searchResults.pricing.newCar.financing.apr}% APR</div>
                              <div><strong>Monthly Payment:</strong> £{searchResults.pricing.newCar.financing.monthlyPaymentEstimate?.toLocaleString()}/month</div>
                              <div className="text-xs text-gray-500 mt-1">*Estimate based on 20% down, 48 months</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Used Market Data */}
                  {searchResults.pricing.usedMarket && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Used Market Data</h4>
                      <div className="space-y-2">
                        <div className="text-xl font-bold text-blue-600">
                          £{searchResults.pricing.usedMarket.averagePrice.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Average Market Price</div>
                        <div className="text-sm">
                          <strong>Price Range:</strong> £{searchResults.pricing.usedMarket.priceRange.min.toLocaleString()} - £{searchResults.pricing.usedMarket.priceRange.max.toLocaleString()}
                        </div>
                        <div className="text-sm">
                          <strong>Market Trend:</strong> 
                          <span className={`ml-1 ${
                            searchResults.pricing.usedMarket.marketTrend.direction === 'rising' ? 'text-green-600' :
                            searchResults.pricing.usedMarket.marketTrend.direction === 'falling' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {searchResults.pricing.usedMarket.marketTrend.direction.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Manufacturer Configurator Data */}
            {searchResults.configurator && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4 text-orange-600">🏭 MANUFACTURER CONFIGURATOR</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Base Configuration</h4>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">£{searchResults.configurator.basePrice.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Official Base Price</div>
                      <a 
                        href={searchResults.configurator.configuratorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        🔗 Open Official Configurator
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Available Options ({searchResults.configurator.availableOptions.length})</h4>
                    <div className="max-h-32 overflow-y-auto">
                      {searchResults.configurator.availableOptions.slice(0, 8).map((option, index) => (
                        <div key={index} className="flex justify-between text-sm py-1">
                          <span>{option.name}</span>
                          <span className="font-medium">£{option.price.toLocaleString()}</span>
                        </div>
                      ))}
                      {searchResults.configurator.availableOptions.length > 8 && (
                        <div className="text-xs text-gray-500 mt-2">
                          + {searchResults.configurator.availableOptions.length - 8} more options
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Market Listings */}
            {searchResults.marketData && searchResults.marketData.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4 text-purple-600">📊 MARKET LISTINGS</h3>
                {searchResults.marketData.map((source, sourceIndex) => (
                  <div key={sourceIndex} className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-3 capitalize">
                      {source.source} ({source.listings.length} listings)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {source.listings.slice(0, 6).map((listing, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="font-medium text-sm mb-2 truncate" title={listing.title}>
                            {listing.title}
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            £{listing.price.toLocaleString()}
                          </div>
                          {listing.mileage && (
                            <div className="text-xs text-gray-500">
                              {listing.mileage.toLocaleString()} miles
                            </div>
                          )}
                          {listing.location && (
                            <div className="text-xs text-gray-500 truncate">
                              📍 {listing.location}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {source.listings.length > 6 && (
                      <div className="text-sm text-gray-500 mt-2">
                        + {source.listings.length - 6} more listings from {source.source}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Ownership Costs */}
            {searchResults.ownershipCosts && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4 text-indigo-600">💸 OWNERSHIP COSTS</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Insurance */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Insurance</h4>
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      £{searchResults.ownershipCosts.insurance.averageAnnual.toLocaleString()}/year
                    </div>
                    <div className="text-sm text-gray-600">
                      Group {searchResults.ownershipCosts.insurance.group}
                    </div>
                  </div>

                  {/* Maintenance */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Maintenance</h4>
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      £{searchResults.ownershipCosts.maintenance.averageAnnual.toLocaleString()}/year
                    </div>
                    <div className="text-sm text-gray-600">
                      Average annual cost
                    </div>
                  </div>

                  {/* Depreciation */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Depreciation</h4>
                    <div className="space-y-1 text-sm">
                      <div>Year 1: <strong>-{searchResults.ownershipCosts.depreciation.year1Percent}%</strong></div>
                      <div>Year 3: <strong>-{searchResults.ownershipCosts.depreciation.year3Percent}%</strong></div>
                      <div>Year 5: <strong>-{searchResults.ownershipCosts.depreciation.year5Percent}%</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">🛠️ Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    const dataToExport = {
                      vehicle: searchResults.vehicle,
                      specifications: searchResults.specifications,
                      pricing: searchResults.pricing,
                      confidence: searchResults.confidence,
                      timestamp: searchResults.timestamp
                    };
                    navigator.clipboard.writeText(JSON.stringify(dataToExport, null, 2));
                    alert('Data copied to clipboard!');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  📋 Copy Data to Clipboard
                </button>
                
                <button
                  onClick={() => {
                    console.log('🚗 Complete SPA Data:', searchResults);
                    alert('Complete data logged to console!');
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                >
                  🔍 View Complete Data
                </button>

                <button
                  onClick={() => {
                    const manufacturerUrl = searchResults.configurator?.configuratorUrl;
                    if (manufacturerUrl) {
                      window.open(manufacturerUrl, '_blank');
                    } else {
                      alert('No manufacturer configurator available for this vehicle');
                    }
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
                  disabled={!searchResults.configurator}
                >
                  🏭 Open Configurator
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}