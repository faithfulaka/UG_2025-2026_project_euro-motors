'use client';

import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-black mb-3">Payment Cancelled</h1>
        <p className="text-gray-600 mb-8">
          Your payment was not completed. No charge has been made. Your cart items are still saved.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/checkout"
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Return to Checkout
          </Link>
          <Link
            href="/"
            className="w-full border border-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
