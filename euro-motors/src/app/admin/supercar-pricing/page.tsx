/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';


import React from 'react';
import { useState, useEffect, useRef } from 'react';
// import { useCar } from '@/context/CarContext'; // commented out since it's not clear if the context exists
// import { any // TODO: Restore ComprehensiveSPAData type, any // TODO: Restore SPASearchParams type } from '@/types/spa'; // commented out since it's not clear if the types exist

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


// TODO: Restore SearchHistory type if available

export default function SupercarPricingAggregatorPage() {
  const { addSPAResult } = /* useCar() // TODO: Restore if CarContext exists */;

interface SearchHistory {
  id: string;
  params: SPASearchParams;
  timestamp: Date;
  resultSummary: string;
  dataSource: string;
}

export default function SupercarPricingAggregatorPage() {
  const { addSPAResult } = useCar();


  // ── Search State ─────────────────────────────────────────────────────

  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [dataSource, setDataSource] = useState<

    'webbase' | 'database'
  >('webbase');

  const [supercarData, setSupercarData] = useState<any | null>(null);

    'comprehensive' | 'database' | 'carquery' | 'manufacturer' | 'market'
  >('comprehensive');

  const [supercarData, setSupercarData] =
    useState<ComprehensiveSPAData | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ── Auto-complete State ─────────────────────────────────────────────

  const [autoComplete, setAutoComplete] = useState<AutoCompleteState>({
    makes: [],
    models: [],
    years: [],
    makesLoading: false,
    modelsLoading: false,
    yearsLoading: false,
  });

  const [showMakeDropdown, setShowMakeDropdown] =
    useState<boolean>(false);
  const [showModelDropdown, setShowModelDropdown] =
    useState<boolean>(false);


  const [searchHistory, setSearchHistory] = useState<any[]>([]);

  const [searchHistory, setSearchHistory] =
    useState<SearchHistory[]>([]);


  const makeDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // ── Effects ─────────────────────────────────────────────────────────

  // load makes when datasource changes
  useEffect(() => {
    loadMakes();
  }, [dataSource]);

  // load models when make or datasource changes
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
  }, [selectedMake, dataSource]);

  // load years when make+model or datasource changes
  useEffect(() => {
    if (selectedMake.trim() && selectedModel.trim()) {
      loadYears();
      setSelectedYear('');
    } else {
      setAutoComplete(prev => ({ ...prev, years: [] }));
      setSelectedYear('');
    }
  }, [selectedMake, selectedModel, dataSource]);

  // close dropdowns when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        makeDropdownRef.current &&
        !makeDropdownRef.current.contains(e.target as Node)
      ) {
        setShowMakeDropdown(false);
      }
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(e.target as Node)
      ) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // ── Data Loading fns ────────────────────────────────────────────────

  async function loadMakes() {
    try {
      setAutoComplete(prev => ({ ...prev, makesLoading: true }));

      const res = await fetch(`/api/spa/suggestions/makes`);

      const url = dataSource === 'database'
        ? `/api/db/makes${selectedMake ? `?search=${encodeURIComponent(selectedMake)}` : ''}`
        : `/api/spa/suggestions/makes`;
      const res = await fetch(url);

      if (!res.ok) throw new Error('Failed to load makes');
      const json = await res.json();
      setAutoComplete(prev => ({
        ...prev,
        makes: json.makes || [],
        makesLoading: false,
      }));
    } catch (err: unknown) {
      console.error(err);
      setAutoComplete(prev => ({ ...prev, makesLoading: false }));
    }
  }

  async function loadModels(make: string) {
    try {
      setAutoComplete(prev => ({ ...prev, modelsLoading: true }));

      const res = await fetch(
        `/api/spa/suggestions/models?make=${encodeURIComponent(make)}`
      );

      const url = dataSource === 'database'
        ? `/api/db/models?make=${encodeURIComponent(make)}${selectedModel ? `&search=${encodeURIComponent(selectedModel)}` : ''}`
        : `/api/spa/suggestions/models?make=${encodeURIComponent(make)}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error('Failed to load models');
      const json = await res.json();
      setAutoComplete(prev => ({
        ...prev,
        models: json.models || [],
        modelsLoading: false,
      }));
    } catch (err: unknown) {
      console.error(err);
      setAutoComplete(prev => ({ ...prev, modelsLoading: false }));
    }
  }

  async function loadYears() {
    try {
      setAutoComplete(prev => ({ ...prev, yearsLoading: true }));

      const res = await fetch(
        `/api/spa/suggestions/years?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}`
      );

      const url = dataSource === 'database'
        ? `/api/db/years?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}`
        : `/api/spa/suggestions/years?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}`;
      const res = await fetch(url);

      if (res.ok) {
        const json = await res.json();
        const yrs = Array.isArray(json.years)
          ? json.years.filter((y: any) => typeof y === 'number' && !isNaN(y))
          : [];
        setAutoComplete(prev => ({
          ...prev,
          years: yrs,
          yearsLoading: false,
        }));
        return;
      }
      setAutoComplete(prev => ({ ...prev, years: [], yearsLoading: false }));
    } catch (err: unknown) {
      console.error(err);
      setAutoComplete(prev => ({ ...prev, yearsLoading: false }));
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────

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

  // ── Search fn ─────────────────────────────────────────────────────

  async function handleSearch() {
    if (!selectedMake.trim() || !selectedModel.trim()) {
      setError('Please select make and model');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSupercarData(null);

    try {

      const params: any = {
        make: selectedMake.trim(),
        model: selectedModel.trim(),
        year: selectedYear ? Number(selectedYear) : undefined,
        dataSource: dataSource === 'webbase' ? 'webbase' : 'database',

      const params: SPASearchParams = {
        make: selectedMake.trim(),
        model: selectedModel.trim(),
        year: selectedYear ? Number(selectedYear) : undefined,
        dataSource,

      };
      const res = await fetch('/api/spa/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.error?.message || 'Search failed');

      if (json.data) {
        setSupercarData(json.data);

        // add to context history
        addSPAResult({
          id: `${selectedMake}-${selectedModel}-${
            selectedYear || 'any'
          }-${Date.now()}`,
          make: selectedMake,
          model: selectedModel,
          year: selectedYear
            ? Number(selectedYear)
            : new Date().getFullYear(),
          data: json.data,
          searchedAt: new Date(),

          source: dataSource === 'webbase' ? 'webbase' : 'database',
        });

        const entry: any = {

          source: dataSource,
        });

        const entry: SearchHistory = {

          id: Date.now().toString(),
          params,
          timestamp: new Date(),
          resultSummary: `${json.data.make} ${json.data.model} - £${
            json.data.pricingData?.averageDealerPrice
              ?.toLocaleString() ?? 'N/A'
          }`,

          dataSource: dataSource === 'webbase' ? 'webbase' : 'database',

          dataSource: json.data.dataSource,

        };
        setSearchHistory(prev => [entry, ...prev.slice(0, 9)]);
      } else {
        setError('No data found for this vehicle');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Search failed';
      console.error(err);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  // ── Quick-fill examples ──────────────────────────────────────────

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

  // ── JSX ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-black">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            🚘 Supercar Pricing Aggregator
          </h1>
          <p className="text-lg text-gray-700">
            Get comprehensive vehicle data from multiple REAL sources with
            live scraping
          </p>
        </div>

        {/* Source Selection */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Data Source Selection
          </h2>

          <div className="flex flex-wrap gap-4">
            {/* Webbase Source */}
            <button
              onClick={() => setDataSource('webbase')}
              className={`flex flex-col items-start px-6 py-4 rounded-xl border shadow-sm min-w-[220px] transition-all duration-150 ${
                dataSource === 'webbase'
                  ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-200'
                  : 'border-gray-300 bg-white'
              }`}
              aria-pressed={dataSource === 'webbase'}
            >
              <span className="flex items-center gap-2 mb-1">
                <span className="text-blue-600 text-xl">🔎</span>
                <span className="font-bold text-lg">Webbase</span>
                <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">LIVE API</span>
              </span>
              <span className="text-gray-700 text-sm">All sources combined (CarQuery, NHTSA, Wikipedia, etc). Recommended for most users.</span>
            </button>
            {/* Database Source */}
            <button
              onClick={() => setDataSource('database')}
              className={`flex flex-col items-start px-6 py-4 rounded-xl border shadow-sm min-w-[220px] transition-all duration-150 ${
                dataSource === 'database'
                  ? 'bg-yellow-50 border-yellow-600 ring-2 ring-yellow-200'
                  : 'border-gray-300 bg-white'
              }`}
              aria-pressed={dataSource === 'database'}
            >
              <span className="flex items-center gap-2 mb-1">
                <span className="text-gray-700 text-xl">💾</span>
                <span className="font-bold text-lg">Database</span>
                <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">FALLBACK</span>
              </span>
              <span className="text-gray-700 text-sm">Local data only. Use for owned/imported cars or when APIs are unavailable.</span>
            </button>

          <div className="flex flex-wrap gap-2">
            {(
              [
                'comprehensive',
                'carquery',
                'manufacturer',
                'market',
                'database',
              ] as const
            ).map(src => (
              <button
                key={src}
                onClick={() => setDataSource(src)}
                className={`px-4 py-2 rounded-lg border ${
                  dataSource === src
                    ? 'bg-blue-100 border-blue-500'
                    : 'border-gray-300'
                }`}
              >
                {src.charAt(0).toUpperCase() + src.slice(1)}
              </button>
            ))}

          </div>
        </div>

        {/* Quick-Fill */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Quick Fill from Database
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableCars.map((c, i) => (
              <button
                key={i}
                onClick={() => handleQuickFill(c)}
                className="p-4 border rounded hover:bg-blue-50 text-left"
              >
                <h3 className="font-semibold">
                  {c.make} {c.model}
                </h3>
                <p className="text-sm text-gray-600">Year: {c.year}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Search Form */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-6">Search Vehicle</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Make */}
            <div className="relative" ref={makeDropdownRef}>
              <label className="block mb-1">Make *</label>
              <input
                type="text"
                value={selectedMake}
                onChange={e => {
                  setSelectedMake(e.target.value);
                  setShowMakeDropdown(true);
                }}
                onFocus={() => setShowMakeDropdown(true)}
                className="w-full p-3 border rounded"
                placeholder="Type to search makes…"
              />
              {showMakeDropdown && (
                <ul className="absolute z-50 w-full bg-white border rounded max-h-52 overflow-y-auto">
                  {autoComplete.makesLoading ? (
                    <li className="p-2 text-center">Loading…</li>
                  ) : getFilteredMakes().length ? (
                    getFilteredMakes().map((m, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          setSelectedMake(m);
                          setShowMakeDropdown(false);
                        }}
                        className="p-2 hover:bg-blue-50 cursor-pointer"
                      >
                        {m}
                      </li>
                    ))
                  ) : (
                    <li className="p-2 text-center">No makes found</li>
                  )}
                </ul>
              )}
            </div>
            {/* Model */}
            <div className="relative" ref={modelDropdownRef}>
              <label className="block mb-1">Model *</label>
              <input
                type="text"
                value={selectedModel}
                onChange={e => {
                  setSelectedModel(e.target.value);
                  setShowModelDropdown(true);
                }}
                onFocus={() => setShowModelDropdown(true)}
                disabled={!selectedMake}
                className="w-full p-3 border rounded disabled:bg-gray-100"
                placeholder="Type to search models…"
              />
              {showModelDropdown && selectedMake && (
                <ul className="absolute z-50 w-full bg-white border rounded max-h-52 overflow-y-auto">
                  {autoComplete.modelsLoading ? (
                    <li className="p-2 text-center">Loading…</li>
                  ) : getFilteredModels().length ? (
                    getFilteredModels().map((m, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          setSelectedModel(m);
                          setShowModelDropdown(false);
                        }}
                        className="p-2 hover:bg-blue-50 cursor-pointer"
                      >
                        {m}
                      </li>
                    ))
                  ) : (
                    <li className="p-2 text-center">No models found</li>
                  )}
                </ul>
              )}
            </div>
            {/* Year */}
            <div>
              <label className="block mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                disabled={!selectedModel}
                className="w-full p-3 border rounded disabled:bg-gray-100"
              >
                <option value="">Select Year</option>
                {autoComplete.years.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            {/* Button */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isLoading || !selectedModel}
                className="w-full bg-blue-600 text-white p-3 rounded disabled:opacity-50"
              >
                {isLoading ? 'Searching…' : '🔍 Get Data'}
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-4 text-red-600">
              ❌ {error}
            </p>
          )}
        </div>

        {/* Recent Searches */}
        {searchHistory.length > 0 && (
          <div className="mb-8 bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl mb-4">Recent Searches</h3>
            <ul className="space-y-2">
              {searchHistory.slice(0, 5).map(h => (
                <li
                  key={h.id}
                  className="flex justify-between p-3 bg-gray-50 rounded hover:bg-gray-100"
                >
                  <span>{h.resultSummary}</span>
                  <button
                    onClick={() => {
                      setSelectedMake(h.params.make);
                      setSelectedModel(h.params.model);
                      setSelectedYear(
                        h.params.year?.toString() ?? ''
                      );
                      setDataSource(h.dataSource as any);
                    }}
                    className="text-blue-600"
                  >
                    Repeat
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Results */}
        {supercarData && (
          <div className="bg-white p-6 rounded-xl shadow space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold">
                🔍 COMPREHENSIVE DATA: {supercarData.make}{' '}
                {supercarData.model}
              </h2>
              <p className="mt-1 text-gray-600">
                Source: {supercarData.dataSource} • Year:{' '}
                {supercarData.year}
              </p>
            </div>

            {/* Basic Specifications */}
            {supercarData.basicSpecifications && (
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">
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

            {/* Performance */}
            {supercarData.performanceData && (
              <div>
                <h3 className="font-semibold text-green-600 mb-2">
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

            {/* Pricing */}
            {supercarData.pricingData && (
              <div>
                <h3 className="font-semibold text-red-600 mb-2">
                  💰 PRICING DATA
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeof supercarData.pricingData.baseMSRP ===
                    'number' && (
                    <div>
                      <strong>Base MSRP:</strong> £
                      {supercarData.pricingData.baseMSRP.toLocaleString()}
                    </div>
                  )}
                  <div>
                    <strong>Current Range:</strong>{' '}
                    {supercarData.pricingData.currentMarketRange}
                  </div>
                  <div>
                    <strong>Avg Dealer Price:</strong> £
                    {supercarData.pricingData.averageDealerPrice.toLocaleString()}
                  </div>
                  <div>
                    <strong>Inventory:</strong>{' '}
                    {supercarData.pricingData.dealerInventoryCount}
                  </div>
                  <div>
                    <strong>Trend:</strong>{' '}
                    {supercarData.pricingData.priceTrend}
                  </div>
                  {supercarData.pricingData.priceDistribution && (
                    <>
                      <div>
                        <strong>Min:</strong> £
                        {supercarData.pricingData.priceDistribution.min.toLocaleString()}
                      </div>
                      <div>
                        <strong>Max:</strong> £
                        {supercarData.pricingData.priceDistribution.max.toLocaleString()}
                      </div>
                      <div>
                        <strong>Median:</strong> £
                        {supercarData.pricingData.priceDistribution.median.toLocaleString()}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Popular Options */}
            {supercarData.popularOptions?.length && (
              <div>
                <h3 className="font-semibold text-orange-600 mb-2">
                  🔧 POPULAR OPTIONS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {supercarData.popularOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center bg-gray-100 p-3 rounded"
                    >
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      <span className="flex-1">{opt.name}</span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {opt.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Data */}
            {supercarData.marketData && (
              <div>
                <h3 className="font-semibold text-indigo-600 mb-2">
                  📊 MARKET DATA
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <strong>Avg Price:</strong> £
                    {supercarData.marketData.averagePrice.toLocaleString()}
                  </div>
                  <div>
                    <strong>Range:</strong>{' '}
                    {supercarData.marketData.priceRange}
                  </div>
                  <div>
                    <strong>Listings:</strong>{' '}
                    {supercarData.marketData.inventoryCount}
                  </div>
                  <div>
                    <strong>Source:</strong>{' '}
                    {supercarData.marketData.dataSource}
                  </div>
                </div>
                <ul className="space-y-2">
                  {supercarData.marketData.listings
                    .slice(0, 5)
                    .map((l, i) => (
                      <li
                        key={i}
                        className="p-3 bg-gray-100 rounded"
                      >
                        <p className="font-medium">{l.title}</p>
                        <p className="text-sm">
                          {l.price} • {l.specs}
                        </p>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Integration Actions */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => {
                  const opts =
                    supercarData.popularOptions?.map(o => o.name) ?? [];
                  console.log('Options:', opts);
                  console.log('Full data:', supercarData);
                  alert(`Extracted ${opts.length} options—check console.`);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                📊 Extract addedOptions
              </button>
              <button
                onClick={() => {
                  const integration = {
                    make: supercarData.make,
                    model: supercarData.model,
                    year: supercarData.year,
                    dealerPrice:
                      supercarData.pricingData?.averageDealerPrice,
                    baseMSRP: supercarData.pricingData?.baseMSRP,
                    addedOptions:
                      supercarData.popularOptions?.map(o => o.name),
                  };
                  navigator.clipboard.writeText(
                    JSON.stringify(integration, null, 2)
                  );
                  alert('Copied integration JSON');
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                📋 Copy Integration Data
              </button>
              <button
                onClick={() => {
                  console.log('Analysis data:', supercarData);
                  alert('Logged analysis to console');
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                📈 Analyze Results
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}