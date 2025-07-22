// src/context/AuthContext.tsx 
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  const clearError = () => setError(null);

  useEffect(() => {
    async function loadUserFromSession() {
      try {
        setLoading(true);
        console.log('🔄 [AUTH CONTEXT] Loading user session...');
        
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });
        
        console.log('📡 [AUTH CONTEXT] Auth response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          console.log('✅ [AUTH CONTEXT] User session loaded:', data.user.email, 'Role:', data.user.role);
          console.log('🎯 [AUTH CONTEXT] IsAdmin calculated:', data.user.role === 'ADMIN');
          
          // REDIRECT LOGIC: If admin user is on non-admin page, redirect
          if (data.user.role === 'ADMIN' && !pathname.startsWith('/admin')) {
            console.log('🔄 [AUTH CONTEXT] Admin detected on user page, redirecting to /admin');
            router.push('/admin');
          }
        } else {
          console.log('❌ [AUTH CONTEXT] Auth failed, trying localStorage token...');
          // Try localStorage token as fallback
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
              console.log('✅ [AUTH CONTEXT] User loaded from localStorage token:', tokenData.user.email, 'Role:', tokenData.user.role);
              
              // REDIRECT LOGIC: If admin user is on non-admin page, redirect
              if (tokenData.user.role === 'ADMIN' && !pathname.startsWith('/admin')) {
                console.log('🔄 [AUTH CONTEXT] Admin detected (from token) on user page, redirecting to /admin');
                router.push('/admin');
              }
            } else {
              console.log('❌ [AUTH CONTEXT] Token invalid, clearing localStorage');
              localStorage.removeItem('token');
            }
          } else {
            console.log('📝 [AUTH CONTEXT] No token found - user not logged in');
          }
        }
      } catch (error) {
        console.error('❌ [AUTH CONTEXT] Failed to load user session:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    }

    loadUserFromSession();
  }, [router, pathname]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔐 [AUTH CONTEXT] Attempting login for:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      setUser(data.user);
      console.log('✅ [AUTH CONTEXT] Login successful:', data.user.email, 'Role:', data.user.role);
      console.log('🎯 [AUTH CONTEXT] User is admin:', data.user.role === 'ADMIN');
      
      // ENHANCED: Force redirect based on user role
      if (data.user.role === 'ADMIN') {
        console.log('🔄 [AUTH CONTEXT] Admin login - FORCING redirect to /admin');
        window.location.href = '/admin'; // Force full page redirect
      } else {
        console.log('🔄 [AUTH CONTEXT] Regular user - redirecting to /dashboard');
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      console.error('❌ [AUTH CONTEXT] Login error:', error);
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

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
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      localStorage.removeItem('token');
      setUser(null);
      setError(null);
      console.log('✅ [AUTH CONTEXT] Logout successful');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced isAdmin calculation with logging
  const isAdmin = user?.role === 'ADMIN';
  
  useEffect(() => {
    if (user) {
      console.log('🎯 [AUTH CONTEXT] isAdmin recalculated:', isAdmin, 'for user:', user.email, 'with role:', user.role);
    }
  }, [user, isAdmin]);

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
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