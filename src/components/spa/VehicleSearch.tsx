// src/components/spa/VehicleSearch.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface VehicleSearchProps {
  onResults?: (results: any) => void;
  showDemo?: boolean;
}

interface SearchFormData {
  make: string;
  model: string;
  year: string;
}

interface Suggestion {
  value: string;
  label: string;
  source: string;
  popular?: boolean;
}

export default function VehicleSearch({ onResults, showDemo = false }: VehicleSearchProps) {
  const [formData, setFormData] = useState<SearchFormData>({
    make: '',
    model: '',
    year: ''
  });
  const [suggestions, setSuggestions] = useState<{
    makes: Suggestion[];
    models: Suggestion[];
    years: Suggestion[];
  }>({
    makes: [],
    models: [],
    years: []
  });
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // Load makes on component mount
  useEffect(() => {
    loadSuggestions('make');
  }, []);

  // Load models when make changes
  useEffect(() => {
    if (formData.make) {
      loadSuggestions('model', formData.make);
      setFormData(prev => ({ ...prev, model: '', year: '' }));
    }
  }, [formData.make]);

  // Load years when model changes
  useEffect(() => {
    if (formData.make && formData.model) {
      loadSuggestions('year', formData.make, formData.model);
      setFormData(prev => ({ ...prev, year: '' }));
    }
  }, [formData.model]);

  const loadSuggestions = async (type: 'make' | 'model' | 'year', make?: string, model?: string) => {
    try {
      const params = new URLSearchParams({ 
        type,
        source: 'web' // Use web sources (CarQuery) for vehicle search, not database
      });
      if (make) params.set('make', make);
      if (model) params.set('model', model);

      const response = await fetch(`/api/spa/suggestions?${params}`);
      const data = await response.json();

      if (data.success) {
        setSuggestions(prev => ({
          ...prev,
          [type === 'year' ? 'years' : `${type}s`]: data.suggestions
        }));
      }
    } catch (err) {
      console.error(`Error loading ${type} suggestions:`, err);
    }
  };

  const handleInputChange = (field: keyof SearchFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSearch = async () => {
    if (!formData.make || !formData.model) {
      setError('Please select both make and model');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        make: formData.make,
        model: formData.model,
        source: 'comprehensive'
      });
      if (formData.year) params.set('year', formData.year);

      const response = await fetch(`/api/spa/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data);
        onResults?.(data.data);
      } else {
        setError(data.error?.message || 'Search failed');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const runDemo = async () => {
    // Demo with BMW X5 2023
    setFormData({ make: 'BMW', model: 'X5', year: '2023' });
    setLoading(true);
    
    try {
      const response = await fetch('/api/spa/search?make=BMW&model=X5&year=2023&source=comprehensive');
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
        onResults?.(data.data);
      }
    } catch (err) {
      console.error('Demo error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <MagnifyingGlassIcon className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-800">Vehicle Search</h2>
        <div className="text-sm text-gray-500 bg-green-50 px-2 py-1 rounded">
          Using Reliable APIs
        </div>
      </div>

      {showDemo && (
        <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <InformationCircleIcon className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">Demo Mode</span>
          </div>
          <p className="text-red-700 text-sm mb-3">
            Try our new reliable API integration with a sample search.
          </p>
          <button
            onClick={runDemo}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
            disabled={loading}
          >
            Run Demo (BMW X5 2023)
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Make Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Make
          </label>
          <select
            value={formData.make}
            onChange={(e) => handleInputChange('make', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">Select Make</option>
            {suggestions.makes.map((make, index) => (
              <option key={index} value={make.value}>
                {make.label} {make.popular && '⭐'}
              </option>
            ))}
          </select>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <select
            value={formData.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={loading || !formData.make}
          >
            <option value="">Select Model</option>
            {suggestions.models.map((model, index) => (
              <option key={index} value={model.value}>
                {model.label} {model.popular && '⭐'}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year (Optional)
          </label>
          <select
            value={formData.year}
            onChange={(e) => handleInputChange('year', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={loading || !formData.model}
          >
            <option value="">Select Year</option>
            {suggestions.years.map((year, index) => (
              <option key={index} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleSearch}
        disabled={loading || !formData.make || !formData.model}
        className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Searching...
          </>
        ) : (
          <>
            <MagnifyingGlassIcon className="w-4 h-4" />
            Search Vehicle Data
          </>
        )}
      </button>

      {/* Search Results Preview */}
      {searchResults && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Search Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Vehicle:</span>
              <p>{searchResults.make} {searchResults.model} {searchResults.year}</p>
            </div>
            <div>
              <span className="font-medium">Body Type:</span>
              <p>{searchResults.bodyType || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium">Data Sources:</span>
              <p>
                {Object.entries(searchResults.dataSources || {})
                  .filter(([_, active]) => active)
                  .map(([source]) => source)
                  .join(', ')
                }
              </p>
            </div>
            <div>
              <span className="font-medium">Market Price:</span>
              <p>{searchResults.pricingData?.currentMarketRange || 'N/A'}</p>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            Search completed in {searchResults.searchQuery?.executionTime || 0}ms using reliable APIs
          </div>
        </div>
      )}
    </div>
  );
}