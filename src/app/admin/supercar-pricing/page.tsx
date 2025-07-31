// src/app/admin/supercar-pricing/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCar } from '@/context/CarContext';
import type { ComprehensiveSPAData, SPASearchParams, SPAServiceResponse, SPAMakesResponse, SPAModelsResponse, } from '@/types/spa';

// --- Types ---
type DataSource = SPASearchParams['dataSource'];

// --- Local types ---
interface AutoCompleteState {
  makes: string[];
  models: string[];
  years: number[];
  makesLoading: boolean;
  modelsLoading: boolean;
  yearsLoading: boolean;
}

// --- Component ---
export default function SupercarPricingAggregatorPage() {
  const { addSPAResult } = useCar();

  // Search form state
  const [selectedMake, setSelectedMake]   = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear]   = useState<string>('');
  const [dataSource, setDataSource]       = useState<DataSource>('comprehensive');

  // Results state
  const [supercarData, setSupercarData] = useState<ComprehensiveSPAData | null>(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  // Auto-complete state
  const [autoComplete, setAutoComplete] = useState<AutoCompleteState>({
    makes: [], models: [], years: [],
    makesLoading: false, modelsLoading: false, yearsLoading: false,
  });

  // Dropdown visibility
  const [showMakeDropdown, setShowMakeDropdown]   = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Refs for click-outside
  const makeRef  = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  // --- Fetchers wrapped in useCallback ---
  const loadMakes = useCallback(async () => {
    setAutoComplete(a => ({ ...a, makesLoading: true }));
    try {
      const res = await fetch(`/api/spa/makes?source=${dataSource}`);
      const js  = (await res.json()) as SPAMakesResponse;
      setAutoComplete(a => ({
        ...a,
        makes: js.makes ?? [],
        makesLoading: false,
      }));
    } catch {
      setAutoComplete(a => ({ ...a, makesLoading: false }));
    }
  }, [dataSource]);

  const loadModels = useCallback(async (make: string) => {
    setAutoComplete(a => ({ ...a, modelsLoading: true }));
    try {
      const res = await fetch(
        `/api/spa/models?make=${encodeURIComponent(make)}&source=${dataSource}`
      );
      const js = (await res.json()) as SPAModelsResponse;
      setAutoComplete(a => ({
        ...a,
        models: js.models ?? [],
        modelsLoading: false,
      }));
    } catch {
      setAutoComplete(a => ({ ...a, modelsLoading: false }));
    }
  }, [dataSource]);

  const loadYears = useCallback(async () => {
    setAutoComplete(a => ({ ...a, yearsLoading: true }));
    try {
      if (dataSource === 'database') {
        const res = await fetch(
          `/api/spa/suggestions?type=years&make=${encodeURIComponent(
            selectedMake
          )}&model=${encodeURIComponent(selectedModel)}`
        );
        if (res.ok) {
          const { data } = await res.json() as { data?: Array<{ value: string }> };
          const yrs = data?.map(d => parseInt(d.value, 10)).filter(Boolean) ?? [];
          setAutoComplete(a => ({ ...a, years: yrs, yearsLoading: false }));
          return;
        }
      }
      // fallback last 6 years
      const cy = new Date().getFullYear();
      setAutoComplete(a => ({
        ...a,
        years: Array.from({ length: 6 }, (_, i) => cy - i),
        yearsLoading: false,
      }));
    } catch {
      setAutoComplete(a => ({ ...a, yearsLoading: false }));
    }
  }, [dataSource, selectedMake, selectedModel]);

  // --- Effects ---
  useEffect(() => { loadMakes(); }, [loadMakes]);
  useEffect(() => {
    if (selectedMake.trim()) {
      loadModels(selectedMake);
      setSelectedModel(''); setSelectedYear('');
    } else {
      setAutoComplete(a => ({ ...a, models: [], years: [] }));
    }
  }, [selectedMake, loadModels]);
  useEffect(() => {
    if (selectedMake && selectedModel) {
      loadYears();
      setSelectedYear('');
    } else {
      setAutoComplete(a => ({ ...a, years: [] }));
    }
  }, [selectedMake, selectedModel, loadYears]);

  // close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (makeRef.current && !makeRef.current.contains(e.target as Node)) {
        setShowMakeDropdown(false);
      }
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // --- Helpers ---
  const filterList = (list: string[], q: string) =>
    list.filter(x => x.toLowerCase().includes(q.toLowerCase())).slice(0, 10);

  // --- Search handler ---
  const handleSearch = useCallback(async () => {
    if (!selectedMake || !selectedModel) {
      setError('Please select make and model');
      return;
    }
    setIsLoading(true); setError(null);
    try {
      const params: SPASearchParams = {
        make: selectedMake, model: selectedModel,
        year: selectedYear ? +selectedYear : undefined,
        dataSource,
      };
      const res  = await fetch('/api/spa/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const js   = await res.json() as SPAServiceResponse<ComprehensiveSPAData>;
      if (!js.success || !js.data) {
        throw new Error(js.error?.message ?? 'No data');
      }
      setSupercarData(js.data);
      addSPAResult({
        id: `${params.make}-${params.model}-${params.year ?? 'any'}-${Date.now()}`,
        make: params.make,
        model: params.model,
        year: params.year ?? new Date().getFullYear(),
        data: js.data,
        searchedAt: new Date(),
        source: dataSource,
      });
    } catch (err: any) {
      setError(err.message);
      setSupercarData(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedMake,
    selectedModel,
    selectedYear,
    dataSource,
    addSPAResult,
  ]);

  // --- Options for dataSource picker ---
  const sources: DataSource[] = [
    'comprehensive',
    'carquery',
    'manufacturer',
    'market',
    'database',
  ];

  // --- Render ---
  return (
    <div className="p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">Supercar Pricing Aggregator</h1>

      {/* DataSource */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Data Source</label>
        <div className="flex gap-2">
          {sources.map(src => (
            <button
              key={src}
              onClick={() => setDataSource(src)}
              className={`px-3 py-1 rounded ${
                dataSource === src
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border'
              }`}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Fill */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { make: 'Bentley', model: 'Bentayga V8', year: 2022 },
          { make: 'Rolls Royce', model: 'Cullinan V12', year: 2022 },
          { make: 'Bentley', model: 'Continental GT V8', year: 2022 },
        ].map((c, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedMake(c.make);
              setSelectedModel(c.model);
              setSelectedYear(String(c.year));
              setDataSource('database');
            }}
            className="p-3 bg-white border rounded"
          >
            {c.make} {c.model} ({c.year})
          </button>
        ))}
      </div>

      {/* Search Form */}
      <div className="bg-white p-6 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Make */}
        <div ref={makeRef} className="relative">
          <input
            value={selectedMake}
            onChange={e => {
              setSelectedMake(e.target.value);
              setShowMakeDropdown(true);
            }}
            onFocus={() => setShowMakeDropdown(true)}
            placeholder="Make"
            className="w-full p-2 border rounded"
          />
          {showMakeDropdown && (
            <ul className="absolute top-full left-0 right-0 bg-white border max-h-40 overflow-auto z-10">
              {autoComplete.makesLoading
                ? <li className="p-2">Loading…</li>
                : filterList(autoComplete.makes, selectedMake).map((m,i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setSelectedMake(m);
                        setShowMakeDropdown(false);
                      }}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {m}
                    </li>
                  ))
              }
            </ul>
          )}
        </div>

        {/* Model */}
        <div ref={modelRef} className="relative">
          <input
            value={selectedModel}
            onChange={e => {
              setSelectedModel(e.target.value);
              setShowModelDropdown(true);
            }}
            onFocus={() => setShowModelDropdown(true)}
            placeholder="Model"
            disabled={!selectedMake}
            className="w-full p-2 border rounded disabled:bg-gray-100"
          />
          {showModelDropdown && selectedMake && (
            <ul className="absolute top-full left-0 right-0 bg-white border max-h-40 overflow-auto z-10">
              {autoComplete.modelsLoading
                ? <li className="p-2">Loading…</li>
                : filterList(autoComplete.models, selectedModel).map((m,i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setSelectedModel(m);
                        setShowModelDropdown(false);
                      }}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {m}
                    </li>
                  ))
              }
            </ul>
          )}
        </div>

        {/* Year */}
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          disabled={!selectedMake || !selectedModel}
          className="w-full p-2 border rounded disabled:bg-gray-100"
        >
          <option value="">Year (optional)</option>
          {autoComplete.years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={isLoading || !selectedMake || !selectedModel}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Searching…' : '🔍 Get Data'}
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Results */}
      {supercarData && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">
            {supercarData.make} {supercarData.model} ({supercarData.year})
          </h2>
          {/* render basicSpecifications, performanceData, pricingData, etc. */}
          {/* … */}
        </div>
      )}
    </div>
  );
}