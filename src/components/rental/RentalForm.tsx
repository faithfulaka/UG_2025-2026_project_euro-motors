"use client";

import React from 'react';

type RentalDuration = 'HOURLY' | 'DAILY' | 'WEEKLY';

interface RentalFormProps {
	startDate: string;
	endDate: string;
	duration: RentalDuration;
	onStartDateChange: (value: string) => void;
	onEndDateChange: (value: string) => void;
	onDurationChange: (value: RentalDuration) => void;
}

export default function RentalForm({
	startDate,
	endDate,
	duration,
	onStartDateChange,
	onEndDateChange,
	onDurationChange,
}: RentalFormProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			<input
				type="date"
				value={startDate}
				onChange={(e) => onStartDateChange(e.target.value)}
				className="w-full border rounded px-3 py-2 text-black bg-white"
			/>
			<input
				type="date"
				value={endDate}
				onChange={(e) => onEndDateChange(e.target.value)}
				className="w-full border rounded px-3 py-2 text-black bg-white"
			/>
			<select
				value={duration}
				onChange={(e) => onDurationChange(e.target.value as RentalDuration)}
				className="w-full border rounded px-3 py-2 text-black bg-white"
			>
				<option value="HOURLY">Hourly</option>
				<option value="DAILY">Daily</option>
				<option value="WEEKLY">Weekly</option>
			</select>
		</div>
	);
}
