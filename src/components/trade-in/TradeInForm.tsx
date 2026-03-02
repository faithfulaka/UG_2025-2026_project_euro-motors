// src/components/trade-in/TradeInForm.tsx
'use client';

import React from 'react';

interface TradeInFormProps {
	children: React.ReactNode;
	onSubmit?: () => void;
}

const TradeInForm: React.FC<TradeInFormProps> = ({ children, onSubmit }) => {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit?.();
			}}
			className="space-y-4"
		>
			{children}
		</form>
	);
};

export default TradeInForm;
