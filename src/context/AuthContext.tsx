// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Load current user
  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.user.role === 'ADMIN' && !pathname.startsWith('/admin')) {
            router.push('/admin');
          }
        } else {
          setUser(null);
        }
      } catch (err: unknown) {
        console.error('[AUTH CONTEXT] Load error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [pathname, router]);

  // Login handler
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Login failed');
      }
      setUser(data.user);
      router.push('/');
    } catch (err: unknown) {
      console.error('[AUTH CONTEXT] Login error:', err);
      if (err instanceof Error) setError(err.message);
      else setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // Registration handler
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? 'Registration failed');
      }
      router.push('/login');
    } catch (err: unknown) {
      console.error('[AUTH CONTEXT] Register error:', err);
      if (err instanceof Error) setError(err.message);
      else setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Logout failed');
      setUser(null);
      router.push('/login');
    } catch (err: unknown) {
      console.error('[AUTH CONTEXT] Logout error:', err);
      if (err instanceof Error) setError(err.message);
      else setError('An error occurred during logout');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}