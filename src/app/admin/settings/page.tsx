// src/app/admin/settings/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    businessName: 'Euro Motors',
    businessEmail: 'info@euromotors.com',
    businessPhone: '+44 20 1234 5678',
    businessAddress: '123 Luxury Car Street, London, UK',
  });

  const handleSave = async () => {
    // Save settings logic here
    alert('Settings saved successfully!');
  };

  return (
    <div>
      <Link href="/admin" className="text-blue-600 hover:text-blue-700 mb-4 inline-block text-sm">
        ← Back to Dashboard
      </Link>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Business Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Business Email
            </label>
            <input
              type="email"
              value={settings.businessEmail}
              onChange={(e) => setSettings({ ...settings, businessEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Business Phone
            </label>
            <input
              type="tel"
              value={settings.businessPhone}
              onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Business Address
            </label>
            <textarea
              value={settings.businessAddress}
              onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
