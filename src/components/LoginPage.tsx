"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Fuel, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const { login, error } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsSubmitting(true);
    await login(username, password);
    setIsSubmitting(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 h-screen w-full px-4">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-border w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-secondary/10 rounded-2xl text-secondary">
            <Fuel className="w-10 h-10" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center text-primary mb-2 tracking-tight">PetroSee Platform</h1>
        <p className="text-center text-gray-500 mb-8 text-sm md:text-base px-2">FMS Fuel Ratio Monitoring Platform.</p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="password"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
          >
            {isSubmitting ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Contact administrator for login access.</p>
        </div>
      </div>
    </div>
  );
}
