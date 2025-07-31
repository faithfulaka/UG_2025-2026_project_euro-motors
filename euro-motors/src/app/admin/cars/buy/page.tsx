'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BuyCar } from '@/types/cars';

export default function AdminCarsBuyPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [cars, setCars] = useState<BuyCar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<string | null>(null);

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
      } catch (err) {
        // handle error
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
      setDeleteModalOpen(false);
    } catch (err) {
      // handle error
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
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [cars, setCars] = useState<BuyCar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<string | null>(null);

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
      if (!user || !isAdmin) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/cars?type=buy');
        
        if (!response.ok) {
          throw new Error('Failed to fetch cars');
        }
        
        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCars();
  }, [user, isAdmin]);

  const handleDeleteClick = (carId: string) => {
    setCarToDelete(carId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!carToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/cars/${carToDelete}?type=buy`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete car');
      }
      
      // Remove car from state
      setCars(cars.filter(car => car.id !== carToDelete));
      setDeleteModalOpen(false);
      setCarToDelete(null);
    } catch (error) {
      console.error('Error deleting car:', error);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setCarToDelete(null);
  };

  if (loading || isLoading) {
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin" className="text-blue-600 hover:underline mb-2 inline-block">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Cars For Sale</h1>
          </div>
          <Link 
            href="/admin/cars/buy/add" 
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Add New Car
          </Link>
        </div>

        {cars.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">No cars available for sale</p>
            <Link 
              href="/admin/cars/buy/add" 
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Add Your First Car
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Car
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cars.map((car) => {
                  // Find main image or use first image
                  const mainImage = car.images.find(img => img.isMain) || car.images[0];
                  const imageUrl = mainImage ? mainImage.url : '/placeholder-car.jpg';
                  
                  return (
                    <tr key={car.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-24 relative flex-shrink-0 mr-4">
                            <Image
                              src={imageUrl}
                              alt={`${car.make} ${car.model}`}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {car.make} {car.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              {car.trim}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{car.year}</div>
                        <div className="text-sm text-gray-500">
                          {car.specifications.mileage > 0 
                            ? `${car.specifications.mileage.toLocaleString()} miles` 
                            : 'New'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          £{car.price.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          car.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {car.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/admin/cars/buy/edit/${car.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(car.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this car? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}