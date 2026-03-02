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
  conditionDetails: string | null;
  accidentHistory: boolean;
  numberOfAccidents: number | null;
  previousOwners: number;
  fullServiceHistory: boolean | null;
  hasModifications: boolean | null;
  interiorCondition: number | null;
  exteriorCondition: number | null;
  fuelType: string | null;
  colour: string | null;
  estimatedValue: number | null;
  actualValue: number | null;
  // Transaction details
  targetCarMake: string | null;
  targetCarModel: string | null;
  targetCarYear: number | null;
  targetCarPrice: number | null;
  balanceDue: number | null;
  cashDeposit: number | null;
  financingTerm: number | null;
  monthlyPayment: number | null;
  remainingAfterDeposit: number | null;
  overage: number | null;
  paymentMethod: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  quote: {
    id: string;
    amount: number;
    quoteStatus: string;
    car: {
      make: string;
      model: string;
      year: number;
      price: number;
    };
  };
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  APPROVED: 'bg-green-100 text-green-800 border-green-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
  COMPLETED: 'bg-blue-100 text-blue-800 border-blue-300',
};

export default function AdminTradeInsPage() {
  const [tradeIns, setTradeIns] = useState<TradeIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    fetchTradeIns();
  }, []);

  const getToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  };

  const fetchTradeIns = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = getToken();
      
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
        // Initialize admin notes
        const notes: Record<string, string> = {};
        result.data.forEach((ti: TradeIn) => {
          notes[ti.id] = ti.adminNotes || '';
        });
        setAdminNotes(notes);
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

  const updateTradeIn = async (tradeInId: string, updates: { status?: string; actualValue?: number; adminNotes?: string }) => {
    try {
      const token = getToken();
      const response = await fetch(`/api/trade-in/${tradeInId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
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

  const filteredTradeIns = filterStatus === 'ALL' 
    ? tradeIns 
    : tradeIns.filter(ti => ti.status === filterStatus);

  const stats = {
    total: tradeIns.length,
    pending: tradeIns.filter(t => t.status === 'PENDING').length,
    approved: tradeIns.filter(t => t.status === 'APPROVED').length,
    completed: tradeIns.filter(t => t.status === 'COMPLETED').length,
    rejected: tradeIns.filter(t => t.status === 'REJECTED').length,
    totalValue: tradeIns.reduce((sum, t) => sum + (t.estimatedValue || 0), 0),
    totalTargetValue: tradeIns.reduce((sum, t) => sum + (t.targetCarPrice || t.quote?.car?.price || 0), 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin" className="text-red-600 hover:text-red-700 mb-2 inline-block text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Trade-In Management</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all trade-in transactions and payment details</p>
        </div>
        <button onClick={fetchTradeIns} className="px-4 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200">
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white rounded-lg shadow-sm border p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-3 text-center">
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
          <div className="text-xs text-yellow-600">Pending</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-3 text-center">
          <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
          <div className="text-xs text-green-600">Approved</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-3 text-center">
          <div className="text-2xl font-bold text-red-700">{stats.completed}</div>
          <div className="text-xs text-red-600">Completed</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-3 text-center">
          <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
          <div className="text-xs text-red-600">Rejected</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-3 text-center">
          <div className="text-lg font-bold text-gray-900">£{stats.totalValue.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Trade-In Value</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-3 text-center">
          <div className="text-lg font-bold text-gray-900">£{stats.totalTargetValue.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Target Car Value</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              filterStatus === status 
                ? 'bg-gray-900 text-white border-gray-900' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status === 'ALL' ? `All (${stats.total})` : `${status.charAt(0) + status.slice(1).toLowerCase()} (${tradeIns.filter(t => t.status === status).length})`}
          </button>
        ))}
      </div>

      {filteredTradeIns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-700 text-lg">No trade-in requests found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTradeIns.map((tradeIn) => {
            const isExpanded = expandedId === tradeIn.id;
            const targetCar = tradeIn.targetCarMake 
              ? `${tradeIn.targetCarMake} ${tradeIn.targetCarModel}` 
              : tradeIn.quote?.car 
                ? `${tradeIn.quote.car.make} ${tradeIn.quote.car.model}` 
                : 'N/A';
            const targetPrice = tradeIn.targetCarPrice || tradeIn.quote?.car?.price || 0;
            const targetYear = tradeIn.targetCarYear || tradeIn.quote?.car?.year || 0;

            return (
              <div key={tradeIn.id} className="bg-white rounded-lg shadow-md border overflow-hidden">
                {/* Summary Row */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : tradeIn.id)}
                >
                  <div className="grid grid-cols-2 md:grid-cols-8 gap-3 items-center">
                    {/* Customer */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium">Customer</div>
                      <div className="text-sm font-semibold text-gray-900">{tradeIn.user.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500 truncate">{tradeIn.user.email}</div>
                    </div>
                    
                    {/* Trade-In Vehicle */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium">Trade-In Vehicle</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {tradeIn.make || 'N/A'} {tradeIn.model}
                      </div>
                      <div className="text-xs text-gray-500">{tradeIn.yearOfManufacture || 'N/A'} • {tradeIn.mileage.toLocaleString()} mi</div>
                    </div>

                    {/* Target Car (What they want to buy) */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium">Purchasing</div>
                      <div className="text-sm font-semibold text-gray-900">{targetCar}</div>
                      <div className="text-xs text-gray-500">{targetYear} • £{targetPrice.toLocaleString()}</div>
                    </div>

                    {/* Trade-In Value */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium">Trade-In Value</div>
                      <div className="text-sm font-bold text-green-600">
                        {tradeIn.estimatedValue ? `£${tradeIn.estimatedValue.toLocaleString()}` : 'N/A'}
                      </div>
                    </div>

                    {/* Balance Due */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium">Balance Due</div>
                      <div className="text-sm font-bold text-red-600">
                        {tradeIn.balanceDue !== null && tradeIn.balanceDue !== undefined ? `£${tradeIn.balanceDue.toLocaleString()}` : 
                          targetPrice && tradeIn.estimatedValue ? `£${Math.max(0, targetPrice - tradeIn.estimatedValue).toLocaleString()}` : 'N/A'}
                      </div>
                    </div>

                    {/* Monthly Payment */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium">Monthly Payment</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {tradeIn.monthlyPayment !== null && tradeIn.monthlyPayment !== undefined ? `£${tradeIn.monthlyPayment.toFixed(2)}` : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tradeIn.financingTerm ? `${tradeIn.financingTerm} months` : ''}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium">Status</div>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full border ${statusColors[tradeIn.status] || 'bg-gray-100 text-gray-800'}`}>
                        {tradeIn.status}
                      </span>
                    </div>

                    {/* Expand */}
                    <div className="text-right">
                      <span className="text-gray-400 text-lg">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t bg-gray-50 p-5 space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      
                      {/* Trade-In Vehicle Assessment Details */}
                      <div className="bg-white rounded-lg border p-4 space-y-3">
                        <h4 className="font-semibold text-gray-900 border-b pb-2">📋 Trade-In Vehicle Assessment</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-500">Registration:</div>
                          <div className="font-medium">{tradeIn.registrationNumber}</div>
                          <div className="text-gray-500">Make:</div>
                          <div className="font-medium">{tradeIn.make || 'N/A'}</div>
                          <div className="text-gray-500">Model:</div>
                          <div className="font-medium">{tradeIn.model}</div>
                          <div className="text-gray-500">Year:</div>
                          <div className="font-medium">{tradeIn.yearOfManufacture || 'N/A'}</div>
                          <div className="text-gray-500">Mileage:</div>
                          <div className="font-medium">{tradeIn.mileage.toLocaleString()} miles</div>
                          <div className="text-gray-500">Condition:</div>
                          <div className="font-medium capitalize">{tradeIn.condition}</div>
                          <div className="text-gray-500">Fuel Type:</div>
                          <div className="font-medium">{tradeIn.fuelType || 'N/A'}</div>
                          <div className="text-gray-500">Colour:</div>
                          <div className="font-medium">{tradeIn.colour || 'N/A'}</div>
                          <div className="text-gray-500">Previous Owners:</div>
                          <div className="font-medium">{tradeIn.previousOwners}</div>
                          <div className="text-gray-500">Accident History:</div>
                          <div className="font-medium">{tradeIn.accidentHistory ? `Yes (${tradeIn.numberOfAccidents || 0} accidents)` : 'No'}</div>
                          <div className="text-gray-500">Modifications:</div>
                          <div className="font-medium">{tradeIn.hasModifications ? 'Yes' : 'No'}</div>
                          <div className="text-gray-500">Service History:</div>
                          <div className="font-medium">{tradeIn.fullServiceHistory ? 'Full' : 'Partial/None'}</div>
                          <div className="text-gray-500">Interior (1-5):</div>
                          <div className="font-medium">{tradeIn.interiorCondition ?? 'N/A'}</div>
                          <div className="text-gray-500">Exterior (1-5):</div>
                          <div className="font-medium">{tradeIn.exteriorCondition ?? 'N/A'}</div>
                        </div>
                        {tradeIn.conditionDetails && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">Condition Notes:</div>
                            <div className="text-sm bg-gray-50 p-2 rounded border">{tradeIn.conditionDetails}</div>
                          </div>
                        )}
                      </div>

                      {/* Transaction Details */}
                      <div className="bg-white rounded-lg border p-4 space-y-3">
                        <h4 className="font-semibold text-gray-900 border-b pb-2">💰 Transaction Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-1 border-b border-dashed">
                            <span className="text-gray-500">Target Car:</span>
                            <span className="font-medium">{targetCar} ({targetYear})</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-dashed">
                            <span className="text-gray-500">Car Price:</span>
                            <span className="font-bold text-gray-900">£{targetPrice.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-dashed">
                            <span className="text-gray-500">Trade-In Value:</span>
                            <span className="font-bold text-green-600">- £{(tradeIn.estimatedValue || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-dashed bg-yellow-50 px-2 rounded">
                            <span className="text-gray-700 font-medium">Balance After Trade-In:</span>
                            <span className="font-bold text-red-600">
                              £{(tradeIn.balanceDue !== null && tradeIn.balanceDue !== undefined ? tradeIn.balanceDue : Math.max(0, targetPrice - (tradeIn.estimatedValue || 0))).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-dashed">
                            <span className="text-gray-500">Cash Deposit:</span>
                            <span className="font-medium">- £{(tradeIn.cashDeposit || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-dashed bg-red-50 px-2 rounded">
                            <span className="text-gray-700 font-medium">Amount to Finance:</span>
                            <span className="font-bold text-red-700">
                              £{(tradeIn.remainingAfterDeposit !== null && tradeIn.remainingAfterDeposit !== undefined ? tradeIn.remainingAfterDeposit : 
                                Math.max(0, (tradeIn.balanceDue || Math.max(0, targetPrice - (tradeIn.estimatedValue || 0))) - (tradeIn.cashDeposit || 0))
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-dashed">
                            <span className="text-gray-500">Financing Term:</span>
                            <span className="font-medium">{tradeIn.financingTerm ? `${tradeIn.financingTerm} months` : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-dashed bg-green-50 px-2 rounded">
                            <span className="text-gray-700 font-medium">Monthly Payment:</span>
                            <span className="font-bold text-green-700">
                              {tradeIn.monthlyPayment !== null && tradeIn.monthlyPayment !== undefined ? `£${tradeIn.monthlyPayment.toFixed(2)}` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-500">Payment Method:</span>
                            <span className="font-medium capitalize">{tradeIn.paymentMethod || 'Financing'}</span>
                          </div>
                          {(tradeIn.overage ?? 0) > 0 && (
                            <div className="bg-green-100 border border-green-300 text-green-800 px-3 py-2 rounded text-sm mt-2">
                              ✅ Trade-in value exceeds car price. Credit: £{(tradeIn.overage || 0).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Admin Actions */}
                      <div className="bg-white rounded-lg border p-4 space-y-3">
                        <h4 className="font-semibold text-gray-900 border-b pb-2">⚡ Admin Actions</h4>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Update Status</label>
                          <select
                            value={tradeIn.status}
                            onChange={(e) => updateTradeIn(tradeIn.id, { status: e.target.value })}
                            className="w-full text-sm border-gray-300 rounded-md border p-2"
                          >
                            <option value="PENDING">⏳ Pending</option>
                            <option value="APPROVED">✅ Approved</option>
                            <option value="REJECTED">❌ Rejected</option>
                            <option value="COMPLETED">🏁 Completed</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Actual Value (Admin Override)</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder={tradeIn.estimatedValue?.toString() || 'Enter value'}
                              defaultValue={tradeIn.actualValue || ''}
                              className="flex-1 text-sm border-gray-300 rounded-md border p-2"
                              id={`actual-${tradeIn.id}`}
                            />
                            <button
                              onClick={() => {
                                const input = document.getElementById(`actual-${tradeIn.id}`) as HTMLInputElement;
                                const val = parseFloat(input.value);
                                if (!isNaN(val)) {
                                  updateTradeIn(tradeIn.id, { actualValue: val });
                                }
                              }}
                              className="px-3 py-2 bg-red-600 text-white text-xs rounded-md hover:bg-red-700"
                            >
                              Set
                            </button>
                          </div>
                          {tradeIn.actualValue && (
                            <div className="text-xs text-red-600 mt-1">
                              Current: £{tradeIn.actualValue.toLocaleString()}
                              {tradeIn.estimatedValue && tradeIn.actualValue !== tradeIn.estimatedValue && (
                                <span className={tradeIn.actualValue > tradeIn.estimatedValue ? ' text-green-600' : ' text-red-600'}>
                                  {' '}({tradeIn.actualValue > tradeIn.estimatedValue ? '+' : ''}£{(tradeIn.actualValue - tradeIn.estimatedValue).toLocaleString()} from estimate)
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Admin Notes</label>
                          <textarea
                            value={adminNotes[tradeIn.id] || ''}
                            onChange={(e) => setAdminNotes(prev => ({ ...prev, [tradeIn.id]: e.target.value }))}
                            className="w-full text-sm border-gray-300 rounded-md border p-2"
                            rows={3}
                            placeholder="Internal notes about this trade-in..."
                          />
                          <button
                            onClick={() => updateTradeIn(tradeIn.id, { adminNotes: adminNotes[tradeIn.id] })}
                            className="mt-1 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md hover:bg-gray-900"
                          >
                            Save Notes
                          </button>
                        </div>

                        <div className="pt-2 border-t">
                          <div className="text-xs text-gray-500">
                            <div>Quote ID: {tradeIn.quote?.id || 'N/A'}</div>
                            <div>Quote Status: {tradeIn.quote?.quoteStatus || 'N/A'}</div>
                            <div>Created: {new Date(tradeIn.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
