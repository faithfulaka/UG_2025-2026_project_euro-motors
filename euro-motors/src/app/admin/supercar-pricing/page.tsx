// src/app/admin/supercar-pricing/page.tsx
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
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [dataSource, setDataSource] = useState<
    'comprehensive' | 'database' | 'carquery' | 'manufacturer' | 'market'
  >('comprehensive');

  // Results state
  const [supercarData, setSupercarData] = useState<ComprehensiveSPAData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-complete state
  const [autoComplete, setAutoComplete] = useState<AutoCompleteState>({
    makes: [],
    models: [],
    years: [],
    makesLoading: false,
    modelsLoading: false,
    yearsLoading: false,
  });

  // Dropdown visibility
  const [showMakeDropdown, setShowMakeDropdown] = useState<boolean>(false);
  const [showModelDropdown, setShowModelDropdown] = useState<boolean>(false);

  // Search history
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);

  // Refs for click outside detection
  const makeDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch makes when dataSource changes
  useEffect(() => {
    loadMakes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource]);

  // Fetch models when make or dataSource changes
  useEffect(() => {
    if (selectedMake.trim()) {
      loadModels(selectedMake);
      setSelectedModel('');
      setSelectedYear('');
    } else {
      setAutoComplete(prev => ({ ...prev, models: [], years: [] }));
      setSelectedModel('');
      setSelectedYear('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMake, dataSource]);

  // Fetch years when model or dataSource changes
  useEffect(() => {
    if (selectedMake.trim() && selectedModel.trim()) {
      loadYears();
      setSelectedYear('');
    } else {
      setAutoComplete(prev => ({ ...prev, years: [] }));
      setSelectedYear('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMake, selectedModel, dataSource]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        makeDropdownRef.current &&
        !makeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMakeDropdown(false);
      }
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
      ) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // === Data-loading functions ===

  const loadMakes = async () => {
    try {
      setAutoComplete(prev => ({ ...prev, makesLoading: true }));
      const res = await fetch(`/api/spa/makes?source=${dataSource}`);
      if (!res.ok) throw new Error('Failed to load makes');
      const js = await res.json();
      setAutoComplete(prev => ({
        ...prev,
        makes: js.makes || [],
        makesLoading: false,
      }));
    } catch (e) {
      console.error(e);
      setAutoComplete(prev => ({ ...prev, makesLoading: false }));
    }
  };

  const loadModels = async (make: string) => {
    try {
      setAutoComplete(prev => ({ ...prev, modelsLoading: true }));
      const res = await fetch(
        `/api/spa/models?make=${encodeURIComponent(
          make
        )}&source=${dataSource}`
      );
      if (!res.ok) throw new Error('Failed to load models');
      const js = await res.json();
      setAutoComplete(prev => ({
        ...prev,
        models: js.models || [],
        modelsLoading: false,
      }));
    } catch (e) {
      console.error(e);
      setAutoComplete(prev => ({ ...prev, modelsLoading: false }));
    }
  };

  const loadYears = async () => {
    try {
      setAutoComplete(prev => ({ ...prev, yearsLoading: true }));
      if (dataSource === 'database') {
        const res = await fetch(
          `/api/spa/suggestions?type=years&make=${encodeURIComponent(
            selectedMake
          )}&model=${encodeURIComponent(selectedModel)}`
        );
        if (res.ok) {
          const js = await res.json();
          const yrs =
            js.data
              ?.map((i: { value: string }) => parseInt(i.value, 10))
              .filter(Boolean) || [];
          setAutoComplete(prev => ({
            ...prev,
            years: yrs,
            yearsLoading: false,
          }));
          return;
        }
      }
      // fallback
      const cy = new Date().getFullYear();
      const yrs = Array.from({ length: 6 }, (_, i) => cy - i);
      setAutoComplete(prev => ({
        ...prev,
        years: yrs,
        yearsLoading: false,
      }));
    } catch (e) {
      console.error(e);
      setAutoComplete(prev => ({ ...prev, yearsLoading: false }));
    }
  };

  // === Helpers ===

  const getFilteredMakes = () =>
    !selectedMake
      ? autoComplete.makes.slice(0, 10)
      : autoComplete.makes
          .filter(m =>
            m.toLowerCase().includes(selectedMake.toLowerCase())
          )
          .slice(0, 10);

  const getFilteredModels = () =>
    !selectedModel
      ? autoComplete.models.slice(0, 10)
      : autoComplete.models
          .filter(m =>
            m.toLowerCase().includes(selectedModel.toLowerCase())
          )
          .slice(0, 10);

  // === Search ===

  const handleSearch = async () => {
    if (!selectedMake.trim() || !selectedModel.trim()) {
      setError('Please select make and model');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSupercarData(null);

    try {
      const params: SPASearchParams = {
        make: selectedMake.trim(),
        model: selectedModel.trim(),
        year: selectedYear ? parseInt(selectedYear, 10) : undefined,
        dataSource,
      };
      const res = await fetch('/api/spa/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const js = await res.json();
      if (!js.success) throw new Error(js.error?.message || 'Search failed');
      if (js.data) {
        setSupercarData(js.data);
        addSPAResult({
          id: `${selectedMake}-${selectedModel}-${
            selectedYear || 'any'
          }-${Date.now()}`,
          make: selectedMake,
          model: selectedModel,
          year: selectedYear
            ? parseInt(selectedYear, 10)
            : new Date().getFullYear(),
          data: js.data,
          searchedAt: new Date(),
          source: dataSource,
        });
        const hist: SearchHistory = {
          id: Date.now().toString(),
          params,
          timestamp: new Date(),
          resultSummary: `${js.data.make} ${js.data.model} - £${
            js.data.pricingData?.averageDealerPrice?.toLocaleString() ?? 'N/A'
          }`,
          dataSource: js.data.dataSource,
        };
        setSearchHistory(prev => [hist, ...prev.slice(0, 9)]);
      } else {
        setError('No data found');
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick‐fill examples
  const availableCars = [
    { make: 'Bentley', model: 'Bentayga V8', year: 2022 },
    { make: 'Rolls Royce', model: 'Cullinan V12', year: 2022 },
    { make: 'Bentley', model: 'Continental GT V8', year: 2022 },
  ];

  const handleQuickFill = (c: {
    make: string;
    model: string;
    year: number;
  }) => {
    setSelectedMake(c.make);
    setSelectedModel(c.model);
    setSelectedYear(c.year.toString());
    setDataSource('database');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-black">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            🚘 Supercar Pricing Aggregator
          </h1>
          <p className="text-lg">
            Get comprehensive vehicle data from multiple REAL sources with live
            scraping
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold mb-2">🔧 Debug Status:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>
                Source:{' '}
                <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                  {dataSource}
                </span>
              </div>
              <div>
                Makes:{' '}
                <span className="font-mono bg-green-100 px-2 py-1 rounded">
                  {autoComplete.makes.length}
                </span>
              </div>
              <div>
                Models:{' '}
                <span className="font-mono bg-green-100 px-2 py-1 rounded">
                  {autoComplete.models.length}
                </span>
              </div>
              <div>
                Years:{' '}
                <span className="font-mono bg-green-100 px-2 py-1 rounded">
                  {autoComplete.years.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SOURCE SELECTION */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">
            Data Source Selection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            {(['comprehensive', 'carquery', 'manufacturer', 'market', 'database'] as const).map(
              src => {
                type Src = typeof src;
                const labels: Record<Src, string> = {
                  comprehensive: '🔍 Comprehensive',
                  carquery: '🔍 CarQuery API',
                  manufacturer: '🏭 Manufacturer',
                  market: '📊 Market Data',
                  database: '💾 Database',
                };
                const subs: Record<Src, string> = {
                  comprehensive: 'All sources combined',
                  carquery: 'Technical specifications',
                  manufacturer: 'Official configurators',
                  market: 'Live listings',
                  database: 'Local data only',
                };
                const badges: Record<Src, JSX.Element> = {
                  comprehensive: (
                    <div className="text-xs text-green-600 font-semibold">
                      ✅ RECOMMENDED
                    </div>
                  ),
                  carquery: (
                    <div className="text-xs text-green-600 font-semibold">
                      ✅ LIVE API
                    </div>
                  ),
                  manufacturer: (
                    <div className="text-xs text-green-600 font-semibold">
                      ✅ REAL SCRAPERS
                    </div>
                  ),
                  market: (
                    <div className="text-xs text-green-600 font-semibold">
                      ✅ LIVE SCRAPING
                    </div>
                  ),
                  database: (
                    <div className="text-xs text-gray-500">📦 FALLBACK</div>
                  ),
                };
                const colors: Record<Src, string> = {
                  comprehensive: 'text-blue-600',
                  carquery: 'text-green-600',
                  manufacturer: 'text-purple-600',
                  market: 'text-orange-600',
                  database: 'text-gray-600',
                };
                return (
                  <button
                    key={src}
                    onClick={() => setDataSource(src)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      dataSource === src
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className={`font-bold ${colors[src]}`}>
                      {labels[src]}
                    </div>
                    <div className="text-sm mt-1">{subs[src]}</div>
                    <div className="mt-2">{badges[src]}</div>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* QUICK FILL */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Quick Fill from Database
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableCars.map((c, i) => (
              <button
                key={i}
                onClick={() => handleQuickFill(c)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-all duration-200 text-left"
              >
                <h3 className="font-semibold">
                  {c.make} {c.model}
                </h3>
                <p className="text-sm">Year: {c.year}</p>
                <p className="text-xs text-blue-600 mt-2">
                  👆 Click to auto-fill
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH FORM */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 overflow-visible">
          <h2 className="text-2xl font-semibold mb-6">Search Vehicle</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* MAKE */}
            <div className="relative overflow-visible" ref={makeDropdownRef}>
              <label className="block text-sm font-medium mb-2">Make *</label>
              <input
                type="text"
                value={selectedMake}
                onChange={e => {
                  setSelectedMake(e.target.value);
                  setShowMakeDropdown(true);
                }}
                onFocus={() => setShowMakeDropdown(true)}
                placeholder="Type to search makes..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              {showMakeDropdown && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {autoComplete.makesLoading ? (
                    <div className="p-3 text-center">Loading makes...</div>
                  ) : getFilteredMakes().length ? (
                    getFilteredMakes().map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedMake(m);
                          setShowMakeDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                      >
                        {m}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center">No makes found</div>
                  )}
                </div>
              )}
            </div>

            {/* MODEL */}
            <div className="relative overflow-visible" ref={modelDropdownRef}>
              <label className="block text-sm font-medium mb-2">Model *</label>
              <input
                type="text"
                value={selectedModel}
                onChange={e => {
                  setSelectedModel(e.target.value);
                  setShowModelDropdown(true);
                }}
                onFocus={() => setShowModelDropdown(true)}
                placeholder="Type to search models..."
                disabled={!selectedMake.trim()}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:bg-gray-100"
              />
              {showModelDropdown && selectedMake.trim() && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {autoComplete.modelsLoading ? (
                    <div className="p-3 text-center">Loading models...</div>
                  ) : getFilteredModels().length ? (
                    getFilteredModels().map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedModel(m);
                          setShowModelDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                      >
                        {m}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center">No models found</div>
                  )}
                </div>
              )}
            </div>

            {/* YEAR */}
            <div className="relative">
              <label className="block text-sm font-medium mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                disabled={!selectedMake.trim() || !selectedModel.trim()}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:bg-gray-100"
              >
                <option value="">Select Year</option>
                {autoComplete.years.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {(!selectedMake.trim() || !selectedModel.trim()) && (
                <p className="text-xs mt-1">Select make and model first</p>
              )}
            </div>

            {/* SEARCH BUTTON */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={
                  isLoading || !selectedMake.trim() || !selectedModel.trim()
                }
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-b-2 border-white mr-2 rounded-full"></div>
                    Searching...
                  </div>
                ) : (
                  '🔍 Get Data'
                )}
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="text-red-600 mr-2">❌</div>
                <div className="text-red-700">{error}</div>
              </div>
            </div>
          )}
        </div>

        {/* SEARCH HISTORY */}
        {searchHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Recent Searches</h3>
            <div className="space-y-3">
              {searchHistory.slice(0, 5).map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100"
                >
                  <div>
                    <span className="font-medium">{s.resultSummary}</span>
                    <div className="text-sm mt-1">
                      Source: {s.dataSource} •{' '}
                      {s.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMake(s.params.make);
                      setSelectedModel(s.params.model);
                      setSelectedYear(s.params.year?.toString() || '');
                      setDataSource(s.params.dataSource);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Repeat Search
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {supercarData && (
          <div className="space-y-6">
            {/* HEADER */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-4">
                🔍 COMPREHENSIVE DATA: {supercarData.make}{' '}
                {supercarData.model}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="bg-green-100 px-3 py-1 rounded-full">
                  Data Source: {supercarData.dataSource}
                </span>
                <span className="bg-blue-100 px-3 py-1 rounded-full">
                  Year: {supercarData.year}
                </span>
                {supercarData.bodyType && (
                  <span className="bg-purple-100 px-3 py-1 rounded-full">
                    Body: {supercarData.bodyType}
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {supercarData.dataSources.database && (
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    Database ✓
                  </span>
                )}
                {supercarData.dataSources.carQuery && (
                  <span className="bg-blue-100 px-2 py-1 rounded text-xs">
                    CarQuery ✓
                  </span>
                )}
                {supercarData.dataSources.manufacturer && (
                  <span className="bg-purple-100 px-2 py-1 rounded text-xs">
                    Manufacturer ✓
                  </span>
                )}
                {supercarData.dataSources.market && (
                  <span className="bg-orange-100 px-2 py-1 rounded text-xs">
                    Market ✓
                  </span>
                )}
              </div>
            </div>

            {/* BASIC SPECS */}
            {supercarData.basicSpecifications && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-semibold mb-4 text-blue-600">
                  📋 BASIC SPECIFICATIONS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <strong>Make:</strong>{' '}
                    {supercarData.basicSpecifications.make}
                  </div>
                  <div>
                    <strong>Model:</strong>{' '}
                    {supercarData.basicSpecifications.model}
                  </div>
                  <div>
                    <strong>Year:</strong>{' '}
                    {supercarData.basicSpecifications.year}
                  </div>
                  <div>
                    <strong>Body Type:</strong>{' '}
                    {supercarData.basicSpecifications.bodyType}
                  </div>
                  <div>
                    <strong>Engine:</strong>{' '}
                    {supercarData.basicSpecifications.engine}
                  </div>
                  <div>
                    <strong>Doors:</strong>{' '}
                    {supercarData.basicSpecifications.doors}
                  </div>
                  <div>
                    <strong>Seats:</strong>{' '}
                    {supercarData.basicSpecifications.seats}
                  </div>
                  {supercarData.basicSpecifications.transmission && (
                    <div>
                      <strong>Transmission:</strong>{' '}
                      {supercarData.basicSpecifications.transmission}
                    </div>
                  )}
                  {supercarData.basicSpecifications.drivetrain && (
                    <div>
                      <strong>Drivetrain:</strong>{' '}
                      {supercarData.basicSpecifications.drivetrain}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PERFORMANCE */}
            {supercarData.performanceData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-semibold mb-4 text-green-600">
                  ⚡ PERFORMANCE
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <strong>Engine:</strong>{' '}
                    {supercarData.performanceData.engine}
                  </div>
                  <div>
                    <strong>Horsepower:</strong>{' '}
                    {supercarData.performanceData.horsePower}
                  </div>
                  <div>
                    <strong>Torque:</strong>{' '}
                    {supercarData.performanceData.torque}
                  </div>
                  <div>
                    <strong>0-60 mph:</strong>{' '}
                    {supercarData.performanceData.acceleration060}
                  </div>
                  <div>
                    <strong>Top Speed:</strong>{' '}
                    {supercarData.performanceData.topSpeed}
                  </div>
                  <div>
                    <strong>Transmission:</strong>{' '}
                    {supercarData.performanceData.transmission}
                  </div>
                  <div>
                    <strong>Drive Type:</strong>{' '}
                    {supercarData.performanceData.driveType}
                  </div>
                  <div>
                    <strong>Weight:</strong>{' '}
                    {supercarData.performanceData.weight}
                  </div>
                  {supercarData.performanceData.fuelEconomy && (
                    <div>
                      <strong>Fuel Economy:</strong>{' '}
                      {supercarData.performanceData.fuelEconomy}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PRICING */}
            {supercarData.pricingData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-semibold mb-4 text-red-600">
                  💰 PRICING DATA
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {supercarData.pricingData.baseMSRP !== undefined && (
                    <div>
                      <strong>Base MSRP:</strong> £
                      {supercarData.pricingData.baseMSRP.toLocaleString()}
                    </div>
                  )}
                  <div>
                    <strong>Current Market Range:</strong>{' '}
                    {supercarData.pricingData.currentMarketRange}
                  </div>
                  <div>
                    <strong>Average Dealer Price:</strong> £
                    {supercarData.pricingData.averageDealerPrice.toLocaleString()}
                  </div>
                  <div>
                    <strong>Dealer Inventory:</strong>{' '}
                    {supercarData.pricingData.dealerInventoryCount} vehicles
                  </div>
                  <div>
                    <strong>Price Trend:</strong>{' '}
                    {supercarData.pricingData.priceTrend}
                  </div>
                  {supercarData.pricingData.priceDistribution && (
                    <>
                      <div>
                        <strong>Min Price:</strong> £
                        {
                          supercarData.pricingData.priceDistribution.min.toLocaleString()
                        }
                      </div>
                      <div>
                        <strong>Max Price:</strong> £
                        {
                          supercarData.pricingData.priceDistribution.max.toLocaleString()
                        }
                      </div>
                      <div>
                        <strong>Median Price:</strong> £
                        {
                          supercarData.pricingData.priceDistribution.median.toLocaleString()
                        }
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* POPULAR OPTIONS */}
            {supercarData.popularOptions && supercarData.popularOptions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-semibold mb-4 text-orange-600">
                  🔧 POPULAR OPTIONS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {supercarData.popularOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center bg-gray-50 p-3 rounded-lg"
                    >
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      <span className="font-medium">{opt.name}</span>
                      <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded">
                        {opt.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MARKET DATA */}
            {supercarData.marketData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-semibold mb-4 text-indigo-600">
                  📊 MARKET DATA
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <strong>Average Price:</strong> £
                    {supercarData.marketData.averagePrice.toLocaleString()}
                  </div>
                  <div>
                    <strong>Price Range:</strong>{' '}
                    {supercarData.marketData.priceRange}
                  </div>
                  <div>
                    <strong>Available Listings:</strong>{' '}
                    {supercarData.marketData.inventoryCount}
                  </div>
                  <div>
                    <strong>Data Source:</strong>{' '}
                    {supercarData.marketData.dataSource}
                  </div>
                </div>
                {supercarData.marketData.listings.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">
                      Recent Listings (Sample):
                    </h4>
                    <div className="space-y-2">
                      {supercarData.marketData.listings
                        .slice(0, 5)
                        .map((l, i) => (
                          <div
                            key={i}
                            className="bg-gray-50 p-3 rounded-lg"
                          >
                            <div className="font-medium">{l.title}</div>
                            <div className="text-sm">
                              Price: {l.price} | {l.specs}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* INTEGRATION ACTIONS */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-semibold mb-4">
                🔧 Integration Actions
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    const opts = supercarData.popularOptions.map(o => o.name);
                    console.log('Options:', opts);
                    console.log('Full data:', supercarData);
                    alert(`Ready: ${opts.length} options\nCheck console.`);
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  📊 Extract addedOptions
                </button>
                <button
                  onClick={() => {
                    const integrationData = {
                      make: supercarData.make,
                      model: supercarData.model,
                      year: supercarData.year,
                      dealerPrice:
                        supercarData.pricingData.averageDealerPrice,
                      baseMSRP: supercarData.pricingData.baseMSRP,
                      addedOptions: supercarData.popularOptions.map(
                        o => o.name
                      ),
                      performanceData:
                        supercarData.performanceData,
                      pricingData: supercarData.pricingData,
                    };
                    navigator.clipboard.writeText(
                      JSON.stringify(integrationData, null, 2)
                    );
                    alert('Integration data copied!');
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📋 Copy Integration Data
                </button>
                <button
                  onClick={() => {
                    console.log(
                      'Sources:',
                      supercarData.dataSources
                    );
                    console.log(
                      'Data from:',
                      supercarData.dataSource
                    );
                    console.log(
                      'Options:',
                      supercarData.popularOptions.map(o => o.name)
                    );
                    alert('Analysis logged in console.');
                  }}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
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