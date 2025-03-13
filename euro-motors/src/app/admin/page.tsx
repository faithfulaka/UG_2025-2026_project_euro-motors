'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRentals: 0,
    totalTradeIns: 0,
    pendingOrders: 0,
    pendingRentals: 0,
    pendingTradeIns: 0,
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, isAdmin, router]);

  // Fetch admin dashboard data
  useEffect(() => {
    async function fetchAdminData() {
      if (user && isAdmin) {
        try {
          // In a real app, you would fetch this data from your API
          // For now, we'll just use dummy data
          setStats({
            totalUsers: 24,
            totalOrders: 12,
            totalRentals: 8,
            totalTradeIns: 4,
            pendingOrders: 3,
            pendingRentals: 2,
            pendingTradeIns: 1,
          });
        } catch (error) {
          console.error('Error fetching admin data:', error);
        }
      }
    }

    fetchAdminData();
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null; // This will be handled by the useEffect redirect
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 mb-2">Total Users</h3>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 mb-2">Total Rentals</h3>
            <p className="text-3xl font-bold">{stats.totalRentals}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 mb-2">Total Trade-Ins</h3>
            <p className="text-3xl font-bold">{stats.totalTradeIns}</p>
          </div>
        </div>
        
        {/* Pending Items */}
        <h2 className="text-2xl font-bold mb-4">Pending Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Pending Orders</h3>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                {stats.pendingOrders} Orders
              </span>
            </div>
            <button className="text-blue-600 hover:underline">View All Orders</button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Pending Rentals</h3>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                {stats.pendingRentals} Rentals
              </span>
            </div>
            <button className="text-blue-600 hover:underline">View All Rentals</button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Pending Trade-Ins</h3>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                {stats.pendingTradeIns} Trade-Ins
              </span>
            </div>
            <button className="text-blue-600 hover:underline">View All Trade-Ins</button>
          </div>
        </div>
        
        {/* Management Links */}
        <h2 className="text-2xl font-bold mb-4">Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
            <h3 className="text-xl font-semibold mb-4">Car Inventory</h3>
            <p className="text-gray-600 mb-4">Manage sale and rental car listings</p>
            <button className="text-blue-600 hover:underline">Manage Inventory</button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
            <h3 className="text-xl font-semibold mb-4">User Management</h3>
            <p className="text-gray-600 mb-4">Manage user accounts and permissions</p>
            <button className="text-blue-600 hover:underline">Manage Users</button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
            <h3 className="text-xl font-semibold mb-4">Reports</h3>
            <p className="text-gray-600 mb-4">Access sales and rental reports</p>
            <button className="text-blue-600 hover:underline">View Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
}