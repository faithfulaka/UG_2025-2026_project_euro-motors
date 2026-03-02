// src/components/trade-in/TradeInModal.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import TermSlider from '@/components/ui/TermSlider';
import type { BuyCar } from '@/types/cars';
import { downloadQuotePdf } from '@/lib/quote-pdf';

export interface TradeInQuoteSummary {
	quoteId: string;
	tradeInId: string;
	estimatedValue: number;
	balanceDue: number;
	cashDeposit: number;
	termMonths: number;
	monthlyPayment: number;
	overage: number;
}

interface TradeInModalProps {
	isOpen: boolean;
	onClose: () => void;
	car: BuyCar;
	onTradeInComplete: (summary: TradeInQuoteSummary) => void;
}

type Condition = 'excellent' | 'good' | 'fair' | 'poor';

interface TradeInFormValues {
	registrationNumber: string;
	make: string;
	model: string;
	yearOfManufacture: string;
	mileage: string;
	condition: Condition;
	previousOwners: string;
	accidentHistory: boolean;
	numberOfAccidents: string;
	hasModifications: boolean;
	fullServiceHistory: boolean;
	conditionDetails: string;
	interiorCondition: string;
	exteriorCondition: string;
	fuelType: string;
	colour: string;
}

interface TradeInEstimate {
	eligible: boolean;
	estimatedValue: number;
	reasons: string[];
}

const initialForm: TradeInFormValues = {
	registrationNumber: '',
	make: '',
	model: '',
	yearOfManufacture: '',
	mileage: '',
	condition: 'good',
	previousOwners: '1',
	accidentHistory: false,
	numberOfAccidents: '0',
	hasModifications: false,
	fullServiceHistory: true,
	conditionDetails: '',
	interiorCondition: '4',
	exteriorCondition: '4',
	fuelType: '',
	colour: ''
};

const conditionMultiplier: Record<Condition, number> = {
	excellent: 1.0,
	good: 0.9,
	fair: 0.8,
	poor: 0.65
};

const scoreToMultiplier = (score: number) => {
	if (score >= 5) return 1.0;
	if (score === 4) return 0.95;
	if (score === 3) return 0.9;
	if (score === 2) return 0.82;
	return 0.75;
};

