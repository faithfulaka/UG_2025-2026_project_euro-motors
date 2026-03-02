// src/app/admin/cars/rent/[id]/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import CarRentForm from '@/components/admin/CarRentForm';
import { RentalCar } from '@/types/cars';

export default function AdminEditRentalCarPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const carId = params?.id as string;
  
  const [car, setCar] = useState<RentalCar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
    async function fetchCar() {
      if (!carId || !user || !isAdmin) return;
      
      try {
        setIsLoading(true);
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        
        const response = await fetch(`/api/admin/cars/${carId}?type=rent`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch car details');
        }
        
        const result = await response.json();
        if (result.success && result.data) {
          setCar(result.data);
        } else {
          throw new Error('Car not found');
        }
      } catch (error) {
        console.error('Error fetching car:', error);
        setError('Failed to load car details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCar();
  }, [carId, user, isAdmin]);

  const handleSubmit = async (formData: any) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      const response = await fetch(`/api/admin/cars/${carId}?type=rent`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to update rental car');
      }

      router.push('/admin/cars/rent');
      alert('Rental car updated successfully!');
    } catch (error) {
      console.error('Error updating car:', error);
      alert(error instanceof Error ? error.message : 'Failed to update rental car. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/admin/cars/rent');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <div className="text-xl">Loading car details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link
            href="/admin/cars/rent"
            className="block w-full text-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Back to Rental Cars List
          </Link>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin || !car) {
    return null;
  }

  return (
    <div>
      <Link href="/admin/cars/rent" className="text-red-600 hover:underline mb-6 inline-block text-sm">
        ← Back to Rental Cars List
      </Link>
      
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Edit Rental Car: {car.make} {car.model}</h1>
      
      <CarRentForm
        car={car}
        mode="edit"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
