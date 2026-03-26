"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function AppContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by rendering only after layout mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Soft route protection logic depending on selected User Role
  useEffect(() => {
    if (mounted && user) {
      if (user.role === 'Guest') {
        // Guests can only see main dashboard & optimization
        if (pathname !== '/' && pathname !== '/optimization') {
          router.replace('/');
        }
      } else if (user.role === 'User') {
        // Users can't access Admin panel
        if (pathname === '/admin') {
          router.replace('/');
        }
      }
    }
  }, [user, pathname, router, mounted]);

  if (!mounted) return null; 

  if (!user) {
    return <LoginPage />;
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-2 md:p-8 pb-20 md:pb-8 min-h-0">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
