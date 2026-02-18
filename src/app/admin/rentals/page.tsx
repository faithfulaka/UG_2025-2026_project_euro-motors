// src/app/admin/rentals/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Rental {
  id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  rentalDuration: string;
  totalAmount: number;
  paymentStatus: string;
  rentalStatus: string;
  createdAt: string;
  car: {
    make: string;
    model: string;
    year: number;
  };
  user: {
    name: string;
    email: string;
  };
}

export default function AdminRentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      // We'll need to create this API endpoint
      const response = await fetch('/api/admin/rentals', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch rentals');
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        setRentals(result.data);
      } else {
        setRentals([]);
      }
    } catch (error) {
      console.error('Error fetching rentals:', error);
      setError('Failed to load rentals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRentalStatus = async (rentalId: string, newStatus: string) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const response = await fetch(`/api/admin/rentals/${rentalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rentalStatus: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update rental');
      }
      
      fetchRentals();
      alert('Rental status updated successfully');
    } catch (error) {
      console.error('Error updating rental:', error);
      alert('Failed to update rental status');
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

      {rentals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-700 text-lg">No rentals found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Car</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rentals.map((rental) => (
                  <tr key={rental.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rental.user.name}</div>
                      <div className="text-sm text-gray-600">{rental.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{rental.car.make} {rental.car.model}</div>
                      <div className="text-sm text-gray-600">{rental.car.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rental.rentalDuration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{new Date(rental.startDate).toLocaleDateString()}</div>
                      <div className="text-gray-500">to {new Date(rental.endDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      £{rental.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        rental.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                        rental.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {rental.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={rental.rentalStatus}
                        onChange={(e) => updateRentalStatus(rental.id, e.target.value)}
                        className="text-sm border-gray-300 rounded-md"
                      >
                        <option value="RESERVED">Reserved</option>
                        <option value="PAID">Paid</option>
                        <option value="PICKED_UP">Picked Up</option>
                        <option value="ACTIVE">Active</option>
                        <option value="RETURNED">Returned</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/rentals/${rental.id}`}
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
