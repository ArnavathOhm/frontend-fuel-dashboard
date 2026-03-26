"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ContourPlot, { ContourData } from '@/components/ContourPlot';
import parametersData from '@/data/parameters.json';
import { Play } from 'lucide-react';

// ─── Type for a single cycle-time parameter ────────────────────────────────
interface Param {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  default: number;
  step: number;
}

interface FleetItem {
  id: string;
  name: string;
  model: string;
  burnRateDigger: number;
  burnRateHauler: number;
  burnRateSupport: number;
  vesselCapacity: number;
  nTruck: number;
  fuelRatioLoadingBudget: number;
  fuelRatioHaulingBudget: number;
  plannedDistance: number;
  staticParams: Record<string, number>;
}

export default function OptimizationDashboard() {
  const params = parametersData as Param[];

  const [xAxisId, setXAxisId] = useState('Loading Time');
  const [yAxisId, setYAxisId] = useState('Spotting Time');

  const [fleet, setFleet] = useState<FleetItem[]>([]);
  const [selectedExcavatorId, setSelectedExcavatorId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plotData, setPlotData] = useState<ContourData | null>(null);

  const selectedFleetItem = useMemo(() => fleet.find(ex => ex.id === selectedExcavatorId), [selectedExcavatorId, fleet]);
  const selectedX = useMemo(() => params.find(p => p.id === xAxisId)!, [xAxisId, params]);
  const selectedY = useMemo(() => params.find(p => p.id === yAxisId)!, [yAxisId, params]);

  // Load backend config
  useEffect(() => {
    async function fetchConfig() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/api/optimization/config`);
        const data = await res.json();
        if (data.fleet && data.fleet.length > 0) {
          setFleet(data.fleet);
          setSelectedExcavatorId(data.fleet[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch optimization config:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();
  }, []);

  // Only parameters with min/max defined can be simulated on the axes
  const selectableParams = useMemo(() => params.filter(p => typeof p.min === 'number'), [params]);

  const handleGenerate = useCallback(async () => {
    if (!selectedX || !selectedY || !selectedFleetItem) return;

    try {
      setIsGenerating(true);

      // Build axis tick arrays
      const gridRes = 50;
      const xVals: number[] = [];
      const yVals: number[] = [];
      const xStep = (selectedX.max - selectedX.min) / gridRes;
      const yStep = (selectedY.max - selectedY.min) / gridRes;

      for (let i = 0; i <= gridRes; i++) {
        xVals.push(parseFloat((selectedX.min + i * xStep).toFixed(2)));
        yVals.push(parseFloat((selectedY.min + i * yStep).toFixed(2)));
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/optimization/contour`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          xAxisId: selectedX.id,
          yAxisId: selectedY.id,
          xVals,
          yVals,
          fleetItem: selectedFleetItem
        })
      });

      if (!res.ok) throw new Error("Contour API failed");
      const grid = await res.json();

      const dist = selectedFleetItem.staticParams['Distance'] || 3.0;
      const plannedDist = selectedFleetItem.plannedDistance || 3.0;
      const baselineTarget = (selectedFleetItem.fuelRatioLoadingBudget || 0.5) +
        ((selectedFleetItem.fuelRatioHaulingBudget || 1.0) * (dist / plannedDist));

      setPlotData({
        x: grid.x,
        y: grid.y,
        z: grid.zActual, // Use absolute fuel ratio for isolines and colorscale
        zActual: grid.zActual,
        productivity: grid.productivity,
        threshold: baselineTarget,
        xLabel: `${selectedX.label} (${selectedX.unit})`,
        yLabel: `${selectedY.label} (${selectedY.unit})`,
        plotPoint: { 
          x: selectedFleetItem.staticParams[selectedX.id] ?? selectedX.default, 
          y: selectedFleetItem.staticParams[selectedY.id] ?? selectedY.default 
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedX, selectedY, selectedFleetItem]);

  // Auto-generate when initial data is loaded
  useEffect(() => {
    if (selectedExcavatorId && fleet.length > 0) {
      handleGenerate();
    }
  }, [selectedExcavatorId, fleet]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Optimization & Sensitivity</h1>
          <p className="text-gray-600">
            Vary operational parameters to visualize fuel ratio thresholds as contour bands.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ─── Contour Plot Area ────────────────────────────────────── */}
        <div className="lg:col-span-3 order-1 lg:order-2 bg-surface p-1 rounded-2xl border border-border min-h-[280px] md:min-h-[540px] shadow-sm flex items-center justify-center overflow-hidden">
          {plotData ? (
             <div className="w-full h-full min-h-[460px] md:min-h-[520px]">
               <ContourPlot data={plotData} />
             </div>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 p-8 md:p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Play className="w-6 h-6" />
              </div>
              <p className="font-medium text-gray-900">Select parameters and generate</p>
            </div>
          )}
        </div>

        {/* ─── Controls Column ──────────────────────────────────────── */}
        <div className="lg:col-span-1 order-2 lg:order-1 space-y-4 bg-surface p-4 md:p-5 rounded-2xl border border-border h-fit shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-500">Inputs</h2>
          </div>

          {/* Excavator Selector */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-gray-400">Equipment Fleet</label>
            <select
              value={selectedExcavatorId}
              onChange={(e) => setSelectedExcavatorId(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-secondary cursor-pointer"
            >
              {fleet.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.id} — {ex.model}</option>
              ))}
            </select>
          </div>

          {/* Axis Selection Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 pt-2 border-t border-border">
            {/* X-Axis Selector */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-[#22C55E]">X-Axis</label>
              <select
                value={xAxisId}
                onChange={(e) => setXAxisId(e.target.value)}
                className="w-full px-2 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-secondary cursor-pointer"
              >
                {selectableParams.map(p => (
                  <option key={`x-${p.id}`} value={p.id} disabled={p.id === yAxisId}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Y-Axis Selector */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-[#F59E0B]">Y-Axis</label>
              <select
                value={yAxisId}
                onChange={(e) => setYAxisId(e.target.value)}
                className="w-full px-2 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-secondary cursor-pointer"
              >
                {selectableParams.map(p => (
                  <option key={`y-${p.id}`} value={p.id} disabled={p.id === xAxisId}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Database Parameters Grid */}
          <div className="p-3 bg-gray-50 dark:bg-border/30 rounded-xl border border-border space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">System Constraints</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <div>
                <p className="text-[10px] text-gray-500">Payload</p>
                <p className="text-xs font-bold">{selectedFleetItem?.vesselCapacity} BCM</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Trucks</p>
                <p className="text-xs font-bold">{selectedFleetItem?.nTruck?.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Burn (Ex/Haul)</p>
                <p className="text-xs font-bold">{selectedFleetItem?.burnRateDigger}/{selectedFleetItem?.burnRateHauler} L/h</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Baseline Target</p>
                <p className="text-xs font-bold text-primary">{(
                  (selectedFleetItem?.fuelRatioLoadingBudget || 0) + 
                  (selectedFleetItem?.fuelRatioHaulingBudget || 0) * 
                  ((selectedFleetItem?.staticParams?.['Distance'] || 3) / (selectedFleetItem?.plannedDistance || 3))
                ).toFixed(2)} L/BCM</p>
              </div>
            </div>
          </div>

          {/* Run button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 bg-primary text-background rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-md"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            {isGenerating ? 'Recalculating...' : 'Update Map'}
          </button>

          {/* Zone Legend - more compact */}
          <div className="flex items-center justify-between text-[10px] px-1 text-gray-500 pt-1">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
              <span>Optimal</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span>Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
