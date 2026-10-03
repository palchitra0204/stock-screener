import { describe, it, expect, beforeEach } from 'vitest';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { generateRealisticStockQuotes } from '@/lib/mock-generator';

describe('Watchlist Store and Metrics', () => {
  const mockStocks = generateRealisticStockQuotes(20);

  beforeEach(() => {
    useWatchlistStore.setState({
      watchlists: [
        {
          id: 'test-wl-1',
          name: 'Portfolio 1',
          symbols: ['RELIANCE', 'TCS'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      activeWatchlistId: 'test-wl-1',
    });
  });

  it('adds and removes symbols correctly', () => {
    const store = useWatchlistStore.getState();
    store.addSymbol('test-wl-1', 'INFY');

    const updated = useWatchlistStore.getState().getActiveWatchlist();
    expect(updated?.symbols).toContain('INFY');

    store.removeSymbol('test-wl-1', 'INFY');
    expect(useWatchlistStore.getState().getActiveWatchlist()?.symbols).not.toContain('INFY');
  });

  it('toggles symbol presence in active watchlist', () => {
    const store = useWatchlistStore.getState();
    store.toggleSymbol('SBIN');
    expect(useWatchlistStore.getState().isSymbolInActiveWatchlist('SBIN')).toBe(true);

    store.toggleSymbol('SBIN');
    expect(useWatchlistStore.getState().isSymbolInActiveWatchlist('SBIN')).toBe(false);
  });

  it('renames and creates new watchlist', () => {
    const store = useWatchlistStore.getState();
    const newId = store.createWatchlist('Tech Stocks', 'Top Indian Tech');
    expect(useWatchlistStore.getState().watchlists.length).toBe(2);

    store.renameWatchlist(newId, 'Renamed Tech');
    expect(useWatchlistStore.getState().watchlists.find((w) => w.id === newId)?.name).toBe('Renamed Tech');

    store.deleteWatchlist(newId);
    expect(useWatchlistStore.getState().watchlists.length).toBe(1);
  });

  it('imports valid and handles invalid JSON watchlists', () => {
    const store = useWatchlistStore.getState();
    const validJson = JSON.stringify([
      { id: 'imp-1', name: 'Imported', symbols: ['TCS'], createdAt: 1, updatedAt: 1 },
    ]);
    expect(store.importWatchlists(validJson)).toBe(true);
    expect(store.importWatchlists('invalid-json')).toBe(false);
  });

  it('calculates aggregate portfolio summary statistics', () => {
    const store = useWatchlistStore.getState();
    const stats = store.getWatchlistStats(mockStocks);

    expect(stats.totalStocks).toBe(2);
    expect(stats.totalMarketCap).toBeGreaterThan(0);
    expect(stats.avgPE).toBeGreaterThan(0);
  });
});
