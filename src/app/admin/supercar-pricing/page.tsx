// src/app/admin/supercar-pricing/page.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function SupercarPricingPage() {
  // Form state
  const [selectedMake, setSelectedMake]   = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear]   = useState('');
  const [makes, setMakes]   = useState<{ label: string; value: string }[]>([]);
  const [models, setModels] = useState<{ label: string; value: string }[]>([]);
  const [years, setYears]   = useState<{ label: string; value: string }[]>([]);

  // Data source toggle
  const [source, setSource] = useState<'webbase'|'database'>('webbase');

  // Quick-fill examples
  const quickFills = [
    { make: 'Bentley',     model: 'Bentayga V8',       year: '2022' },
    { make: 'Rolls Royce', model: 'Cullinan V12',      year: '2022' },
    { make: 'Bentley',     model: 'Continental GT V8', year: '2022' },
  ];

  // Fetchers
  const fetchMakes   = async (q: string) => {
    const resp = await axios.get('/api/spa/suggestions/makes', { params: { source, search: q.trim() } });
    const suggestions = resp.data.suggestions as Array<{ value: string; displayName: string }>;
    setMakes(suggestions.map(s => ({ label: s.displayName, value: s.value })));
  };
  const fetchModels  = async (make: string, q: string) => {
    const resp = await axios.get('/api/spa/suggestions/models', { params: { source, make, search: q.trim() } });
    const suggestions = resp.data.suggestions as Array<{ value: string; displayName: string }>;
    setModels(suggestions.map(s => ({ label: s.displayName, value: s.value })));
  };
  const fetchYears   = async (make: string, model: string) => {
    const resp = await axios.get('/api/spa/suggestions/years', { params: { source, make, model } });
    const suggestions = resp.data.suggestions as Array<{ value: string; displayName: string }>;
    setYears(suggestions.map(s => ({ label: s.displayName, value: s.value })));
  };

  // Reset when source changes
  useEffect(() => {
    fetchMakes('');
    setSelectedMake('');
    setSelectedModel('');
    setSelectedYear('');
  }, [source]);

  // When make changes → models
  useEffect(() => {
    if (selectedMake) {
      setSelectedModel('');
      setSelectedYear('');
      fetchModels(selectedMake, '');
    } else {
      setModels([]);
      setYears([]);
    }
  }, [selectedMake, source]);

  // When model changes → years
  useEffect(() => {
    if (selectedMake && selectedModel) {
      setSelectedYear('');
      fetchYears(selectedMake, selectedModel);
    } else {
      setYears([]);
    }
  }, [selectedMake, selectedModel, source]);

  // Search state
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [searchError, setSearchError]   = useState<string|null>(null);

  const fetchSearch = useCallback(async () => {
    if (!selectedMake || !selectedModel || !selectedYear) {
      setSearchError('Please select make, model, and year');
      return;
    }
    try {
      setIsLoading(true);
      setSearchError(null);
      const { data } = await axios.get('/api/spa/search', {
        params: { source, make: selectedMake, model: selectedModel, year: selectedYear },
      });
      setSearchResult(data);
    } catch (err: any) {
      setSearchError(err.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, [source, selectedMake, selectedModel, selectedYear]);

  return (
    <div className="p-8 max-w-4xl mx-auto text-black">
      <h1 className="text-3xl font-bold mb-6">Supercar Pricing</h1>

      {/* Data Source Selection */}
      <h2 className="text-xl font-semibold mb-4">🗂️ Data Source Selection</h2>
      <div className="flex gap-4 mb-8">
        {[
          { key: 'webbase',  label: '🔍 Webbase',  desc: 'Live API data'   },
          { key: 'database', label: '🗄️ Database', desc: 'Local data only' },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => setSource(opt.key as any)}
            className={`flex-1 p-4 border rounded ${
              source === opt.key ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <div className="font-medium">{opt.label}</div>
            <div className="text-sm text-gray-600">{opt.desc}</div>
          </button>
        ))}
      </div>

      {/* Quick Fill */}
      <h2 className="text-xl font-semibold mb-4">⚡ Quick Fill</h2>
      <div className="flex gap-4 mb-8">
        {quickFills.map(q => (
          <div
            key={`${q.make}-${q.model}`}
            onClick={() => {
              setSelectedMake(q.make);
              setSelectedModel(q.model);
              setSelectedYear(q.year);
            }}
            className="cursor-pointer flex-1 p-4 border rounded hover:bg-gray-100"
          >
            <div className="font-medium">{q.make} {q.model}</div>
            <div className="text-sm text-gray-600">Year: {q.year}</div>
            <div className="text-blue-600 text-sm">👉 Click to auto-fill</div>
          </div>
        ))}
      </div>

      {/* Search Vehicle */}
      <h2 className="text-xl font-semibold mb-4">🔎 Search Vehicle</h2>
      <div className="flex gap-4 mb-6">
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Make"
            className="border p-2 rounded w-full text-black"
            value={selectedMake}
            onChange={e => { setSelectedMake(e.target.value); fetchMakes(e.target.value); }}
            list="make-options"
          />
          <datalist id="make-options">
            {makes.map(m => <option key={m.value} value={m.value} />)}
          </datalist>
        </div>
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Model"
            className="border p-2 rounded w-full text-black"
            value={selectedModel}
            onChange={e => { setSelectedModel(e.target.value); fetchModels(selectedMake, e.target.value); }}
            list="model-options"
          />
          <datalist id="model-options">
            {models.map(m => <option key={m.value} value={m.value} />)}
          </datalist>
        </div>
        <div className="relative w-1/3">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="border p-2 rounded w-full text-black bg-white"
          >
            <option value="" disabled>Year</option>
            {years.length === 0
              ? <option value="" disabled>No years available</option>
              : years.map(y => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))
            }
          </select>
        </div>
      </div>

      <button
        onClick={fetchSearch}
        className="bg-black text-white px-6 py-2 rounded mb-4"
        disabled={isLoading}
      >
        {isLoading ? 'Loading…' : 'Search'}
      </button>
      {searchError && <p className="text-red-600 mt-2">{searchError}</p>}

      {searchResult && (
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
          {JSON.stringify(searchResult, null, 2)}
        </pre>
      )}
    </div>
  );
}