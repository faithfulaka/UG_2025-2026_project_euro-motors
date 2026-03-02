// src/app/admin/cars/buy/add/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import CarBuyForm from '@/components/admin/CarBuyForm';

export default function AdminAddCarPage() {
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
        body: JSON.stringify({ ...formData, type: 'buy' }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to add car');
      }

      // Wait a bit for any image uploads to complete, then redirect
      setTimeout(() => {
        router.push('/admin/cars/buy');
        alert('Car added successfully!');
      }, 1000);
    } catch (error) {
      console.error('Error adding car:', error);
      alert(error instanceof Error ? error.message : 'Failed to add car. Please try again.');
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/admin/cars/buy');
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
      <Link href="/admin/cars/buy" className="text-red-600 hover:underline mb-6 inline-block text-sm">
        ← Back to Cars List
      </Link>
      
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Add New Car for Sale</h1>
      
      <CarBuyForm
        mode="add"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