const calculateEstimate = (form: TradeInFormValues, targetPrice: number): TradeInEstimate => {
	const reasons: string[] = [];
	
	// FIRST CHECK: Year validation
	const year = parseInt(form.yearOfManufacture || '0');
	const currentYear = new Date().getFullYear();
	
	if (!year) {
		return {
			eligible: false,
			estimatedValue: 0,
			reasons: ['Year of manufacture is required to estimate value.']
		};
	}

	// Check accidents early
	const accidents = parseInt(form.numberOfAccidents || '0');
	if (form.accidentHistory && accidents > 2) {
		return {
			eligible: false,
			estimatedValue: 0,
			reasons: ['Vehicle has more than 2 accidents and is not eligible for trade-in.']
		};
	}

	const mileage = parseInt(form.mileage || '0');
	const owners = parseInt(form.previousOwners || '1');
	const age = Math.max(0, currentYear - year);

	// ---- YEAR-BASED PRICING (PRIMARY FACTOR) ----
	// Higher year = higher value. A 2015 car is ALWAYS worth less than a 2025 car.
	// Start at 60% of target price as base value
	const baseValue = targetPrice * 0.6;
	
	// Year-based deduction: steeper for older cars
	// 2026 (current year): 0% deduction
	// 2025: -5%, 2024: -10%, 2023: -15%, 2022: -20%, 2020: -30%, 2015: -55%, 2010: -80%
	const yearDeductionPercent = Math.min(95, age * 5 + Math.max(0, age - 5) * 3);
	const ageFactor = Math.max(0.05, 1 - yearDeductionPercent / 100);
	
	// ---- HARD CAP: Pre-2025 cars CANNOT exceed a percentage of target price ----
	// This ensures the trade-in value of an older car never exceeds what they're buying
	let yearCap = targetPrice; // Default: no cap for current year cars
	if (year < currentYear) {
		// Pre-current-year cars are capped at decreasing % of target price
		// 2025: max 85%, 2024: max 70%, 2023: max 60%, etc.
		const capPercent = Math.max(10, 90 - age * 10);
		yearCap = targetPrice * (capPercent / 100);
	}
	
	// Mileage factor: Low mileage = higher value
	// 0 miles = 1.0, 50k = 0.85, 100k = 0.60, 200k+ = 0.20
	const mileageFactor = Math.max(0.2, 1 - (mileage / 200000) * 0.8);
	
	// Owner factor: More owners = less value
	const ownerFactor = owners === 1 ? 1.0 : owners === 2 ? 0.93 : owners === 3 ? 0.86 : 0.75;
	
	// Modification factor: Modified cars worth less
	const modificationFactor = form.hasModifications ? 0.85 : 1.0;
	
	// Accident factor: Major impact on value
	const accidentFactor = !form.accidentHistory ? 1.0 : 
		accidents === 1 ? 0.85 : 
		accidents === 2 ? 0.70 : 0.5;
	
	// Condition factor: Excellent to poor
	const conditionFactor = conditionMultiplier[form.condition];
	
	// Interior/Exterior condition: 1-5 scale
	const interiorFactor = scoreToMultiplier(parseInt(form.interiorCondition || '4'));
	const exteriorFactor = scoreToMultiplier(parseInt(form.exteriorCondition || '4'));

	// Service history factor
	const serviceHistoryFactor = form.fullServiceHistory ? 1.0 : 0.93;

	const rawEstimate = Math.round(
		baseValue *
			ageFactor *
			mileageFactor *
			ownerFactor *
			modificationFactor *
			accidentFactor *
			conditionFactor *
			interiorFactor *
			exteriorFactor *
			serviceHistoryFactor
	);

	// Apply year cap - pre-2025 cars NEVER exceed the year-based cap
	const cappedValue = Math.min(rawEstimate, yearCap);
	
	// CRITICAL: Never allow trade-in value to exceed target car price
	const finalValue = Math.min(cappedValue, targetPrice);

	// Build informative reasons from assessment data
	if (!form.make) reasons.push('Make not provided, estimate may be lower.');
	if (!form.fuelType) reasons.push('Fuel type not provided, estimate may be lower.');
	if (age > 0) reasons.push(`📅 Vehicle is ${age} year(s) old — ${yearDeductionPercent}% year-based deduction applied.`);
	if (year < currentYear && cappedValue < rawEstimate) reasons.push(`⚠️ Pre-${currentYear} vehicle: value capped at ${Math.round((yearCap / targetPrice) * 100)}% of target car price.`);
	if (mileage > 50000) reasons.push(`🔧 Mileage (${mileage.toLocaleString()} mi) reduces value by ${Math.round((1 - mileageFactor) * 100)}%.`);
	if (owners > 1) reasons.push(`👥 ${owners} previous owners: -${Math.round((1 - ownerFactor) * 100)}% deduction.`);
	if (form.accidentHistory) reasons.push(`💥 ${accidents} accident(s): -${Math.round((1 - accidentFactor) * 100)}% deduction.`);
	if (form.hasModifications) reasons.push('⚙️ Modifications: -15% deduction.');
	if (form.condition !== 'excellent') reasons.push(`🎨 Condition (${form.condition}): -${Math.round((1 - conditionFactor) * 100)}% deduction.`);
	if (!form.fullServiceHistory) reasons.push('📋 No full service history: -7% deduction.');

	return {
		eligible: true,
		estimatedValue: Math.max(500, finalValue),
		reasons
	};
};

const getToken = () => {
	if (typeof document === 'undefined') return undefined;
	const match = document.cookie.split('; ').find(row => row.startsWith('token='));
	if (!match) {
		console.warn('Token not found in cookies');
	}
	return match?.split('=')[1];
};

