// src/app/admin/page.tsx 
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminDashboardStats } from '@/types/admin';

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRentals: 0,
    totalTradeIns: 0,
    pendingOrders: 0,
    pendingRentals: 0,
    pendingTradeIns: 0,
    carsForSale: 0,
    carsForRent: 0,
    // ADDED: Missing properties to fix TypeScript error
    monthlyRevenue: 0,
    popularMakes: [],
    recentActivity: [],
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
          // Fetch dashboard stats from API
          const response = await fetch('/api/admin/dashboard');
          if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
          }
          const data = await response.json();
          setStats(data);
        } catch (error) {
          console.error('Error fetching admin data:', error);
          // UPDATED: Fallback data with all required properties
          setStats({
            totalUsers: 24,
            totalOrders: 12,
            totalRentals: 8,
            totalTradeIns: 4,
            pendingOrders: 3,
            pendingRentals: 2,
            pendingTradeIns: 1,
            carsForSale: 15,
            carsForRent: 10,
            monthlyRevenue: 125000,
            popularMakes: [
              { make: 'Bentley', count: 8 },
              { make: 'Rolls Royce', count: 5 },
              { make: 'Ferrari', count: 3 },
            ],
            recentActivity: [
              {
                id: '1',
                type: 'order',
                description: 'New purchase order for Bentley Continental GT',
                timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
                details: { carMake: 'Bentley', amount: 175000 }
              },
              {
                id: '2',
                type: 'rental',
                description: 'Rental booking for Rolls Royce Cullinan',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                details: { carMake: 'Rolls Royce', amount: 2500 }
              },
              {
                id: '3',
                type: 'trade-in',
                description: 'Trade-in request submitted',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
              },
            ],
          });
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 mb-2">Total Users</h3>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 mb-2">Cars For Sale</h3>
            <p className="text-3xl font-bold">{stats.carsForSale}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 mb-2">Cars For Rent</h3>
            <p className="text-3xl font-bold">{stats.carsForRent}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 mb-2">Monthly Revenue</h3>
            <p className="text-3xl font-bold">£{stats.monthlyRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Popular Makes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Popular Makes</h3>
            <div className="space-y-3">
              {stats.popularMakes.map((make, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium">{make.make}</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {make.count} cars
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 3).map((activity) => (
                <div key={activity.id} className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
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
            <Link href="/admin/orders" className="text-blue-600 hover:underline">
              View All Orders
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Pending Rentals</h3>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                {stats.pendingRentals} Rentals
              </span>
            </div>
            <Link href="/admin/rentals" className="text-blue-600 hover:underline">
              View All Rentals
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Pending Trade-Ins</h3>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                {stats.pendingTradeIns} Trade-Ins
              </span>
            </div>
            <Link href="/admin/trade-ins" className="text-blue-600 hover:underline">
              View All Trade-Ins
            </Link>
          </div>
        </div>
        
        {/* Management Links */}
        <h2 className="text-2xl font-bold mb-4">Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/cars/buy" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 h-full">
              <h3 className="text-xl font-semibold mb-4">Cars For Sale</h3>
              <p className="text-gray-600 mb-4">Manage cars available for purchase</p>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 hover:underline">Manage Inventory</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {stats.carsForSale} Cars
                </span>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/cars/rent" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 h-full">
              <h3 className="text-xl font-semibold mb-4">Rental Cars</h3>
              <p className="text-gray-600 mb-4">Manage cars available for rent</p>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 hover:underline">Manage Rentals</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {stats.carsForRent} Cars
                </span>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/users" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 h-full">
              <h3 className="text-xl font-semibold mb-4">User Management</h3>
              <p className="text-gray-600 mb-4">Manage user accounts and permissions</p>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 hover:underline">Manage Users</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {stats.totalUsers} Users
                </span>
              </div>
            </div>
          </Link>
          
          {/* UPDATED: SPA Tool Link */}
          <Link href="/admin/supercar-pricing" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 h-full border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <h3 className="text-xl font-semibold mb-4 text-blue-800">🚘 SPA Tool</h3>
              <p className="text-gray-600 mb-4">Supercar Pricing Aggregator - Get comprehensive vehicle data from multiple sources</p>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 hover:underline font-medium">Launch SPA Tool</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  NEW
                </span>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/reports" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 h-full">
              <h3 className="text-xl font-semibold mb-4">Reports</h3>
              <p className="text-gray-600 mb-4">Access sales, rental, and financial reports</p>
              <span className="text-blue-600 hover:underline">View Reports</span>
            </div>
          </Link>
          
          <Link href="/admin/settings" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 h-full">
              <h3 className="text-xl font-semibold mb-4">Settings</h3>
              <p className="text-gray-600 mb-4">Configure system settings and preferences</p>
              <span className="text-blue-600 hover:underline">Manage Settings</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}