// src/app/admin/supercar-pricing/page.tsx
'use client';

import React, { useState } from 'react';
import VehicleSearch from '@/components/spa/VehicleSearch';
import Link from 'next/link';

export default function SPAToolPage() {
  const [results, setResults] = useState<any>(null);

  return (
    <div>
      <Link href="/admin" className="text-red-600 hover:text-red-700 mb-2 inline-block text-sm">
        ← Back to Dashboard
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          Supercar Pricing Aggregator
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Search vehicle specifications, market pricing, and performance data from multiple sources.
        </p>
      </div>

      {/* Vehicle Search Component */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <VehicleSearch onResults={setResults} showDemo />
      </div>

      {/* Results Display */}
      {results && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h2>
          <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm text-gray-800 max-h-[500px] overflow-y-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
