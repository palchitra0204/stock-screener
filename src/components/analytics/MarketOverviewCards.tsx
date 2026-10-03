import React, { useMemo } from 'react';
import { useStockStore } from '@/stores/useStockStore';
import { formatMarketCap, formatPercent } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Layers, BarChart2 } from 'lucide-react';
import { clsx } from 'clsx';

export const MarketOverviewCards: React.FC = () => {
  const stocks = useStockStore((state) => state.stocks);

  const stats = useMemo(() => {
    if (stocks.length === 0) {
      return {
        totalMcap: 0,
        gainers: 0,
        losers: 0,
        unchanged: 0,
        avgRsi: 50,
        topGainer: null,
        topLoser: null,
      };
    }

    let totalMcap = 0;
    let gainers = 0;
    let losers = 0;
    let unchanged = 0;
    let rsiSum = 0;

    let topGainer = stocks[0];
    let topLoser = stocks[0];

    for (const s of stocks) {
      totalMcap += s.marketCap;
      rsiSum += s.rsi14;

      if (s.changePercent > 0) gainers++;
      else if (s.changePercent < 0) losers++;
      else unchanged++;

      if (s.changePercent > topGainer.changePercent) topGainer = s;
      if (s.changePercent < topLoser.changePercent) topLoser = s;
    }

    return {
      totalMcap,
      gainers,
      losers,
      unchanged,
      avgRsi: Number((rsiSum / stocks.length).toFixed(1)),
      topGainer,
      topLoser,
    };
  }, [stocks]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 select-none">
      {/* Total Market Breadth */}
      <div className="bg-surface-300 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Market Breadth</span>
          <Layers className="w-3.5 h-3.5 text-brand-accent" />
        </div>
        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-xl font-mono font-bold text-bull">{stats.gainers}</span>
          <span className="text-xs text-slate-400">Adv</span>
          <span className="text-slate-600">/</span>
          <span className="text-xl font-mono font-bold text-bear">{stats.losers}</span>
          <span className="text-xs text-slate-400">Dec</span>
        </div>
        {/* Progress ratio bar */}
        <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${(stats.gainers / (stocks.length || 1)) * 100}%` }}
            className="bg-bull h-full"
          />
          <div
            style={{ width: `${(stats.losers / (stocks.length || 1)) * 100}%` }}
            className="bg-bear h-full"
          />
        </div>
      </div>

      {/* Total Aggregate Indian Equities Capitalization */}
      <div className="bg-surface-300 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Aggregate M-Cap</span>
          <BarChart2 className="w-3.5 h-3.5 text-brand-accent" />
        </div>
        <div className="my-1">
          <span className="text-xl font-mono font-bold text-slate-100 block">
            {formatMarketCap(stats.totalMcap)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Across 5,000+ Listed Equities</span>
        </div>
      </div>

      {/* Top Gainer */}
      <div className="bg-surface-300 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Top Momentum</span>
          <TrendingUp className="w-3.5 h-3.5 text-bull" />
        </div>
        {stats.topGainer && (
          <div className="my-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono font-bold text-slate-100">
                {stats.topGainer.symbol}
              </span>
              <span className="text-xs font-mono font-bold text-bull">
                {formatPercent(stats.topGainer.changePercent)}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block truncate">{stats.topGainer.name}</span>
          </div>
        )}
      </div>

      {/* Top Loser */}
      <div className="bg-surface-300 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Top Pullback</span>
          <TrendingDown className="w-3.5 h-3.5 text-bear" />
        </div>
        {stats.topLoser && (
          <div className="my-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono font-bold text-slate-100">
                {stats.topLoser.symbol}
              </span>
              <span className="text-xs font-mono font-bold text-bear">
                {formatPercent(stats.topLoser.changePercent)}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block truncate">{stats.topLoser.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};