const TradeInModal: React.FC<TradeInModalProps> = ({ isOpen, onClose, car, onTradeInComplete }) => {
	const [form, setForm] = useState<TradeInFormValues>(initialForm);
	const [estimate, setEstimate] = useState<TradeInEstimate | null>(null);
	const [cashDeposit, setCashDeposit] = useState('');
	const [termMonths, setTermMonths] = useState(24);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [lastForm, setLastForm] = useState<TradeInFormValues | null>(null);
	const [lastPrice, setLastPrice] = useState<number | null>(null);
	const [priceChange, setPriceChange] = useState<number | null>(null);

	useEffect(() => {
		if (!isOpen) {
			setForm(initialForm);
			setEstimate(null);
			setCashDeposit('');
			setTermMonths(24);
			setIsSubmitting(false);
			setError('');
		}
	}, [isOpen]);

	const depositValue = useMemo(() => parseFloat(cashDeposit || '0') || 0, [cashDeposit]);
	const tradeInValue = estimate?.estimatedValue || 0;
	const balanceDue = Math.max(0, car.price - tradeInValue);
	const minimumDeposit = Math.round(balanceDue * 0.3); // 30% of balance due for trade-in
	const remainingAfterDeposit = Math.max(0, balanceDue - depositValue);
	const monthlyPayment = termMonths > 0 ? remainingAfterDeposit / termMonths : 0;

	const updateField = (field: keyof TradeInFormValues, value: string | boolean) => {
		setForm(prev => ({ ...prev, [field]: value }));
	};

	const handleEstimate = async () => {
		setError('');
		if (!form.registrationNumber || !form.model || !form.mileage) {
			setError('Please fill in registration number, model, and mileage.');
			return;
		}

		// First run basic validation
		const basicResult = calculateEstimate(form, car.price);
		if (!basicResult.eligible) {
			setEstimate(basicResult);
			return;
		}

		// Then use AI for intelligent valuation
		setIsSubmitting(true);
		try {
			const response = await fetch('/api/trade-in/evaluate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({
					targetPrice: car.price,
					make: form.make,
					model: form.model,
					year: parseInt(form.yearOfManufacture || '0'),
					mileage: parseInt(form.mileage || '0'),
					condition: form.condition,
					accidentHistory: form.accidentHistory,
					numberOfAccidents: parseInt(form.numberOfAccidents || '0'),
					previousOwners: parseInt(form.previousOwners || '1'),
					fullServiceHistory: form.fullServiceHistory,
					hasModifications: form.hasModifications,
					interiorCondition: parseInt(form.interiorCondition || '4'),
					exteriorCondition: parseInt(form.exteriorCondition || '4'),
					fuelType: form.fuelType,
					colour: form.colour,
					// Include last valuation for context
					lastPrice: lastPrice,
					previousCondition: lastForm?.condition,
					previousMileage: lastForm ? parseInt(lastForm.mileage || '0') : undefined,
					previousAccidents: lastForm ? parseInt(lastForm.numberOfAccidents || '0') : undefined
				})
			});

			const data = await response.json();

			if (response.ok && data.success) {
				// Calculate price change
				const newPrice = data.data.estimatedValue;
				const change = lastPrice ? newPrice - lastPrice : null;
				
				// Use AI valuation with detailed breakdown
				const reasons: string[] = [data.data.reasoning];
				
				// Add deduction details if available
				if (data.data.deductions) {
					const deds = data.data.deductions;
					if (deds.mileageDeduction > 0) reasons.push(`🔧 Mileage: -${deds.mileageDeduction}%`);
					if (deds.ageDeduction > 0) reasons.push(`📅 Age: -${deds.ageDeduction}%`);
					if (deds.ownersDeduction > 0) reasons.push(`👥 Previous Owners: -${deds.ownersDeduction}%`);
					if (deds.modificationDeduction > 0) reasons.push(`⚙️ Modifications: -${deds.modificationDeduction}%`);
					if (deds.accidentDeduction > 0) reasons.push(`💥 Accidents: -${deds.accidentDeduction}%`);
					if (deds.conditionDeduction > 0) reasons.push(`🎨 Condition: -${deds.conditionDeduction}%`);
					if (deds.interiorExteriorDeduction > 0) reasons.push(`🛋️ Interior/Exterior: -${deds.interiorExteriorDeduction}%`);
					if (deds.serviceHistoryDeduction > 0) reasons.push(`📋 Service History: -${deds.serviceHistoryDeduction}%`);
					
					if (data.data.totalDeductionPercent > 0) {
						reasons.push(`📊 Total Deductions: ${data.data.totalDeductionPercent}%`);
					}
				}
				
				const aiEstimate: TradeInEstimate = {
					eligible: true,
					estimatedValue: data.data.estimatedValue,
					reasons
				};
				setEstimate(aiEstimate);
				// Cache the form and price for next analysis
				setLastForm(form);
				setLastPrice(data.data.estimatedValue);
				setPriceChange(change);
			} else {
				// Fall back to basic calculation if AI fails
				setEstimate(basicResult);
				setError('Using standard valuation (AI service unavailable)');
			}
		} catch (err) {
			console.error('Valuation error:', err);
			// Fall back to basic calculation
			setEstimate(basicResult);
			setError('Using standard valuation (connection error)');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleGenerateQuote = async () => {
		if (!estimate?.eligible) {
			setError('Trade-in is not eligible.');
			return;
		}
		if (balanceDue > 0 && depositValue < minimumDeposit) {
			setError(`Down payment must be at least £${minimumDeposit.toLocaleString()}.`);
			return;
		}

		setIsSubmitting(true);
		setError('');

		try {
			const quoteRes = await fetch('/api/quotes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({
					carId: car.id,
					amount: car.price,
					financingOption: true,
					financingTerm: termMonths,
					monthlyPayment,
					cashDeposit: depositValue,
					tradeInIncluded: true
				})
			});

			const quoteJson = await quoteRes.json();
			if (!quoteRes.ok || !quoteJson.success) {
				throw new Error(quoteJson?.error?.message || 'Failed to create quote');
			}

			const tradeInRes = await fetch('/api/trade-in', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({
					quoteId: quoteJson.data.id,
					registrationNumber: form.registrationNumber,
					make: form.make,
					model: form.model,
					colour: form.colour,
					fuelType: form.fuelType,
					yearOfManufacture: form.yearOfManufacture,
					mileage: form.mileage,
					condition: form.condition,
					conditionDetails: form.conditionDetails,
					accidentHistory: form.accidentHistory,
					numberOfAccidents: form.numberOfAccidents,
					previousOwners: form.previousOwners,
					fullServiceHistory: form.fullServiceHistory,
					hasModifications: form.hasModifications,
					interiorCondition: form.interiorCondition,
					exteriorCondition: form.exteriorCondition,
					estimatedValue: tradeInValue,
					// Transaction details for admin visibility
					targetCarMake: car.make,
					targetCarModel: car.model,
					targetCarYear: car.year,
					targetCarPrice: car.price,
					balanceDue,
					cashDeposit: depositValue,
					financingTerm: termMonths,
					monthlyPayment,
					remainingAfterDeposit,
					overage: Math.max(0, tradeInValue - car.price),
					paymentMethod: 'financing'
				})
			});

			const tradeJson = await tradeInRes.json();
			if (!tradeInRes.ok || !tradeJson.success) {
				throw new Error(tradeJson?.error?.message || 'Failed to create trade-in request');
			}

			const summary: TradeInQuoteSummary = {
				quoteId: quoteJson.data.id,
				tradeInId: tradeJson.data.id,
				estimatedValue: tradeInValue,
				balanceDue,
				cashDeposit: depositValue,
				termMonths,
				monthlyPayment,
				overage: Math.max(0, tradeInValue - car.price)
			};

			downloadQuotePdf({
				quoteId: summary.quoteId,
				car,
				quoteType: 'trade-in',
				amount: car.price,
				tradeInValue: tradeInValue,
				balanceDue: summary.balanceDue,
				cashDeposit: summary.cashDeposit,
				termMonths: summary.termMonths,
				monthlyPayment: summary.monthlyPayment,
				customerNotes: summary.overage > 0
					? 'Trade-in value exceeds vehicle price. Credit available on account.'
					: 'Balance due after trade-in will be financed.'
			});

			onTradeInComplete(summary);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to generate quote');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
			<div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
				<div className="flex items-center justify-between px-6 py-4 border-b">
					<h3 className="text-xl font-semibold text-gray-900">Trade-In Assessment</h3>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
				</div>

				<div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
							{error}
						</div>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">Registration Number *</label>
							<input
								value={form.registrationNumber}
								onChange={(e) => updateField('registrationNumber', e.target.value)}
								className="mt-1 w-full border rounded-md p-2"
								placeholder="AB12 CDE"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Make</label>
							<input
								value={form.make}
								onChange={(e) => updateField('make', e.target.value)}
								className="mt-1 w-full border rounded-md p-2"
								placeholder="BMW"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Model *</label>
							<input
								value={form.model}
								onChange={(e) => updateField('model', e.target.value)}
								className="mt-1 w-full border rounded-md p-2"
								placeholder="X5"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Year of Manufacture *</label>
							<input
								type="number"
								value={form.yearOfManufacture}
								onChange={(e) => updateField('yearOfManufacture', e.target.value)}
								className="mt-1 w-full border rounded-md p-2"
								placeholder="2019"
								min="1990"
								max={new Date().getFullYear().toString()}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Mileage *</label>
							<input
								value={form.mileage}
								onChange={(e) => updateField('mileage', e.target.value.replace(/[^0-9]/g, ''))}
								className="mt-1 w-full border rounded-md p-2"
								placeholder="35000"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Fuel Type</label>
							<input
								value={form.fuelType}
								onChange={(e) => updateField('fuelType', e.target.value)}
								className="mt-1 w-full border rounded-md p-2"
								placeholder="Petrol"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Exterior Colour</label>
							<input
								value={form.colour}
								onChange={(e) => updateField('colour', e.target.value)}
								className="mt-1 w-full border rounded-md p-2"
								placeholder="Black"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Condition *</label>
							<select
								value={form.condition}
								onChange={(e) => updateField('condition', e.target.value as Condition)}
								className="mt-1 w-full border rounded-md p-2"
							>
								<option value="excellent">Excellent</option>
								<option value="good">Good</option>
								<option value="fair">Fair</option>
								<option value="poor">Poor</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Previous Owners *</label>
							<input
								value={form.previousOwners}
								onChange={(e) => updateField('previousOwners', e.target.value.replace(/[^0-9]/g, ''))}
								className="mt-1 w-full border rounded-md p-2"
								placeholder="1"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={form.accidentHistory}
								onChange={(e) => updateField('accidentHistory', e.target.checked)}
							/>
							<span className="text-sm text-gray-700">Accident history</span>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Number of Accidents</label>
							<input
								value={form.numberOfAccidents}
								onChange={(e) => updateField('numberOfAccidents', e.target.value.replace(/[^0-9]/g, ''))}
								className="mt-1 w-full border rounded-md p-2"
								placeholder="0"
								disabled={!form.accidentHistory}
							/>
						</div>
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={form.hasModifications}
								onChange={(e) => updateField('hasModifications', e.target.checked)}
							/>
							<span className="text-sm text-gray-700">Modifications</span>
						</div>
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={form.fullServiceHistory}
								onChange={(e) => updateField('fullServiceHistory', e.target.checked)}
							/>
							<span className="text-sm text-gray-700">Full service history</span>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Interior Condition (1-5)</label>
							<input
								value={form.interiorCondition}
								onChange={(e) => updateField('interiorCondition', e.target.value.replace(/[^1-5]/g, ''))}
								className="mt-1 w-full border rounded-md p-2"
								placeholder="4"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Exterior Condition (1-5)</label>
							<input
								value={form.exteriorCondition}
								onChange={(e) => updateField('exteriorCondition', e.target.value.replace(/[^1-5]/g, ''))}
								className="mt-1 w-full border rounded-md p-2"
								placeholder="4"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">Condition Details</label>
						<textarea
							value={form.conditionDetails}
							onChange={(e) => updateField('conditionDetails', e.target.value)}
							className="mt-1 w-full border rounded-md p-2"
							rows={3}
							placeholder="Describe any known issues"
						/>
					</div>

					<button
						onClick={handleEstimate}
						disabled={isSubmitting}
						className={`w-full py-3 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
							isSubmitting
								? 'bg-gray-400 text-gray-700 cursor-not-allowed'
								: 'bg-black text-white hover:bg-gray-800 active:scale-95'
						}`}
					>
						{isSubmitting ? (
							<>
								<svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								<span>Analyzing Vehicle...</span>
							</>
						) : (
							'Evaluate Trade-In'
						)}
					</button>

					{estimate && (
						<div className="border rounded-lg p-4 bg-gray-50 space-y-3">
							<div className="flex items-center justify-between">
								<div className="text-lg font-semibold text-gray-900">
									{estimate.eligible ? 'Estimated Trade-In Value' : 'Trade-In Not Eligible'}
								</div>
								{estimate.eligible && (
									<div className="space-y-1 text-right">
										<div className="text-2xl font-bold text-green-600">£{estimate.estimatedValue.toLocaleString()}</div>
										{priceChange !== null && (
											<div className={`text-sm font-medium ${priceChange > 0 ? 'text-green-600' : priceChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
												{priceChange > 0 ? '📈 +' : priceChange < 0 ? '📉 ' : ''} £{Math.abs(priceChange).toLocaleString()} {priceChange > 0 ? '(improved)' : priceChange < 0 ? '(adjusted)' : '(no change)'}
											</div>
										)}
									</div>
								)}
							</div>
							{estimate.reasons.length > 0 && (
								<ul className="text-sm text-gray-600 list-disc pl-5">
									{estimate.reasons.map((reason, index) => (
										<li key={index}>{reason}</li>
									))}
								</ul>
							)}

							{estimate.eligible && (
								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700">Down Payment (minimum £{minimumDeposit.toLocaleString()} - 30% of balance)</label>
											<input
												value={cashDeposit}
												onChange={(e) => setCashDeposit(e.target.value.replace(/[^0-9.]/g, ''))}
												className="mt-1 w-full border rounded-md p-2"
												placeholder="5000"
											/>
										</div>
										<div className="bg-white border rounded-md p-3">
											<div className="text-sm text-gray-600">Balance after trade-in</div>
											<div className="text-lg font-semibold text-gray-900">£{balanceDue.toLocaleString()}</div>
										</div>
									</div>

									<TermSlider termMonths={termMonths} setTermMonths={setTermMonths} />

									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
										<div className="bg-white border rounded-md p-3">
											<div className="text-gray-600">Remaining after deposit</div>
											<div className="text-lg font-semibold">£{remainingAfterDeposit.toLocaleString()}</div>
										</div>
										<div className="bg-white border rounded-md p-3">
											<div className="text-gray-600">Estimated monthly</div>
											<div className="text-lg font-semibold">£{monthlyPayment.toFixed(2)}</div>
										</div>
										<div className="bg-white border rounded-md p-3">
											<div className="text-gray-600">Overage credit</div>
											<div className="text-lg font-semibold">£{Math.max(0, tradeInValue - car.price).toLocaleString()}</div>
										</div>
									</div>

									<button
										onClick={handleGenerateQuote}
										disabled={isSubmitting}
										className="w-full py-3 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:opacity-60"
									>
										{isSubmitting ? 'Generating Quote...' : 'Generate Quote + Download PDF'}
									</button>
								</div>
							)}
						</div>
					)}
				</div>

				<div className="px-6 py-4 border-t flex justify-end gap-3">
					<button onClick={onClose} className="px-4 py-2 border rounded-md">Close</button>
				</div>
			</div>
		</div>
	);
};

export default TradeInModal;
