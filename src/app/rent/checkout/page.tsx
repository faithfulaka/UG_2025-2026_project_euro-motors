'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RentCheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/checkout');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to checkout...</p>
      </div>
    </div>
  );
}
