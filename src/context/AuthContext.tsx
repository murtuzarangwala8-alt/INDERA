import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '/api';

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  role: string;
  shippingAddresses?: ShippingAddress[];
  cart?: unknown[];
}

export interface ShippingAddress {
  _id?: string;
  label?: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  register: (data: RegisterData) => Promise<{ success: boolean; userId?: string; message?: string; phoneOtp?: string; smsSent?: boolean; nextStep?: string }>;
  verifyPhone: (userId: string, otp: string) => Promise<{ success: boolean; token?: string; message?: string }>;
  resendOtp: (userId: string, type: 'email' | 'phone') => Promise<{ success: boolean; message?: string; otp?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; userId?: string; nextStep?: string; message?: string; phoneOtp?: string }>;
  logout: () => void;
  forgotPassword: (identifier: string) => Promise<{ success: boolean; message?: string; smsSent?: boolean }>;
  resetPassword: (identifier: string, otp: string, password: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; user?: AuthUser; message?: string }>;
  addAddress: (data: ShippingAddress) => Promise<{ success: boolean; user?: AuthUser; message?: string }>;
  deleteAddress: (id: string) => Promise<{ success: boolean; user?: AuthUser; message?: string }>;
  fetchOrders: () => Promise<{ success: boolean; orders?: unknown[]; message?: string }>;
  authFetch: (path: string, options?: RequestInit) => Promise<Response>;
  isAuthenticated: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('indera_token'));
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      const saved = localStorage.getItem('indera_token');
      if (!saved) { setLoading(false); return; }
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${saved}` },
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setToken(saved);
        } else {
          localStorage.removeItem('indera_token');
          setToken(null);
        }
      } catch {
        localStorage.removeItem('indera_token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const saveToken = (t: string) => {
    localStorage.setItem('indera_token', t);
    setToken(t);
  };

  const register = async (data: RegisterData) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json;
  };

  const verifyPhone = async (userId: string, otp: string) => {
    const res = await fetch(`${API}/auth/verify-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, otp }),
    });
    const json = await res.json();
    if (json.success && json.token) {
      saveToken(json.token);
      setUser(json.user);
      toast.success(`Welcome to INDÉRA, ${json.user.firstName}!`);
    }
    return json;
  };

  const resendOtp = async (userId: string, type: 'email' | 'phone') => {
    const res = await fetch(`${API}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type }),
    });
    return res.json();
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (json.success && json.token) {
      saveToken(json.token);
      setUser(json.user);
      toast.success(`Welcome back, ${json.user.firstName}!`);
    }
    return json;
  };

  const logout = () => {
    localStorage.removeItem('indera_token');
    setToken(null);
    setUser(null);
    toast.success('Signed out');
  };

  const forgotPassword = async (identifier: string) => {
    const res = await fetch(`${API}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    return res.json();
  };

  const resetPassword = async (identifier: string, otp: string, password: string) => {
    const res = await fetch(`${API}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, otp, password }),
    });
    const json = await res.json();
    if (json.success && json.token) {
      saveToken(json.token);
      setUser(json.user);
    }
    return json;
  };

  const authFetch = (path: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return fetch(`${API}${path}`, { ...options, headers });
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    const res = await authFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success && json.user) setUser(json.user);
    return json;
  };

  const addAddress = async (data: ShippingAddress) => {
    const res = await authFetch('/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success && json.user) setUser(json.user);
    return json;
  };

  const deleteAddress = async (id: string) => {
    const res = await authFetch(`/auth/addresses/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success && json.user) setUser(json.user);
    return json;
  };

  const fetchOrders = async () => {
    const res = await authFetch('/auth/orders');
    return res.json();
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      register, verifyPhone, resendOtp,
      login, logout, forgotPassword, resetPassword,
      updateProfile, addAddress, deleteAddress, fetchOrders, authFetch,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
