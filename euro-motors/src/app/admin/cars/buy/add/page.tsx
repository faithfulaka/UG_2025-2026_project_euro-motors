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

  // Update the type to match what CarBuyForm expects
  const handleSubmit = async (formData: import('@/types/cars').BuyCar) => {
    try {
      const response = await fetch('/api/admin/cars?type=buy', {
        method: 'POST', // or 'PUT' for edit
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add car');
      }
      
      router.push('/admin/cars/buy');
      alert('Car added successfully');
    } catch (error) {
      console.error('Error adding car:', error);
      alert('Failed to add car. Please try again.');
    }
  }

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

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/admin/cars/buy" className="text-blue-600 hover:underline mb-6 inline-block">
          &larr; Back to Cars
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Add New Car</h1>
        
        <CarBuyForm
          mode="add"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}