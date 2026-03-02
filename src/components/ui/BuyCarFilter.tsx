// src/components/ui/BuyCarFilter.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BuyCarFilterProps {
  onFilter: (filters: FilterData) => void;
  className?: string;
}

interface FilterData {
  make?: string;
  model?: string;
  year?: string;
  minPrice?: number;
  maxPrice?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
}

interface Suggestion {
  value: string;
  label: string;
  count?: number;
}

export default function BuyCarFilter({ onFilter, className = '' }: BuyCarFilterProps) {
  const [filters, setFilters] = useState<FilterData>({});
  const [suggestions, setSuggestions] = useState<{
    makes: Suggestion[];
    models: Suggestion[];
    years: Suggestion[];
    bodyTypes: Suggestion[];
    fuelTypes: Suggestion[];
    transmissions: Suggestion[];
  }>({
    makes: [],
    models: [],
    years: [],
    bodyTypes: [],
    fuelTypes: [],
    transmissions: []
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load makes on component mount (from database)
  useEffect(() => {
    loadSuggestions('make');
    loadStaticSuggestions();
  }, []);

  // Load models when make changes
  useEffect(() => {
    if (filters.make) {
      loadSuggestions('model', filters.make);
      setFilters(prev => ({ ...prev, model: undefined, year: undefined }));
    }
  }, [filters.make]);

  // Load years when model changes
  useEffect(() => {
    if (filters.make && filters.model) {
      loadSuggestions('year', filters.make, filters.model);
      setFilters(prev => ({ ...prev, year: undefined }));
    }
  }, [filters.model]);

  const loadSuggestions = async (type: 'make' | 'model' | 'year', make?: string, model?: string) => {
    try {
      const params = new URLSearchParams({ 
        type,
        source: 'database' // Use database source for filtering existing inventory
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

  const loadStaticSuggestions = async () => {
    try {
      // Get unique body types, fuel types, and transmissions from database
      const response = await fetch('/api/buy/filter-options');
      const data = await response.json();

      if (data.success) {
        setSuggestions(prev => ({
          ...prev,
          bodyTypes: data.bodyTypes || [],
          fuelTypes: data.fuelTypes || [],
          transmissions: data.transmissions || []
        }));
      }
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  };

  const handleFilterChange = (field: keyof FilterData, value: any) => {
    const newFilters = { ...filters, [field]: value || undefined };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    // Remove undefined values
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key as keyof FilterData] = value;
      }
      return acc;
    }, {} as FilterData);

    onFilter(cleanFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilter({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filter Cars</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 md:hidden"
        >
          {isExpanded ? <XMarkIcon className="w-5 h-5" /> : <FunnelIcon className="w-5 h-5" />}
        </button>
      </div>

      <div className={`space-y-4 ${!isExpanded && 'hidden md:block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Make Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Make
            </label>
            <select
              value={filters.make || ''}
              onChange={(e) => handleFilterChange('make', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black bg-white"
            >
              <option value="">All Makes</option>
              {suggestions.makes.map((make, index) => (
                <option key={index} value={make.value}>
                  {make.label} {make.count && `(${make.count})`}
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
              value={filters.model || ''}
              onChange={(e) => handleFilterChange('model', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black bg-white"
              disabled={!filters.make}
            >
              <option value="">All Models</option>
              {suggestions.models.map((model, index) => (
                <option key={index} value={model.value}>
                  {model.label} {model.count && `(${model.count})`}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={filters.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black bg-white"
              disabled={!filters.model}
            >
              <option value="">All Years</option>
              {suggestions.years.map((year, index) => (
                <option key={index} value={year.value}>
                  {year.label} {year.count && `(${year.count})`}
                </option>
              ))}
            </select>
          </div>

          {/* Body Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body Type
            </label>
            <select
              value={filters.bodyType || ''}
              onChange={(e) => handleFilterChange('bodyType', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black bg-white"
            >
              <option value="">All Body Types</option>
              {suggestions.bodyTypes.map((type, index) => (
                <option key={index} value={type.value}>
                  {type.label} {type.count && `(${type.count})`}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Type
            </label>
            <select
              value={filters.fuelType || ''}
              onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black bg-white"
            >
              <option value="">All Fuel Types</option>
              {suggestions.fuelTypes.map((type, index) => (
                <option key={index} value={type.value}>
                  {type.label} {type.count && `(${type.count})`}
                </option>
              ))}
            </select>
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transmission
            </label>
            <select
              value={filters.transmission || ''}
              onChange={(e) => handleFilterChange('transmission', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black bg-white"
            >
              <option value="">All Transmissions</option>
              {suggestions.transmissions.map((type, index) => (
                <option key={index} value={type.value}>
                  {type.label} {type.count && `(${type.count})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Price (£)
            </label>
            <input
              type="number"
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black bg-white"
              placeholder="No minimum"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price (£)
            </label>
            <input
              type="number"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm text-black bg-white"
              placeholder="No maximum"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={applyFilters}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition text-sm font-medium"
          >
            Apply Filters
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition text-sm font-medium text-gray-700"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}