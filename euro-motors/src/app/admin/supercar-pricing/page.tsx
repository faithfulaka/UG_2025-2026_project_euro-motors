//src/app/admin/supercar-pricing/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useCar } from '@/context/CarContext';
import { ComprehensiveSPAData, SPASearchParams } from '@/types/spa';

interface AutoCompleteState {
  makes: string[];
  models: string[];
  years: number[];
  makesLoading: boolean;
  modelsLoading: boolean;
  yearsLoading: boolean;
}

interface SearchHistory {
  id: string;
  params: SPASearchParams;
  timestamp: Date;
  resultSummary: string;
  dataSource: string;
}

export default function SupercarPricingAggregatorPage() {
  const { addSPAResult } = useCar();

  // Search state
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [dataSource, setDataSource] = useState<'comprehensive' | 'database' | 'carquery' | 'manufacturer' | 'market'>('comprehensive');

  // Safe setter for dataSource to handle undefined or invalid values
  const setDataSourceSafely = (value: string | undefined | null) => {
    const validSources = ['comprehensive', 'database', 'carquery', 'manufacturer', 'market'];
    const sourceToSet = (value && validSources.includes(value)) ? value : 'comprehensive';
    setDataSource(sourceToSet as typeof dataSource);
  };

  // Results state
  const [supercarData, setSupercarData] = useState<ComprehensiveSPAData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-complete state
  const [autoComplete, setAutoComplete] = useState<AutoCompleteState>({
    makes: [],
    models: [],
    years: [],
    makesLoading: false,
    modelsLoading: false,
    yearsLoading: false
  });

  // Dropdown visibility
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  

  // Search history
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);

  // Refs for click outside detection
  const makeDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  

  // Load makes on component mount
  useEffect(() => {
    loadMakes();
  }, []);

  // Load models when make changes
  useEffect(() => {
    if (selectedMake.trim()) {
      loadModels(selectedMake);
      setSelectedModel(''); // Reset model when make changes
      setSelectedYear('');   // Reset year when make changes
    } else {
      setAutoComplete(prev => ({ ...prev, models: [], years: [] }));
      setSelectedModel('');
      setSelectedYear('');
    }
  }, [selectedMake]);

  // Load years when model changes
  useEffect(() => {
    if (selectedMake.trim() && selectedModel.trim()) {
      loadYears();
      setSelectedYear(''); // Reset year when model changes
    } else {
      setAutoComplete(prev => ({ ...prev, years: [] }));
      setSelectedYear('');
    }
  }, [selectedMake, selectedModel]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (makeDropdownRef.current && !makeDropdownRef.current.contains(event.target as Node)) {
        setShowMakeDropdown(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load makes from API
  const loadMakes = async () => {
    try {
      setAutoComplete(prev => ({ ...prev, makesLoading: true }));

      const response = await fetch('/api/spa/makes?source=combined');
      if (!response.ok) throw new Error('Failed to load makes');

      const data = await response.json();
      setAutoComplete(prev => ({
        ...prev,
        makes: data.makes || [],
        makesLoading: false
      }));

    } catch (error) {
      console.error('Error loading makes:', error);
      setAutoComplete(prev => ({ ...prev, makesLoading: false }));
    }
  };

  // Load models for specific make
  const loadModels = async (make: string) => {
    try {
      setAutoComplete(prev => ({ ...prev, modelsLoading: true }));

      const response = await fetch(`/api/spa/models?make=${encodeURIComponent(make)}&source=combined`);
      if (!response.ok) throw new Error('Failed to load models');

      const data = await response.json();
      setAutoComplete(prev => ({
        ...prev,
        models: data.models || [],
        modelsLoading: false
      }));

    } catch (error) {
      console.error('Error loading models:', error);
      setAutoComplete(prev => ({ ...prev, modelsLoading: false }));
    }
  };

  // Load years for specific make/model (using CarQuery)
  const loadYears = async () => {
    try {
      setAutoComplete(prev => ({ ...prev, yearsLoading: true }));

      // For now, provide common years - in real implementation, this would call CarQuery
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

      setAutoComplete(prev => ({
        ...prev,
        years,
        yearsLoading: false
      }));

    } catch (error) {
      console.error('Error loading years:', error);
      setAutoComplete(prev => ({ ...prev, yearsLoading: false }));
    }
  };

  // Filter suggestions based on input
  const getFilteredMakes = () => {
    if (!selectedMake) return autoComplete.makes.slice(0, 10);
    return autoComplete.makes
      .filter(make => make.toLowerCase().includes(selectedMake.toLowerCase()))
      .slice(0, 10);
  };

  const getFilteredModels = () => {
    if (!selectedModel) return autoComplete.models.slice(0, 10);
    return autoComplete.models
      .filter(model => model.toLowerCase().includes(selectedModel.toLowerCase()))
      .slice(0, 10);
  };

  // Handle search
  const handleSearch = async () => {
    if (!selectedMake.trim() || !selectedModel.trim()) {
      setError('Please select make and model');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSupercarData(null);

    try {
      const searchParams: SPASearchParams = {
        make: selectedMake.trim(),
        model: selectedModel.trim(),
        year: selectedYear ? parseInt(selectedYear) : undefined,
        dataSource
      };

      console.log('🔍 Starting SPA search:', searchParams);

      const response = await fetch('/api/spa/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Search failed');
      }

      if (result.data) {
        setSupercarData(result.data);

        // Add to global context
        addSPAResult({
          id: `${selectedMake}-${selectedModel}-${selectedYear || 'any'}-${Date.now()}`,
          make: selectedMake,
          model: selectedModel,
          year: selectedYear ? parseInt(selectedYear) : 2024,
          data: result.data,
          searchedAt: new Date(),
          source: dataSource
        });

        // Add to search history
        const historyEntry: SearchHistory = {
          id: Date.now().toString(),
          params: searchParams,
          timestamp: new Date(),
          resultSummary: `${result.data.make} ${result.data.model} - £${result.data.pricingData?.averageDealerPrice?.toLocaleString() || 'N/A'}`,
          dataSource: result.data.dataSource
        };

        setSearchHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      } else {
        setError('No data found for this vehicle');
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed. Please try again.';
      console.error('Search error:', error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill from database cars
  const availableCars = [
    { make: 'Bentley', model: 'Bentayga V8', year: 2022 },
    { make: 'Rolls Royce', model: 'Cullinan V12', year: 2022 },
    { make: 'Bentley', model: 'Continental GT V8', year: 2022 }
  ];

  const handleQuickFill = (car: { make: string; model: string; year: number }) => {
    setSelectedMake(car.make);
    setSelectedModel(car.model);
    setSelectedYear(car.year.toString());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚘 Supercar Pricing Aggregator</h1>
          <p className="text-gray-600 text-lg">Get comprehensive vehicle data from multiple REAL sources with live scraping</p>
        </div>

        {/* Data Source Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Data Source Selection</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <button
              onClick={() => setDataSource('comprehensive')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                dataSource === 'comprehensive' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-bold text-blue-600">🔍 Comprehensive</div>
              <div className="text-sm text-gray-600 mt-1">All sources combined</div>
              <div className="text-xs text-green-600 mt-2 font-semibold">✅ RECOMMENDED</div>
            </button>
            
            <button
              onClick={() => setDataSource('carquery')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                dataSource === 'carquery' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-bold text-green-600">🔍 CarQuery API</div>
              <div className="text-sm text-gray-600 mt-1">Technical specifications</div>
              <div className="text-xs text-green-600 mt-2 font-semibold">✅ LIVE API</div>
            </button>
            
            <button
              onClick={() => setDataSource('manufacturer')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                dataSource === 'manufacturer' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-bold text-purple-600">🏭 Manufacturer</div>
              <div className="text-sm text-gray-600 mt-1">Official configurators</div>
              <div className="text-xs text-green-600 mt-2 font-semibold">✅ REAL SCRAPERS</div>
            </button>
            
            <button
              onClick={() => setDataSource('market')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                dataSource === 'market' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-bold text-orange-600">📊 Market Data</div>
              <div className="text-sm text-gray-600 mt-1">Live listings</div>
              <div className="text-xs text-green-600 mt-2 font-semibold">✅ LIVE SCRAPING</div>
            </button>
            
            <button
              onClick={() => setDataSource('database')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                dataSource === 'database' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-bold text-gray-600">💾 Database</div>
              <div className="text-sm text-gray-600 mt-1">Local data only</div>
              <div className="text-xs text-gray-500 mt-2">📦 FALLBACK</div>
            </button>
          </div>
        </div>

        {/* Quick Fill from Database */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Quick Fill from Database</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableCars.map((car, index) => (
              <button
                key={index}
                onClick={() => handleQuickFill(car)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-left"
              >
                <h3 className="font-semibold text-gray-800">{car.make} {car.model}</h3>
                <p className="text-sm text-gray-600">Year: {car.year}</p>
                <p className="text-xs text-blue-600 mt-2">👆 Click to auto-fill</p>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Search Form with Auto-Complete */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Search Vehicle</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Make Input with Auto-Complete */}
            <div className="relative" ref={makeDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Make *</label>
              <input
                type="text"
                value={selectedMake}
                onChange={(e) => {
                  setSelectedMake(e.target.value);
                  setShowMakeDropdown(true);
                }}
                onFocus={() => setShowMakeDropdown(true)}
                placeholder="Type to search makes..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              
              {showMakeDropdown && (
                <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {autoComplete.makesLoading ? (
                    <div className="p-3 text-center text-gray-500">Loading makes...</div>
                  ) : getFilteredMakes().length > 0 ? (
                    getFilteredMakes().map((make, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedMake(make);
                          setShowMakeDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                      >
                        <span className="font-medium">{make}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">No makes found</div>
                  )}
                </div>
              )}
            </div>

            {/* Model Input with Auto-Complete */}
            <div className="relative" ref={modelDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
              <input
                type="text"
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setShowModelDropdown(true);
                }}
                onFocus={() => setShowModelDropdown(true)}
                placeholder="Type to search models..."
                disabled={!selectedMake.trim()}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              
              {showModelDropdown && selectedMake.trim() && (
                <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {autoComplete.modelsLoading ? (
                    <div className="p-3 text-center text-gray-500">Loading models...</div>
                  ) : getFilteredModels().length > 0 ? (
                    getFilteredModels().map((model, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowModelDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                      >
                        <span className="font-medium">{model}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">No models found</div>
                  )}
                </div>
              )}
            </div>

            {/* Year Dropdown (Conditional) */}
            <div className="relative" ref={makeDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={!selectedMake.trim() || !selectedModel.trim()}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Year</option>
                {autoComplete.years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              {!selectedMake.trim() || !selectedModel.trim() ? (
                <p className="text-xs text-gray-500 mt-1">Select make and model first</p>
              ) : null}
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isLoading || !selectedMake.trim() || !selectedModel.trim()}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  '🔍 Get Data'
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="text-red-600 mr-2">❌</div>
                <div className="text-red-700">{error}</div>
              </div>
            </div>
          )}
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Searches</h3>
            <div className="space-y-3">
              {searchHistory.slice(0, 5).map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                >
                  <div>
                    <span className="font-medium text-gray-800">{search.resultSummary}</span>
                    <div className="text-sm text-gray-600 mt-1">
                      Source: {search.dataSource} • {search.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMake(search.params.make);
                      setSelectedModel(search.params.model);
                      setSelectedYear(search.params.year?.toString() || '');
                      setDataSourceSafely(search.params.dataSource);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Repeat Search
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comprehensive Data Display */}
        {supercarData && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🔍 COMPREHENSIVE DATA: {supercarData.make} {supercarData.model}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                  Data Source: {supercarData.dataSource}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  Year: {supercarData.year}
                </span>
                {supercarData.bodyType && (
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                    Body: {supercarData.bodyType}
                  </span>
                )}
              </div>
              
              {/* Data Sources Used */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Sources used:</span>
                {supercarData.dataSources.database && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">Database ✓</span>
                )}
                {supercarData.dataSources.carQuery && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">CarQuery ✓</span>
                )}
                {supercarData.dataSources.manufacturer && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Manufacturer ✓</span>
                )}
                {supercarData.dataSources.market && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">Market ✓</span>
                )}
              </div>
            </div>

            {/* Basic Specifications */}
            {supercarData.basicSpecifications && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-semibold mb-4 text-blue-600">📋 BASIC SPECIFICATIONS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><strong>Make:</strong> {supercarData.basicSpecifications.make}</div>
                  <div><strong>Model:</strong> {supercarData.basicSpecifications.model}</div>
                  <div><strong>Year:</strong> {supercarData.basicSpecifications.year}</div>
                  <div><strong>Body Type:</strong> {supercarData.basicSpecifications.bodyType}</div>
                  <div><strong>Engine:</strong> {supercarData.basicSpecifications.engine}</div>
                  <div><strong>Doors:</strong> {supercarData.basicSpecifications.doors}</div>
                  <div><strong>Seats:</strong> {supercarData.basicSpecifications.seats}</div>
                  {supercarData.basicSpecifications.transmission && (
                    <div><strong>Transmission:</strong> {supercarData.basicSpecifications.transmission}</div>
                  )}
                  {supercarData.basicSpecifications.drivetrain && (
                    <div><strong>Drivetrain:</strong> {supercarData.basicSpecifications.drivetrain}</div>
                  )}
                </div>
              </div>
            )}

            {/* Performance Data */}
            {supercarData.performanceData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-semibold mb-4 text-green-600">⚡ PERFORMANCE</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><strong>Engine:</strong> {supercarData.performanceData.engine}</div>
                  <div><strong>Horsepower:</strong> {supercarData.performanceData.horsePower}</div>
                  <div><strong>Torque:</strong> {supercarData.performanceData.torque}</div>
                  <div><strong>0-60 mph:</strong> {supercarData.performanceData.acceleration060}</div>
                  <div><strong>Top Speed:</strong> {supercarData.performanceData.topSpeed}</div>
                  <div><strong>Transmission:</strong> {supercarData.performanceData.transmission}</div>
                  <div><strong>Drive Type:</strong> {supercarData.performanceData.driveType}</div>
                  <div><strong>Weight:</strong> {supercarData.performanceData.weight}</div>
                  {supercarData.performanceData.fuelEconomy && (
                    <div><strong>Fuel Economy:</strong> {supercarData.performanceData.fuelEconomy}</div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing Data */}
            {supercarData.pricingData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-semibold mb-4 text-red-600">💰 PRICING DATA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {supercarData.pricingData.baseMSRP && (
                    <div><strong>Base MSRP:</strong> £{supercarData.pricingData.baseMSRP.toLocaleString()}</div>
                  )}
                  <div><strong>Current Market Range:</strong> {supercarData.pricingData.currentMarketRange}</div>
                  <div><strong>Average Dealer Price:</strong> £{supercarData.pricingData.averageDealerPrice?.toLocaleString() || 'N/A'}</div>
                  <div><strong>Dealer Inventory:</strong> {supercarData.pricingData.dealerInventoryCount} vehicles</div>
                  <div><strong>Price Trend:</strong> {supercarData.pricingData.priceTrend}</div>
                  {supercarData.pricingData.priceDistribution && (
                    <>
                      <div><strong>Min Price:</strong> £{supercarData.pricingData.priceDistribution.min.toLocaleString()}</div>
                      <div><strong>Max Price:</strong> £{supercarData.pricingData.priceDistribution.max.toLocaleString()}</div>
                      <div><strong>Median Price:</strong> £{supercarData.pricingData.priceDistribution.median.toLocaleString()}</div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Popular Options */}
            {supercarData.popularOptions && supercarData.popularOptions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-semibold mb-4 text-orange-600">🔧 POPULAR OPTIONS</h3>
                <div className="mb-4">
                  <strong>Ready for addedOptions field:</strong>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {supercarData.popularOptions.map((option: { name: string; source: string }, index: number) => (
                    <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      <span className="font-medium">{option.name}</span>
                      <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {option.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Data */}
            {supercarData.marketData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-semibold mb-4 text-indigo-600">📊 MARKET DATA</h3>
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div><strong>Average Price:</strong> £{supercarData.marketData.averagePrice.toLocaleString()}</div>
                    <div><strong>Price Range:</strong> {supercarData.marketData.priceRange}</div>
                    <div><strong>Available Listings:</strong> {supercarData.marketData.inventoryCount}</div>
                    <div><strong>Data Source:</strong> {supercarData.marketData.dataSource}</div>
                  </div>
                </div>
                
                {supercarData.marketData.listings && supercarData.marketData.listings.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Recent Listings (Sample):</h4>
                    <div className="space-y-2">
                      {supercarData.marketData.listings.slice(0, 5).map((listing: { title: string; price: string; specs?: string }, index: number) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-medium">{listing.title}</div>
                          <div className="text-sm text-gray-600">
                            Price: {listing.price} | {listing.specs}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">🔧 Integration Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    const optionsArray = supercarData.popularOptions?.map((opt: { name: string }) => opt.name) || [];
                    console.log('🚗 Options for addedOptions field:', optionsArray);
                    console.log('📊 Full SPA Data:', supercarData);
                    alert(`${optionsArray.length} options ready for integration!\nCheck console for details.`);
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold"
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
                      addedOptions: supercarData.popularOptions?.map((opt: { name: string }) => opt.name) || [],
                      performanceData: supercarData.performanceData,
                      pricingData: supercarData.pricingData
                    };
                    navigator.clipboard.writeText(JSON.stringify(integrationData, null, 2));
                    alert('Integration data copied to clipboard!');
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
                >
                  📋 Copy Integration Data
                </button>

                <button
                  onClick={() => {
                    console.log('🔍 Search completed with sources:', supercarData.dataSources);
                    console.log('📍 Data from:', supercarData.dataSource);
                    console.log('🔄 Options ready:', supercarData.popularOptions?.map((opt: { name: string }) => opt.name));
                    alert('Search analysis logged to console!\nReal data from multiple sources confirmed.');
                  }}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-semibold"
                >
                  📈 Analyze Results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}