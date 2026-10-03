import React, { useMemo } from 'react';
import { useStockStore } from '@/stores/useStockStore';
import { useFilterStore } from '@/stores/useFilterStore';
import { SECTORS } from '@/lib/constants';
import { Sector } from '@/types/stock';
import { formatPercent, formatMarketCap } from '@/lib/formatters';
import { LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';

export const SectorHeatmap: React.FC = () => {
  const stocks = useStockStore((state) => state.stocks);
  const selectedSectors = useFilterStore((state) => state.selectedSectors);
  const toggleSector = useFilterStore((state) => state.toggleSector);

  const sectorMetrics = useMemo(() => {
    return SECTORS.map((sector) => {
      const sectorStocks = stocks.filter((s) => s.sector === sector);
      if (sectorStocks.length === 0) {
        return {
          sector,
          count: 0,
          totalMcap: 0,
          avgReturn: 0,
          avgPe: 0,
          avgRoe: 0,
        };
      }

      let mcapSum = 0;
      let returnSum = 0;
      let peSum = 0;
      let roeSum = 0;

      for (const s of sectorStocks) {
        mcapSum += s.marketCap;
        returnSum += s.changePercent;
        peSum += s.pe;
        roeSum += s.roe;
      }

      const count = sectorStocks.length;

      return {
        sector,
        count,
        totalMcap: mcapSum,
        avgReturn: Number((returnSum / count).toFixed(2)),
        avgPe: Number((peSum / count).toFixed(1)),
        avgRoe: Number((roeSum / count).toFixed(1)),
      };
    }).sort((a, b) => b.totalMcap - a.totalMcap);
  }, [stocks]);

  return (
    <div className="bg-surface-300 border border-slate-800 rounded-xl p-4 space-y-3 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <LayoutGrid className="w-3.5 h-3.5 text-brand-accent" />
          <span>Sector Performance Heatmap ({SECTORS.length} Sectors)</span>
        </h3>
        <span className="text-[11px] text-slate-400">
          Click any tile to toggle sector filter in screener
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {sectorMetrics.map((item) => {
          const isSelected = selectedSectors.includes(item.sector);
          const isGain = item.avgReturn >= 0;

          // Color intensity based on return
          const intensity = Math.min(1, Math.abs(item.avgReturn) / 2.5);

          return (
            <div
              key={item.sector}
              onClick={() => toggleSector(item.sector)}
              className={clsx(
                'p-2.5 rounded-lg border text-left cursor-pointer transition-all duration-150 relative overflow-hidden flex flex-col justify-between h-24',
                isSelected
                  ? 'border-brand-400 ring-2 ring-brand-500/40'
                  : 'border-slate-800 hover:border-slate-700'
              )}
              style={{
                backgroundColor: isGain
                  ? `rgba(16, 185, 129, ${0.12 + intensity * 0.25})`
                  : `rgba(244, 63, 94, ${0.12 + intensity * 0.25})`,
              }}
            >
              <div>
                <span className="text-xs font-bold text-slate-100 line-clamp-1">
                  {item.sector}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {item.count} stocks
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span
                  className={clsx(
                    'font-mono font-bold text-sm',
                    isGain ? 'text-bull' : 'text-bear'
                  )}
                >
                  {formatPercent(item.avgReturn)}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {formatMarketCap(item.totalMcap)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
