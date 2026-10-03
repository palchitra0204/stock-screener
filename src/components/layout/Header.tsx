import React, { useEffect, useRef } from 'react';
import { useStockStore } from '@/stores/useStockStore';
import { useFilterStore } from '@/stores/useFilterStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useWebSocketStore } from '@/stores/useWebSocketStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  SlidersHorizontal,
  Star,
  Activity,
  Play,
  Pause,
  HelpCircle,
  BarChart3,
  Wifi,
  WifiOff,
  RefreshCw,
  Gauge,
} from 'lucide-react';
import { clsx } from 'clsx';

export const Header: React.FC = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Store bindings
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const setSearchQuery = useFilterStore((state) => state.setSearchQuery);
  const filterGroup = useFilterStore((state) => state.filterGroup);

  const isFilterDrawerOpen = useStockStore((state) => state.isFilterDrawerOpen);
  const setFilterDrawerOpen = useStockStore((state) => state.setFilterDrawerOpen);
  const isWatchlistDrawerOpen = useStockStore((state) => state.isWatchlistDrawerOpen);
  const setWatchlistDrawerOpen = useStockStore((state) => state.setWatchlistDrawerOpen);
  const setShortcutsModalOpen = useStockStore((state) => state.setShortcutsModalOpen);
  const setBenchmarkModalOpen = useStockStore((state) => state.setBenchmarkModalOpen);
  const isOffline = useStockStore((state) => state.isOffline);

  const watchlists = useWatchlistStore((state) => state.watchlists);
  const activeWatchlistId = useWatchlistStore((state) => state.activeWatchlistId);
  const activeWatchlist = watchlists.find((w) => w.id === activeWatchlistId);

  const wsStatus = useWebSocketStore((state) => state.status);
  const latencyMs = useWebSocketStore((state) => state.latencyMs);
  const ticksPerSec = useWebSocketStore((state) => state.ticksPerSecond);
  const isStreaming = useWebSocketStore((state) => state.isStreaming);
  const toggleStreaming = useWebSocketStore((state) => state.toggleStreaming);
  const reconnectWS = useWebSocketStore((state) => state.reconnect);

  const activeRulesCount = filterGroup.rules.filter((r) => r.enabled).length;

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when inside inputs/textareas
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setFilterDrawerOpen(!isFilterDrawerOpen);
      } else if (e.key.toLowerCase() === 'w') {
        e.preventDefault();
        setWatchlistDrawerOpen(!isWatchlistDrawerOpen);
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setBenchmarkModalOpen(true);
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        toggleStreaming();
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isFilterDrawerOpen,
    isWatchlistDrawerOpen,
    setFilterDrawerOpen,
    setWatchlistDrawerOpen,
    setShortcutsModalOpen,
    setBenchmarkModalOpen,
    toggleStreaming,
  ]);

  return (
    <header className="w-full bg-surface-300 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-brand-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black tracking-tight text-slate-100 text-base sm:text-lg flex items-center">
                BHARAT<span className="text-brand-accent ml-1 font-mono font-bold">SCREENER</span>
              </span>
              <span className="bg-gradient-to-r from-orange-500 via-white to-green-600 w-3.5 h-2.5 rounded-sm inline-block shadow-sm" title="Indian Equities (NSE/BSE)" />
              <Badge variant="brand" size="sm">
                PRO 1A
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              5,000+ Indian Stocks • Real-Time Terminal
            </p>
          </div>
        </div>

        {/* Center: Search Bar with Keyboard Hint */}
        <div className="flex-1 max-w-xl mx-2">
          <div className="relative">
            <Input
              ref={searchInputRef}
              placeholder="Search 5,000+ stocks by Symbol, Company, Sector, ISIN (Press '/' to focus)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              leftIcon={<Search className="w-4 h-4" />}
              rightIcon={
                !searchQuery ? (
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-surface-100 border border-slate-700 rounded shadow-sm">
                    /
                  </kbd>
                ) : undefined
              }
              className="bg-surface-400 border-slate-700 text-xs sm:text-sm py-1.5 h-9"
            />
          </div>
        </div>

        {/* Right: Actions & WS Telemetry */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* WebSocket Status Indicator */}
          <div className="hidden lg:flex items-center bg-surface-400 border border-slate-800 rounded-lg px-2.5 py-1 text-xs space-x-2 font-mono">
            <div className="flex items-center space-x-1.5">
              <span
                className={clsx(
                  'w-2 h-2 rounded-full',
                  wsStatus === 'connected' && 'bg-bull animate-pulse',
                  wsStatus === 'connecting' && 'bg-amber-400 animate-ping',
                  wsStatus === 'reconnecting' && 'bg-amber-500 animate-spin',
                  wsStatus === 'paused' && 'bg-yellow-500',
                  wsStatus === 'disconnected' && 'bg-bear'
                )}
              />
              <span className="text-slate-300 font-medium capitalize">{wsStatus}</span>
            </div>

            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-[11px]">{latencyMs}ms</span>
            <span className="text-slate-600">|</span>
            <span className="text-bull text-[11px]">{ticksPerSec} tick/s</span>

            <button
              type="button"
              onClick={toggleStreaming}
              title={isStreaming ? 'Pause real-time stream' : 'Resume real-time stream'}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded"
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-bull" />}
            </button>

            {wsStatus !== 'connected' && (
              <button
                type="button"
                onClick={reconnectWS}
                title="Force Reconnect"
                className="text-slate-400 hover:text-slate-200 p-0.5 rounded"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Drawer Toggle */}
          <Button
            variant={activeRulesCount > 0 ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilterDrawerOpen(true)}
            leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            className="relative"
            aria-label="Toggle filters"
          >
            <span>Filters</span>
            {activeRulesCount > 0 && (
              <span className="bg-white text-brand-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {activeRulesCount}
              </span>
            )}
            <kbd className="hidden md:inline-block ml-1 text-[10px] text-slate-300/70 font-mono">F</kbd>
          </Button>

          {/* Watchlist Drawer Toggle */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setWatchlistDrawerOpen(true)}
            leftIcon={<Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />}
            aria-label="Toggle watchlists"
          >
            <span className="hidden sm:inline">Watchlist</span>
            {activeWatchlist && (
              <span className="bg-surface-100 text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {activeWatchlist.symbols.length}
              </span>
            )}
            <kbd className="hidden md:inline-block ml-1 text-[10px] text-slate-400 font-mono">W</kbd>
          </Button>

          {/* Benchmark Performance Modal */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBenchmarkModalOpen(true)}
            title="Performance Metrics & Telemetry"
            className="p-1.5 text-slate-400 hover:text-brand-accent"
            aria-label="Performance benchmark"
          >
            <Gauge className="w-4 h-4" />
          </Button>

          {/* Keyboard Shortcuts */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShortcutsModalOpen(true)}
            title="Keyboard Shortcuts (?)"
            className="p-1.5 text-slate-400 hover:text-slate-200"
            aria-label="Keyboard shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
