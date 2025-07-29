/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';


import React, { useState, useEffect, useRef } from 'react';
// TODO: Restore CarContext and types if available


interface AutoCompleteState {
  makes: string[];
  models: string[];
  years: number[];
  makesLoading: boolean;
  modelsLoading: boolean;
  yearsLoading: boolean;
}


// TODO: Restore SearchHistory type if available

function SupercarPricingAggregatorPage() {
  // const { addSPAResult } = useCar(); // Uncomment if CarContext exists


  // ── Search State ─────────────────────────────────────────────────────

  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [dataSource, setDataSource] = useState<

    'webbase' | 'database'
  >('webbase');

  const [supercarData, setSupercarData] = useState<any | null>(null);

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

        // Add to local search history
        const entry: any = {
          id: Date.now().toString(),
          params,
          timestamp: new Date(),
          resultSummary: `${json.data.make} ${json.data.model} - £${
            json.data.pricingData?.averageDealerPrice?.toLocaleString() ?? 'N/A'
          }`,
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

  // ── JSX ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Supercar Pricing Aggregator
        </h1>
        <div>
          <p className="text-lg text-gray-700">
            Get comprehensive vehicle data from multiple REAL sources with
            live scraping
          </p>
        </div>

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
          </div>
        </div>

        {/*
          Quick-Fill
        */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Quick Fill from Database
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableCars.map((c: { make: string; model: string; year: number }, i: number) => (
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

              {/* ... */}
              {showMakeDropdown && (
                <ul className="absolute z-50 w-full bg-white border rounded max-h-52 overflow-y-auto">
                  {autoComplete.makesLoading ? (
                    <li className="p-2 text-center">Loading…</li>
                  ) : getFilteredMakes().length ? (
                    getFilteredMakes().map((m: string, idx: number) => (
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

              {/* ... */}
              <>
                {supercarData.popularOptions && (
                  <div>
                    <h3 className="font-semibold text-orange-600 mb-2">
                      🔧 POPULAR OPTIONS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {supercarData.popularOptions?.map((opt: { name: string; source: string }, idx: number) => (
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
                        .map((l: { title: string; price: string; specs: string }, i: number) => (
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
              </>

            {/* Integration Actions */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => {
                  const opts =
                    supercarData.popularOptions?.map((o: { name: string }) => o.name) ?? [];
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
                      supercarData.popularOptions?.map((o: { name: string }) => o.name),
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
        </div>
      );
    }
  }
  export default SupercarPricingAggregatorPage;