// src/app/admin/cars/rent/add/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import CarRentForm from '@/components/admin/CarRentForm';

export default function AdminAddRentalCarPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, isAdmin, router]);

  const handleSubmit = async (formData: any) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      const response = await fetch('/api/admin/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, type: 'rent' }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to add rental car');
      }

      router.push('/admin/cars/rent');
      alert('Rental car added successfully!');
    } catch (error) {
      console.error('Error adding rental car:', error);
      alert(error instanceof Error ? error.message : 'Failed to add rental car. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/admin/cars/rent');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div>
      <Link href="/admin/cars/rent" className="text-blue-600 hover:underline mb-6 inline-block text-sm">
        ← Back to Rental Cars List
      </Link>
      
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Add New Rental Car</h1>
      
      <CarRentForm
        mode="add"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
