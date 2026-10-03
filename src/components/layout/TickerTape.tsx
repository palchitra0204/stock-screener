import React, { useMemo } from 'react';
import { useStockStore } from '@/stores/useStockStore';
import { formatINR, formatPercent } from '@/lib/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

export const TickerTape: React.FC = () => {
  const stocks = useStockStore((state) => state.stocks);
  const tickFlashes = useStockStore((state) => state.tickFlashes);
  const setSelectedStock = useStockStore((state) => state.setSelectedStock);
  const setChartModalOpen = useStockStore((state) => state.setChartModalOpen);

  // Top 15 prominent stocks for the ticker marquee
  const tickerStocks = useMemo(() => {
    return stocks.slice(0, 16);
  }, [stocks]);

  if (tickerStocks.length === 0) return null;

  const handleStockClick = (stock: any) => {
    setSelectedStock(stock);
    setChartModalOpen(true);
  };

  return (
    <div
      className="w-full bg-surface-400 border-b border-slate-800 overflow-hidden py-1.5 px-2 select-none relative z-20"
      aria-label="Real-time Indian Market Ticker"
    >
      <div className="flex items-center space-x-6 animate-ticker whitespace-nowrap hover:[animation-play-state:paused]">
        {/* Double array for seamless loop */}
        {[...tickerStocks, ...tickerStocks].map((stock, idx) => {
          const isGain = stock.changePercent >= 0;
          const flash = tickFlashes[stock.symbol];

          return (
            <button
              key={`${stock.symbol}-${idx}`}
              type="button"
              onClick={() => handleStockClick(stock)}
              className={clsx(
                'inline-flex items-center space-x-2 text-xs font-mono px-2.5 py-0.5 rounded transition-all duration-300 hover:bg-surface-200 cursor-pointer',
                flash?.direction === 'up' && 'animate-flash-green bg-bull-bg',
                flash?.direction === 'down' && 'animate-flash-red bg-bear-bg'
              )}
            >
              <span className="font-semibold text-slate-200">{stock.symbol}</span>
              <span className="text-slate-100 font-medium tabular-nums">
                {formatINR(stock.price)}
              </span>
              <span
                className={clsx(
                  'flex items-center font-medium tabular-nums text-[11px]',
                  isGain ? 'text-bull' : 'text-bear'
                )}
              >
                {isGain ? (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                )}
                {formatPercent(stock.changePercent)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
