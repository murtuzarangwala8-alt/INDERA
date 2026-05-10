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
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  register: (data: RegisterData) => Promise<{ success: boolean; userId?: string; message?: string }>;
  verifyEmail: (userId: string, otp: string) => Promise<{ success: boolean; nextStep?: string; message?: string }>;
  verifyPhone: (userId: string, otp: string) => Promise<{ success: boolean; token?: string; message?: string }>;
  resendOtp: (userId: string, type: 'email' | 'phone') => Promise<{ success: boolean; message?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; userId?: string; nextStep?: string; message?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; message?: string }>;
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

  const verifyEmail = async (userId: string, otp: string) => {
    const res = await fetch(`${API}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, otp }),
    });
    return res.json();
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

  const forgotPassword = async (email: string) => {
    const res = await fetch(`${API}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  };

  const resetPassword = async (resetToken: string, password: string) => {
    const res = await fetch(`${API}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, password }),
    });
    const json = await res.json();
    if (json.success && json.token) {
      saveToken(json.token);
      setUser(json.user);
    }
    return json;
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      register, verifyEmail, verifyPhone, resendOtp,
      login, logout, forgotPassword, resetPassword,
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
