import { describe, it, expect } from 'vitest';
import { generateRealisticStockQuotes, generate252DayOHLCV } from '@/lib/mock-generator';

describe('Realistic Mock Data Generator', () => {
  it('generates 5,000 unique Indian stock quotes', () => {
    const count = 5000;
    const stocks = generateRealisticStockQuotes(count);
    expect(stocks.length).toBe(count);

    // Verify symbols are unique
    const symbolSet = new Set(stocks.map((s) => s.symbol));
    expect(symbolSet.size).toBe(count);
  });

  it('populates realistic financial metrics within plausible bounds', () => {
    const stocks = generateRealisticStockQuotes(100);

    for (const s of stocks) {
      expect(s.price).toBeGreaterThan(0);
      expect(s.marketCap).toBeGreaterThan(0);
      expect(s.pe).toBeGreaterThan(0);
      expect(s.pb).toBeGreaterThan(0);
      expect(s.rsi14).toBeGreaterThanOrEqual(0);
      expect(s.rsi14).toBeLessThanOrEqual(100);
      expect(s.week52High).toBeGreaterThanOrEqual(s.week52Low);
      expect(['NSE', 'BSE']).toContain(s.exchange);
      expect(['Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap']).toContain(s.marketCapCategory);
    }
  });

  it('generates 252 trading days of OHLCV candlestick data', () => {
    const candles = generate252DayOHLCV(2500, 'RELIANCE');
    expect(candles.length).toBe(252);

    for (const c of candles) {
      expect(c.high).toBeGreaterThanOrEqual(c.low);
      expect(c.high).toBeGreaterThanOrEqual(c.open);
      expect(c.high).toBeGreaterThanOrEqual(c.close);
      expect(c.low).toBeLessThanOrEqual(c.open);
      expect(c.low).toBeLessThanOrEqual(c.close);
      expect(c.volume).toBeGreaterThan(0);
    }
  });
});
