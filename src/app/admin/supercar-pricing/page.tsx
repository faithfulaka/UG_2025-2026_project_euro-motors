// src/app/admin/supercar-pricing/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

interface CarSearchResult {
  basicSpecs: {
    model_make_id: string;
    model_name: string;
    model_year: string;
    model_body?: string | null;
    model_engine_cc?: string | null;
    model_engine_type?: string | null;
  };
  pricingData: {
    baseMSRP?: number | null;
    marketRange?: string | null;
    averageDealerPrice?: number | null;
    dealerInventoryCount?: number | null;
  };
  ownershipCosts?: {
    annualTax?: number | null;
    insuranceGroup?: string | null;
    fuelCostPerYear?: number | null;
  };
  performance?: {
    depreciation?: unknown[];
    engine?: string | null;
  };
  auctionHistory?: unknown[];
  wikiSummary?: string;
  image?: string | null;
}

const SupercarPricingPage = () => {
  const [makes, setMakes] = useState<{ label: string; value: string }[]>([]);
  const [models, setModels] = useState<{ label: string; value: string }[]>([]);
  const [years, setYears] = useState<{ label: string; value: string }[]>([]);
  const [searchResults, setSearchResults] = useState<CarSearchResult[]>([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchMakes = async (query: string) => {
    const { data } = await axios.get(`/api/spa/suggestions/makes?source=combined&search=${query}`);
    setMakes(data.makes.map((make: string) => ({ label: make, value: make })));
  };

  const fetchModels = async (make: string, query: string) => {
    const { data } = await axios.get(`/api/spa/suggestions/models?source=combined&make=${make}&search=${query}`);
    setModels(data.models.map((model: string) => ({ label: model, value: model })));
  };

  const fetchYears = async (make: string, model: string) => {
    const { data } = await axios.get(`/api/spa/suggestions/years?source=combined&make=${make}&model=${model}`);
    setYears(data.years.map((year: string) => ({ label: year, value: year })));
  };

  const fetchResults = async () => {
    if (!selectedMake || !selectedModel || !selectedYear) return;

    setIsLoading(true);
    const { data } = await axios.post('/api/spa/search', {
      make: selectedMake,
      model: selectedModel,
      year: selectedYear,
    });
    setSearchResults([data]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMakes('');
  }, []);

  useEffect(() => {
    if (selectedMake) {
      fetchModels(selectedMake, '');
    }
  }, [selectedMake]);

  useEffect(() => {
    if (selectedMake && selectedModel) {
      fetchYears(selectedMake, selectedModel);
    }
  }, [selectedMake, selectedModel]);

  return (
    <div className="p-6 text-black">
      <h1 className="text-3xl font-bold mb-4">Supercar Pricing</h1>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Make"
          className="border p-2 rounded w-1/4 text-black"
          value={selectedMake}
          onChange={(e) => {
            const make = e.target.value;
            setSelectedMake(make);
            fetchMakes(make);
          }}
          list="make-options"
        />
        <datalist id="make-options">
          {makes.map((make) => (
            <option key={make.value} value={make.value} />
          ))}
        </datalist>

        <input
          type="text"
          placeholder="Model"
          className="border p-2 rounded w-1/4 text-black"
          value={selectedModel}
          onChange={(e) => {
            const model = e.target.value;
            setSelectedModel(model);
            fetchModels(selectedMake, model);
          }}
          list="model-options"
        />
        <datalist id="model-options">
          {models.map((model) => (
            <option key={model.value} value={model.value} />
          ))}
        </datalist>

        <select
          className="border p-2 rounded w-1/4 text-black"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Year</option>
          {years.map((year) => (
            <option key={year.value} value={year.value}>
              {year.label}
            </option>
          ))}
        </select>

        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={fetchResults}
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {searchResults.map((car, index) => (
          <div key={index} className="border p-4 rounded shadow text-black bg-white">
            <h2 className="text-xl font-bold mb-2">{car.basicSpecs.model_make_id} {car.basicSpecs.model_name} {car.basicSpecs.model_year}</h2>
            {car.image && (
              <Image
                src={car.image}
                alt={`${car.basicSpecs.model_make_id} ${car.basicSpecs.model_name}`}
                width={400}
                height={250}
                className="object-cover mb-2 rounded"
              />
            )}
            <p><strong>MSRP:</strong> {car.pricingData.baseMSRP ? `£${car.pricingData.baseMSRP}` : 'N/A'}</p>
            <p><strong>Engine:</strong> {car.performance?.engine || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupercarPricingPage;