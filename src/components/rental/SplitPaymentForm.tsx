"use client";

import React from 'react';

interface CoRenterInput {
	email: string;
	name?: string;
	paymentAmount?: number;
}

interface SplitPaymentFormProps {
	enabled: boolean;
	coRenters: CoRenterInput[];
	onToggle: (enabled: boolean) => void;
	onChange: (next: CoRenterInput[]) => void;
}

export default function SplitPaymentForm({
	enabled,
	coRenters,
	onToggle,
	onChange,
}: SplitPaymentFormProps) {
	const addRow = () => onChange([...coRenters, { email: '', name: '', paymentAmount: 0 }]);
	const removeRow = (index: number) => onChange(coRenters.filter((_, i) => i !== index));

	return (
		<div className="space-y-3">
			<label className="flex items-center gap-2 text-sm text-gray-700">
				<input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked)} />
				Enable split payment with co-renters
			</label>

			{enabled && (
				<div className="space-y-2">
					{coRenters.map((r, i) => (
						<div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2">
							<input
								type="email"
								value={r.email}
								onChange={(e) => {
									const next = [...coRenters];
									next[i] = { ...next[i], email: e.target.value };
									onChange(next);
								}}
								placeholder="Co-renter email"
								className="border rounded px-3 py-2"
							/>
							<input
								type="text"
								value={r.name || ''}
								onChange={(e) => {
									const next = [...coRenters];
									next[i] = { ...next[i], name: e.target.value };
									onChange(next);
								}}
								placeholder="Name (optional)"
								className="border rounded px-3 py-2"
							/>
							<input
								type="number"
								value={r.paymentAmount || ''}
								onChange={(e) => {
									const next = [...coRenters];
									next[i] = { ...next[i], paymentAmount: Number(e.target.value) };
									onChange(next);
								}}
								placeholder="Amount"
								className="border rounded px-3 py-2"
							/>
							<button type="button" onClick={() => removeRow(i)} className="text-red-600 text-sm">
								Remove
							</button>
						</div>
					))}
					<button type="button" onClick={addRow} className="text-sm text-red-600 font-medium">
						+ Add Co-renter
					</button>
				</div>
			)}
		</div>
	);
}
