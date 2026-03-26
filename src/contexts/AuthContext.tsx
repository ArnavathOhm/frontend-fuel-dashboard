"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'Administrator' | 'User' | 'Guest';
export type AppUser = { id: string; username: string; name: string; role: Role; initials: string };

interface AuthContextType {
  user: AppUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('petrosee_session');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('petrosee_session', JSON.stringify(data.user));
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch(err) {
      setError('Network error reading auth module');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('petrosee_session');
  };

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-gray-50"><div className="animate-pulse w-10 h-10 bg-primary/20 rounded-full"></div></div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
