import React from 'react';
import { LayoutDashboard, Users, ActivitySquare, Settings, LogOut, Fuel, Database, BotMessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  return (
    <aside className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border z-50 flex flex-row items-center justify-around px-2 md:relative md:flex-col md:w-[80px] lg:w-[240px] md:h-screen md:border-t-0 md:border-r transition-all duration-300 pointer-events-auto">
      <div className="hidden md:flex h-[72px] items-center justify-center lg:justify-start lg:px-6 border-b border-border w-full">
        <Fuel className="w-8 h-8 text-secondary" />
        <span className="ml-3 font-bold text-xl hidden lg:block text-primary">PetroSee</span>
      </div>
      <nav className="flex flex-row md:flex-col flex-1 md:py-6 gap-1 md:gap-2 px-1 md:px-3 w-full justify-around md:justify-start">
        <SidebarItem icon={<LayoutDashboard />} label="Dashboard" href="/" />
        <SidebarItem icon={<ActivitySquare />} label="Optimization" href="/optimization" />
        
        {user.role !== 'Guest' && (
          <>
            <SidebarItem icon={<Users />} label="Equipment" href="/equipment" />
            <SidebarItem icon={<BotMessageSquare />} label="AI Chatbot" href="/ai-assistant" />
            <SidebarItem icon={<Database />} label="Data Logs" href="/logs" />
          </>
        )}
        
        {user.role === 'Administrator' && (
          <SidebarItem icon={<Settings />} label="Admin Settings" href="/admin" />
        )}
      </nav>
      <div className="hidden md:block p-4 border-t border-border w-full">
        <button onClick={logout} className="flex items-center w-full p-3 rounded-xl transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 font-medium">
          <LogOut className="w-6 h-6 shrink-0" />
          <span className="ml-3 hidden lg:block">Logout ({user.role})</span>
        </button>
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
  return (
    <Link href={href} className="flex flex-col md:flex-row items-center justify-center md:items-center md:justify-start w-full p-2 md:p-3 rounded-xl transition-colors text-gray-600 hover:bg-gray-50 dark:hover:bg-border">
      <span className="w-6 h-6 shrink-0">{icon}</span>
      <span className="hidden lg:block ml-3 text-sm lg:text-base font-medium">{label}</span>
    </Link>
  );
}
