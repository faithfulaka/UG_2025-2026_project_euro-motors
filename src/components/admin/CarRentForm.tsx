'use client';

import React, { useState } from 'react';
import { RentalCar } from '@/types/cars';

interface CarFormProps {
  car?: RentalCar;
  mode: 'add' | 'edit';
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function CarRentForm({ car, mode, onSubmit, onCancel }: CarFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      await onSubmit(Object.fromEntries(formData));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {mode === 'add' ? 'Add New Rental Car' : 'Edit Rental Car'}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
            <input
              type="text"
              name="make"
              defaultValue={car?.make || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input
              type="text"
              name="model"
              defaultValue={car?.model || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
