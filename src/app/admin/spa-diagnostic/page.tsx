'use client';

import { useState } from 'react';
import axios from 'axios';

interface APITestResult {
  name: string;
  status: 'testing' | 'success' | 'error' | 'not-configured';
  message?: string;
  data?: any;
  time?: number;
}

export default function SPADiagnosticPage() {
  const [testResults, setTestResults] = useState<APITestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [selectedMake, setSelectedMake] = useState('Ferrari');
  const [selectedModel, setSelectedModel] = useState('488');
  const [selectedYear, setSelectedYear] = useState('2020');

  const updateResult = (name: string, result: Partial<APITestResult>) => {
    setTestResults(prev => {
      const existing = prev.findIndex(r => r.name === name);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], ...result };
        return updated;
      }
      return [...prev, { name, status: 'testing', ...result } as APITestResult];
    });
  };

  const testAllAPIs = async () => {
    setTesting(true);
    setTestResults([]);

    // Test 1: CarQuery API - Makes
    updateResult('CarQuery - Makes', { status: 'testing' });
    try {
      const start = Date.now();
      const res = await axios.get('/api/spa/suggestions?type=make');
      const time = Date.now() - start;
      const makeCount = res.data.suggestions?.length || 0;
      updateResult('CarQuery - Makes', {
        status: makeCount > 0 ? 'success' : 'error',
        message: `Found ${makeCount} makes`,
        data: res.data.suggestions?.slice(0, 5),
        time
      });
    } catch (error: any) {
      updateResult('CarQuery - Makes', {
        status: 'error',
        message: error.message
      });
    }

    // Test 2: CarQuery API - Models
    updateResult('CarQuery - Models', { status: 'testing' });
    try {
      const start = Date.now();
      const res = await axios.get(`/api/spa/suggestions?type=model&make=${selectedMake}`);
      const time = Date.now() - start;
      const modelCount = res.data.suggestions?.length || 0;
      updateResult('CarQuery - Models', {
        status: modelCount > 0 ? 'success' : 'error',
        message: `Found ${modelCount} models for ${selectedMake}`,
        data: res.data.suggestions?.slice(0, 5),
        time
      });
    } catch (error: any) {
      updateResult('CarQuery - Models', {
        status: 'error',
        message: error.message
      });
    }

    // Test 3: CarQuery API - Years
    updateResult('CarQuery - Years', { status: 'testing' });
    try {
      const start = Date.now();
      const res = await axios.get(`/api/spa/suggestions?type=year&make=${selectedMake}&model=${selectedModel}`);
      const time = Date.now() - start;
      const yearCount = res.data.suggestions?.length || 0;
      updateResult('CarQuery - Years', {
        status: yearCount > 0 ? 'success' : 'error',
        message: `Found ${yearCount} years for ${selectedMake} ${selectedModel}`,
        data: res.data.suggestions?.slice(0, 10),
        time
      });
    } catch (error: any) {
      updateResult('CarQuery - Years', {
        status: 'error',
        message: error.message
      });
    }

    // Test 4: Database Cars
    updateResult('Database Cars', { status: 'testing' });
    try {
      const start = Date.now();
      const res = await axios.get('/api/admin/cars?type=buy');
      const time = Date.now() - start;
      const carCount = res.data.data?.length || 0;
      updateResult('Database Cars', {
        status: carCount > 0 ? 'success' : 'error',
        message: `Found ${carCount} cars in database`,
        time
      });
    } catch (error: any) {
      updateResult('Database Cars', {
        status: 'error',
        message: error.message
      });
    }

    // Test 5: Full SPA Search
    updateResult('SPA Search (Comprehensive)', { status: 'testing' });
    try {
      const start = Date.now();
      const res = await axios.post('/api/spa/search', {
        make: selectedMake,
        model: selectedModel,
        year: parseInt(selectedYear),
        source: 'comprehensive'
      });
      const time = Date.now() - start;
      
      if (res.data.success && res.data.data) {
        const data = res.data.data;
        updateResult('SPA Search (Comprehensive)', {
          status: 'success',
          message: `Data sources: ${Object.entries(data.dataSources || {})
            .filter(([_, v]) => v)
            .map(([k]) => k)
            .join(', ')}`,
          data: {
            basicSpecs: data.basicSpecifications ? 'Yes' : 'No',
            performance: data.performanceData ? 'Yes' : 'No',
            pricing: data.pricingData ? 'Yes' : 'No',
            market: data.marketData ? 'Yes' : 'No'
          },
          time
        });
      } else {
        updateResult('SPA Search (Comprehensive)', {
          status: 'error',
          message: 'No data returned',
          time
        });
      }
    } catch (error: any) {
      updateResult('SPA Search (Comprehensive)', {
        status: 'error',
        message: error.message
      });
    }

    // Test 6: Check Environment Variables
    updateResult('Environment Check', { status: 'testing' });
    const envVars = {
      EBAY_APP_ID: process.env.NEXT_PUBLIC_EBAY_APP_ID ? 'Set' : 'Missing',
      CARQUERY_BASE: process.env.NEXT_PUBLIC_CARQUERY_BASE_URL || 'Using default',
      NODE_ENV: process.env.NODE_ENV
    };
    updateResult('Environment Check', {
      status: 'success',
      message: 'Environment variables status',
      data: envVars
    });

    setTesting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'testing': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🔧 SPA API Diagnostic Tool</h1>
      
      {/* Test Configuration */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Make</label>
            <input
              type="text"
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., Ferrari"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <input
              type="text"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., 488"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input
              type="text"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., 2020"
            />
          </div>
        </div>
        <button
          onClick={testAllAPIs}
          disabled={testing}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {testing ? 'Testing APIs...' : 'Run API Tests'}
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Results</h2>
          {testResults.map((result, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getStatusIcon(result.status)}</span>
                  <h3 className="font-semibold text-lg">{result.name}</h3>
                  {result.time && (
                    <span className="text-sm text-gray-500">({result.time}ms)</span>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                  {result.status}
                </span>
              </div>
              {result.message && (
                <p className="text-gray-700 mb-2">{result.message}</p>
              )}
              {result.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                    View Data
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* API Status Summary */}
      <div className="mt-8 bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
        <h2 className="text-xl font-semibold mb-4">📊 API Status Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">CarQuery API:</span>
            <span className="text-green-600">✅ FREE - Works without API key</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">eBay API:</span>
            <span className="text-orange-600">⚠️ Needs EBAY_APP_ID in .env</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Motors.co.uk Scraper:</span>
            <span className="text-red-600">❌ Requires Puppeteer (server-side only)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Wikipedia API:</span>
            <span className="text-green-600">✅ FREE - Works without API key</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Database:</span>
            <span className="text-green-600">✅ Local Prisma database</span>
          </div>
        </div>
      </div>

      {/* Known Issues */}
      <div className="mt-8 bg-red-50 p-6 rounded-lg border-2 border-red-200">
        <h2 className="text-xl font-semibold mb-4">⚠️ Known Issues & Solutions</h2>
        <div className="space-y-3 text-sm">
          <div>
            <h3 className="font-semibold text-red-700">1. No Years Available</h3>
            <p>Some car models don't have year data in CarQuery. Solution: Allow manual year entry or use a year range (e.g., 2015-2023).</p>
          </div>
          <div>
            <h3 className="font-semibold text-red-700">2. Scrapers Not Working</h3>
            <p>Puppeteer scrapers (Motors, ClassicValuer, AutoExpress) only work server-side. They won't work in Vercel without additional setup.</p>
          </div>
          <div>
            <h3 className="font-semibold text-red-700">3. Missing API Keys</h3>
            <p>Create a .env.local file with: EBAY_APP_ID, NEXT_PUBLIC_EBAY_APP_ID</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-8 bg-green-50 p-6 rounded-lg border-2 border-green-200">
        <h2 className="text-xl font-semibold mb-4">✅ Recommendations</h2>
        <div className="space-y-2 text-sm">
          <p>• <strong>Keep:</strong> CarQuery API (free, reliable, good data)</p>
          <p>• <strong>Keep:</strong> Database integration (your own data)</p>
          <p>• <strong>Optional:</strong> eBay API (needs API key, good for auction prices)</p>
          <p>• <strong>Remove:</strong> Puppeteer scrapers (complex, unreliable, breaks easily)</p>
          <p>• <strong>Alternative:</strong> Use manual data entry or CSV import instead of scrapers</p>
          <p>• <strong>Add:</strong> Allow custom year input when no years are found</p>
        </div>
      </div>
    </div>
  );
}
