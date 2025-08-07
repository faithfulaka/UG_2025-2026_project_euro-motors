// src/app/admin/supercar-pricing/page.tsx - Restored to use working individual endpoints
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/solid';
import type { SPASuggestion, SPASuggestionResponse, SPASearchResponse, ComprehensiveSPAData } from '@/types/spa';
import type { BuyCar, CarSpecifications, CarFeatures, PerformanceData, PricingData } from '@/types/cars';


export default function SupercarPricingPage() {
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [source, setSource] = useState<'comprehensive' | 'database'>('comprehensive');
  const [makes, setMakes] = useState<SPASuggestion[]>([]);
  const [models, setModels] = useState<SPASuggestion[]>([]);
  const [years, setYears] = useState<SPASuggestion[]>([]);
  const [searchResult, setSearchResult] = useState<SPASearchResponse | null>(null);
  const [databaseCars, setDatabaseCars] = useState<BuyCar[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Fetch makes suggestions using restored working endpoints
  const fetchMakes = useCallback(
    async (q: string) => {
      try {
        const apiSource = source === 'database' ? 'database' : 'webbase';
        const resp = await axios.get<SPASuggestionResponse>('/api/spa/suggestions/makes', {
          params: { source: apiSource, search: q.trim() },
        });
        setMakes(resp.data.suggestions);
      } catch (error) {
        console.error('Error fetching makes:', error);
        // Fallback to unified endpoint if individual endpoint fails
        try {
          const fallbackResp = await axios.get<SPASuggestionResponse>('/api/spa/suggestions', {
            params: { type: 'make', query: q.trim() },
          });
          setMakes(fallbackResp.data.suggestions);
        } catch (fallbackError) {
          console.error('Fallback makes fetch also failed:', fallbackError);
          setMakes([]);
        }
      }
    },
    [source]
  );

  // Fetch models suggestions using restored working endpoints
  const fetchModels = useCallback(
    async (make: string, q: string) => {
      if (!make) {
        setModels([]);
        return;
      }
      try {
        const apiSource = source === 'database' ? 'database' : 'webbase';
        const resp = await axios.get<SPASuggestionResponse>('/api/spa/suggestions/models', {
          params: { source: apiSource, make, search: q.trim() },
        });
        setModels(resp.data.suggestions);
      } catch (error) {
        console.error('Error fetching models:', error);
        // Fallback to unified endpoint
        try {
          const fallbackResp = await axios.get<SPASuggestionResponse>('/api/spa/suggestions', {
            params: { type: 'model', make, query: q.trim() },
          });
          setModels(fallbackResp.data.suggestions);
        } catch (fallbackError) {
          console.error('Fallback models fetch also failed:', fallbackError);
          setModels([]);
        }
      }
    },
    [source]
  );

  // Fetch years suggestions using restored working endpoints
  const fetchYears = useCallback(
    async (make: string, model: string) => {
      if (!make || !model) {
        setYears([]);
        return;
      }
      try {
        const apiSource = source === 'database' ? 'database' : 'webbase';
        const resp = await axios.get<SPASuggestionResponse>('/api/spa/suggestions/years', {
          params: { source: apiSource, make, model },
        });
        setYears(resp.data.suggestions);
      } catch (error) {
        console.error('Error fetching years:', error);
        // Fallback to unified endpoint
        try {
          const fallbackResp = await axios.get<SPASuggestionResponse>('/api/spa/suggestions', {
            params: { type: 'year', make, model },
          });
          setYears(fallbackResp.data.suggestions);
        } catch (fallbackError) {
          console.error('Fallback years fetch also failed:', fallbackError);
          setYears([]);
        }
      }
    },
    [source]
  );

  // Reset on source change
  useEffect(() => {
    setSelectedMake('');
    setSelectedModel('');
    setSelectedYear('');
    setModels([]);
    setYears([]);
    setSearchResult(null);
    setDatabaseCars([]);
    setHasSearched(false);
    fetchMakes('');
  }, [source, fetchMakes]);

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
  const fetchSearch = useCallback(async () => {
    if (!selectedMake || !selectedModel || !selectedYear) {
      setSearchError('⚠️ Please select make, model, and year');
      return;
    }
    
    setIsLoading(true);
    setSearchError('');
    setHasSearched(true);
    setDatabaseCars([]);
    
    try {
      if (source === 'database') {
        // For database source, fetch directly from the database
        const { data } = await axios.get('/api/admin/cars', {
          params: { type: 'buy' },
          headers: {
            // Add auth header if needed
          }
        });
        
        // Filter cars based on selected criteria
        const filteredCars = data.data?.filter((car: BuyCar) => 
          car.make.toLowerCase() === selectedMake.toLowerCase() &&
          car.model.toLowerCase() === selectedModel.toLowerCase() &&
          car.year === parseInt(selectedYear)
        ) || [];
        
        setDatabaseCars(filteredCars);
      } else {
        // For comprehensive source, use SPA search
        const { data } = await axios.post<SPASearchResponse>('/api/spa/search', {
          make: selectedMake,
          model: selectedModel,
          year: parseInt(selectedYear),
          source: 'comprehensive'
        });
        
        setSearchResult(data);
      }
    } catch (err) {
      console.error('Search error:', err);
      const error = err as Error | { response?: { data?: { error?: { message?: string } } }; message?: string };
      const errorMessage = 
        ('response' in error && error.response?.data?.error?.message) || 
        (error instanceof Error ? error.message : 'Search failed');
      setSearchError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [source, selectedMake, selectedModel, selectedYear]);

  // Render database results
  const renderDatabaseResults = () => {
    if (!hasSearched || source !== 'database') return null;
    
    if (isLoading) {
      return (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            Loading database results...
          </div>
        </div>
      );
    }

    if (databaseCars.length === 0) {
      return (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No database results found for {selectedMake} {selectedModel} {selectedYear}
          </p>
        </div>
      );
    }

    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Database Results ({databaseCars.length} found)</h2>
        <div className="space-y-4">
          {databaseCars.map((car: BuyCar) => {
            const specs = car.specifications as CarSpecifications;
            const features = car.features as CarFeatures;
            const performanceData = car.performanceData as PerformanceData | null;
            const pricingData = car.pricingData as PricingData | null;

            return (
              <div key={car.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-black">
                      {car.year} {car.make} {car.model} {car.trim || ''}
                    </h3>
                    <p className="text-sm text-gray-600">ID: {car.id}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      £{car.price.toLocaleString()}
                    </div>
                    {car.baseMSRP && (
                      <div className="text-sm text-gray-500">
                        MSRP: £{car.baseMSRP.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Basic Specs</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Engine:</span> {specs.engine || 'N/A'}</p>
                      <p><span className="text-gray-500">Power:</span> {specs.horsePower || 'N/A'} HP</p>
                      <p><span className="text-gray-500">Transmission:</span> {specs.transmission || 'N/A'}</p>
                      <p><span className="text-gray-500">Fuel:</span> {specs.fuelType || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Performance</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Top Speed:</span> {specs.topSpeed || performanceData?.topSpeed || 'N/A'}</p>
                      <p><span className="text-gray-500">0-60:</span> {specs.acceleration60 || performanceData?.acceleration060 || 'N/A'}</p>
                      <p><span className="text-gray-500">Weight:</span> {specs.weight || performanceData?.weight || 'N/A'}</p>
                      <p><span className="text-gray-500">Drive:</span> {specs.driveType || performanceData?.driveType || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Color:</span> {specs.color || 'N/A'}</p>
                      <p><span className="text-gray-500">Interior:</span> {specs.interiorColor || 'N/A'}</p>
                      <p><span className="text-gray-500">Mileage:</span> {specs.mileage?.toLocaleString() || 'N/A'} miles</p>
                      <p><span className="text-gray-500">Body:</span> {specs.bodyType || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                {features && (features.interior?.length > 0 || features.exterior?.length > 0 || features.safety?.length > 0) && (
                  <div className="border-t pt-3 mt-3 mb-3">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      {features.interior?.length > 0 && (
                        <div>
                          <strong>Interior:</strong> {features.interior.slice(0, 3).join(', ')}
                          {features.interior.length > 3 && ` +${features.interior.length - 3} more`}
                        </div>
                      )}
                      {features.exterior?.length > 0 && (
                        <div>
                          <strong>Exterior:</strong> {features.exterior.slice(0, 3).join(', ')}
                          {features.exterior.length > 3 && ` +${features.exterior.length - 3} more`}
                        </div>
                      )}
                      {features.safety?.length > 0 && (
                        <div>
                          <strong>Safety:</strong> {features.safety.slice(0, 3).join(', ')}
                          {features.safety.length > 3 && ` +${features.safety.length - 3} more`}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Performance Data Section */}
                {performanceData && (
                  <div className="border-t pt-3 mt-3 mb-3">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Performance Data</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div><span className="text-gray-500">Engine:</span> {performanceData.engine}</div>
                      <div><span className="text-gray-500">Power:</span> {performanceData.horsePower}</div>
                      <div><span className="text-gray-500">Torque:</span> {performanceData.torque}</div>
                      <div><span className="text-gray-500">0-60:</span> {performanceData.acceleration060}</div>
                    </div>
                  </div>
                )}

                {/* Market Data Section */}
                {pricingData && (
                  <div className="border-t pt-3 mt-3">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Market Data</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div><span className="text-gray-500">Avg Dealer:</span> £{pricingData.averageDealerPrice?.toLocaleString() || 'N/A'}</div>
                      <div><span className="text-gray-500">Inventory:</span> {pricingData.dealerInventoryCount || 'N/A'} units</div>
                      <div><span className="text-gray-500">Range:</span> {pricingData.currentMarketRange || 'N/A'}</div>
                      <div><span className="text-gray-500">Trend:</span> {pricingData.priceTrend || 'N/A'}</div>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
                  Available: {car.isAvailable ? '✅ Yes' : '❌ No'} | 
                  Created: {new Date(car.createdAt).toLocaleDateString()} | 
                  Updated: {new Date(car.updatedAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render comprehensive SPA results
  const renderComprehensiveResults = () => {
    if (!hasSearched || source !== 'comprehensive') return null;
  
    if (isLoading) {
      return (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            Loading comprehensive data from hybrid APIs (CarQuery + new APIs)...
          </div>
        </div>
      );
    }
  
    if (!searchResult || !searchResult.success) {
      return (
        <div className="mt-6 p-4 bg-red-50 rounded-lg">
          <p className="text-red-600">Search failed: {searchError || 'Unknown error'}</p>
        </div>
      );
    }

    const data = searchResult.data as ComprehensiveSPAData;
    if (!data) return null;

    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Comprehensive SPA Results (Hybrid: Working CarQuery + New APIs)</h2>
        
        {/* Main Result Card */}
        <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-black">
                {data.year} {data.make} {data.model} {data.trim || ''}
              </h3>
              <p className="text-sm text-gray-600">Body Type: {data.bodyType || 'N/A'}</p>
            </div>
            {data.pricingData && (
              <div className="text-right">
                <div className="text-sm text-gray-500">Market Range</div>
                <div className="text-xl font-bold text-green-600">
                  {data.pricingData.currentMarketRange}
                </div>
                {data.pricingData.baseMSRP && (
                  <div className="text-sm text-gray-500">
                    MSRP: £{data.pricingData.baseMSRP.toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Data Sources Used - Updated to show hybrid approach */}
          <div className="mb-6 p-3 bg-blue-50 rounded border border-blue-200">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">Hybrid Data Sources (Working CarQuery + New APIs):</h4>
            <div className="flex flex-wrap gap-2">
              {data.dataSources.database && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Database</span>
              )}
              {data.dataSources.carQuery && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">CarQuery API ✅ Working</span>
              )}
              {data.dataSources.manufacturer && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Edmunds API</span>
              )}
              {data.dataSources.market && (
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">MarketCheck API</span>
              )}
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">CIS Automotive (when available)</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Car Data API (when available)</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              ✅ Primary: Working CarQuery API for suggestions • Secondary: New APIs when available • Fallback: Database
            </p>
          </div>

          {/* Basic Specifications */}
          {data.basicSpecifications && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Basic Specifications</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500">Engine:</span> {data.basicSpecifications.engine}
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500">Doors:</span> {data.basicSpecifications.doors}
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500">Seats:</span> {data.basicSpecifications.seats}
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
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500">Engine CC:</span> {data.basicSpecifications.engineCC || 'N/A'}
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500">Cylinders:</span> {data.basicSpecifications.cylinders || 'N/A'}
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
                  <span className="text-gray-500">Power:</span> {data.performanceData.horsePower}
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <span className="text-gray-500">Torque:</span> {data.performanceData.torque}
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <span className="text-gray-500">0-60:</span> {data.performanceData.acceleration060}
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <span className="text-gray-500">Top Speed:</span> {data.performanceData.topSpeed}
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <span className="text-gray-500">Weight:</span> {data.performanceData.weight}
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <span className="text-gray-500">Drive Type:</span> {data.performanceData.driveType}
                </div>
                {data.performanceData.fuelEconomy && (
                  <div className="bg-green-50 p-2 rounded col-span-2">
                    <span className="text-gray-500">Fuel Economy:</span> {data.performanceData.fuelEconomy}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing Data */}
          {data.pricingData && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Market Pricing Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-yellow-50 p-2 rounded">
                  <span className="text-gray-500">Avg Dealer Price:</span> £{data.pricingData.averageDealerPrice.toLocaleString()}
                </div>
                <div className="bg-yellow-50 p-2 rounded">
                  <span className="text-gray-500">Dealer Inventory:</span> {data.pricingData.dealerInventoryCount} units
                </div>
                <div className="bg-yellow-50 p-2 rounded">
                  <span className="text-gray-500">Price Trend:</span> {data.pricingData.priceTrend}
                </div>
                {data.pricingData.priceDistribution && (
                  <>
                    <div className="bg-yellow-50 p-2 rounded">
                      <span className="text-gray-500">Min Price:</span> £{data.pricingData.priceDistribution.min.toLocaleString()}
                    </div>
                    <div className="bg-yellow-50 p-2 rounded">
                      <span className="text-gray-500">Max Price:</span> £{data.pricingData.priceDistribution.max.toLocaleString()}
                    </div>
                    <div className="bg-yellow-50 p-2 rounded">
                      <span className="text-gray-500">Median Price:</span> £{data.pricingData.priceDistribution.median.toLocaleString()}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Popular Options */}
          {data.popularOptions && data.popularOptions.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Popular Options</h4>
              <div className="flex flex-wrap gap-2">
                {data.popularOptions.map((option, index) => (
                  <span key={index} className="bg-gray-100 px-3 py-1 rounded text-sm">
                    {option.name}
                    {option.frequency && option.frequency > 1 && (
                      <span className="ml-1 text-xs text-gray-500">({option.frequency})</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* API Performance Indicator */}
          <div className="mb-6 p-3 bg-green-50 rounded border border-green-200">
            <h4 className="font-semibold text-sm text-green-900 mb-2">Hybrid API Performance:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div><span className="text-green-700">CarQuery:</span> ✅ Working & Fast</div>
              <div><span className="text-green-700">Reliability:</span> CarQuery Proven</div>
              <div><span className="text-green-700">New APIs:</span> When Available</div>
              <div><span className="text-green-700">Fallback:</span> Database Always</div>
            </div>
          </div>

          {/* Metadata */}
          <div className="text-xs text-gray-500 mt-4 pt-4 border-t">
            <div className="flex justify-between">
              <span>Search performed: {new Date(data.timestamp).toLocaleString()}</span>
              {data.cacheExpiry && (
                <span>Cache expires: {new Date(data.cacheExpiry).toLocaleString()}</span>
              )}
            </div>
            <div className="mt-1 text-blue-600">
              🔄 Hybrid Approach: Working CarQuery API + New APIs (when available) + Database fallback
            </div>
          </div>
        </div>

        {/* Raw JSON Data (Collapsible) */}
        <details className="bg-white border rounded-lg p-4">
          <summary className="cursor-pointer font-semibold text-gray-700 hover:text-blue-600">
            View Raw JSON Response
          </summary>
          <pre className="mt-4 bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(searchResult, null, 2)}
          </pre>
        </details>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-black">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Supercar Pricing Aggregator 🚘</h1>
        <p className="text-gray-600">Search comprehensive vehicle data from hybrid API sources</p>
        <div className="mt-2 p-2 bg-blue-100 rounded text-blue-800 text-sm">
          🔄 <strong>Hybrid Approach</strong>: Working CarQuery API for suggestions + New APIs when available + Database fallback
        </div>
      </div>

      {/* Source Selection */}
      <div className="flex gap-4 mb-8">
        {(['comprehensive', 'database'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setSource(key)}
            className={`flex-1 p-3 border rounded-lg transition-all ${
              source === key
                ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-sm'
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            {key === 'comprehensive' ? '🌐 Comprehensive (Hybrid APIs)' : '💾 Database Only'}
          </button>
        ))}
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
              fetchModels(val, '');
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
                    {item.displayName} <span className="text-xs text-gray-500">({item.source})</span>
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
              if (selectedMake) fetchYears(selectedMake, val);
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
                    {item.displayName} <span className="text-xs text-gray-500">({item.source})</span>
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>

          {/* Year Combobox */}
          <Combobox
            value={selectedYear}
            onChange={(val: string) => {
              setSelectedYear(val);
            }}
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
                    {item.displayName} <span className="text-xs text-gray-500">({item.source})</span>
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={fetchSearch}
            disabled={!selectedMake || !selectedModel || !selectedYear || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors font-medium"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching with hybrid APIs...
              </span>
            ) : (
              'Search'
            )}
          </button>
          
          <button
            onClick={() => {
              setSearchResult(null);
              setDatabaseCars([]);
              setSearchError('');
              setHasSearched(false);
            }}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error Display */}
      {searchError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {searchError}
          </div>
        </div>
      )}

      {/* Results Display */}
      {source === 'database' ? renderDatabaseResults() : renderComprehensiveResults()}
    </div>
  );
}