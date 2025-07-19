// src/context/AuthContext.tsx - COMPLETE WORKING VERSION
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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

  // Clear error function
  const clearError = () => setError(null);

  // Check if user is logged in on page load
  useEffect(() => {
    async function loadUserFromSession() {
      try {
        setLoading(true);
        
        // Try to get user from API (which checks HTTP-only cookies)
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // If cookie auth fails, try localStorage token as fallback
          const token = localStorage.getItem('token');
          if (token) {
            const tokenResponse = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (tokenResponse.ok) {
              const tokenData = await tokenResponse.json();
              setUser(tokenData.user);
            } else {
              // Token is invalid, clear it
              localStorage.removeItem('token');
            }
          }
        }
      } catch (error) {
        console.error('Failed to load user session:', error);
        // Clear any invalid tokens
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    }

    loadUserFromSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Save token to localStorage as fallback
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      setUser(data.user);
      
      // Redirect based on user role
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      // Redirect to login page after successful registration
      router.push('/login?message=Registration successful! Please log in.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Call logout API to clear HTTP-only cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Clear user state
      setUser(null);
      setError(null);
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API call fails, clear local state
      localStorage.removeItem('token');
      setUser(null);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'ADMIN',
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}