// src/app/admin/trade-ins/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TradeIn {
  id: string;
  userId: string;
  registrationNumber: string;
  make: string | null;
  model: string;
  yearOfManufacture: number | null;
  mileage: number;
  condition: string;
  estimatedValue: number | null;
  actualValue: number | null;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminTradeInsPage() {
  const [tradeIns, setTradeIns] = useState<TradeIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTradeIns();
  }, []);

  const fetchTradeIns = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      const response = await fetch('/api/trade-in', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch trade-ins');
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        setTradeIns(result.data);
      } else {
        setTradeIns([]);
      }
    } catch (error) {
      console.error('Error fetching trade-ins:', error);
      setError('Failed to load trade-ins. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTradeInStatus = async (tradeInId: string, newStatus: string, actualValue?: number) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const response = await fetch(`/api/trade-in/${tradeInId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: newStatus,
          ...(actualValue !== undefined && { actualValue })
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update trade-in');
      }
      
      fetchTradeIns();
      alert('Trade-in updated successfully');
    } catch (error) {
      console.error('Error updating trade-in:', error);
      alert('Failed to update trade-in');
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
      <div className="flex justify-between items-center mb-6">
        <Link href="/admin" className="text-blue-600 hover:text-blue-700 mb-2 inline-block text-sm">
          ← Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {tradeIns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-700 text-lg">No trade-in requests found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Registration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Mileage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Estimated Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tradeIns.map((tradeIn) => (
                  <tr key={tradeIn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tradeIn.user.name}</div>
                      <div className="text-sm text-gray-600">{tradeIn.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tradeIn.make || 'N/A'} {tradeIn.model}
                      </div>
                      <div className="text-sm text-gray-600">{tradeIn.yearOfManufacture || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tradeIn.registrationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tradeIn.mileage.toLocaleString()} miles
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tradeIn.condition}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tradeIn.estimatedValue ? `£${tradeIn.estimatedValue.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={tradeIn.status}
                        onChange={(e) => updateTradeInStatus(tradeIn.id, e.target.value)}
                        className="text-sm border-gray-300 rounded-md"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/trade-ins/${tradeIn.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
