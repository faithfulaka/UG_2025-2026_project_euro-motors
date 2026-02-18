// src/app/admin/reports/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      // We'll need to create this API endpoint
      const response = await fetch('/api/admin/reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setReports(result.data || {});
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin" className="text-blue-600 hover:text-blue-700 mb-4 inline-block text-sm">
        ← Back to Dashboard
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Sales Report</h2>
          <p className="text-gray-700">Sales reports and analytics will be displayed here.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Rental Report</h2>
          <p className="text-gray-700">Rental reports and analytics will be displayed here.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Trade-in Report</h2>
          <p className="text-gray-700">Trade-in reports and analytics will be displayed here.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">User Analytics</h2>
          <p className="text-gray-700">User analytics and growth metrics will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}
