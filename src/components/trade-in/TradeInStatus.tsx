// src/components/trade-in/TradeInStatus.tsx
'use client';

import React from 'react';
import type { TradeInQuoteSummary } from './TradeInModal';

interface TradeInStatusProps {
	summary: TradeInQuoteSummary;
	carPrice: number;
}

const TradeInStatus: React.FC<TradeInStatusProps> = ({ summary, carPrice }) => {
	return (
		<div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
			<div className="flex items-center justify-between">
				<h4 className="text-lg font-semibold text-gray-900">Trade-In Quote Summary</h4>
				<span className="text-sm text-gray-500">Quote ID: {summary.quoteId}</span>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
				<div className="bg-gray-50 border rounded-md p-3">
					<div className="text-gray-600">Vehicle Price</div>
					<div className="text-lg font-semibold">£{carPrice.toLocaleString()}</div>
				</div>
				<div className="bg-gray-50 border rounded-md p-3">
					<div className="text-gray-600">Trade-In Value</div>
					<div className="text-lg font-semibold">£{summary.estimatedValue.toLocaleString()}</div>
				</div>
				<div className="bg-gray-50 border rounded-md p-3">
					<div className="text-gray-600">Balance Due</div>
					<div className="text-lg font-semibold">£{summary.balanceDue.toLocaleString()}</div>
				</div>
				<div className="bg-gray-50 border rounded-md p-3">
					<div className="text-gray-600">Down Payment</div>
					<div className="text-lg font-semibold">£{summary.cashDeposit.toLocaleString()}</div>
				</div>
				<div className="bg-gray-50 border rounded-md p-3">
					<div className="text-gray-600">Term</div>
					<div className="text-lg font-semibold">{summary.termMonths} months</div>
				</div>
				<div className="bg-gray-50 border rounded-md p-3">
					<div className="text-gray-600">Estimated Monthly</div>
					<div className="text-lg font-semibold">£{summary.monthlyPayment.toFixed(2)}</div>
				</div>
			</div>

			{summary.overage > 0 && (
				<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
					Trade-in value exceeds the car price. Credit available: £{summary.overage.toLocaleString()}.
				</div>
			)}
		</div>
	);
};

export default TradeInStatus;
