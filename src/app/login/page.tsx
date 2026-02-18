//src/app/login/page.tsx  
import LoginForm from '@/components/auth/LoginForm';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign In to Euro Motors</h1>
        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}