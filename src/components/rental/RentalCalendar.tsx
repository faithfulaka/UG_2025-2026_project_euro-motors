"use client";

import React from 'react';

interface RentalCalendarProps {
	startDate: string;
	endDate: string;
	onStartDateChange: (value: string) => void;
	onEndDateChange: (value: string) => void;
	minDate?: string;
}

export default function RentalCalendar({
	startDate,
	endDate,
	onStartDateChange,
	onEndDateChange,
	minDate,
}: RentalCalendarProps) {
	const today = minDate || new Date().toISOString().split('T')[0];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<input
				type="date"
				min={today}
				value={startDate}
				onChange={(e) => onStartDateChange(e.target.value)}
				className="w-full border rounded px-3 py-2 text-black bg-white"
			/>
			<input
				type="date"
				min={startDate || today}
				value={endDate}
				onChange={(e) => onEndDateChange(e.target.value)}
				className="w-full border rounded px-3 py-2 text-black bg-white"
			/>
		</div>
	);
}
