import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCSV, exportToJSON } from '@/lib/export-utils';
import { storage } from '@/lib/storage';
import { generateRealisticStockQuotes } from '@/lib/mock-generator';

describe('Export and Storage Utilities', () => {
  const mockStocks = generateRealisticStockQuotes(5);

  beforeEach(() => {
    localStorage.clear();
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  describe('exportToCSV and exportToJSON', () => {
    it('creates CSV download link without errors', () => {
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      exportToCSV(mockStocks, 'test.csv');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      clickSpy.mockRestore();
    });

    it('creates JSON download link without errors', () => {
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      exportToJSON(mockStocks, 'test.json');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      clickSpy.mockRestore();
    });
  });

  describe('storage methods', () => {
    it('persists and retrieves watchlists', () => {
      const sampleWl = [
        {
          id: 'wl-1',
          name: 'My List',
          symbols: ['TCS', 'INFY'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
      storage.saveWatchlists(sampleWl);
      const retrieved = storage.getWatchlists();
      expect(retrieved.length).toBe(1);
      expect(retrieved[0].name).toBe('My List');
    });

    it('persists and retrieves custom presets', () => {
      const samplePresets = [
        {
          id: 'p-1',
          name: 'Test Preset',
          description: 'Desc',
          filterGroup: { id: 'g', combinator: 'AND' as const, enabled: true, rules: [] },
        },
      ];
      storage.saveCustomPresets(samplePresets);
      const retrieved = storage.getCustomPresets();
      expect(retrieved.length).toBe(1);
      expect(retrieved[0].name).toBe('Test Preset');
    });

    it('caches and reads offline stock snapshots', () => {
      storage.cacheStockQuotes(mockStocks);
      const cached = storage.getCachedStockQuotes();
      expect(cached).not.toBeNull();
      expect(cached?.stocks.length).toBe(mockStocks.length);
    });
  });
});
