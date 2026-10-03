import { describe, it, expect } from 'vitest';
import { generateRealisticStockQuotes } from '@/lib/mock-generator';
import { filterStocks } from '@/lib/filter-engine';
import { useStockStore } from '@/stores/useStockStore';
import { useFilterStore } from '@/stores/useFilterStore';

describe('Screener End-to-End Flow Integration', () => {
  const stocks = generateRealisticStockQuotes(100);

  it('filters 100 stocks and verifies matches meet all criteria', () => {
    useStockStore.setState({ stocks, filteredStocks: stocks });

    // Apply AND filter: ROE >= 20 and DebtToEquity <= 0.5
    const filterGroup = {
      id: 'flow-group',
      combinator: 'AND' as const,
      enabled: true,
      rules: [
        { id: 'r1', field: 'roe' as const, operator: 'gte' as const, value: 20, enabled: true },
        { id: 'r2', field: 'debtToEquity' as const, operator: 'lte' as const, value: 0.5, enabled: true },
      ],
    };

    const result = filterStocks(stocks, filterGroup);
    expect(result.matched).toBeGreaterThanOrEqual(0);

    for (const match of result.data) {
      expect(match.roe).toBeGreaterThanOrEqual(20);
      expect(match.debtToEquity).toBeLessThanOrEqual(0.5);
    }
  });

  it('applies search query on top of filter rules', () => {
    const result = filterStocks(stocks, null, 'RELIANCE');
    expect(result.data.length).toBeGreaterThanOrEqual(1);
    expect(result.data[0].symbol).toBe('RELIANCE');
  });

  it('handles sector filtering correctly', () => {
    const result = filterStocks(stocks, null, undefined, ['Information Technology']);
    for (const match of result.data) {
      expect(match.sector).toBe('Information Technology');
    }
  });
});
