import { create } from 'zustand';
import { Watchlist, WatchlistStats } from '@/types/watchlist';
import { StockQuote } from '@/types/stock';
import { storage } from '@/lib/storage';

interface WatchlistStoreState {
  watchlists: Watchlist[];
  activeWatchlistId: string;

  // Actions
  createWatchlist: (name: string, description?: string, color?: string) => string;
  deleteWatchlist: (id: string) => void;
  renameWatchlist: (id: string, name: string) => void;
  setActiveWatchlistId: (id: string) => void;
  toggleSymbol: (symbol: string) => void;
  addSymbol: (watchlistId: string, symbol: string) => void;
  removeSymbol: (watchlistId: string, symbol: string) => void;
  isSymbolInActiveWatchlist: (symbol: string) => boolean;
  getActiveWatchlist: () => Watchlist | undefined;
  getWatchlistStats: (allStocks: StockQuote[]) => WatchlistStats;
  importWatchlists: (jsonString: string) => boolean;
}

const DEFAULT_WATCHLISTS: Watchlist[] = [
  {
    id: 'wl-primary',
    name: 'Primary Watchlist',
    description: 'Top watched Indian stocks',
    symbols: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HAL', 'ZOMATO', 'DIXON'],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    color: '#3b82f6',
  },
];

export const useWatchlistStore = create<WatchlistStoreState>((set, get) => {
  return {
    watchlists: DEFAULT_WATCHLISTS,
    activeWatchlistId: 'wl-primary',

    createWatchlist: (name, description = '', color = '#6366f1') => {
      const newWl: Watchlist = {
        id: `wl-${Date.now()}`,
        name,
        description,
        symbols: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        color,
      };
      const updated = [...get().watchlists, newWl];
      storage.saveWatchlists(updated);
      set({ watchlists: updated, activeWatchlistId: newWl.id });
      return newWl.id;
    },

    deleteWatchlist: (id) => {
      const current = get().watchlists;
      if (current.length <= 1) return; // Keep at least one
      const updated = current.filter((w) => w.id !== id);
      storage.saveWatchlists(updated);
      set({
        watchlists: updated,
        activeWatchlistId: get().activeWatchlistId === id ? updated[0].id : get().activeWatchlistId,
      });
    },

    renameWatchlist: (id, name) => {
      const updated = get().watchlists.map((w) =>
        w.id === id ? { ...w, name, updatedAt: Date.now() } : w
      );
      storage.saveWatchlists(updated);
      set({ watchlists: updated });
    },

    setActiveWatchlistId: (activeWatchlistId) => set({ activeWatchlistId }),

    toggleSymbol: (symbol) => {
      const activeId = get().activeWatchlistId;
      const wl = get().watchlists.find((w) => w.id === activeId);
      if (!wl) return;

      if (wl.symbols.includes(symbol)) {
        get().removeSymbol(activeId, symbol);
      } else {
        get().addSymbol(activeId, symbol);
      }
    },

    addSymbol: (watchlistId, symbol) => {
      const updated = get().watchlists.map((w) => {
        if (w.id === watchlistId) {
          if (!w.symbols.includes(symbol)) {
            return {
              ...w,
              symbols: [...w.symbols, symbol],
              updatedAt: Date.now(),
            };
          }
        }
        return w;
      });
      storage.saveWatchlists(updated);
      set({ watchlists: updated });
    },

    removeSymbol: (watchlistId, symbol) => {
      const updated = get().watchlists.map((w) => {
        if (w.id === watchlistId) {
          return {
            ...w,
            symbols: w.symbols.filter((s) => s !== symbol),
            updatedAt: Date.now(),
          };
        }
        return w;
      });
      storage.saveWatchlists(updated);
      set({ watchlists: updated });
    },

    isSymbolInActiveWatchlist: (symbol) => {
      const activeId = get().activeWatchlistId;
      const wl = get().watchlists.find((w) => w.id === activeId);
      return wl ? wl.symbols.includes(symbol) : false;
    },

    getActiveWatchlist: () => {
      return get().watchlists.find((w) => w.id === get().activeWatchlistId);
    },

    getWatchlistStats: (allStocks) => {
      const wl = get().getActiveWatchlist();
      if (!wl || wl.symbols.length === 0 || allStocks.length === 0) {
        return {
          totalStocks: 0,
          totalMarketCap: 0,
          avgPE: 0,
          avgROE: 0,
          avgChange1D: 0,
          gainersCount: 0,
          losersCount: 0,
        };
      }

      const symSet = new Set(wl.symbols);
      const matched = allStocks.filter((s) => symSet.has(s.symbol));
      if (matched.length === 0) {
        return {
          totalStocks: 0,
          totalMarketCap: 0,
          avgPE: 0,
          avgROE: 0,
          avgChange1D: 0,
          gainersCount: 0,
          losersCount: 0,
        };
      }

      let totalMcap = 0;
      let totalPE = 0;
      let totalROE = 0;
      let totalChange = 0;
      let gainers = 0;
      let losers = 0;

      for (const s of matched) {
        totalMcap += s.marketCap;
        totalPE += s.pe;
        totalROE += s.roe;
        totalChange += s.changePercent;
        if (s.changePercent > 0) gainers++;
        else if (s.changePercent < 0) losers++;
      }

      const count = matched.length;

      return {
        totalStocks: count,
        totalMarketCap: Number(totalMcap.toFixed(2)),
        avgPE: Number((totalPE / count).toFixed(1)),
        avgROE: Number((totalROE / count).toFixed(1)),
        avgChange1D: Number((totalChange / count).toFixed(2)),
        gainersCount: gainers,
        losersCount: losers,
      };
    },

    importWatchlists: (jsonString) => {
      try {
        const parsed = JSON.parse(jsonString);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].symbols) {
          storage.saveWatchlists(parsed);
          set({ watchlists: parsed, activeWatchlistId: parsed[0].id });
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
  };
});
