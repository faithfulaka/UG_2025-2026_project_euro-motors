'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [tradeIns, setTradeIns] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch user data (orders, rentals, trade-ins)
  useEffect(() => {
    async function fetchUserData() {
      if (user) {
        try {
          // In a real app, you would fetch this data from your API
          // For now, we'll just use empty arrays
          setOrders([]);
          setRentals([]);
          setTradeIns([]);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    }

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // This will be handled by the useEffect redirect
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{user.name || 'User'}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300"
            >
              Logout
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Orders</h3>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Rentals</h3>
              <p className="text-2xl font-bold">{rentals.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Trade-In Requests</h3>
              <p className="text-2xl font-bold">{tradeIns.length}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            {orders.length > 0 ? (
              <div>
                {/* Map through orders here */}
                <p>Your orders will appear here.</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You have no orders yet</p>
                <Link 
                  href="/buy" 
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition duration-300"
                >
                  Browse Cars
                </Link>
              </div>
            )}
          </div>
          
          {/* Recent Rentals */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Recent Rentals</h2>
            {rentals.length > 0 ? (
              <div>
                {/* Map through rentals here */}
                <p>Your rentals will appear here.</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You have no rentals yet</p>
                <Link 
                  href="/rent" 
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition duration-300"
                >
                  Rent a Car
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}