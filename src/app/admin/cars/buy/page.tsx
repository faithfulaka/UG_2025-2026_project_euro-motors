// src/app/admin/cars/buy/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { BuyCar } from '@/types/cars';

export default function AdminCarsBuyPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [cars, setCars] = useState<BuyCar[]>([]);
  const [isLoading, setIsLoading] = useState(true);


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
    async function fetchCars() {
      try {
        const response = await fetch('/api/admin/cars?type=buy');
        if (!response.ok) throw new Error('Failed to fetch cars');
        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCars();
  }, []);

  const handleDelete = async (carId: string) => {
    try {
      const response = await fetch(`/api/admin/cars/${carId}?type=buy`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete car');
      setCars(cars.filter(car => car.id !== carId));
    } catch (error) {
      console.error('Error deleting car:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }
  if (!user || !isAdmin) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/admin/cars/buy/add" className="bg-blue-600 text-white px-4 py-2 rounded mb-6 inline-block hover:bg-blue-700 transition">Add New Car</Link>
        <h1 className="text-3xl font-bold mb-8">Cars for Sale</h1>
        {/* Render car table/list here */}
        {/* ...rest of your car table/list UI... */}
      </div>
    </div>
  );
}
