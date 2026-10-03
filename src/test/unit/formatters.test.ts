import { describe, it, expect } from 'vitest';
import {
  formatINR,
  formatMarketCap,
  formatPercent,
  formatRatio,
  formatVolume,
  formatIndianNumber,
} from '@/lib/formatters';

describe('Financial and Currency Formatters', () => {
  it('formats INR prices correctly', () => {
    expect(formatINR(1250.5)).toBe('₹1,250.50');
    expect(formatINR(0)).toBe('₹0.00');
    expect(formatINR(NaN as any)).toBe('—');
  });

  it('formats Market Cap in Crores and Lakh Crores', () => {
    expect(formatMarketCap(500)).toBe('₹500.00 Cr');
    expect(formatMarketCap(25000)).toBe('₹25.00k Cr');
    expect(formatMarketCap(1500000)).toBe('₹15.00L Cr');
  });

  it('formats Percentages with optional positive sign', () => {
    expect(formatPercent(3.45, true)).toBe('+3.45%');
    expect(formatPercent(-2.1, true)).toBe('-2.10%');
    expect(formatPercent(15.2, false)).toBe('15.20%');
  });

  it('formats Ratios with x suffix', () => {
    expect(formatRatio(24.5)).toBe('24.50x');
    expect(formatRatio(18.256, 1)).toBe('18.3x');
  });

  it('formats Volumes in Lakhs and Crores', () => {
    expect(formatVolume(500000)).toBe('5.00 L');
    expect(formatVolume(25000000)).toBe('2.50 Cr');
    expect(formatVolume(5000)).toBe('5.0 K');
  });
});
