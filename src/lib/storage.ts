import { StockQuote } from '@/types/stock';
import { Watchlist } from '@/types/watchlist';
import { PresetScreen } from '@/types/filter';

const STORAGE_KEYS = {
  WATCHLISTS: 'agy_screener_watchlists_v1',
  ACTIVE_WATCHLIST: 'agy_screener_active_watchlist_id',
  CUSTOM_PRESETS: 'agy_screener_custom_presets_v1',
  TABLE_SETTINGS: 'agy_screener_table_settings_v1',
  OFFLINE_CACHE: 'agy_screener_offline_stocks_v1',
  OFFLINE_TIMESTAMP: 'agy_screener_offline_timestamp_v1',
};

const DEFAULT_WATCHLIST: Watchlist = {
  id: 'wl-primary',
  name: 'Primary Watchlist',
  description: 'Top watched Indian stocks',
  symbols: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HAL', 'ZOMATO', 'DIXON'],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  color: '#3b82f6',
};

export const storage = {
  getWatchlists(): Watchlist[] {
    if (typeof window === 'undefined') return [DEFAULT_WATCHLIST];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WATCHLISTS);
      if (!data) return [DEFAULT_WATCHLIST];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_WATCHLIST];
    } catch {
      return [DEFAULT_WATCHLIST];
    }
  },

  saveWatchlists(watchlists: Watchlist[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.WATCHLISTS, JSON.stringify(watchlists));
    } catch (e) {
      console.error('Failed to save watchlists', e);
    }
  },

  getCustomPresets(): PresetScreen[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRESETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCustomPresets(presets: PresetScreen[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PRESETS, JSON.stringify(presets));
    } catch (e) {
      console.error('Failed to save presets', e);
    }
  },

  cacheStockQuotes(stocks: StockQuote[]): void {
    if (typeof window === 'undefined') return;
    try {
      // Store compact snapshot to avoid hitting 5MB quota
      const compact = stocks.slice(0, 500).map((s) => ({
        id: s.id,
        symbol: s.symbol,
        name: s.name,
        price: s.price,
        change: s.change,
        changePercent: s.changePercent,
        sector: s.sector,
        marketCap: s.marketCap,
        pe: s.pe,
        roe: s.roe,
        rsi14: s.rsi14,
      }));
      localStorage.setItem(STORAGE_KEYS.OFFLINE_CACHE, JSON.stringify(compact));
      localStorage.setItem(STORAGE_KEYS.OFFLINE_TIMESTAMP, String(Date.now()));
    } catch (e) {
      console.warn('Offline cache storage quota exceeded', e);
    }
  },

  getCachedStockQuotes(): { stocks: Partial<StockQuote>[]; timestamp: number } | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_CACHE);
      const time = localStorage.getItem(STORAGE_KEYS.OFFLINE_TIMESTAMP);
      if (!raw) return null;
      return {
        stocks: JSON.parse(raw),
        timestamp: time ? Number(time) : Date.now(),
      };
    } catch {
      return null;
    }
  },
};
