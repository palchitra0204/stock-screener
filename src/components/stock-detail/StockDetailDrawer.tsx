import React, { useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { useStockStore } from '@/stores/useStockStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { CandlestickChart } from '@/components/chart/CandlestickChart';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  formatINR,
  formatMarketCap,
  formatPercent,
  formatRatio,
  formatVolume,
} from '@/lib/formatters';
import {
  Star,
  LineChart,
  Activity,
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';

export const StockDetailDrawer: React.FC = () => {
  const isDetailDrawerOpen = useStockStore((state) => state.isDetailDrawerOpen);
  const setDetailDrawerOpen = useStockStore((state) => state.setDetailDrawerOpen);
  const selectedStock = useStockStore((state) => state.selectedStock);

  const toggleWatchlistSymbol = useWatchlistStore((state) => state.toggleSymbol);
  const isSymbolInActiveWatchlist = useWatchlistStore((state) => state.isSymbolInActiveWatchlist);

  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'chart' | 'financials' | 'technicals'>('overview');

  if (!selectedStock) return null;

  const isStarred = isSymbolInActiveWatchlist(selectedStock.symbol);
  const isGain = selectedStock.changePercent >= 0;

  // 52W High/Low Range Percentage Calculation
  const high52 = selectedStock.week52High;
  const low52 = selectedStock.week52Low;
  const range52 = high52 - low52;
  const position52 = range52 > 0 ? Math.min(100, Math.max(0, ((selectedStock.price - low52) / range52) * 100)) : 50;

  return (
    <Drawer
      isOpen={isDetailDrawerOpen}
      onClose={() => setDetailDrawerOpen(false)}
      title={
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold font-mono text-slate-100">{selectedStock.symbol}</span>
              <span className="text-xs px-1.5 py-0.5 bg-surface-100 text-slate-400 rounded">
                {selectedStock.exchange}
              </span>
              <Badge variant="brand" size="sm">
                {selectedStock.marketCapCategory}
              </Badge>
            </div>
            <span className="text-xs text-slate-400">{selectedStock.name}</span>
          </div>
        </div>
      }
      size="xl"
    >
      <div className="space-y-6">
        {/* Top Price Card */}
        <div className="bg-surface-400 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {formatINR(selectedStock.price)}
              </span>
              <div
                className={clsx(
                  'flex items-center font-mono font-bold text-sm',
                  isGain ? 'text-bull' : 'text-bear'
                )}
              >
                {isGain ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                <span>
                  {formatINR(selectedStock.change)} ({formatPercent(selectedStock.changePercent)})
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
              <span>
                Prev Close: <span className="text-slate-200 font-mono">{formatINR(selectedStock.previousClose)}</span>
              </span>
              <span>
                Day Range:{' '}
                <span className="text-slate-200 font-mono">
                  {formatINR(selectedStock.dayLow)} - {formatINR(selectedStock.dayHigh)}
                </span>
              </span>
              <span>
                Volume: <span className="text-cyan-400 font-mono">{formatVolume(selectedStock.volume)}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isStarred ? 'primary' : 'outline'}
              size="sm"
              onClick={() => toggleWatchlistSymbol(selectedStock.symbol)}
              leftIcon={<Star className={clsx('w-4 h-4', isStarred ? 'fill-white' : 'text-amber-400')} />}
            >
              {isStarred ? 'Starred' : 'Watchlist'}
            </Button>
          </div>
        </div>

        {/* 52-Week Range Bar Gauge */}
        <div className="bg-surface-400/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">52W Low: <span className="font-mono text-slate-200">{formatINR(low52)}</span></span>
            <span className="text-slate-300 font-medium">52-Week Price Spectrum</span>
            <span className="text-slate-400">52W High: <span className="font-mono text-slate-200">{formatINR(high52)}</span></span>
          </div>
          <div className="relative w-full h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-bear via-amber-500 to-bull rounded-full"
              style={{ width: '100%' }}
            />
          </div>
          <div className="relative w-full h-4">
            <div
              className="absolute -top-1.5 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${position52}%` }}
            >
              <div className="w-2.5 h-2.5 bg-white border-2 border-brand-500 rounded-full shadow" />
              <span className="text-[10px] font-mono text-slate-300 mt-0.5">{position52.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Tabs: Overview / Financials / Technicals / Chart */}
        <div className="flex border-b border-slate-800 space-x-1">
          {[
            { id: 'overview', label: 'Overview & Valuation' },
            { id: 'financials', label: 'Financial Health & Growth' },
            { id: 'technicals', label: 'Technicals & Momentum' },
            { id: 'chart', label: 'Interactive Candlestick' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveDetailTab(tab.id as any)}
              className={clsx(
                'px-3 py-2 text-xs font-semibold border-b-2 transition-all',
                activeDetailTab === tab.id
                  ? 'border-brand-500 text-brand-accent bg-brand-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview & Valuation Grid */}
        {activeDetailTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-surface-400/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Market Capitalization</span>
                <span className="text-sm font-bold font-mono text-slate-100 mt-0.5 block">
                  {formatMarketCap(selectedStock.marketCap)}
                </span>
              </div>
              <div className="bg-surface-400/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">P/E Ratio (TTM)</span>
                <span className="text-sm font-bold font-mono text-slate-100 mt-0.5 block">
                  {formatRatio(selectedStock.pe, 1)}
                </span>
                <span className="text-[10px] text-slate-500 block">Ind: {formatRatio(selectedStock.industryPe, 1)}</span>
              </div>
              <div className="bg-surface-400/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">P/B Ratio</span>
                <span className="text-sm font-bold font-mono text-slate-100 mt-0.5 block">
                  {formatRatio(selectedStock.pb, 2)}
                </span>
              </div>
              <div className="bg-surface-400/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Dividend Yield</span>
                <span className="text-sm font-bold font-mono text-slate-100 mt-0.5 block">
                  {formatPercent(selectedStock.dividendYield, false)}
                </span>
              </div>
              <div className="bg-surface-400/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Book Value</span>
                <span className="text-sm font-bold font-mono text-slate-100 mt-0.5 block">
                  {formatINR(selectedStock.bookValue)}
                </span>
              </div>
              <div className="bg-surface-400/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">EPS (TTM)</span>
                <span className="text-sm font-bold font-mono text-slate-100 mt-0.5 block">
                  {formatINR(selectedStock.earningsPerShare)}
                </span>
              </div>
              <div className="bg-surface-400/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">EV / EBITDA</span>
                <span className="text-sm font-bold font-mono text-slate-100 mt-0.5 block">
                  {formatRatio(selectedStock.evToEbitda, 1)}
                </span>
              </div>
              <div className="bg-surface-400/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Delivery %</span>
                <span className="text-sm font-bold font-mono text-slate-100 mt-0.5 block">
                  {formatPercent(selectedStock.deliveryPercent, false)}
                </span>
              </div>
            </div>

            {/* Sector Details */}
            <div className="bg-surface-400/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Company & Industry Classification
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Sector</span>
                  <span className="text-slate-200 font-medium">{selectedStock.sector}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Industry</span>
                  <span className="text-slate-200 font-medium">{selectedStock.industry}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">ISIN</span>
                  <span className="text-slate-200 font-mono">{selectedStock.isin}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Exchange</span>
                  <span className="text-slate-200 font-semibold">{selectedStock.exchange} (India)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Health & Growth Tab */}
        {activeDetailTab === 'financials' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Return on Equity (ROE)</span>
              <span className="text-base font-bold font-mono text-bull mt-1 block">
                {formatPercent(selectedStock.roe, false)}
              </span>
            </div>
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Return on Capital (ROCE)</span>
              <span className="text-base font-bold font-mono text-cyan-400 mt-1 block">
                {formatPercent(selectedStock.roce, false)}
              </span>
            </div>
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Debt to Equity</span>
              <span className="text-base font-bold font-mono text-slate-100 mt-1 block">
                {formatRatio(selectedStock.debtToEquity, 2)}
              </span>
            </div>
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Operating Margin</span>
              <span className="text-base font-bold font-mono text-slate-100 mt-1 block">
                {formatPercent(selectedStock.operatingMargin, false)}
              </span>
            </div>
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Net Profit Margin</span>
              <span className="text-base font-bold font-mono text-slate-100 mt-1 block">
                {formatPercent(selectedStock.profitMargin, false)}
              </span>
            </div>
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Free Cash Flow</span>
              <span className="text-base font-bold font-mono text-bull mt-1 block">
                {formatINR(selectedStock.freeCashFlow)} Cr
              </span>
            </div>
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">1Y Revenue Growth</span>
              <span className="text-base font-bold font-mono text-slate-100 mt-1 block">
                {formatPercent(selectedStock.revenueGrowth1Y)}
              </span>
            </div>
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">1Y Profit Growth</span>
              <span className="text-base font-bold font-mono text-slate-100 mt-1 block">
                {formatPercent(selectedStock.profitGrowth1Y)}
              </span>
            </div>
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">3Y EPS CAGR</span>
              <span className="text-base font-bold font-mono text-slate-100 mt-1 block">
                {formatPercent(selectedStock.epsGrowth3Y)}
              </span>
            </div>
          </div>
        )}

        {/* Technicals & Momentum Tab */}
        {activeDetailTab === 'technicals' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">RSI (14-Period)</span>
              <span className="text-base font-bold font-mono text-brand-accent mt-1 block">
                {selectedStock.rsi14.toFixed(1)}
              </span>
            </div>
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Beta (Volatility)</span>
              <span className="text-base font-bold font-mono text-slate-100 mt-1 block">
                {selectedStock.beta.toFixed(2)}
              </span>
            </div>
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Volume Spike</span>
              <span className="text-base font-bold font-mono text-cyan-400 mt-1 block">
                {formatRatio(selectedStock.volumeSpike, 2)}
              </span>
            </div>
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">SMA (20-Day)</span>
              <span className="text-sm font-bold font-mono text-slate-100 mt-1 block">
                {formatINR(selectedStock.sma20)}
              </span>
            </div>
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">SMA (50-Day)</span>
              <span className="text-sm font-bold font-mono text-slate-100 mt-1 block">
                {formatINR(selectedStock.sma50)}
              </span>
            </div>
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">SMA (200-Day)</span>
              <span className="text-sm font-bold font-mono text-slate-100 mt-1 block">
                {formatINR(selectedStock.sma200)}
              </span>
            </div>
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">1W Return</span>
              <span className="text-sm font-bold font-mono text-slate-100 mt-1 block">
                {formatPercent(selectedStock.change1W)}
              </span>
            </div>
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">1M Return</span>
              <span className="text-sm font-bold font-mono text-slate-100 mt-1 block">
                {formatPercent(selectedStock.change1M)}
              </span>
            </div>
            <div className="bg-surface-400/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">1Y Return</span>
              <span className="text-sm font-bold font-mono text-slate-100 mt-1 block">
                {formatPercent(selectedStock.change1Y)}
              </span>
            </div>
          </div>
        )}

        {/* Embedded Interactive Candlestick Tab */}
        {activeDetailTab === 'chart' && (
          <div className="pt-2">
            <CandlestickChart stock={selectedStock} height={420} />
          </div>
        )}
      </div>
    </Drawer>
  );
};
