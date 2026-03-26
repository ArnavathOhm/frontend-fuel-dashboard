"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Check, Fuel, Trash2, Loader2, AlertCircle } from 'lucide-react';


function EquipmentCategory({ title, data, newItem, setNewItem, onAdd, onDelete }: any) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col h-[500px] shadow-sm relative group overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">{title}</h2>
        <div className="px-3 py-1 rounded-full bg-background border border-border text-xs font-bold text-gray-500">
          {data.length} {data.length === 1 ? 'Unit' : 'Units'}
        </div>
      </div>
      
      <div className="space-y-3 mb-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {data.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-xl border border-dashed border-border border-gray-200">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">No {title.toLowerCase()} listed.</p>
            <p className="text-xs text-gray-400 mt-1">Add a new component below to get started.</p>
          </div>
        )}
        
        {data.map((item: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-4 border border-border rounded-xl bg-background hover:border-secondary/30 hover:shadow-sm transition-all group/item">
            <div>
              <p className="font-bold text-sm">{item.id}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.model}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-surface px-3 py-1.5 rounded-lg border border-border">
                <p className="font-bold text-secondary text-sm">{item.burn_rate_lph} <span className="text-[10px] font-normal text-gray-400">L/h</span></p>
              </div>
              <button 
                onClick={() => onDelete(item.id)} 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-status-pending/10 hover:text-status-pending transition-colors"
                title="Remove Unit"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-5 border-t border-border mt-auto">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Add New Unit</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input 
            placeholder="ID (e.g. EX01)" 
            value={newItem.id}
            onChange={e => setNewItem({...newItem, id: e.target.value})}
            className="px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium placeholder:font-normal"
          />
          <input 
            placeholder="Model/Type" 
            value={newItem.model}
            onChange={e => setNewItem({...newItem, model: e.target.value})}
            className="px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium placeholder:font-normal"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input 
              type="number"
              placeholder="Burn Rate" 
              value={newItem.burn_rate_lph}
              onChange={e => setNewItem({...newItem, burn_rate_lph: e.target.value})}
              className="w-full px-4 pr-10 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium placeholder:font-normal"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">L/h</span>
          </div>
          <button 
            onClick={onAdd} 
            disabled={!newItem.id || !newItem.model || !newItem.burn_rate_lph}
            className="px-5 py-2.5 bg-secondary text-white rounded-xl font-bold hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EquipmentPage() {

  const [equipment, setEquipment] = useState({
    diggers: [],
    support: []
  });
  
  const [haulerRate, setHaulerRate] = useState('');
  const [saveToast, setSaveToast] = useState(false);
  
  const [newDigger, setNewDigger] = useState({ id: '', model: '', burn_rate_lph: '' });
  const [newSupport, setNewSupport] = useState({ id: '', model: '', burn_rate_lph: '' });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/equipment`);
      if (!res.ok) throw new Error('Failed to fetch equipment data');
      const data = await res.json();
      
      setEquipment({
        diggers: data.diggers || [],
        support: data.support || []
      });
      setHaulerRate(data.haulers?.homogeneous_burn_rate_lph?.toString() || '65.5');
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchEquipment();
  }, []);

  // Use this state to safely avoid hydration mismatches that the browser encounters
  if (!isMounted) {
    return null;
  }

  const handleUpdateHauler = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/equipment/haulers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ burn_rate_lph: parseFloat(haulerRate) })
      });
      if (!res.ok) throw new Error('Failed to update hauler rate');
      
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddEquipment = async (type: 'diggers' | 'support') => {
    const payload = type === 'diggers' ? newDigger : newSupport;
    if (!payload.id || !payload.model || !payload.burn_rate_lph) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/equipment/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: payload.id,
          model: payload.model,
          burn_rate_lph: parseFloat(payload.burn_rate_lph)
        })
      });
      if (!res.ok) throw new Error(`Failed to add ${type}`);
      
      // Refresh data
      await fetchEquipment();
      
      if (type === 'diggers') setNewDigger({ id: '', model: '', burn_rate_lph: '' });
      if (type === 'support') setNewSupport({ id: '', model: '', burn_rate_lph: '' });
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (type: 'diggers' | 'support', id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/equipment/${type}/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`Failed to delete component`);
      
      // Update local state for immediate feedback
      setEquipment(prev => ({
        ...prev,
        [type]: prev[type].filter((item: any) => item.id !== id)
      }));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Equipment Configuration</h1>
        <p className="text-gray-600">Configure core fleet capacity parameters and fixed fuel burn rates.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-status-pending p-4 rounded-xl flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-status-upcoming/20 flex items-center justify-center text-status-upcoming">
            <Fuel className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold">Haulers (Homogeneous Fleet)</h2>
            <p className="text-xs md:text-sm text-gray-500">Global fuel consumption baseline.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-32">
            <input 
              type="number" 
              value={haulerRate}
              onChange={(e) => setHaulerRate(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium text-base md:text-lg" 
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">L/h</span>
          </div>
          <button 
            onClick={handleUpdateHauler} 
            className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold text-sm md:text-base flex items-center gap-2 transition-all shrink-0 ${
              saveToast 
                ? 'bg-status-active/20 text-status-active' 
                : 'bg-primary text-background hover:bg-primary/90'
            }`}
          >
            {saveToast ? <><Check className="w-4 h-4" /> Saved</> : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <EquipmentCategory 
          title="Diggers" 
          data={equipment.diggers} 
          newItem={newDigger}
          setNewItem={setNewDigger}
          onAdd={() => handleAddEquipment('diggers')}
          onDelete={(id: string) => handleDelete('diggers', id)}
        />
        <EquipmentCategory 
          title="Support" 
          data={equipment.support} 
          newItem={newSupport}
          setNewItem={setNewSupport}
          onAdd={() => handleAddEquipment('support')}
          onDelete={(id: string) => handleDelete('support', id)}
        />
      </div>
    </div>
  );
}

