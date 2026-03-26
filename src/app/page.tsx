"use client";

import React, { useState, useEffect } from 'react';
import { Droplet, TrendingUp, Activity, Loader2, AlertCircle } from 'lucide-react';

interface KPI {
  label: string;
  value: string;
  unit: string;
  alert: boolean;
}

interface MetricCell {
  value: number;
  target: number;
  color: string;
}

interface MatrixRow {
  id: string;
  metrics: MetricCell[];
}

interface DashboardData {
  kpis: KPI[];
  headers: string[];
  matrixData: MatrixRow[];
}

export default function MainDashboard() {
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const fetchDashboard = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/dashboard`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      setDashData(data);
      setError(null);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setError('Request timed out (60s). Please check FMS connection.');
      } else {
        console.error(err);
        setError(err.message || 'Error fetching dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchDashboard();
  }, []);

  if (!isMounted) return null;


  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-12">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl flex items-center gap-3 border border-red-100">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-bold">Dashboard Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashData) return null;

  const { kpis, headers, matrixData } = dashData;

  const kpiIcons = [
    <Droplet className="w-5 h-5" key="d" />,
    <Activity className="w-5 h-5" key="a" />,
    <TruckIcon key="t" />,
    <TrendingUp className="w-5 h-5" key="tr" />,
  ];

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Main Dashboard</h1>
        <p className="text-gray-600">Real-time overview of active shift health and fuel inefficiencies.</p>
      </div>

      {/* Hero Row: KPI Cards - Adaptive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-3 md:mb-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`p-2 md:p-4 rounded-xl border ${kpi.alert ? 'border-status-pending bg-status-pending/5' : 'border-border bg-surface'} shadow-sm flex flex-col justify-between`}>
            <div className="flex items-center justify-between mb-1 md:mb-3">
              <div className={`p-1 md:p-1.5 rounded-md ${kpi.alert ? 'bg-status-pending text-white' : 'bg-gray-100 text-gray-600'}`}>
                {kpiIcons[idx] || <Activity className="w-4 h-4 md:w-5 md:h-5" />}
              </div>
            </div>
            <div>
              <p className="text-[8px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">{kpi.label}</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <h3 className={`text-base md:text-xl font-bold ${kpi.alert ? 'text-status-pending' : 'text-primary'}`}>{kpi.value}</h3>
                <span className="text-[8px] md:text-[10px] text-gray-400 font-medium">{kpi.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Matrix - App Style (Dual Scroll) */}
      <div className="bg-surface border border-border rounded-xl shadow-sm p-1.5 md:p-5 flex flex-col overflow-hidden max-h-[60vh] md:max-h-none">
        <div className="flex items-center justify-between mb-3 md:mb-6 px-1 md:px-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm md:text-lg text-primary">Fleet Matrix</h2>
            <span className="text-[8px] md:text-xs bg-status-priority/10 text-status-priority px-1.5 py-0.5 rounded font-black flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-status-priority animate-pulse"></span>
              SYNC
            </span>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#189123]"></div>
            <div className="w-2 h-2 rounded-full bg-[#DFA83B]"></div>
            <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Matrix Legend */}
          <div className="flex flex-col md:flex-row md:items-center gap-2.5 md:gap-4 text-xs font-semibold bg-gray-50 px-3 py-3 rounded-lg border border-border mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#189123] shadow-sm"></span>
              <span className="text-gray-600">Under Budget</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#DFA83B] shadow-sm"></span>
              <span className="text-gray-600">Near Budget (&lt;±15%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#EF4444] shadow-sm"></span>
              <span className="text-gray-600">Over Budget (&gt;+15%)</span>
            </div>
          </div>

          <div className="w-full">
            <div
              className="grid gap-1 md:gap-2"
              style={{
                gridTemplateColumns: `clamp(70px, 8vw, 85px) repeat(${headers.length - 1}, minmax(110px, 1fr))`
              }}
            >
              {/* Headers Row - Standardized Height */}
              {headers.map((h, i) => (
                <div key={i} className={`bg-[#32775F] text-white font-bold text-center text-[9px] md:text-[11px] h-10 md:h-14 rounded-md flex items-center justify-center shadow-sm px-1 leading-tight ${h.includes('(D)') ? 'opacity-80' : ''} ${i === 0 ? 'sticky left-0 z-20' : ''}`}>
                  {h}
                </div>
              ))}

              {/* Data Rows - Standardized Height for perfect alignment */}
              {matrixData.map((row, rIdx) => (
                <React.Fragment key={rIdx}>
                  {/* Row Header (Excavator ID) */}
                  <div className={`${row.id === 'Overall' ? 'bg-[#32775F]' : 'bg-[#6F9E8B]'} text-white font-bold text-center text-[10px] md:text-sm rounded-md h-12 md:h-16 flex items-center justify-center shadow-sm sticky left-0 z-10`}>
                    {row.id}
                  </div>

                  {row.metrics.map((cell, cIdx) => (
                    <div key={cIdx} className={`${cell.color} ${cell.color.includes('bg-[#') || cell.color.includes('bg-primary') || cell.color.includes('EF4444') ? 'text-white' : 'text-gray-900 border border-gray-100'} relative rounded h-12 md:h-16 flex items-center justify-center shadow-sm select-none`}>
                      <div className="flex flex-col items-center">
                        <span className="text-[clamp(0.75rem,3.5vw,1.1rem)] font-bold tracking-tight">
                          {typeof cell.value === 'number' ? cell.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : cell.value}
                        </span>
                        <span className={`text-[7px] md:text-[9px] font-bold opacity-70`}>
                          {typeof cell.target === 'number' ? cell.target.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : cell.target}
                        </span>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

function TruckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17h4V5H2v12h3" /><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" /><path d="M14 17h1" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>
  );
}

