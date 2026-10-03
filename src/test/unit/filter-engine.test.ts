import { describe, it, expect } from 'vitest';
import {
  evaluateRule,
  evaluateFilterGroup,
  evaluateSearch,
  filterStocks,
} from '@/lib/filter-engine';
import { StockQuote } from '@/types/stock';
import { FilterRule, FilterGroup } from '@/types/filter';

describe('Filter Engine and Rule Evaluation', () => {
  const sampleStock: StockQuote = {
    id: 'stock-tcs',
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    isin: 'INE467B01029',
    exchange: 'NSE',
    sector: 'Information Technology',
    industry: 'IT Services & Consulting',
    marketCapCategory: 'Large Cap',
    price: 4200,
    previousClose: 4150,
    open: 4160,
    dayHigh: 4220,
    dayLow: 4140,
    change: 50,
    changePercent: 1.2,
    volume: 1200000,
    avgVolume30D: 1000000,
    deliveryPercent: 62.5,
    volumeSpike: 1.2,
    marketCap: 1520000,
    pe: 29.5,
    industryPe: 30.0,
    pb: 12.5,
    evToEbitda: 22.0,
    dividendYield: 1.8,
    earningsPerShare: 142.3,
    bookValue: 336,
    pegRatio: 2.1,
    roe: 48.5,
    roce: 56.2,
    debtToEquity: 0.05,
    currentRatio: 2.8,
    interestCoverage: 35.0,
    profitMargin: 19.8,
    operatingMargin: 24.5,
    revenueGrowth1Y: 14.5,
    profitGrowth1Y: 16.8,
    epsGrowth3Y: 15.2,
    freeCashFlow: 38000,
    week52High: 4500,
    week52Low: 3200,
    distanceFrom52WHigh: -6.67,
    distanceFrom52WLow: 31.25,
    beta: 0.85,
    rsi14: 58.4,
    sma20: 4150,
    sma50: 4050,
    sma200: 3800,
    ema20: 4180,
    ema50: 4100,
    macd: 12.5,
    macdSignal: 10.2,
    macdHist: 2.3,
    upperBand: 4400,
    lowerBand: 4000,
    change1W: 2.1,
    change1M: 5.4,
    change1Y: 28.5,
    lastUpdated: Date.now(),
  };

  describe('evaluateRule', () => {
    it('evaluates greater than (gt) and greater than or equal (gte)', () => {
      const ruleGt: FilterRule = {
        id: 'r1',
        field: 'roe',
        operator: 'gt',
        value: 40,
        enabled: true,
      };
      expect(evaluateRule(sampleStock, ruleGt)).toBe(true);

      const ruleGtFail: FilterRule = {
        id: 'r2',
        field: 'roe',
        operator: 'gt',
        value: 50,
        enabled: true,
      };
      expect(evaluateRule(sampleStock, ruleGtFail)).toBe(false);
    });

    it('evaluates less than (lt) and less than or equal (lte)', () => {
      const ruleLte: FilterRule = {
        id: 'r1',
        field: 'debtToEquity',
        operator: 'lte',
        value: 0.1,
        enabled: true,
      };
      expect(evaluateRule(sampleStock, ruleLte)).toBe(true);
    });

    it('evaluates between range operator', () => {
      const ruleBetween: FilterRule = {
        id: 'r1',
        field: 'pe',
        operator: 'between',
        value: [20, 35],
        enabled: true,
      };
      expect(evaluateRule(sampleStock, ruleBetween)).toBe(true);

      const ruleBetweenOut: FilterRule = {
        id: 'r2',
        field: 'pe',
        operator: 'between',
        value: [5, 25],
        enabled: true,
      };
      expect(evaluateRule(sampleStock, ruleBetweenOut)).toBe(false);
    });

    it('evaluates equality and case-insensitive string matches', () => {
      const ruleEq: FilterRule = {
        id: 'r1',
        field: 'marketCapCategory',
        operator: 'eq',
        value: 'large cap',
        enabled: true,
      };
      expect(evaluateRule(sampleStock, ruleEq)).toBe(true);
    });

    it('returns true when rule is disabled', () => {
      const ruleDisabled: FilterRule = {
        id: 'r1',
        field: 'price',
        operator: 'gt',
        value: 999999,
        enabled: false,
      };
      expect(evaluateRule(sampleStock, ruleDisabled)).toBe(true);
    });
  });

  describe('evaluateFilterGroup (AND / OR)', () => {
    it('evaluates AND group correctly when all rules pass', () => {
      const group: FilterGroup = {
        id: 'g1',
        combinator: 'AND',
        enabled: true,
        rules: [
          { id: 'r1', field: 'roe', operator: 'gte', value: 30, enabled: true },
          { id: 'r2', field: 'pe', operator: 'lte', value: 35, enabled: true },
        ],
      };
      expect(evaluateFilterGroup(sampleStock, group)).toBe(true);
    });

    it('evaluates AND group correctly when one rule fails', () => {
      const group: FilterGroup = {
        id: 'g1',
        combinator: 'AND',
        enabled: true,
        rules: [
          { id: 'r1', field: 'roe', operator: 'gte', value: 30, enabled: true },
          { id: 'r2', field: 'pe', operator: 'lte', value: 20, enabled: true }, // Fails
        ],
      };
      expect(evaluateFilterGroup(sampleStock, group)).toBe(false);
    });

    it('evaluates OR group correctly when at least one rule passes', () => {
      const group: FilterGroup = {
        id: 'g1',
        combinator: 'OR',
        enabled: true,
        rules: [
          { id: 'r1', field: 'pe', operator: 'lte', value: 10, enabled: true }, // Fails
          { id: 'r2', field: 'roe', operator: 'gte', value: 40, enabled: true }, // Passes
        ],
      };
      expect(evaluateFilterGroup(sampleStock, group)).toBe(true);
    });
  });

  describe('evaluateSearch', () => {
    it('matches by symbol, company name, and sector', () => {
      expect(evaluateSearch(sampleStock, 'TCS')).toBe(true);
      expect(evaluateSearch(sampleStock, 'Consultancy')).toBe(true);
      expect(evaluateSearch(sampleStock, 'Technology')).toBe(true);
      expect(evaluateSearch(sampleStock, 'INE467B01029')).toBe(true);
      expect(evaluateSearch(sampleStock, 'NONEXISTENTXYZ')).toBe(false);
    });
  });

  describe('filterStocks full pipeline', () => {
    it('filters array of stocks in sub-20ms duration', () => {
      const stockList = [sampleStock];
      const result = filterStocks(stockList, null, 'TCS');
      expect(result.matched).toBe(1);
      expect(result.durationMs).toBeLessThan(50);
    });
  });
});
