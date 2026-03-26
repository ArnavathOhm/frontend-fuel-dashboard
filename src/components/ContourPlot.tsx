"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex items-center justify-center bg-gray-50 rounded-lg border border-border">
      Loading Contour Engine...
    </div>
  ),
});

export interface ContourData {
  x: number[];          // unique x-axis tick values
  y: number[];          // unique y-axis tick values
  z: number[][];        // efficiency ratio matrix [y.length][x.length] (1.0 = target)
  zActual?: number[][]; // actual fuel ratio matrix (for tooltip)
  productivity: number[][];  // productivity matrix (secondary z data)
  threshold: number;    // fuel ratio budget target
  xLabel: string;
  yLabel: string;
  plotPoint?: { x: number; y: number }; // current operating point
}

export default function ContourPlot({ data }: { data: ContourData }) {
  if (!data || !data.z || data.z.length === 0) return null;

  const { x, y, z, zActual, productivity, threshold, xLabel, yLabel, plotPoint } = data;

  // Build dynamic colorscale with strict 3-zone bands:
  // Green  = Under Budget   (< threshold * 1.00)
  // Orange = Near Budget    (threshold to threshold * 1.15)
  // Grey   = Over Budget    (> threshold * 1.15)
  const colorscale = useMemo(() => {
    const flat = z.flat();
    const zMin = Math.min(...flat);
    const zMax = Math.max(...flat);
    const range = zMax - zMin;

    if (range === 0) {
      return [[0, '#22C55E'], [1, '#22C55E']] as [number, string][];
    }

    // Strictly map the two boundary values into [0,1] normalized space
    const t1 = threshold;           // 100% of budget  -> green/orange border
    const t2 = threshold * 1.15;    // 115% of budget  -> orange/grey border

    // Calculate normalized positions for the two budget markers
    const n1 = (t1 - zMin) / range;
    const n2 = (t2 - zMin) / range;

    const s1 = Math.max(0, Math.min(1, n1));
    const s2 = Math.max(s1, Math.min(1, n2));

    // Discrete colorscale with very narrow transitions to look sharp
    const eps = 0.0001;
    return [
      [0,          '#22C55E'],
      [s1,         '#22C55E'],
      [Math.min(1, s1 + eps), '#F59E0B'],
      [s2,         '#F59E0B'],
      [Math.min(1, s2 + eps), '#F3F4F6'],
      [1,          '#F3F4F6'],
    ] as [number, string][];
  }, [z, threshold]);

  // Build customdata for tooltip (productivity and actual fuel ratio values)
  const customdata = useMemo(() => {
    return productivity.map((row, yi) => 
      row.map((val, xi) => ({
        prod: typeof val === 'number' ? val.toFixed(1) : '-',
        actualFR: zActual?.[yi]?.[xi] !== undefined 
          ? zActual[yi][xi].toFixed(2) 
          : (typeof z[yi]?.[xi] === 'number' ? (z[yi][xi] * (threshold || 1.5)).toFixed(2) : '-')
      }))
    );
  }, [productivity, z, zActual, threshold]);

  // Find nearest productivity for Actual Condition point
  const actualProdVal = useMemo(() => {
    if (!plotPoint || !x.length || !y.length) return '-';
    // Find nearest indices
    const xi = x.reduce((prev, curr, idx) => Math.abs(curr - plotPoint.x) < Math.abs(x[prev] - plotPoint.x) ? idx : prev, 0);
    const yi = y.reduce((prev, curr, idx) => Math.abs(curr - plotPoint.y) < Math.abs(y[prev] - plotPoint.y) ? idx : prev, 0);
    return productivity[yi]?.[xi]?.toFixed(1) ?? '-';
  }, [plotPoint, x, y, productivity]);

  // Scatter trace for the "current operating point" with a glow effect
  const scatterTraces: any[] = [];
  if (plotPoint) {
    // 1. The Pulse/Glow Ring
    scatterTraces.push({
      x: [plotPoint.x],
      y: [plotPoint.y],
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: 26,
        color: 'rgba(239, 68, 68, 0.15)',
        symbol: 'circle',
        line: { width: 1, color: 'rgba(239, 68, 68, 0.4)' },
      },
      showlegend: false,
      hoverinfo: 'none'
    });
    // 2. The Core Dot
    scatterTraces.push({
      x: [plotPoint.x],
      y: [plotPoint.y],
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: 13,
        color: '#EF4444',
        line: { width: 2, color: '#fff' },
        symbol: 'circle',
      },
      name: 'Actual Condition',
      hovertemplate: `<b>Actual Condition</b><br>${xLabel}: %{x:.1f}<br>${yLabel}: %{y:.1f}<br><b>Productivity: ${actualProdVal} BCM/hr</b><extra></extra>`,
    });
  }

  return (
    <div className="w-full h-full min-h-[520px]">
      <Plot
        data={[

          // 2. High-Density Background Fill (Smooth, no labels)
          {
            x: x,
            y: y,
            z: z,
            type: 'contour',
            colorscale: colorscale,
            autocontour: false,
            ncontours: 100, // Still use high density but with sharper edges
            zsmooth: false,
            contours: {
              coloring: 'fill',
              showlabels: false,
              showlines: false
            },
            showscale: false,
            hoverinfo: 'none' as const,
          },
          // 3. Minor Isoline Labels (Every 0.1, subtle)
          {
            x: x,
            y: y,
            z: z,
            type: 'contour',
            colorscale: [['0','rgba(0,0,0,0)'],['1','rgba(0,0,0,0)']],
            showscale: false,
            autocontour: false,
            ncontours: 0,
            zsmooth: 'best',
            contours: {
              coloring: 'none',
              showlabels: true,
              labelfont: { family: 'Inter, sans-serif', size: 8, color: '#666' },
              labelformat: '.1f',
              start: 0,
              end: 10,
              size: 0.1,
            },
            line: { 
              smoothing: 1, 
              width: 0.3, 
              color: '#666666',
              dash: 'solid' 
            },
            hoverinfo: 'none' as const,
          },
          // 3. Major Isoline Labels (Every 1.0, BOLD BLACK)
          {
            x: x,
            y: y,
            z: z,
            customdata: customdata,
            type: 'contour',
            colorscale: [['0','#000'],['1','#000']], 
            showscale: false,
            autocontour: false,
            ncontours: 0,
            zsmooth: 'best',
            contours: {
              coloring: 'none',
              showlabels: true,
              labelfont: { family: 'Inter, sans-serif', size: 12, color: '#000', weight: 800 as any },
              labelformat: '.1f',
              start: 0,
              end: 10,
              size: 1.0,
            },
            line: { 
              smoothing: 1, 
              width: 1.2, 
              color: '#000000',
              dash: 'solid'
            },
            hovertemplate:
              `<b>Analytical Status</b><br>` +
              `${xLabel}: %{x:.1f}<br>${yLabel}: %{y:.1f}<br>` +
              `Fuel Ratio: <b>%{customdata.actualFR}</b> L/BCM<br>` +
              `Productivity: <b>%{customdata.prod}</b> BCM/hr<extra></extra>`,
          },
          // 4. Global Hover Layer (Transparent, top-most)
          {
            x: x,
            y: y,
            z: z,
            customdata: customdata,
            type: 'contour',
            showscale: false,
            autocontour: true,
            ncontours: 0,
            zsmooth: 'best',
            contours: { coloring: 'none', showlines: false },
            hovertemplate: `<b>Analytical Status</b><br>${xLabel}: %{x:.1f}<br>${yLabel}: %{y:.1f}<br><b>Fuel Ratio: %{customdata.actualFR} L/BCM</b><br><b>Productivity: %{customdata.prod} BCM/hr</b><extra></extra>`,
            hoverinfo: 'all' as const,
          },
          ...scatterTraces,
        ]}
        layout={{
          title: { 
            text: 'Operational Performance Sensitivity Map', 
            font: { size: 16, family: 'Inter, sans-serif', color: '#111' },
            pad: { t: 20 }
          },
          xaxis: {
            title: { text: xLabel, font: { size: 13 } },
            gridcolor: '#e5e7eb',
            zeroline: false,
          },
          yaxis: {
            title: { text: yLabel, font: { size: 13 } },
            gridcolor: '#e5e7eb',
            zeroline: false,
          },
          shapes: [
            // Green zone boundary line
            {
              type: 'line',
              x0: 0, x1: 0, y0: 0, y1: 0,
              line: { width: 0 },
              layer: 'above',
            },
          ],
          annotations: [
            {
              x: 0.02,
              y: 0.98,
              xref: 'paper',
              yref: 'paper',
              text: threshold === 1.0 ? `Target Baseline: <b>1.0</b> (Normalized)` : `Fuel Ratio Target: <b>${typeof threshold === 'number' ? threshold.toFixed(2) : 'N/A'}</b> L/BCM`,
              showarrow: false,
              font: { size: 11, color: '#374151', family: 'Inter, sans-serif' },
              bgcolor: 'rgba(255,255,255,0.85)',
              bordercolor: '#d1d5db',
              borderwidth: 1,
              borderpad: 6,
            },
          ],
          autosize: true,
          margin: { l: 65, r: 15, b: 60, t: 50, pad: 4 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(250,250,250,0.5)',
          font: { family: 'Inter, sans-serif' },
          showlegend: false,
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
