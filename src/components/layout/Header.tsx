"use client";

import React from 'react';
import { Bell, Search, Menu, User, Fuel, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-[72px] bg-surface border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 w-full shrink-0">
      <div className="flex items-center gap-4">
        {/* Hamburger hidden as we use bottom nav for mobile */}
        <div className="flex items-center md:hidden">
          <Fuel className="w-6 h-6 text-secondary" />
          <span className="ml-2 font-bold text-lg text-primary">PetroSee</span>
        </div>
        <div className="relative hidden sm:block">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-secondary w-[180px] lg:w-[300px]"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-status-pending rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-semibold text-sm shadow-sm" title={user?.name}>
          {user?.initials || <User className="w-4 h-4" />}
        </div>
        <button 
          onClick={logout} 
          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors md:hidden"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
