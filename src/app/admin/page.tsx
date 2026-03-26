"use client";

import React, { useState, useEffect } from 'react';
import { Network, BellRing, Users, Save, Check, Database, Trash2, UserPlus } from 'lucide-react';

export default function AdminPanel() {
  const [saveToast, setSaveToast] = useState(false);
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'User' });

  const [fuelRatioLoadingBudget, setFuelRatioLoadingBudget] = useState(0.5);
  const [fuelRatioHaulingBudget, setFuelRatioHaulingBudget] = useState(1.0);
  const [plannedTruck, setPlannedTruck] = useState(5);
  const [accessEquipment, setAccessEquipment] = useState(true);
  const [accessDatalog, setAccessDatalog] = useState(true);
  const [accessChatbot, setAccessChatbot] = useState(true);
  const [connectionProtocol, setConnectionProtocol] = useState('Dev'); // 'Dev' | 'REST'
  const [debugMode, setDebugMode] = useState(false);
  const [plannedDistance, setPlannedDistance] = useState(3.0);

  // Fetch admin settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/api/admin/settings`);
        if (res.ok) {
          const data = await res.json();
          setFuelRatioLoadingBudget(data.fuelRatioLoadingBudget ?? 0.5);
          setFuelRatioHaulingBudget(data.fuelRatioHaulingBudget ?? 1.0);
          setPlannedTruck(data.plannedTruck ?? 5);
          setAccessEquipment(data.accessEquipment ?? true);
          setAccessDatalog(data.accessDatalog ?? true);
          setAccessChatbot(data.accessChatbot ?? true);
          setConnectionProtocol(data.connectionProtocol ?? 'Dev');
          setDebugMode(data.debugMode ?? false);
          setPlannedDistance(data.plannedDistance ?? 3.0);
        }
      } catch (e) { console.error('Failed to fetch admin settings'); }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      await fetch(`${apiUrl}/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fuelRatioLoadingBudget,
          fuelRatioHaulingBudget,
          plannedTruck,
          accessEquipment,
          accessDatalog,
          accessChatbot,
          connectionProtocol,
          debugMode,
          plannedDistance
        })
      });
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2000);
    } catch (e) {
      console.error('Failed to save admin settings');
    }
  };

  const fetchUsers = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/users`);
      if (res.ok) setDbUsers(await res.json());
    } catch(e) { console.error('Failed to fetch users'); }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password || !newUser.name) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      await fetch(`${apiUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUser,
          initials: newUser.name.substring(0, 2).toUpperCase()
        })
      });
      setNewUser({ username: '', password: '', name: '', role: 'User' });
      fetchUsers();
    } catch(e) {}
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Permanently delete this user?')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      await fetch(`${apiUrl}/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch(e) {}
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Settings</h1>
          <p className="text-gray-600">Global system connectivity, alert thresholds, and role-based access.</p>
        </div>
        <button onClick={handleSave} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-background rounded-lg font-medium hover:opacity-90 transition-all sm:w-auto w-full">
          {saveToast ? <><Check className="w-4 h-4" /> Saved Successfully</> : <><Save className="w-4 h-4" /> Save Local State</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* System Connectivity */}
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-gray-50 flex items-center gap-3">
            <Network className="w-5 h-5 text-secondary" />
            <h2 className="font-bold">System Connectivity</h2>
          </div>
          <div className="p-6 space-y-6 flex-1">
            <div>
              <label className="block text-sm font-semibold mb-2">FMS Connection Protocol</label>
              <select 
                value={connectionProtocol}
                onChange={e => setConnectionProtocol(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-secondary"
              >
                 <option value="Dev">Disconnected Mock (Dev Mode)</option>
                 <option value="REST">REST Polling (Minerva API)</option>
                 <option disabled>Live WebSockets (Unavailable)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 border border-border rounded-xl">
               <div>
                  <label className="block text-sm font-semibold">Enable Debug Mode</label>
                  <p className="text-[10px] text-gray-500">Show detailed fetch logs and console debugging.</p>
               </div>
               <button 
                  onClick={() => setDebugMode(!debugMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${debugMode ? 'bg-primary' : 'bg-gray-200'}`}
               >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${debugMode ? 'translate-x-6' : 'translate-x-1'}`} />
               </button>
            </div>
            
            <div className="pt-4 border-t border-border">
               <button className="w-full py-2 text-sm text-status-pending border border-status-pending/30 bg-status-pending/5 rounded-lg hover:bg-status-pending hover:text-white transition-colors font-medium">
                 Flush Local Data Cache
               </button>
            </div>
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-gray-50 flex items-center gap-3">
            <BellRing className="w-5 h-5 text-status-priority" />
            <h2 className="font-bold">Alert Thresholds</h2>
          </div>
          <div className="p-6 space-y-6 flex-1">
            <div>
              <label className="block text-sm font-semibold mb-1">Fuel Ratio Loading Budget</label>
              <p className="text-xs text-gray-500 mb-2">Target consumption for stationary/loading activities.</p>
              <div className="flex items-center gap-2">
                 <input type="number" value={fuelRatioLoadingBudget} step="0.1" onChange={e => setFuelRatioLoadingBudget(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-secondary" />
                 <span className="text-sm font-medium text-gray-500">L/BCM</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Fuel Ratio Hauling Budget</label>
              <p className="text-xs text-gray-500 mb-2">Target consumption for travel/hauling per reference km.</p>
              <div className="flex items-center gap-2">
                 <input type="number" value={fuelRatioHaulingBudget} step="0.1" onChange={e => setFuelRatioHaulingBudget(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-secondary" />
                 <span className="text-sm font-medium text-gray-500">L/BCM</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Planned Truck</label>
              <p className="text-xs text-gray-500 mb-2">Truck used target applied on Dashboard.</p>
              <div className="flex items-center gap-2">
                 <input type="number" value={plannedTruck} step="1" min="1" onChange={e => setPlannedTruck(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-secondary" />
                 <span className="text-sm font-medium text-gray-500">Trucks</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Planned Distance</label>
              <p className="text-xs text-gray-500 mb-2">Global hauling distance baseline.</p>
              <div className="flex items-center gap-2">
                 <input type="number" value={plannedDistance} step="0.1" min="0" onChange={e => setPlannedDistance(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-secondary" />
                 <span className="text-sm font-medium text-gray-500">km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Role-Based Access */}
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-gray-50 flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="font-bold">Access Control</h2>
          </div>
          <div className="p-6 flex-1">
            <p className="text-sm text-gray-600 mb-4">Manage environment constraints for standard users vs administrators.</p>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">Equipment</span>
                <input type="checkbox" checked={accessEquipment} onChange={e => setAccessEquipment(e.target.checked)} className="w-4 h-4 accent-secondary rounded" />
              </label>
              <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">Datalog</span>
                <input type="checkbox" checked={accessDatalog} onChange={e => setAccessDatalog(e.target.checked)} className="w-4 h-4 accent-secondary rounded" />
              </label>
              <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">Chatbot</span>
                <input type="checkbox" checked={accessChatbot} onChange={e => setAccessChatbot(e.target.checked)} className="w-4 h-4 accent-secondary rounded" />
              </label>
            </div>
          </div>
        </div>

        {/* User Management Database (Drizzle connected) */}
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col md:col-span-2 lg:col-span-3">
          <div className="p-4 border-b border-border bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="font-bold">User Management (Database)</h2>
            </div>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">Live SQLite</span>
          </div>
          
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">User</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Role Clearance</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dbUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {u.initials}
                          </div>
                          <span className="font-semibold text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-500 text-xs">@{u.username}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-[11px] font-bold ${
                          u.role === 'Administrator' ? 'bg-primary/10 text-primary' : 
                          u.role === 'Guest' ? 'bg-blue-100 text-blue-600' : 'bg-secondary/10 text-secondary'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteUser(u.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded bg-gray-50 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dbUsers.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">No users found in database.</p>}
            </div>

            <div className="lg:border-l border-border lg:pl-8">
              <h3 className="font-bold text-sm mb-4">Provision New Identity</h3>
              <form onSubmit={handleAddUser} className="space-y-3">
                <input 
                  type="text" placeholder="Full Name (e.g. John Doe)" required
                  value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-border rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <input 
                  type="text" placeholder="Username" required
                  value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-border rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <input 
                  type="password" placeholder="Temporary Password" required
                  value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-border rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <select 
                  value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-border rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="User">Standard User</option>
                  <option value="Guest">Guest Observer</option>
                </select>
                <button type="submit" className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors mt-2">
                  <UserPlus className="w-4 h-4" /> Create User
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
