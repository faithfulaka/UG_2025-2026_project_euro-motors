//src/app/dashboard/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Quote {
  id: string;
  amount: number;
  quoteStatus: string;
  financingOption: boolean;
  financingTerm?: number;
  monthlyPayment?: number;
  createdAt: string;
  car: { make: string; model: string; year: number };
}

interface Rental {
  id: string;
  totalAmount: number;
  rentalStatus: string;
  paymentStatus: string;
  startDate: string;
  endDate: string;
  rentalDuration: string;
  car: { make: string; model: string; year: number };
}

interface TradeIn {
  id: string;
  make?: string;
  model: string;
  yearOfManufacture?: number;
  estimatedValue?: number;
  status: string;
  targetCarMake?: string;
  targetCarModel?: string;
  balanceDue?: number;
  createdAt: string;
}

export default function UserDashboard() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [tradeIns, setTradeIns] = useState<TradeIn[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (isAdmin) {
        router.push('/admin');
      }
    }
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
    if (user && !isAdmin) {
      fetchUserData();
    }
  }, [user, isAdmin]);

  const fetchUserData = async () => {
    try {
      setDataLoading(true);
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const headers = { 'Authorization': `Bearer ${token}` };

      const [quotesRes, rentalsRes, tradeInsRes] = await Promise.allSettled([
        fetch('/api/quotes', { headers }),
        fetch('/api/rentals', { headers }),
        fetch('/api/trade-in', { headers }),
      ]);

      if (quotesRes.status === 'fulfilled' && quotesRes.value.ok) {
        const data = await quotesRes.value.json();
        setQuotes(data.data || []);
      }
      if (rentalsRes.status === 'fulfilled' && rentalsRes.value.ok) {
        const data = await rentalsRes.value.json();
        setRentals(data.data || []);
      }
      if (tradeInsRes.status === 'fulfilled' && tradeInsRes.value.ok) {
        const data = await tradeInsRes.value.json();
        setTradeIns(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user || isAdmin) return null;

  const formatCurrency = (amount: number) => `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 0 })}`;

  const statusColor = (status: string) => {
    const s = status.toUpperCase();
    if (['PAID', 'COMPLETED', 'APPROVED', 'RESERVED', 'GENERATED'].includes(s)) return 'bg-green-100 text-green-700';
    if (['CANCELLED', 'REJECTED', 'FAILED'].includes(s)) return 'bg-red-100 text-red-700';
    if (['ACTIVE', 'PICKED_UP'].includes(s)) return 'bg-blue-100 text-blue-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name || 'there'}!</h1>
          <p className="text-gray-500 mt-1">{user.email}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link href="/buy" className="group block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-red-200 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1h2m6 0h4l2-8H7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Browse Cars</h3>
                <p className="text-sm text-gray-500">Explore our luxury collection</p>
              </div>
            </div>
          </Link>
          <Link href="/rent" className="group block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-red-200 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rent a Car</h3>
                <p className="text-sm text-gray-500">Luxury rentals for any occasion</p>
              </div>
            </div>
          </Link>
          <Link href="/trade-in" className="group block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-red-200 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Trade In</h3>
                <p className="text-sm text-gray-500">Trade your vehicle towards a purchase</p>
              </div>
            </div>
          </Link>
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Orders / Quotes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Your Orders
              </h2>
              {quotes.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">No orders yet. <Link href="/buy" className="text-red-600 hover:underline">Browse cars</Link> to get started.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-gray-500 font-medium">Vehicle</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Price</th>
                        <th className="text-center py-2 text-gray-500 font-medium">Financing</th>
                        <th className="text-center py-2 text-gray-500 font-medium">Status</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.map((q) => (
                        <tr key={q.id} className="border-b border-gray-50">
                          <td className="py-3 text-gray-900 font-medium">{q.car?.make} {q.car?.model} ({q.car?.year})</td>
                          <td className="py-3 text-right text-gray-900">{formatCurrency(q.amount)}</td>
                          <td className="py-3 text-center text-gray-600 text-xs">
                            {q.financingOption ? `${q.financingTerm}mo — ${formatCurrency(q.monthlyPayment || 0)}/mo` : 'Full payment'}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(q.quoteStatus)}`}>
                              {q.quoteStatus}
                            </span>
                          </td>
                          <td className="py-3 text-right text-gray-500 text-xs">{new Date(q.createdAt).toLocaleDateString('en-GB')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Rentals */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Your Rentals
              </h2>
              {rentals.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">No rentals yet. <Link href="/rent" className="text-red-600 hover:underline">Browse rental cars</Link> to get started.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-gray-500 font-medium">Vehicle</th>
                        <th className="text-left py-2 text-gray-500 font-medium">Period</th>
                        <th className="text-center py-2 text-gray-500 font-medium">Duration</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Total</th>
                        <th className="text-center py-2 text-gray-500 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rentals.map((r) => (
                        <tr key={r.id} className="border-b border-gray-50">
                          <td className="py-3 text-gray-900 font-medium">{r.car?.make} {r.car?.model} ({r.car?.year})</td>
                          <td className="py-3 text-gray-600 text-xs">
                            {new Date(r.startDate).toLocaleDateString('en-GB')} — {new Date(r.endDate).toLocaleDateString('en-GB')}
                          </td>
                          <td className="py-3 text-center text-gray-600 text-xs capitalize">{r.rentalDuration?.toLowerCase()}</td>
                          <td className="py-3 text-right text-gray-900">{formatCurrency(r.totalAmount)}</td>
                          <td className="py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(r.rentalStatus)}`}>
                              {r.rentalStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Trade-Ins */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Your Trade-Ins
              </h2>
              {tradeIns.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">No trade-in requests yet. Start from any <Link href="/buy" className="text-red-600 hover:underline">car detail page</Link>.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-gray-500 font-medium">Your Vehicle</th>
                        <th className="text-left py-2 text-gray-500 font-medium">Target Vehicle</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Trade-In Value</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Balance Due</th>
                        <th className="text-center py-2 text-gray-500 font-medium">Status</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradeIns.map((ti) => (
                        <tr key={ti.id} className="border-b border-gray-50">
                          <td className="py-3 text-gray-900 font-medium">
                            {ti.make || ''} {ti.model}
                            <span className="text-gray-400 text-xs ml-1">({ti.yearOfManufacture || 'N/A'})</span>
                          </td>
                          <td className="py-3 text-gray-600">
                            {ti.targetCarMake || '—'} {ti.targetCarModel || ''}
                          </td>
                          <td className="py-3 text-right text-gray-900">{formatCurrency(ti.estimatedValue || 0)}</td>
                          <td className="py-3 text-right text-gray-900">{formatCurrency(ti.balanceDue || 0)}</td>
                          <td className="py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(ti.status)}`}>
                              {ti.status}
                            </span>
                          </td>
                          <td className="py-3 text-right text-gray-500 text-xs">{new Date(ti.createdAt).toLocaleDateString('en-GB')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}