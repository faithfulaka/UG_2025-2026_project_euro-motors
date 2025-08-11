// src/app/admin/supercar-pricing/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/solid';
import type { SPASuggestion, SPASearchResponse, ComprehensiveSPAData } from '@/types/spa';

// Define year range for manual selection when API doesn't have data
const generateYearRange = (startYear: number = 1990) => {
  const currentYear = new Date().getFullYear() + 1;
  const years = [];
  for (let year = currentYear; year >= startYear; year--) {
    years.push(year.toString());
  }
  return years;
};

export default function ImprovedSupercarPricingPage() {
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [allowManualYear, setAllowManualYear] = useState(false);
  
  const [makes, setMakes] = useState<SPASuggestion[]>([]);
  const [models, setModels] = useState<SPASuggestion[]>([]);
  const [years, setYears] = useState<SPASuggestion[]>([]);
  const [manualYears] = useState(generateYearRange());
  
  const [searchResult, setSearchResult] = useState<SPASearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<Record<string, boolean>>({
    carQuery: false,
    database: false,
    ebay: false
  });

  // Check which APIs are available on mount
  useEffect(() => {
    checkAPIStatus();
  }, []);

  const checkAPIStatus = async () => {
    try {
      // Check CarQuery
      const carQueryTest = await axios.get('/api/spa/suggestions?type=make').catch(() => null);
      setApiStatus(prev => ({ ...prev, carQuery: !!carQueryTest?.data?.suggestions?.length }));
      
      // Check Database
      const dbTest = await axios.get('/api/admin/cars?type=buy').catch(() => null);
      setApiStatus(prev => ({ ...prev, database: !!dbTest?.data?.data }));
      
      // Check if eBay is configured (you'd need to add an endpoint for this)
      setApiStatus(prev => ({ ...prev, ebay: !!process.env.NEXT_PUBLIC_EBAY_APP_ID }));
    } catch (error) {
      console.error('Error checking API status:', error);
    }
  };

  // Fetch makes
  const fetchMakes = useCallback(async (query: string = '') => {
    try {
      const res = await axios.get('/api/spa/suggestions', {
        params: { type: 'make', query }
      });
      setMakes(res.data.suggestions || []);
      
      // If no makes from API, add some common luxury brands
      if (res.data.suggestions?.length === 0) {
        const commonMakes = [
          'Ferrari', 'Lamborghini', 'Porsche', 'McLaren', 'Aston Martin',
          'Bentley', 'Rolls-Royce', 'Bugatti', 'Mercedes-Benz', 'BMW'
        ].map(make => ({
          value: make,
          label: make,
          displayName: make,
          type: 'make' as const,
          source: 'manual' as const
        }));
        setMakes(commonMakes);
      }
    } catch (error) {
      console.error('Error fetching makes:', error);
      // Fallback to common makes
      const commonMakes = [
        'Ferrari', 'Lamborghini', 'Porsche', 'McLaren', 'Aston Martin'
      ].map(make => ({
        value: make,
        label: make,
        displayName: make,
        type: 'make' as const,
        source: 'manual' as const
      }));
      setMakes(commonMakes);
    }
  }, []);

  // Fetch models
  const fetchModels = useCallback(async (make: string, query: string = '') => {
    if (!make) {
      setModels([]);
      return;
    }
    
    try {
      const res = await axios.get('/api/spa/suggestions', {
        params: { type: 'model', make, query }
      });
      setModels(res.data.suggestions || []);
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    }
  }, []);

  // Fetch years
  const fetchYears = useCallback(async (make: string, model: string) => {
    if (!make || !model) {
      setYears([]);
      return;
    }
    
    try {
      const res = await axios.get('/api/spa/suggestions', {
        params: { type: 'year', make, model }
      });
      
      if (res.data.suggestions && res.data.suggestions.length > 0) {
        setYears(res.data.suggestions);
        setAllowManualYear(false);
      } else {
        // No years found - allow manual selection
        setYears([]);
        setAllowManualYear(true);
      }
    } catch (error) {
      console.error('Error fetching years:', error);
      setYears([]);
      setAllowManualYear(true);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    fetchMakes();
  }, [fetchMakes]);

  // Handle make change
  useEffect(() => {
    if (selectedMake) {
      fetchModels(selectedMake);
    }
  }, [selectedMake, fetchModels]);

  // Handle model change
  useEffect(() => {
    if (selectedMake && selectedModel) {
      fetchYears(selectedMake, selectedModel);
    }
  }, [selectedMake, selectedModel, fetchYears]);

  // Perform search
  const performSearch = async () => {
    if (!selectedMake || !selectedModel || !selectedYear) {
      setSearchError('Please select make, model, and year');
      return;
    }
    
    setIsLoading(true);
    setSearchError('');
    
    try {
      const res = await axios.post('/api/spa/search', {
        make: selectedMake,
        model: selectedModel,
        year: parseInt(selectedYear),
        source: 'comprehensive'
      });
      
      setSearchResult(res.data);
    } catch (error) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setSearchError(err.response?.data?.error?.message || err.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedMake('');
    setSelectedModel('');
    setSelectedYear('');
    setSearchResult(null);
    setSearchError('');
    setAllowManualYear(false);
  };

  // Handle make selection with proper typing
  const handleMakeChange = (value: string) => {
    setSelectedMake(value);
    setSelectedModel('');
    setSelectedYear('');
  };

  // Handle model selection with proper typing
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    setSelectedYear('');
  };

  // Handle year selection with proper typing
  const handleYearChange = (value: string) => {
    setSelectedYear(value);
  };

  const renderSearchForm = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Vehicle Search</h2>
        <div className="flex items-center space-x-2 text-xs">
          {Object.entries(apiStatus).map(([api, status]) => (
            <span
              key={api}
              className={`px-2 py-1 rounded ${
                status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {api}: {status ? '✓' : '✗'}
            </span>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Make Selection */}
        <Combobox value={selectedMake} onChange={handleMakeChange}>
          <div className="relative">
            <Combobox.Label className="block text-sm font-medium text-gray-700 mb-1">
              Make
            </Combobox.Label>
            <div className="relative">
              <Combobox.Input
                className="w-full p-2 border rounded-lg"
                placeholder="Type to search or select..."
                onChange={(e) => fetchMakes(e.target.value)}
                displayValue={(val: string) => val}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </Combobox.Button>
            </div>
            <Combobox.Options className="absolute z-10 w-full bg-white border rounded-lg max-h-60 overflow-auto mt-1 shadow-lg">
              {makes.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  Type to search makes...
                </div>
              ) : (
                makes.map((make) => (
                  <Combobox.Option
                    key={make.value}
                    value={make.value}
                    className={({ active }) =>
                      `px-3 py-2 cursor-pointer text-sm ${
                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`
                    }
                  >
                    {make.displayName}
                    {make.count && (
                      <span className="text-gray-500 text-xs ml-2">
                        ({make.count} in DB)
                      </span>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </div>
        </Combobox>

        {/* Model Selection */}
        <Combobox
          value={selectedModel}
          onChange={handleModelChange}
          disabled={!selectedMake}
        >
          <div className="relative">
            <Combobox.Label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </Combobox.Label>
            <div className="relative">
              <Combobox.Input
                className="w-full p-2 border rounded-lg disabled:opacity-50"
                placeholder={selectedMake ? "Type to search models..." : "Select make first"}
                onChange={(e) => selectedMake && fetchModels(selectedMake, e.target.value)}
                displayValue={(val: string) => val}
                disabled={!selectedMake}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </Combobox.Button>
            </div>
            <Combobox.Options className="absolute z-10 w-full bg-white border rounded-lg max-h-60 overflow-auto mt-1 shadow-lg">
              {models.length === 0 && selectedMake ? (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No models found. Type model name manually.
                </div>
              ) : (
                models.map((model) => (
                  <Combobox.Option
                    key={model.value}
                    value={model.value}
                    className={({ active }) =>
                      `px-3 py-2 cursor-pointer text-sm ${
                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`
                    }
                  >
                    {model.displayName}
                    {model.count && (
                      <span className="text-gray-500 text-xs ml-2">
                        ({model.count})
                      </span>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </div>
        </Combobox>

        {/* Year Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
            {allowManualYear && (
              <span className="text-xs text-orange-600 ml-2">
                (Manual selection - no API data)
              </span>
            )}
          </label>
          {allowManualYear ? (
            // Manual year dropdown when API has no data
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2 border rounded-lg"
              disabled={!selectedModel}
            >
              <option value="">Select year...</option>
              {manualYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          ) : (
            // API-driven year selection
            <Combobox
              value={selectedYear}
              onChange={handleYearChange}
              disabled={!selectedModel}
            >
              <div className="relative">
                <div className="relative">
                  <Combobox.Input
                    className="w-full p-2 border rounded-lg disabled:opacity-50"
                    placeholder={selectedModel ? "Select year..." : "Select model first"}
                    displayValue={(val: string) => val}
                    disabled={!selectedModel}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                  </Combobox.Button>
                </div>
                <Combobox.Options className="absolute z-10 w-full bg-white border rounded-lg max-h-60 overflow-auto mt-1 shadow-lg">
                  {years.length === 0 && selectedModel ? (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      No years found. Try manual selection.
                    </div>
                  ) : (
                    years.map((year) => (
                      <Combobox.Option
                        key={year.value}
                        value={year.value}
                        className={({ active }) =>
                          `px-3 py-2 cursor-pointer text-sm ${
                            active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                          }`
                        }
                      >
                        {year.displayName}
                      </Combobox.Option>
                    ))
                  )}
                </Combobox.Options>
              </div>
            </Combobox>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={performSearch}
            disabled={!selectedMake || !selectedModel || !selectedYear || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={clearAll}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg"
          >
            Clear
          </button>
        </div>
        
        {/* Manual Year Toggle */}
        {!allowManualYear && selectedModel && years.length === 0 && (
          <button
            onClick={() => setAllowManualYear(true)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Switch to manual year selection →
          </button>
        )}
      </div>

      {/* Error Display */}
      {searchError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {searchError}
        </div>
      )}
    </div>
  );

  const renderResults = () => {
    if (!searchResult || !searchResult.success) return null;
    
    const data = searchResult.data as ComprehensiveSPAData;
    if (!data) return null;
    
    return (
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {data.year} {data.make} {data.model}
          </h2>
          <div className="flex gap-2 mb-4">
            {Object.entries(data.dataSources || {})
              .filter(([, active]) => active)
              .map(([source]) => (
                <span key={source} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  {source}
                </span>
              ))}
          </div>
        </div>
        
        {/* Results content - simplified for readability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.basicSpecifications && (
            <div>
              <h3 className="font-semibold mb-2">Specifications</h3>
              <div className="space-y-1 text-sm">
                <p>Engine: {data.basicSpecifications.engine}</p>
                <p>Transmission: {data.basicSpecifications.transmission}</p>
                <p>Fuel: {data.basicSpecifications.fuelType}</p>
                <p>Body: {data.bodyType}</p>
              </div>
            </div>
          )}
          
          {data.pricingData && (
            <div>
              <h3 className="font-semibold mb-2">Pricing</h3>
              <div className="space-y-1 text-sm">
                <p>Range: {data.pricingData.currentMarketRange}</p>
                <p>Avg Price: £{data.pricingData.averageDealerPrice?.toLocaleString()}</p>
                {data.pricingData.priceTrend && <p>Trend: {data.pricingData.priceTrend}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Supercar Pricing Tool (Improved)</h1>
        <p className="text-gray-600">
          Search vehicle data with automatic fallback for missing years
        </p>
      </div>
      
      {renderSearchForm()}
      {renderResults()}
      
      {/* Help Section */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• If years don&apos;t appear, use manual selection or type a custom year</li>
          <li>• CarQuery API is free but may not have all luxury/exotic models</li>
          <li>• Database results show only if you have matching cars in your system</li>
          <li>• For best results, add cars manually to your database</li>
        </ul>
      </div>
    </div>
  );
}
