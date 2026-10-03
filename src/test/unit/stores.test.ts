import { describe, it, expect, beforeEach } from 'vitest';
import { useStockStore } from '@/stores/useStockStore';
import { useFilterStore } from '@/stores/useFilterStore';
import { useWebSocketStore } from '@/stores/useWebSocketStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { generateRealisticStockQuotes } from '@/lib/mock-generator';

describe('Zustand Stores Suite', () => {
  const mockStocks = generateRealisticStockQuotes(30);

  beforeEach(() => {
    useStockStore.setState({
      stocks: mockStocks,
      filteredStocks: mockStocks,
      selectedStock: mockStocks[0],
      visibleColumns: ['symbol', 'price', 'marketCap'],
      density: 'normal',
      tickFlashes: {},
      isChartModalOpen: false,
      isFilterDrawerOpen: false,
      isDetailDrawerOpen: false,
      isWatchlistDrawerOpen: false,
      isShortcutsModalOpen: false,
      isBenchmarkModalOpen: false,
      isOffline: false,
      fps: 60,
    });

    useFilterStore.getState().resetFilters();
  });

  describe('useStockStore', () => {
    it('updates density, activeTab, and selectedStock', () => {
      const store = useStockStore.getState();
      store.setDensity('compact');
      expect(useStockStore.getState().density).toBe('compact');

      store.setActiveTab('valuation');
      expect(useStockStore.getState().activeTab).toBe('valuation');

      store.setSelectedStock(mockStocks[5]);
      expect(useStockStore.getState().selectedStock?.symbol).toBe(mockStocks[5].symbol);
    });

    it('toggles column visibility correctly', () => {
      const store = useStockStore.getState();
      store.toggleColumnVisibility('pe');
      expect(useStockStore.getState().visibleColumns).toContain('pe');

      store.toggleColumnVisibility('pe');
      expect(useStockStore.getState().visibleColumns).not.toContain('pe');
    });

    it('sorts filtered stocks numerically and alphabetically', () => {
      const store = useStockStore.getState();
      store.setSorting('marketCap', 'desc');
      const filtered = useStockStore.getState().filteredStocks;
      expect(filtered[0].marketCap).toBeGreaterThanOrEqual(filtered[filtered.length - 1].marketCap);

      store.setSorting('symbol', 'asc');
      const filteredSym = useStockStore.getState().filteredStocks;
      expect(filteredSym[0].symbol.localeCompare(filteredSym[filteredSym.length - 1].symbol)).toBeLessThanOrEqual(0);
    });

    it('manages modal visibility states and tick flashes', () => {
      const store = useStockStore.getState();
      store.setChartModalOpen(true);
      store.setFilterDrawerOpen(true);
      store.setDetailDrawerOpen(true);
      store.setWatchlistDrawerOpen(true);
      store.setShortcutsModalOpen(true);
      store.setBenchmarkModalOpen(true);
      store.setOfflineStatus(true);
      store.setFPS(58);

      const state = useStockStore.getState();
      expect(state.isChartModalOpen).toBe(true);
      expect(state.isFilterDrawerOpen).toBe(true);
      expect(state.isDetailDrawerOpen).toBe(true);
      expect(state.isWatchlistDrawerOpen).toBe(true);
      expect(state.isShortcutsModalOpen).toBe(true);
      expect(state.isBenchmarkModalOpen).toBe(true);
      expect(state.isOffline).toBe(true);
      expect(state.fps).toBe(58);

      store.applyPriceTicks([
        {
          symbol: 'RELIANCE',
          price: 2990,
          change: 10,
          changePercent: 0.3,
          dayHigh: 3000,
          dayLow: 2980,
          volume: 50000,
          timestamp: Date.now(),
          direction: 'up',
        },
      ]);
      expect(useStockStore.getState().tickFlashes['RELIANCE']?.direction).toBe('up');
    });
  });

  describe('useFilterStore', () => {
    it('manages sector and market cap category toggles', () => {
      const store = useFilterStore.getState();
      store.toggleSector('Information Technology');
      expect(useFilterStore.getState().selectedSectors).toContain('Information Technology');
      store.toggleSector('Information Technology');
      expect(useFilterStore.getState().selectedSectors).not.toContain('Information Technology');

      store.toggleMcap('Large Cap');
      expect(useFilterStore.getState().selectedMcap).toContain('Large Cap');
      store.toggleMcap('Large Cap');
      expect(useFilterStore.getState().selectedMcap).not.toContain('Large Cap');
    });

    it('adds, updates, toggles, and removes rules in filter tree', () => {
      const store = useFilterStore.getState();
      store.addRule({ field: 'pe', operator: 'lte', value: 25 });
      expect(useFilterStore.getState().filterGroup.rules.length).toBe(1);

      const rule = useFilterStore.getState().filterGroup.rules[0] as any;
      store.updateRule(rule.id, { value: 30 });
      expect((useFilterStore.getState().filterGroup.rules[0] as any).value).toBe(30);

      store.toggleRule(rule.id);
      expect((useFilterStore.getState().filterGroup.rules[0] as any).enabled).toBe(false);

      store.removeRule(rule.id);
      expect(useFilterStore.getState().filterGroup.rules.length).toBe(0);
    });

    it('saves and deletes custom user preset screeners', () => {
      const store = useFilterStore.getState();
      store.saveCustomPreset('My Test Screen', 'Description');
      const presets = useFilterStore.getState().customPresets;
      expect(presets.length).toBeGreaterThan(0);
      const saved = presets.find((p) => p.name === 'My Test Screen');
      expect(saved).toBeDefined();

      if (saved) {
        store.deleteCustomPreset(saved.id);
        expect(useFilterStore.getState().customPresets.find((p) => p.id === saved.id)).toBeUndefined();
      }
    });
  });

  describe('useWebSocketStore', () => {
    it('manages telemetry, update interval and streaming toggle', () => {
      const store = useWebSocketStore.getState();
      store.setStatus('connected');
      store.setLatency(15);
      store.incrementTicks(5);
      store.setUpdateInterval(300);

      const state = useWebSocketStore.getState();
      expect(state.status).toBe('connected');
      expect(state.latencyMs).toBe(15);
      expect(state.ticksReceivedTotal).toBeGreaterThanOrEqual(5);
      expect(state.updateIntervalMs).toBe(300);

      store.toggleStreaming();
      expect(useWebSocketStore.getState().isStreaming).toBe(false);
      store.toggleStreaming();
      expect(useWebSocketStore.getState().isStreaming).toBe(true);
    });
  });
});
