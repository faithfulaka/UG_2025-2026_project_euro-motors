// src/components/spa/APITestDashboard.tsx
'use client';

import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  CpuChipIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface APITestResult {
  api: string;
  status: 'success' | 'error' | 'loading';
  data?: any;
  error?: string;
  executionTime?: number;
  working?: boolean;
}

export default function APITestDashboard() {
  const [testResults, setTestResults] = useState<APITestResult[]>([]);
  const [overallTest, setOverallTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const apis = [
    { 
      key: 'edmunds', 
      name: 'Edmunds API', 
      description: 'Official vehicle specifications, MSRP pricing, and reviews',
      color: 'blue'
    },
    { 
      key: 'marketcheck', 
      name: 'MarketCheck API', 
      description: 'Real-time market data, vehicle listings, and pricing trends',
      color: 'green'
    },
    { 
      key: 'cis', 
      name: 'CIS Automotive API', 
      description: 'Dealer information, inventory management, and dealer reviews',
      color: 'purple'
    },
    { 
      key: 'cardata', 
      name: 'Car Data API', 
      description: 'Comprehensive vehicle database and detailed specifications',
      color: 'orange'
    }
  ];

  const testIndividualAPI = async (apiKey: string) => {
    setTestResults(prev => prev.map(result => 
      result.api === apiKey 
        ? { ...result, status: 'loading' as const }
        : result
    ));

    try {
      const params = new URLSearchParams({
        api: apiKey,
        make: 'BMW',
        model: 'X5',
        year: '2023'
      });

      const startTime = Date.now();
      const response = await fetch(`/api/spa/test-apis?${params}`);
      const data = await response.json();
      const executionTime = Date.now() - startTime;

      setTestResults(prev => prev.map(result => 
        result.api === apiKey 
          ? { 
              ...result, 
              status: data.success ? 'success' as const : 'error' as const,
              data: data.results,
              error: data.error?.message,
              executionTime,
              working: data.success
            }
          : result
      ));
    } catch (error) {
      setTestResults(prev => prev.map(result => 
        result.api === apiKey 
          ? { 
              ...result, 
              status: 'error' as const,
              error: error instanceof Error ? error.message : 'Network error',
              working: false
            }
          : result
      ));
    }
  };

  const testAllAPIs = async () => {
    setLoading(true);
    
    // Initialize test results
    setTestResults(apis.map(api => ({
      api: api.key,
      status: 'loading' as const
    })));

    try {
      const startTime = Date.now();
      const response = await fetch('/api/spa/test-apis?api=all&make=BMW&model=X5&year=2023');
      const data = await response.json();
      const executionTime = Date.now() - startTime;

      if (data.success) {
        setOverallTest({
          ...data.results,
          executionTime,
          timestamp: new Date().toISOString()
        });

        // Update individual results
        setTestResults(apis.map(api => ({
          api: api.key,
          status: data.results.results[api.key]?.working ? 'success' as const : 'error' as const,
          data: data.results.results[api.key]?.data,
          error: data.results.results[api.key]?.error?.message,
          executionTime,
          working: data.results.results[api.key]?.working
        })));
      } else {
        setTestResults(apis.map(api => ({
          api: api.key,
          status: 'error' as const,
          error: data.error?.message || 'Test failed'
        })));
      }
    } catch (error) {
      setTestResults(apis.map(api => ({
        api: api.key,
        status: 'error' as const,
        error: 'Network error'
      })));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, working?: boolean) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'loading':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      green: 'border-green-200 bg-green-50 text-green-700',
      purple: 'border-purple-200 bg-purple-50 text-purple-700',
      orange: 'border-orange-200 bg-orange-50 text-orange-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <CpuChipIcon className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-800">API Test Dashboard</h2>
        <div className="text-sm text-gray-500 bg-green-50 px-2 py-1 rounded">
          Live Testing
        </div>
      </div>

      {/* Overview Card */}
      <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
        <h3 className="font-medium text-red-800 mb-2">Reliable API Integration</h3>
        <p className="text-red-700 text-sm mb-3">
          Test the new reliable APIs that replaced all scrapers and unreliable services. 
          Each API provides specific functionality with high uptime and consistent data formats.
        </p>
        <button
          onClick={testAllAPIs}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-red-300 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Testing All APIs...
            </>
          ) : (
            <>
              <ChartBarIcon className="w-4 h-4" />
              Test All APIs (BMW X5 2023)
            </>
          )}
        </button>
      </div>

      {/* Overall Results */}
      {overallTest && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-medium text-gray-800 mb-3">Overall Test Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Working APIs:</span>
              <p>{overallTest.totalWorkingApis}/4</p>
            </div>
            <div>
              <span className="font-medium">Execution Time:</span>
              <p>{overallTest.executionTime}ms</p>
            </div>
            <div>
              <span className="font-medium">Success Rate:</span>
              <p>{((overallTest.totalWorkingApis / 4) * 100).toFixed(0)}%</p>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <p className={`font-medium ${overallTest.totalWorkingApis === 4 ? 'text-green-600' : 'text-yellow-600'}`}>
                {overallTest.totalWorkingApis === 4 ? 'All Systems Operational' : 'Partial Service'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Individual API Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apis.map((api) => {
          const result = testResults.find(r => r.api === api.key);
          
          return (
            <div
              key={api.key}
              className={`p-4 rounded-lg border-2 ${getColorClasses(api.color)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{api.name}</h4>
                <div className="flex items-center gap-2">
                  {getStatusIcon(result?.status || 'idle', result?.working)}
                  <button
                    onClick={() => testIndividualAPI(api.key)}
                    disabled={result?.status === 'loading'}
                    className="text-xs px-2 py-1 bg-white rounded border border-current opacity-70 hover:opacity-100"
                  >
                    Test
                  </button>
                </div>
              </div>
              
              <p className="text-sm opacity-80 mb-3">{api.description}</p>
              
              {result && (
                <div className="space-y-2">
                  {result.status === 'success' && result.data && (
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span>{result.executionTime}ms</span>
                      </div>
                      {api.key === 'edmunds' && result.data.makes && (
                        <div className="flex justify-between">
                          <span>Makes Available:</span>
                          <span>{result.data.makes?.length || 0}</span>
                        </div>
                      )}
                      {api.key === 'marketcheck' && result.data.makesCount !== undefined && (
                        <div className="flex justify-between">
                          <span>Makes Available:</span>
                          <span>{result.data.makesCount}</span>
                        </div>
                      )}
                      {api.key === 'cis' && result.data.makesCount !== undefined && (
                        <div className="flex justify-between">
                          <span>Makes Available:</span>
                          <span>{result.data.makesCount}</span>
                        </div>
                      )}
                      {api.key === 'cardata' && result.data.makesCount !== undefined && (
                        <div className="flex justify-between">
                          <span>Makes Available:</span>
                          <span>{result.data.makesCount}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {result.status === 'error' && (
                    <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                      Error: {result.error || 'Unknown error'}
                    </div>
                  )}
                  
                  {result.status === 'loading' && (
                    <div className="text-xs opacity-70">
                      Testing API endpoint...
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* API Comparison Table */}
      {testResults.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <h3 className="font-medium text-gray-800 mb-3">API Comparison</h3>
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">API</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Response Time</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Data Quality</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Primary Use Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {testResults.map((result) => {
                const api = apis.find(a => a.key === result.api);
                return (
                  <tr key={result.api} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium">{api?.name}</td>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(result.status, result.working)}
                        <span className={result.working ? 'text-green-600' : 'text-red-600'}>
                          {result.working ? 'Working' : 'Error'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {result.executionTime ? `${result.executionTime}ms` : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {result.working ? 'High' : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {api?.description.split(',')[0]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <strong>Note:</strong> All unreliable APIs and scrapers have been removed. These 4 APIs provide 
        comprehensive vehicle data, market information, and dealer services with high reliability and 
        consistent data formats. No more Puppeteer, no more HTML scraping, no more conditional APIs.
      </div>
    </div>
  );
}