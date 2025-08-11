"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isEmailVerified?: boolean;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  setDemo: (role: string) => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') || localStorage.getItem('token');
    }
    return null;
  };

  // Set token in localStorage
  const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('token', token); // Keep for backward compatibility
    }
  };

  // Remove token from localStorage
  const removeToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  };

  // Check if user is authenticated and load user data
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.user) {
            setUser(data.data.user);
          } else {
            removeToken();
          }
        } else {
          // Token might be expired, try to refresh
          await tryRefreshToken();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Try to refresh the token
  const tryRefreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      removeToken();
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.tokens) {
          setToken(data.data.tokens.accessToken);
          localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
          
          // Now fetch user data with new token
          const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${data.data.tokens.accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.success && userData.data.user) {
              setUser(userData.data.user);
              return true;
            }
          }
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    removeToken();
    return false;
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Login failed');
      }

      if (data.success && data.data.tokens && data.data.user) {
        setToken(data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        setUser(data.data.user);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      setUser(null);
      router.push('/');
    }
  };

  const setDemo = (role: string) => {
    // Create a demo user for testing
    const demoUser: User = {
      id: 'demo-' + role,
      email: `demo-${role}@example.com`,
      firstName: 'Demo',
      lastName: role.charAt(0).toUpperCase() + role.slice(1),
      role: role,
      isEmailVerified: true
    };
    
    setUser(demoUser);
    
    // Set a demo token
    setToken('demo-token-' + role);
    
    // Navigate to appropriate dashboard
    if (role === 'customer') {
      router.push('/dashboard/customer');
    } else if (role === 'provider') {
      router.push('/dashboard/provider');
    } else if (role === 'admin' || role === 'super_admin') {
      router.push('/dashboard/admin');
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    setDemo,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface ProtectedProps {
  children: ReactNode;
  roles?: string[];
}

export function Protected({ children, roles = [] }: ProtectedProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && roles.length > 0 && !roles.includes(user.role)) {
      router.push('/unauthorized');
    }
  }, [user, loading, roles, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || (roles.length > 0 && !roles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
