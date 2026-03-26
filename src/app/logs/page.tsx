"use client";

import React, { useState } from 'react';
import { Download, Search, Filter } from 'lucide-react';

export default function DataLogs() {
  const [searchTerm, setSearchTerm] = useState('');

  // Disconnected mocking block matching mockData.json array structures
  const logs = [
    { id: "EX0389", payload: 86.5, ewh: 0.72, queuing: 120, speed: 12.5, timestamp: "2026-02-17T14:30:00Z" },
    { id: "EX0215", payload: 92.1, ewh: 0.88, queuing: 45, speed: 14.1, timestamp: "2026-02-17T14:30:00Z" },
    { id: "EX0481", payload: 88.0, ewh: 0.93, queuing: 5, speed: 10.2, timestamp: "2026-02-17T14:30:00Z" },
    { id: "EX0389", payload: 87.2, ewh: 0.65, queuing: 145, speed: 11.2, timestamp: "2026-02-17T15:30:00Z" },
    { id: "EX0215", payload: 91.5, ewh: 0.85, queuing: 50, speed: 14.3, timestamp: "2026-02-17T15:30:00Z" },
    { id: "EX0481", payload: 89.1, ewh: 0.95, queuing: 8, speed: 10.8, timestamp: "2026-02-17T15:30:00Z" },
  ];

  const filteredLogs = logs.filter(log => log.id.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Granular Data Logs</h1>
          <p className="text-gray-600">Raw chronological ledger of FMS API parameter ingestion.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Equipment ID..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-background border border-border rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
            <Filter className="w-4 h-4" /> Advanced Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp (UTC)</th>
                <th className="px-6 py-4">Equipment ID</th>
                <th className="px-6 py-4">Payload (BCM)</th>
                <th className="px-6 py-4">EWH</th>
                <th className="px-6 py-4">Queueing (Mins)</th>
                <th className="px-6 py-4">Speed (km/h)</th>
                <th className="px-6 py-4">Production Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-primary">{log.id}</td>
                  <td className="px-6 py-4 font-medium">{log.payload}</td>
                  <td className="px-6 py-4 text-secondary font-medium">{log.ewh}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${log.queuing > 60 ? 'bg-status-pending/10 text-status-pending' : 'bg-gray-100 text-gray-600'}`}>
                      {log.queuing}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{log.speed}</td>
                  <td className="px-6 py-4">
                     <div className="flex items-end gap-[2px] h-5 opacity-60">
                        {Array.from({length: 6}).map((_, idx) => (
                          <div key={idx} className="w-1 bg-primary rounded-t-sm" style={{ height: `${Math.floor(Math.random() * 80 + 20)}%` }}></div>
                        ))}
                     </div>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No telemetry logs found for the applied filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-gray-50 text-sm text-gray-500">
           <span>Showing 1 to {filteredLogs.length} of {filteredLogs.length} entries</span>
           <div className="flex gap-2">
             <button className="px-3 py-1 border border-border rounded-lg bg-background disabled:opacity-50" disabled>Previous</button>
             <button className="px-3 py-1 border border-border rounded-lg bg-background disabled:opacity-50" disabled>Next</button>
           </div>
        </div>

      </div>
    </div>
  );
}
