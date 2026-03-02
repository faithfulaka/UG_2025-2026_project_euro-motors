'use client';

import Link from 'next/link';

export default function TradeInPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Trade In Your Vehicle</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get a fair valuation for your current vehicle and apply it towards the purchase of a luxury car from our collection.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Choose Your New Car</h3>
              <p className="text-gray-600 text-sm">Browse our luxury collection and find the car you want to purchase.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Submit Your Vehicle</h3>
              <p className="text-gray-600 text-sm">Enter your vehicle details and get an instant AI-powered valuation.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Complete Your Trade</h3>
              <p className="text-gray-600 text-sm">Your trade-in value is applied to the purchase, reducing your balance.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to Trade In?</h2>
          <p className="text-gray-300 mb-6">Start by choosing the luxury car you&apos;d like to purchase. The trade-in option is available on every car detail page.</p>
          <Link
            href="/buy"
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Browse Cars For Sale
          </Link>
        </div>
      </div>
    </div>
  );
}
