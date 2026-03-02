// src/components/spa/DealerFinder.tsx
'use client';

import React, { useState } from 'react';
import { MapPinIcon, PhoneIcon, StarIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

interface DealerFinderProps {
  make?: string;
  onDealerSelect?: (dealer: any) => void;
}

interface DealerSearchForm {
  make: string;
  location: string;
  radius: number;
}

export default function DealerFinder({ make: initialMake = '', onDealerSelect }: DealerFinderProps) {
  const [formData, setFormData] = useState<DealerSearchForm>({
    make: initialMake,
    location: '',
    radius: 25
  });
  const [dealers, setDealers] = useState<any[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<any>(null);
  const [dealerDetails, setDealerDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!formData.make || !formData.location) {
      setError('Please enter both make and location');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        action: 'search',
        make: formData.make,
        state: formData.location, // Assuming location is state for demo
        radius: formData.radius.toString()
      });

      const response = await fetch(`/api/spa/dealers?${params}`);
      const data = await response.json();

      if (data.success) {
        setDealers(data.dealers || []);
      } else {
        setError(data.error?.message || 'Search failed');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Dealer search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDealerDetails = async (dealerID: string) => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        action: 'details',
        dealerID
      });

      const response = await fetch(`/api/spa/dealers?${params}`);
      const data = await response.json();

      if (data.success) {
        setDealerDetails(data);
        setSelectedDealer(data.dealer);
        onDealerSelect?.(data.dealer);
      }
    } catch (err) {
      console.error('Error loading dealer details:', err);
    } finally {
      setLoading(false);
    }
  };

  const runDemo = async () => {
    setFormData({ make: 'BMW', location: 'CA', radius: 50 });
    setLoading(true);
    
    try {
      const response = await fetch('/api/spa/dealers?action=search&make=BMW&state=CA&radius=50');
      const data = await response.json();
      
      if (data.success) {
        setDealers(data.dealers || []);
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
        <BuildingStorefrontIcon className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-800">Dealer Finder</h2>
        <div className="text-sm text-gray-500 bg-green-50 px-2 py-1 rounded">
          CIS Automotive API
        </div>
      </div>

      {/* Demo Button */}
      <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-700 text-sm mb-3">
          Find dealers using the CIS Automotive API with real dealer data.
        </p>
        <button
          onClick={runDemo}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
          disabled={loading}
        >
          Demo: Find BMW Dealers in California
        </button>
      </div>

      {/* Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Make/Brand
          </label>
          <input
            type="text"
            value={formData.make}
            onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
            placeholder="e.g., BMW, Mercedes, Audi"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State/Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., CA, NY, TX"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Radius (miles)
          </label>
          <select
            value={formData.radius}
            onChange={(e) => setFormData(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value={10}>10 miles</option>
            <option value={25}>25 miles</option>
            <option value={50}>50 miles</option>
            <option value={100}>100 miles</option>
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
        disabled={loading || !formData.make || !formData.location}
        className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Searching...
          </>
        ) : (
          <>
            <MapPinIcon className="w-4 h-4" />
            Find Dealers
          </>
        )}
      </button>

      {/* Dealers List */}
      {dealers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">
            Found {dealers.length} Dealers
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dealers.slice(0, 6).map((dealer, index) => (
              <div
                key={dealer.dealerID || index}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-shadow"
                onClick={() => dealer.dealerID && loadDealerDetails(dealer.dealerID)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-800 truncate">
                    {dealer.dealerName || 'Unknown Dealer'}
                  </h4>
                  {dealer.ratings?.overall && (
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">
                        {dealer.ratings.overall.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  {dealer.address && (
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      <span>
                        {dealer.address.city}, {dealer.address.state}
                      </span>
                    </div>
                  )}
                  
                  {dealer.phone && (
                    <div className="flex items-center gap-1">
                      <PhoneIcon className="w-3 h-3" />
                      <span>{dealer.phone}</span>
                    </div>
                  )}
                  
                  {dealer.services && dealer.services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {dealer.services.slice(0, 3).map((service: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                        >
                          {service}
                        </span>
                      ))}
                      {dealer.services.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{dealer.services.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dealer Details Modal/Section */}
      {dealerDetails && selectedDealer && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {selectedDealer.dealerName}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Contact Information</h4>
              <div className="space-y-2 text-sm">
                {selectedDealer.address && (
                  <p>
                    {selectedDealer.address.street}<br/>
                    {selectedDealer.address.city}, {selectedDealer.address.state} {selectedDealer.address.zip}
                  </p>
                )}
                {selectedDealer.phone && <p>Phone: {selectedDealer.phone}</p>}
                {selectedDealer.website && (
                  <p>
                    <a href={selectedDealer.website} target="_blank" rel="noopener noreferrer" 
                       className="text-red-600 hover:underline">
                      Visit Website
                    </a>
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Inventory</h4>
              {dealerDetails.inventory && (
                <div className="space-y-1 text-sm">
                  <p>Total Vehicles: {dealerDetails.inventory.count}</p>
                  {dealerDetails.inventory.vehicles.length > 0 && (
                    <div>
                      <p className="font-medium mt-2">Sample Inventory:</p>
                      <div className="space-y-1">
                        {dealerDetails.inventory.vehicles.slice(0, 3).map((vehicle: any, idx: number) => (
                          <div key={idx} className="text-xs text-gray-600">
                            {vehicle.year} {vehicle.make} {vehicle.model} - ${vehicle.price?.toLocaleString()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}