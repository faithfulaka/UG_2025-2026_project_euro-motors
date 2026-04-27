'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-black mb-3">Payment Successful</h1>
        <p className="text-gray-600 mb-2">
          Your payment has been confirmed and your booking is now active.
        </p>
        {sessionId && (
          <p className="text-sm text-gray-400 mb-6 font-mono break-all">
            Reference: {sessionId}
          </p>
        )}

        <p className="text-gray-500 text-sm mb-8">
          Redirecting to your dashboard in {countdown} second{countdown !== 1 ? 's' : ''}...
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="w-full border border-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
