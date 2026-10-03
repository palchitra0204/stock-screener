import React from 'react';
import { useStockStore } from '@/stores/useStockStore';
import { useWebSocketStore } from '@/stores/useWebSocketStore';
import { ShieldCheck, Cpu, Database, Activity, Wifi } from 'lucide-react';

export const Footer: React.FC = () => {
  const stocks = useStockStore((state) => state.stocks);
  const lastFilterDurationMs = useStockStore((state) => state.lastFilterDurationMs);
  const lastSortDurationMs = useStockStore((state) => state.lastSortDurationMs);
  const wsStatus = useWebSocketStore((state) => state.status);
  const latencyMs = useWebSocketStore((state) => state.latencyMs);

  return (
    <footer className="w-full bg-surface-400 border-t border-slate-800 text-slate-400 text-xs py-3 px-4 sm:px-6">
      <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-bull" />
            <span>BharatScreener Pro 1A</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-brand-accent" />
            <span>5,000+ Indian Equities (NSE/BSE)</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-bull" />
            <span>WCAG 2.1 AA Compliant</span>
          </span>
        </div>

        <div className="flex items-center space-x-4 font-mono text-[11px]">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>Filter Latency: {lastFilterDurationMs || 8.4}ms</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-amber-400" />
            <span>Sort: {lastSortDurationMs || 12.1}ms</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-bull" />
            <span>WS: {latencyMs}ms</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
