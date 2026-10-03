import { describe, it, expect } from 'vitest';
import {
  calculateSMA,
  calculateEMA,
  calculateBollingerBands,
  calculateRSI,
  calculateMACD,
  calculateVolumeProfile,
} from '@/lib/indicators';
import { OHLCV } from '@/types/stock';

describe('Technical Indicators Math Engine', () => {
  const mockCandles: OHLCV[] = Array.from({ length: 50 }, (_, i) => ({
    time: `2026-01-${String(i + 1).padStart(2, '0')}`,
    open: 100 + i,
    high: 105 + i,
    low: 95 + i,
    close: 100 + i + (i % 2 === 0 ? 2 : -1),
    volume: 1000 + i * 50,
  }));

  describe('calculateSMA', () => {
    it('returns empty array if candles count is less than period', () => {
      expect(calculateSMA(mockCandles.slice(0, 10), 20)).toEqual([]);
    });

    it('correctly computes Simple Moving Average for period 20', () => {
      const sma = calculateSMA(mockCandles, 20);
      expect(sma.length).toBe(mockCandles.length - 20 + 1);
      expect(sma[0].value).toBeGreaterThan(0);
      expect(typeof sma[0].time).toBe('string');
    });
  });

  describe('calculateEMA', () => {
    it('returns empty array if insufficient data', () => {
      expect(calculateEMA([], 20)).toEqual([]);
    });

    it('correctly calculates Exponential Moving Average', () => {
      const ema = calculateEMA(mockCandles, 20);
      expect(ema.length).toBe(mockCandles.length - 20 + 1);
      expect(ema[0].value).toBeGreaterThan(0);
    });
  });

  describe('calculateBollingerBands', () => {
    it('calculates Upper, Lower, and Basis bands', () => {
      const bb = calculateBollingerBands(mockCandles, 20, 2);
      expect(bb.length).toBe(mockCandles.length - 20 + 1);
      const first = bb[0];
      expect(first.upper).toBeGreaterThan(first.basis);
      expect(first.basis).toBeGreaterThan(first.lower);
    });
  });

  describe('calculateRSI', () => {
    it('returns values bounded between 0 and 100', () => {
      const rsi = calculateRSI(mockCandles, 14);
      expect(rsi.length).toBeGreaterThan(0);
      for (const point of rsi) {
        expect(point.value).toBeGreaterThanOrEqual(0);
        expect(point.value).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('calculateMACD', () => {
    it('calculates MACD line, Signal line, and Histogram', () => {
      const macd = calculateMACD(mockCandles, 12, 26, 9);
      expect(macd.length).toBeGreaterThan(0);
      const first = macd[0];
      expect(first).toHaveProperty('macd');
      expect(first).toHaveProperty('signal');
      expect(first).toHaveProperty('histogram');
    });
  });

  describe('calculateVolumeProfile', () => {
    it('generates volume distribution buckets and identifies Point of Control (POC)', () => {
      const profile = calculateVolumeProfile(mockCandles, 10);
      expect(profile.length).toBe(10);
      const pocs = profile.filter((p) => p.isPoc);
      expect(pocs.length).toBe(1);
      expect(profile[0].volume).toBeGreaterThanOrEqual(0);
    });
  });
});
