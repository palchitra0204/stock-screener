import { create } from 'zustand';
import { StockQuote, TableDensity, TabCategory } from '@/types/stock';
import { PriceTick } from '@/types/websocket';
import { getCachedStockQuotes } from '@/lib/mock-generator';

export interface TickFlash {
  direction: 'up' | 'down';
  timestamp: number;
}

interface StockStoreState {
  stocks: StockQuote[];
  filteredStocks: StockQuote[];
  selectedStock: StockQuote | null;
  activeTab: TabCategory;
  density: TableDensity;
  visibleColumns: string[];
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  tickFlashes: Record<string, TickFlash>;
  isChartModalOpen: boolean;
  isFilterDrawerOpen: boolean;
  isDetailDrawerOpen: boolean;
  isWatchlistDrawerOpen: boolean;
  isShortcutsModalOpen: boolean;
  isBenchmarkModalOpen: boolean;
  isOffline: boolean;
  lastFilterDurationMs: number;
  lastSortDurationMs: number;
  fps: number;

  // Actions
  setStocks: (stocks: StockQuote[]) => void;
  setFilteredStocks: (stocks: StockQuote[], durationMs?: number) => void;
  setSelectedStock: (stock: StockQuote | null) => void;
  setActiveTab: (tab: TabCategory) => void;
  setDensity: (density: TableDensity) => void;
  setVisibleColumns: (cols: string[]) => void;
  toggleColumnVisibility: (colId: string) => void;
  setSorting: (col: string, dir: 'asc' | 'desc') => void;
  applyPriceTicks: (ticks: PriceTick[]) => void;
  setChartModalOpen: (open: boolean) => void;
  setFilterDrawerOpen: (open: boolean) => void;
  setDetailDrawerOpen: (open: boolean) => void;
  setWatchlistDrawerOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setBenchmarkModalOpen: (open: boolean) => void;
  setOfflineStatus: (isOffline: boolean) => void;
  setFPS: (fps: number) => void;
}

const DEFAULT_VISIBLE_COLUMNS = [
  'symbol',
  'name',
  'price',
  'changePercent',
  'volume',
  'marketCap',
  'pe',
  'roe',
  'rsi14',
  'sector',
  'week52High',
  'week52Low',
];

export const useStockStore = create<StockStoreState>((set, get) => {
  const initialStocks = getCachedStockQuotes(5000);

  return {
    stocks: initialStocks,
    filteredStocks: initialStocks,
    selectedStock: initialStocks[0] || null,
    activeTab: 'overview',
    density: 'normal',
    visibleColumns: DEFAULT_VISIBLE_COLUMNS,
    sortColumn: 'marketCap',
    sortDirection: 'desc',
    tickFlashes: {},
    isChartModalOpen: false,
    isFilterDrawerOpen: false,
    isDetailDrawerOpen: false,
    isWatchlistDrawerOpen: false,
    isShortcutsModalOpen: false,
    isBenchmarkModalOpen: false,
    isOffline: false,
    lastFilterDurationMs: 0,
    lastSortDurationMs: 0,
    fps: 60,

    setStocks: (stocks) => set({ stocks, filteredStocks: stocks }),

    setFilteredStocks: (filteredStocks, durationMs = 0) =>
      set({ filteredStocks, lastFilterDurationMs: durationMs }),

    setSelectedStock: (selectedStock) => set({ selectedStock }),

    setActiveTab: (activeTab) => set({ activeTab }),

    setDensity: (density) => set({ density }),

    setVisibleColumns: (visibleColumns) => set({ visibleColumns }),

    toggleColumnVisibility: (colId) => {
      const current = get().visibleColumns;
      if (current.includes(colId)) {
        if (current.length > 2) {
          set({ visibleColumns: current.filter((c) => c !== colId) });
        }
      } else {
        set({ visibleColumns: [...current, colId] });
      }
    },

    setSorting: (col, dir) => {
      const start = performance.now();
      const currentFiltered = [...get().filteredStocks];

      currentFiltered.sort((a, b) => {
        const valA = (a as any)[col];
        const valB = (b as any)[col];

        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'string') {
          return dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return dir === 'asc' ? valA - valB : valB - valA;
      });

      const sortTime = Number((performance.now() - start).toFixed(2));
      set({
        sortColumn: col,
        sortDirection: dir,
        filteredStocks: currentFiltered,
        lastSortDurationMs: sortTime,
      });
    },

    applyPriceTicks: (ticks) => {
      const newFlashes: Record<string, TickFlash> = { ...get().tickFlashes };
      const now = Date.now();

      // Clean old flashes (> 2.5s)
      for (const [sym, flash] of Object.entries(newFlashes)) {
        if (now - flash.timestamp > 2500) {
          delete newFlashes[sym];
        }
      }

      for (const tick of ticks) {
        if (tick.direction !== 'neutral') {
          newFlashes[tick.symbol] = {
            direction: tick.direction,
            timestamp: now,
          };
        }
      }

      set({ tickFlashes: newFlashes });
    },

    setChartModalOpen: (isChartModalOpen) => set({ isChartModalOpen }),
    setFilterDrawerOpen: (isFilterDrawerOpen) => set({ isFilterDrawerOpen }),
    setDetailDrawerOpen: (isDetailDrawerOpen) => set({ isDetailDrawerOpen }),
    setWatchlistDrawerOpen: (isWatchlistDrawerOpen) => set({ isWatchlistDrawerOpen }),
    setShortcutsModalOpen: (isShortcutsModalOpen) => set({ isShortcutsModalOpen }),
    setBenchmarkModalOpen: (isBenchmarkModalOpen) => set({ isBenchmarkModalOpen }),
    setOfflineStatus: (isOffline) => set({ isOffline }),
    setFPS: (fps) => set({ fps }),
  };
});
