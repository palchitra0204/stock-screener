import React, { useState, useMemo } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useStockStore } from '@/stores/useStockStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  formatINR,
  formatMarketCap,
  formatPercent,
  formatRatio,
} from '@/lib/formatters';
import { exportToCSV, exportToJSON } from '@/lib/export-utils';
import {
  Star,
  Plus,
  Trash2,
  Download,
  Upload,
  PieChart,
  TrendingUp,
  TrendingDown,
  LineChart,
} from 'lucide-react';
import { clsx } from 'clsx';

export const WatchlistDrawer: React.FC = () => {
  const isWatchlistDrawerOpen = useStockStore((state) => state.isWatchlistDrawerOpen);
  const setWatchlistDrawerOpen = useStockStore((state) => state.setWatchlistDrawerOpen);
  const setSelectedStock = useStockStore((state) => state.setSelectedStock);
  const setDetailDrawerOpen = useStockStore((state) => state.setDetailDrawerOpen);
  const setChartModalOpen = useStockStore((state) => state.setChartModalOpen);
  const allStocks = useStockStore((state) => state.stocks);

  const watchlists = useWatchlistStore((state) => state.watchlists);
  const activeWatchlistId = useWatchlistStore((state) => state.activeWatchlistId);
  const setActiveWatchlistId = useWatchlistStore((state) => state.setActiveWatchlistId);
  const createWatchlist = useWatchlistStore((state) => state.createWatchlist);
  const deleteWatchlist = useWatchlistStore((state) => state.deleteWatchlist);
  const removeSymbol = useWatchlistStore((state) => state.removeSymbol);
  const getWatchlistStats = useWatchlistStore((state) => state.getWatchlistStats);
  const importWatchlists = useWatchlistStore((state) => state.importWatchlists);

  const [isNewWlModalOpen, setIsNewWlModalOpen] = useState(false);
  const [newWlName, setNewWlName] = useState('');
  const [newWlDesc, setNewWlDesc] = useState('');

  const activeWl = watchlists.find((w) => w.id === activeWatchlistId) || watchlists[0];

  // Matched watched stock quotes
  const watchedStocks = useMemo(() => {
    if (!activeWl || activeWl.symbols.length === 0) return [];
    const symMap = new Map(allStocks.map((s) => [s.symbol, s]));
    return activeWl.symbols.map((sym) => symMap.get(sym)).filter(Boolean) as typeof allStocks;
  }, [activeWl, allStocks]);

  const stats = useMemo(() => {
    return getWatchlistStats(allStocks);
  }, [getWatchlistStats, allStocks, activeWatchlistId, activeWl?.symbols]);

  const handleCreateWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWlName.trim()) return;
    createWatchlist(newWlName.trim(), newWlDesc.trim());
    setNewWlName('');
    setNewWlDesc('');
    setIsNewWlModalOpen(false);
  };

  const handleExportJSON = () => {
    exportToJSON(watchedStocks, `${activeWl?.name || 'watchlist'}.json`);
  };

  const handleExportCSV = () => {
    exportToCSV(watchedStocks, `${activeWl?.name || 'watchlist'}.csv`);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importWatchlists(content);
        if (ok) {
          alert('Watchlists imported successfully!');
        } else {
          alert('Invalid watchlist JSON format');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Drawer
        isOpen={isWatchlistDrawerOpen}
        onClose={() => setWatchlistDrawerOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>Watchlists & Portfolios</span>
          </div>
        }
        subtitle="Track, benchmark and organize your favorite Indian equities"
        size="lg"
      >
        <div className="space-y-6">
          {/* Watchlist Switcher & Management */}
          <div className="flex items-center justify-between gap-2 bg-surface-400 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 flex-1">
              <select
                value={activeWatchlistId}
                onChange={(e) => setActiveWatchlistId(e.target.value)}
                className="bg-surface-200 border border-slate-700 rounded-lg text-xs font-semibold text-slate-100 py-1.5 px-3 focus:outline-none focus:border-brand-500"
              >
                {watchlists.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.symbols.length} stocks)
                  </option>
                ))}
              </select>

              <Button
                variant="subtle"
                size="sm"
                onClick={() => setIsNewWlModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                title="Create new watchlist"
              >
                New
              </Button>
            </div>

            {watchlists.length > 1 && (
              <button
                type="button"
                onClick={() => deleteWatchlist(activeWatchlistId)}
                className="text-slate-500 hover:text-bear p-1.5 rounded hover:bg-surface-200 transition-colors"
                title="Delete current watchlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Portfolio Stats Summary Card */}
          {watchedStocks.length > 0 && (
            <div className="bg-gradient-to-r from-surface-400 via-surface-300 to-surface-400 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Watchlist Summary</span>
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {stats.gainersCount} Up / {stats.losersCount} Down
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-surface-200/70 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Total M-Cap</span>
                  <span className="text-xs font-bold font-mono text-slate-100 block mt-0.5">
                    {formatMarketCap(stats.totalMarketCap)}
                  </span>
                </div>
                <div className="bg-surface-200/70 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Avg P/E</span>
                  <span className="text-xs font-bold font-mono text-slate-100 block mt-0.5">
                    {formatRatio(stats.avgPE, 1)}
                  </span>
                </div>
                <div className="bg-surface-200/70 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Avg ROE</span>
                  <span className="text-xs font-bold font-mono text-bull block mt-0.5">
                    {formatPercent(stats.avgROE, false)}
                  </span>
                </div>
                <div className="bg-surface-200/70 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">1D Return</span>
                  <span
                    className={clsx(
                      'text-xs font-bold font-mono block mt-0.5',
                      stats.avgChange1D >= 0 ? 'text-bull' : 'text-bear'
                    )}
                  >
                    {formatPercent(stats.avgChange1D)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Watched Stocks List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
              <span>Symbols ({watchedStocks.length})</span>
              <span>Price & 1D Change</span>
            </div>

            {watchedStocks.length === 0 ? (
              <div className="text-center py-10 px-4 border border-dashed border-slate-800 rounded-xl bg-surface-400/40">
                <Star className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-300">No stocks in this watchlist yet</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Click the star icon next to any stock in the table to add it here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60 border border-slate-800 rounded-xl bg-surface-400/60 overflow-hidden">
                {watchedStocks.map((stock) => {
                  const isGain = stock.changePercent >= 0;
                  return (
                    <div
                      key={stock.symbol}
                      onClick={() => {
                        setSelectedStock(stock);
                        setDetailDrawerOpen(true);
                      }}
                      className="p-3 flex items-center justify-between hover:bg-surface-200/80 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSymbol(activeWatchlistId, stock.symbol);
                          }}
                          className="text-amber-400 hover:text-slate-500 p-1 rounded"
                          title="Remove from watchlist"
                        >
                          <Star className="w-4 h-4 fill-amber-400" />
                        </button>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-sm text-slate-100">
                              {stock.symbol}
                            </span>
                            <span className="text-[10px] px-1 py-0.2 bg-surface-100 rounded text-slate-400">
                              {stock.exchange}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 block truncate max-w-[180px]">
                            {stock.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className="font-mono font-semibold text-xs text-slate-100 block tabular-nums">
                            {formatINR(stock.price)}
                          </span>
                          <span
                            className={clsx(
                              'font-mono text-[11px] font-medium flex items-center justify-end tabular-nums',
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
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStock(stock);
                            setChartModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-brand-accent rounded hover:bg-surface-100 transition-colors"
                          title="Open Chart"
                        >
                          <LineChart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Export & Import Tools */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="subtle"
                size="xs"
                onClick={handleExportCSV}
                leftIcon={<Download className="w-3 h-3" />}
                disabled={watchedStocks.length === 0}
              >
                CSV
              </Button>
              <Button
                variant="subtle"
                size="xs"
                onClick={handleExportJSON}
                leftIcon={<Download className="w-3 h-3" />}
                disabled={watchedStocks.length === 0}
              >
                JSON
              </Button>
            </div>

            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 bg-surface-200 px-2.5 py-1 rounded-lg border border-slate-700">
                <Upload className="w-3 h-3" />
                <span>Import JSON</span>
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      </Drawer>

      {/* New Watchlist Modal */}
      <Modal
        isOpen={isNewWlModalOpen}
        onClose={() => setIsNewWlModalOpen(false)}
        title="Create New Watchlist"
        description="Organize stocks by sector, strategy, or high-conviction ideas."
        maxWidth="md"
      >
        <form onSubmit={handleCreateWatchlist} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Watchlist Name *
            </label>
            <Input
              required
              placeholder="e.g. EV & Green Energy, Dividend Kings..."
              value={newWlName}
              onChange={(e) => setNewWlName(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Description (Optional)
            </label>
            <Input
              placeholder="e.g. High momentum stocks breaking out"
              value={newWlDesc}
              onChange={(e) => setNewWlDesc(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsNewWlModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Watchlist
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
