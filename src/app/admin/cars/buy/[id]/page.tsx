'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import CarBuyForm from '@/components/admin/CarBuyForm';
import { BuyCar } from '@/types/cars';

export default function AdminEditCarPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const carId = params?.id as string;
  
  const [car, setCar] = useState<BuyCar | null>(null);
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
        const response = await fetch(`/api/admin/cars/${carId}?type=buy`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch car details');
        }
        
        const data = await response.json();
        setCar(data);
      } catch (error) {
        console.error('Error fetching car:', error);
        setError('Failed to load car details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCar();
  }, [carId, user, isAdmin]);

  // Update the type to match what CarBuyForm expects
  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await fetch('/api/admin/cars?type=buy', {
        method: 'POST', // or 'PUT' for edit
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
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
            href="/admin/cars/buy"
            className="block w-full text-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Back to Cars List
          </Link>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin || !car) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/admin/cars/buy" className="text-blue-600 hover:underline mb-6 inline-block">
          &larr; Back to Cars
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Edit Car: {car.make} {car.model}</h1>
        
        <CarBuyForm
          car={car}
          mode="edit"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}