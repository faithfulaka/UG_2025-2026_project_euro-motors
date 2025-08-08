// src/app/admin/supercar-pricing/page.tsx - Simplified single API approach with proper null checks
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/solid';
import type { SPASuggestion, SPASuggestionResponse, SPASearchResponse, SimplifiedVehicleData } from '@/types/spa';

export default function SupercarPricingPage() {
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [makes, setMakes] = useState<SPASuggestion[]>([]);
  const [models, setModels] = useState<SPASuggestion[]>([]);
  const [years, setYears] = useState<SPASuggestion[]>([]);
  const [searchResult, setSearchResult] = useState<SimplifiedVehicleData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Fetch makes suggestions
  const fetchMakes = useCallback(async (q: string) => {
    try {
      const resp = await axios.get<SPASuggestionResponse>('/api/spa/suggestions', {
        params: { type: 'make', query: q.trim() },
      });
      if (resp.data.success) {
        setMakes(resp.data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching makes:', error);
      setMakes([]);
    }
  }, []);

  // Fetch models suggestions
  const fetchModels = useCallback(async (make: string, q: string) => {
    if (!make) {
      setModels([]);
      return;
    }
    try {
      const resp = await axios.get<SPASuggestionResponse>('/api/spa/suggestions', {
        params: { type: 'model', make, query: q.trim() },
      });
      if (resp.data.success) {
        setModels(resp.data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    }
  }, []);

  // Fetch years suggestions
  const fetchYears = useCallback(async (make: string, model: string) => {
    if (!make || !model) {
      setYears([]);
      return;
    }
    try {
      const resp = await axios.get<SPASuggestionResponse>('/api/spa/suggestions', {
        params: { type: 'year', make, model },
      });
      if (resp.data.success) {
        setYears(resp.data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching years:', error);
      setYears([]);
    }
  }, []);

  // Initialize makes on mount
  useEffect(() => {
    fetchMakes('');
  }, [fetchMakes]);

  // Reset model and year when make changes
  useEffect(() => {
    setSelectedModel('');
    setSelectedYear('');
    setYears([]);
    if (selectedMake) fetchModels(selectedMake, '');
  }, [selectedMake, fetchModels]);

  // Reset year when model changes
  useEffect(() => {
    setSelectedYear('');
    if (selectedMake && selectedModel) fetchYears(selectedMake, selectedModel);
  }, [selectedMake, selectedModel, fetchYears]);

  // Perform search
  const performSearch = useCallback(async () => {
    if (!selectedMake || !selectedModel || !selectedYear) {
      setSearchError('Please select make, model, and year');
      return;
    }
    
    setIsLoading(true);
    setSearchError('');
    setHasSearched(true);
    setSearchResult(null);
    
    try {
      const { data } = await axios.post<SPASearchResponse>('/api/spa/search', {
        make: selectedMake,
        model: selectedModel,
        year: parseInt(selectedYear)
      });
      
      if (data.success && data.data) {
        setSearchResult(data.data);
      } else {
        setSearchError(data.error?.message || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('Failed to search vehicle data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMake, selectedModel, selectedYear]);

  // Render search results - WITH PROPER NULL CHECKS
  const renderResults = () => {
    if (!hasSearched) return null;
    
    if (isLoading) {
      return (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            Loading vehicle data...
          </div>
        </div>
      );
    }

    if (searchError) {
      return (
        <div className="mt-6 p-4 bg-red-50 rounded-lg">
          <p className="text-red-600">{searchError}</p>
        </div>
      );
    }

    if (!searchResult) return null;

    const data = searchResult;

    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Vehicle Data</h2>
        
        {/* Main Result Card */}
        <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-black">
              {data.year} {data.make} {data.model}
            </h3>
            <p className="text-sm text-gray-600">Body Type: {data.bodyType || 'N/A'}</p>
          </div>

          {/* Basic Specifications */}
          {data.basicSpecifications && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Basic Specifications</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500">Engine:</span> {data.basicSpecifications.engine || 'N/A'}
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500">Engine CC:</span> {data.basicSpecifications.engineCC || 'N/A'}
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500">Cylinders:</span> {data.basicSpecifications.cylinders || 'N/A'}
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500">Doors:</span> {data.basicSpecifications.doors || 'N/A'}
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500">Seats:</span> {data.basicSpecifications.seats || 'N/A'}
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500">Drivetrain:</span> {data.basicSpecifications.drivetrain || 'N/A'}
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500">Transmission:</span> {data.basicSpecifications.transmission || 'N/A'}
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500">Fuel Type:</span> {data.basicSpecifications.fuelType || 'N/A'}
                </div>
              </div>
            </div>
          )}

          {/* Performance Data */}
          {data.performanceData && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Performance Data</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-green-50 p-2 rounded">
                  <span className="text-gray-500">Power:</span> {data.performanceData.horsePower || 'N/A'}
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <span className="text-gray-500">Torque:</span> {data.performanceData.torque || 'N/A'}
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <span className="text-gray-500">0-60:</span> {data.performanceData.acceleration060 || 'N/A'}
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <span className="text-gray-500">Top Speed:</span> {data.performanceData.topSpeed || 'N/A'}
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <span className="text-gray-500">Weight:</span> {data.performanceData.weight || 'N/A'}
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <span className="text-gray-500">Drive Type:</span> {data.performanceData.driveType || 'N/A'}
                </div>
              </div>
            </div>
          )}

          {/* Dimensions */}
          {data.dimensions && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Dimensions</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-blue-50 p-2 rounded">
                  <span className="text-gray-500">Length:</span> {data.dimensions.length || 'N/A'}
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <span className="text-gray-500">Width:</span> {data.dimensions.width || 'N/A'}
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <span className="text-gray-500">Height:</span> {data.dimensions.height || 'N/A'}
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <span className="text-gray-500">Wheelbase:</span> {data.dimensions.wheelbase || 'N/A'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-black">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Vehicle Data Search</h1>
        <p className="text-gray-600">Search vehicle data using CarQuery API</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Make Combobox */}
          <Combobox
            value={selectedMake}
            onChange={(val: string) => {
              setSelectedMake(val);
              setSelectedModel('');
              setSelectedYear('');
            }}
          >
            <div className="relative">
              <Combobox.Label className="block text-sm font-medium text-gray-700 mb-1">
                Make
              </Combobox.Label>
              <div className="relative">
                <Combobox.Input
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Select or type make..."
                  onChange={(e) => fetchMakes(e.currentTarget.value)}
                  displayValue={(val: string) => val}
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                </Combobox.Button>
              </div>
              <Combobox.Options className="absolute z-10 w-full bg-white border rounded-lg max-h-60 overflow-auto mt-1 shadow-lg">
                {makes.length === 0 && (
                  <div className="px-3 py-2 text-gray-500 text-sm">No makes found</div>
                )}
                {makes.map((item) => (
                  <Combobox.Option
                    key={item.value}
                    value={item.value}
                    className={({ active }) =>
                      `px-3 py-2 cursor-pointer text-sm ${
                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`
                    }
                  >
                    {item.displayName}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>

          {/* Model Combobox */}
          <Combobox
            value={selectedModel}
            onChange={(val: string) => {
              setSelectedModel(val);
              setSelectedYear('');
            }}
            disabled={!selectedMake}
          >
            <div className="relative">
              <Combobox.Label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </Combobox.Label>
              <div className="relative">
                <Combobox.Input
                  className="w-full p-2 border rounded-lg disabled:opacity-50 disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={selectedMake ? "Select or type model..." : "Select make first"}
                  onChange={(e) =>
                    selectedMake && fetchModels(selectedMake, e.currentTarget.value)
                  }
                  displayValue={(val: string) => val}
                  disabled={!selectedMake}
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                </Combobox.Button>
              </div>
              <Combobox.Options className="absolute z-10 w-full bg-white border rounded-lg max-h-60 overflow-auto mt-1 shadow-lg">
                {models.length === 0 && selectedMake && (
                  <div className="px-3 py-2 text-gray-500 text-sm">No models found</div>
                )}
                {models.map((item) => (
                  <Combobox.Option
                    key={item.value}
                    value={item.value}
                    className={({ active }) =>
                      `px-3 py-2 cursor-pointer text-sm ${
                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`
                    }
                  >
                    {item.displayName}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>

          {/* Year Combobox */}
          <Combobox
            value={selectedYear}
            onChange={(val: string) => setSelectedYear(val)}
            disabled={!selectedMake || !selectedModel}
          >
            <div className="relative">
              <Combobox.Label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </Combobox.Label>
              <div className="relative">
                <Combobox.Input
                  className="w-full p-2 border rounded-lg disabled:opacity-50 disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={selectedModel ? "Select year..." : "Select model first"}
                  displayValue={(val: string) => val}
                  disabled={!selectedMake || !selectedModel}
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                </Combobox.Button>
              </div>
              <Combobox.Options className="absolute z-10 w-full bg-white border rounded-lg max-h-60 overflow-auto mt-1 shadow-lg">
                {years.length === 0 && selectedModel && (
                  <div className="px-3 py-2 text-gray-500 text-sm">No years found</div>
                )}
                {years.map((item) => (
                  <Combobox.Option
                    key={item.value}
                    value={item.value}
                    className={({ active }) =>
                      `px-3 py-2 cursor-pointer text-sm ${
                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`
                    }
                  >
                    {item.displayName}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={performSearch}
            disabled={!selectedMake || !selectedModel || !selectedYear || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors font-medium"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
          
          <button
            onClick={() => {
              setSearchResult(null);
              setSearchError('');
              setHasSearched(false);
            }}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Results Display */}
      {renderResults()}
    </div>
  );
}
