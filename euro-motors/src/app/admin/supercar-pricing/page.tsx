//src/app/admin/supercar-pricing/page.tsx
'use client';
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function SupercarPricingPage() {
  const [selectedMake, setSelectedMake] = useState('');
  const [makeOptions, setMakeOptions] = useState<string[]>([]);
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);

  const [selectedModel, setSelectedModel] = useState('');
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const [selectedYear, setSelectedYear] = useState('');
  const [yearOptions, setYearOptions] = useState<number[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const [searchError, setSearchError] = useState<string | null>(null);
  const [supercarData, setSupercarData] = useState<any>(null);

  const makeRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (makeRef.current && !makeRef.current.contains(e.target as Node)) {
        setShowMakeDropdown(false);
      }
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Load models when make changes
  useEffect(() => {
    if (selectedMake) {
      loadModels('');
    } else {
      setModelOptions([]);
      setSelectedModel('');
      setYearOptions([]);
      setSelectedYear('');
    }
  }, [selectedMake]);

  // Load years when model changes
  useEffect(() => {
    if (selectedMake && selectedModel) {
      loadYears();
    } else {
      setYearOptions([]);
      setSelectedYear('');
    }
  }, [selectedModel, selectedMake]);

  // Fetch makes matching `query`
  const loadMakes = async (query: string = '') => {
    try {
      setShowMakeDropdown(true);
      const res = await axios.get('/api/spa/suggestions/makes', {
        params: { source: 'combined', search: query },
      });
      setMakeOptions(res.data.makes || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch models for selectedMake matching `query`
  const loadModels = async (query: string = '') => {
    if (!selectedMake) return;
    try {
      setShowModelDropdown(true);
      const res = await axios.get('/api/spa/suggestions/models', {
        params: {
          source: 'combined',
          make: selectedMake,
          search: query,
        },
      });
      setModelOptions(res.data.models || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch years for selectedMake + selectedModel
  const loadYears = async () => {
    if (!selectedMake || !selectedModel) return;
    try {
      setShowYearDropdown(true);
      const res = await axios.get('/api/spa/suggestions/years', {
        params: {
          source: 'combined',
          make: selectedMake,
          model: selectedModel,
        },
      });
      setYearOptions(res.data.years || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger the combined search
  const handleGetData = async () => {
    if (!selectedMake || !selectedModel || !selectedYear) {
      setSearchError('Please select Make, Model, and Year.');
      return;
    }
    try {
      setSearchError(null);
      const res = await axios.post('/api/spa/search', {
        make: selectedMake,
        model: selectedModel,
        year: selectedYear,
      });
      setSupercarData(res.data);
    } catch (err: any) {
      console.error(err);
      setSearchError(err?.response?.data?.error || 'Failed to fetch data');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-black">
        Supercar Pricing Aggregator
      </h1>

      <div className="bg-white p-6 rounded-xl shadow overflow-visible">
        <h2 className="text-lg font-semibold mb-4 text-black">
          Search Vehicle
        </h2>
        <div className="flex space-x-4">
          {/* Make */}
          <div className="w-1/3 relative" ref={makeRef}>
            <label className="block text-sm font-medium text-black mb-1">
              Make *
            </label>
            <input
              type="text"
              value={selectedMake}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedMake(v);
                setSelectedModel('');
                setModelOptions([]);
                setSelectedYear('');
                setYearOptions([]);
                loadMakes(v);
              }}
              onFocus={() => {
                loadMakes(selectedMake);
              }}
              placeholder="Type to search makes..."
              className="w-full border rounded px-3 py-2 text-black focus:outline-none focus:ring"
            />
            {showMakeDropdown && makeOptions.length > 0 && (
              <ul className="absolute top-full left-0 z-50 w-full bg-white border rounded shadow max-h-60 overflow-auto mt-1 text-black">
                {makeOptions.map((m) => (
                  <li
                    key={m}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedMake(m);
                      setShowMakeDropdown(false);
                      setSelectedModel('');
                      setModelOptions([]);
                      setSelectedYear('');
                      setYearOptions([]);
                    }}
                  >
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Model */}
          <div className="w-1/3 relative" ref={modelRef}>
            <label className="block text-sm font-medium text-black mb-1">
              Model *
            </label>
            <input
              type="text"
              value={selectedModel}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedModel(v);
                setSelectedYear('');
                setYearOptions([]);
                loadModels(v);
              }}
              onFocus={() => {
                loadModels(selectedModel);
              }}
              placeholder="Type to search models..."
              className="w-full border rounded px-3 py-2 text-black focus:outline-none focus:ring"
            />
            {showModelDropdown && modelOptions.length > 0 && (
              <ul className="absolute top-full left-0 z-50 w-full bg-white border rounded shadow max-h-60 overflow-auto mt-1 text-black">
                {modelOptions.map((m) => (
                  <li
                    key={m}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedModel(m);
                      setShowModelDropdown(false);
                      setSelectedYear('');
                      setYearOptions([]);
                    }}
                  >
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Year */}
          <div className="w-1/3 relative">
            <label className="block text-sm font-medium text-black mb-1">
              Year *
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              onFocus={() => {
                if (selectedMake && selectedModel) loadYears();
              }}
              className="w-full border rounded px-3 py-2 text-black focus:outline-none focus:ring"
            >
              <option value="">Select Year</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {searchError && (
          <div className="my-4 bg-red-100 border border-red-400 text-black px-4 py-3 rounded">
            <strong>Error:</strong> {searchError}
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={handleGetData}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            🔍 Get Data
          </button>
        </div>
      </div>

      {/* Specifications */}
      {supercarData?.basicSpecs && (
        <div className="my-6 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-black mb-2">
            Specifications
          </h3>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm text-black">
            {JSON.stringify(supercarData.basicSpecs, null, 2)}
          </pre>
        </div>
      )}

      {/* Raw Response */}
      {supercarData && (
        <div className="my-6 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-black mb-2">
            All Data (Raw Response)
          </h3>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm text-black">
            {JSON.stringify(supercarData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}