// src/app/admin/supercar-pricing/page.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/solid';
import type { SPASuggestion, SPASuggestionResponse } from '@/types/spa';

export default function SupercarPricingPage() {
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [source, setSource] = useState<'webbase' | 'database'>('webbase');
  const [makes, setMakes] = useState<SPASuggestion[]>([]);
  const [models, setModels] = useState<SPASuggestion[]>([]);
  const [years, setYears] = useState<SPASuggestion[]>([]);
  const [searchResult, setSearchResult] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');

  const fetchMakes = useCallback(async (q: string) => {
    const resp = await axios.get<SPASuggestionResponse>('/api/spa/suggestions/makes', {
      params: { source, search: q.trim() },
    });
    setMakes(resp.data.suggestions);
  }, [source]);

  const fetchModels = useCallback(async (make: string, q: string) => {
    if (!make) {
      setModels([]);
      return;
    }
    const resp = await axios.get<SPASuggestionResponse>('/api/spa/suggestions/models', {
      params: { source, make, search: q.trim() },
    });
    setModels(resp.data.suggestions);
  }, [source]);

  const fetchYears = useCallback(async (make: string, model: string) => {
    if (!make || !model) {
      setYears([]);
      return;
    }
    const resp = await axios.get<SPASuggestionResponse>('/api/spa/suggestions/years', {
      params: { source, make, model },
    });
    setYears(resp.data.suggestions);
  }, [source]);

  useEffect(() => {
    setSelectedMake('');
    setSelectedModel('');
    setSelectedYear('');
    setModels([]);
    setYears([]);
    fetchMakes('');
  }, [source, fetchMakes]);

  useEffect(() => {
    setSelectedModel('');
    setSelectedYear('');
    setModels([]);
    setYears([]);
    if (selectedMake) fetchModels(selectedMake, '');
  }, [selectedMake, fetchModels]);

  useEffect(() => {
    setSelectedYear('');
    setYears([]);
    if (selectedMake && selectedModel) fetchYears(selectedMake, selectedModel);
  }, [selectedMake, selectedModel, fetchYears]);

  const fetchSearch = useCallback(async () => {
    if (!selectedMake || !selectedModel || !selectedYear) {
      setSearchError('Please select make, model, and year');
      return;
    }
    setIsLoading(true);
    setSearchError('');
    try {
      const { data } = await axios.get('/api/spa/search', {
        params: { source, make: selectedMake, model: selectedModel, year: selectedYear },
      });
      setSearchResult(data);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, [source, selectedMake, selectedModel, selectedYear]);

  return (
    <div className="p-8 max-w-4xl mx-auto text-black">
      <h1 className="text-3xl font-bold mb-6">Supercar Pricing</h1>

      {/* Data Source Buttons */}
      <div className="flex gap-4 mb-8">
        {(['webbase', 'database'] as const).map(key => (
          <button
            key={key}
            onClick={() => setSource(key)}
            className={`flex-1 p-3 border rounded ${
              source === key ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
            }`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      {/* Form Inputs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Make Combobox */}
        <Combobox value={selectedMake} onChange={(val: string) => {
          setSelectedMake(val);
          setSelectedModel('');
          setSelectedYear('');
          fetchModels(val, '');
        }}>
          <div className="relative">
            <Combobox.Input
              className="w-full p-2 border rounded"
              onChange={e => fetchMakes(e.target.value)}
              displayValue={(val: string) => val}
              placeholder="Make"
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </Combobox.Button>
            <Combobox.Options className="absolute z-10 w-full bg-white border rounded max-h-48 overflow-auto mt-1">
              {makes.map(item => (
                <Combobox.Option
                  key={item.value}
                  value={item.value}
                  className={({ active }) => `px-2 py-1 cursor-pointer ${active ? 'bg-blue-100' : ''}`}
                >
                  {item.displayName}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </div>
        </Combobox>

        {/* Model Combobox */}
        <Combobox value={selectedModel} onChange={(val: string) => {
          setSelectedModel(val);
          setSelectedYear('');
          fetchYears(selectedMake, val);
        }} disabled={!selectedMake}>
          <div className="relative">
            <Combobox.Input
              className="w-full p-2 border rounded disabled:opacity-50"
              onChange={e => fetchModels(selectedMake, e.target.value)}
              displayValue={(val: string) => val}
              placeholder="Model"
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </Combobox.Button>
            <Combobox.Options className="absolute z-10 w-full bg-white border rounded max-h-48 overflow-auto mt-1">
              {models.map(item => (
                <Combobox.Option
                  key={item.value}
                  value={item.value}
                  className={({ active }) => `px-2 py-1 cursor-pointer ${active ? 'bg-blue-100' : ''}`}
                >
                  {item.displayName}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </div>
        </Combobox>

        {/* Year Combobox */}
        <Combobox value={selectedYear} onChange={(val: string) => setSelectedYear(val)} disabled={!selectedModel}>
          <div className="relative">
            <Combobox.Input
              className="w-full p-2 border rounded disabled:opacity-50"
              placeholder="Year"
              displayValue={(val: string) => val}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </Combobox.Button>
            <Combobox.Options className="absolute z-10 w-full bg-white border rounded max-h-48 overflow-auto mt-1">
              {years.map(item => (
                <Combobox.Option
                  key={item.value}
                  value={item.value}
                  className={({ active }) => `px-2 py-1 cursor-pointer ${active ? 'bg-blue-100' : ''}`}
                >
                  {item.displayName}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </div>
        </Combobox>
      </div>

      {/* Search Button */}
      <div className="mb-6">
        <button
          onClick={fetchSearch}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Error or Result */}
      {searchError && (
        <div className="text-red-600 mb-4">{searchError}</div>
      )}
      {searchResult && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(searchResult, null, 2)}
        </pre>
      )}
    </div>
  );
}