/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AutoCompleteState {
  makes: string[];
  models: string[];
  years: number[];
  makesLoading: boolean;
  modelsLoading: boolean;
  yearsLoading: boolean;
}

function SupercarPricingAggregatorPage() {
  // ── Search State ─────────────────────────────────────────────────────
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [_selectedYear, setSelectedYear] = useState<string>('');
  const [dataSource, setDataSource] = useState<'webbase' | 'database'>('webbase');

  const [supercarData, _setSupercarData] = useState<any | null>(null);

  // ── Auto-complete State ─────────────────────────────────────────────

  const [autoComplete, setAutoComplete] = useState<AutoCompleteState>({
    makes: [],
    models: [],
    years: [],
    makesLoading: false,
    modelsLoading: false,
    yearsLoading: false,
  });

  const [showMakeDropdown, setShowMakeDropdown] = useState<boolean>(false);
  const makeDropdownRef = useRef<HTMLDivElement>(null);

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
      // Removed modelDropdownRef and setShowModelDropdown handling
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // ── Data Loading fns ────────────────────────────────────────────────

  async function loadMakes() {
    try {
      setAutoComplete(prev => ({ ...prev, makesLoading: true }));

      const url =
        dataSource === 'database'
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

      const url =
        dataSource === 'database'
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

      const url =
        dataSource === 'database'
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

  // ── Get Data Handler ───────────────────────────────────────────
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function handleGetData(e: React.FormEvent) {
    e.preventDefault();
    setSearchLoading(true);
    setSearchError(null);
    _setSupercarData(null);
    try {
      const url = dataSource === 'database'
        ? '/api/db/search'
        : '/api/spa/search';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: selectedMake,
          model: selectedModel,
          year: _selectedYear,
          dataSource,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.data) {
        setSearchError(json.error?.message || 'No data found for this vehicle.');
      } else {
        _setSupercarData(json.data);
      }
    } catch (err: any) {
      setSearchError(err.message || 'Failed to fetch data.');
    } finally {
      setSearchLoading(false);
    }
  }

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

        {/* Dynamic Search Bar */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-4">Search Vehicle</h2>
          <form className="flex flex-col md:flex-row gap-4 items-end" onSubmit={handleGetData}>
            {/* Make Dropdown */}
            <div className="flex-1">
              <label className="block mb-1 font-medium">Make *</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="Type to search makes..."
                value={selectedMake}
                onChange={e => setSelectedMake(e.target.value)}
                list="makes-list"
                autoComplete="off"
                disabled={autoComplete.makesLoading}
              />
              <datalist id="makes-list">
                {autoComplete.makes.map((make, idx) => (
                  <option key={idx} value={make} />
                ))}
              </datalist>
            </div>
            {/* Model Dropdown */}
            <div className="flex-1">
              <label className="block mb-1 font-medium">Model *</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="Type to search models..."
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                list="models-list"
                autoComplete="off"
                disabled={!selectedMake || autoComplete.modelsLoading}
              />
              <datalist id="models-list">
                {autoComplete.models.map((model, idx) => (
                  <option key={idx} value={model} />
                ))}
              </datalist>
            </div>
            {/* Year Dropdown */}
            <div className="flex-1">
              <label className="block mb-1 font-medium">Year</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={_selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                disabled={!selectedMake || !selectedModel || autoComplete.yearsLoading}
              >
                <option value="">Select Year</option>
                {autoComplete.years.map((year, idx) => (
                  <option key={idx} value={year}>{year}</option>
                ))}
              </select>
            </div>
            {/* Get Data Button */}
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-60"
              disabled={!(selectedMake && selectedModel && _selectedYear)}
            >
              🔍 Get Data
            </button>
          </form>
        </div>
        {/* Search Loading/Error States */}
        {searchLoading && (
          <div className="my-4 text-blue-600 font-semibold flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            Fetching vehicle data...
          </div>
        )}
        {searchError && (
          <div className="my-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong> {searchError}
          </div>
        )}
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

        {/* Make Dropdown */}
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

        {/* Popular Options */}
        {supercarData?.popularOptions && (
          <div>
            <h3 className="font-semibold text-orange-600 mb-2">
              🔧 POPULAR OPTIONS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supercarData.popularOptions.map((opt: { name: string; source: string }, idx: number) => (
                <div key={idx} className="flex items-center bg-gray-100 p-3 rounded">
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
        {supercarData?.marketData && (
          <div>
            <h3 className="font-semibold text-indigo-600 mb-2">
              📊 MARKET DATA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <strong>Avg Price:</strong> £{supercarData.marketData.averagePrice.toLocaleString()}
              </div>
              <div>
                <strong>Range:</strong> {supercarData.marketData.priceRange}
              </div>
              <div>
                <strong>Listings:</strong> {supercarData.marketData.inventoryCount}
              </div>
              <div>
                <strong>Source:</strong> {supercarData.marketData.dataSource}
              </div>
            </div>
            <ul className="space-y-2">
              {supercarData.marketData.listings.slice(0, 5).map((l: { title: string; price: string; specs: string }, i: number) => (
                <li key={i} className="p-3 bg-gray-100 rounded">
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
              const opts = supercarData?.popularOptions?.map((o: { name: string }) => o.name) ?? [];
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
                make: supercarData?.make,
                model: supercarData?.model,
                year: supercarData?.year,
                dealerPrice: supercarData?.pricingData?.averageDealerPrice,
                baseMSRP: supercarData?.pricingData?.baseMSRP,
                addedOptions: supercarData?.popularOptions?.map((o: { name: string }) => o.name),
              };
              navigator.clipboard.writeText(JSON.stringify(integration, null, 2));
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

export default SupercarPricingAggregatorPage;