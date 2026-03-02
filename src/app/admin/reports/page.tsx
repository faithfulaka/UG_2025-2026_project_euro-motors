// src/app/admin/reports/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ReportData {
  sales: { total: number; revenue: number; data: any[] };
  rentals: { total: number; revenue: number; data: any[] };
  tradeIns: { total: number; averageValue: number; data: any[] };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      const response = await fetch('/api/admin/reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setReports(result.data || null);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 0 })}`;

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="text-red-600 hover:text-red-700 mb-2 inline-block text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Reports</h1>
          <p className="text-sm text-gray-500">{monthName}</p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium text-gray-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency((reports?.sales?.revenue || 0) + (reports?.rentals?.revenue || 0))}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1h2m6 0h4l2-8H7" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Sales</p>
              <p className="text-xl font-bold text-gray-900">{reports?.sales?.total || 0}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">{formatCurrency(reports?.sales?.revenue || 0)} revenue</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Rentals</p>
              <p className="text-xl font-bold text-gray-900">{reports?.rentals?.total || 0}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">{formatCurrency(reports?.rentals?.revenue || 0)} revenue</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Trade-Ins</p>
              <p className="text-xl font-bold text-gray-900">{reports?.tradeIns?.total || 0}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Avg value: {formatCurrency(reports?.tradeIns?.averageValue || 0)}</p>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1h2m6 0h4l2-8H7" />
            </svg>
            Sales This Month
          </h2>
          {(reports?.sales?.data?.length || 0) > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Vehicle</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reports?.sales?.data?.map((sale: any) => (
                    <tr key={sale.id} className="border-b border-gray-50">
                      <td className="py-2.5 text-gray-900 font-medium">
                        {sale.car?.make} {sale.car?.model}
                      </td>
                      <td className="py-2.5 text-right text-gray-900">{formatCurrency(sale.amount)}</td>
                      <td className="py-2.5 text-right text-gray-500 text-xs">
                        {new Date(sale.createdAt).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-400 text-sm">No sales this month</p>
            </div>
          )}
        </div>

        {/* Rentals Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Rentals This Month
          </h2>
          {(reports?.rentals?.data?.length || 0) > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Vehicle</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reports?.rentals?.data?.map((rental: any) => (
                    <tr key={rental.id} className="border-b border-gray-50">
                      <td className="py-2.5 text-gray-900 font-medium">
                        {rental.car?.make} {rental.car?.model}
                      </td>
                      <td className="py-2.5 text-right text-gray-900">{formatCurrency(rental.totalAmount)}</td>
                      <td className="py-2.5 text-right text-gray-500 text-xs">
                        {new Date(rental.createdAt).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-400 text-sm">No rentals this month</p>
            </div>
          )}
        </div>

        {/* Trade-Ins Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Trade-Ins This Month
          </h2>
          {(reports?.tradeIns?.data?.length || 0) > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Trade-In Vehicle</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Target Vehicle</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Estimated Value</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Balance Due</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Status</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reports?.tradeIns?.data?.map((ti: any) => (
                    <tr key={ti.id} className="border-b border-gray-50">
                      <td className="py-2.5 text-gray-900 font-medium">
                        {ti.make || ''} {ti.model}
                        <span className="text-gray-400 text-xs ml-1">({ti.yearOfManufacture || 'N/A'})</span>
                      </td>
                      <td className="py-2.5 text-gray-900">
                        {ti.targetCarMake || '—'} {ti.targetCarModel || ''}
                      </td>
                      <td className="py-2.5 text-right text-gray-900">{formatCurrency(ti.estimatedValue || 0)}</td>
                      <td className="py-2.5 text-right text-gray-900">{formatCurrency(ti.balanceDue || 0)}</td>
                      <td className="py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          ti.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          ti.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          ti.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {ti.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-gray-500 text-xs">
                        {new Date(ti.createdAt).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-400 text-sm">No trade-ins this month</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
