import { FilterGroup, FilterRule } from '@/types/filter';
import { StockQuote } from '@/types/stock';

/**
 * Checks if a single rule matches a stock quote
 */
export function evaluateRule(stock: StockQuote, rule: FilterRule): boolean {
  if (!rule.enabled) return true;

  const stockValue = stock[rule.field];
  if (stockValue === undefined || stockValue === null) return false;

  const targetValue = rule.value;

  switch (rule.operator) {
    case 'gt':
      return typeof stockValue === 'number' && stockValue > Number(targetValue);

    case 'gte':
      return typeof stockValue === 'number' && stockValue >= Number(targetValue);

    case 'lt':
      return typeof stockValue === 'number' && stockValue < Number(targetValue);

    case 'lte':
      return typeof stockValue === 'number' && stockValue <= Number(targetValue);

    case 'eq':
      if (typeof stockValue === 'string') {
        return stockValue.toLowerCase() === String(targetValue).toLowerCase();
      }
      return stockValue === targetValue;

    case 'neq':
      if (typeof stockValue === 'string') {
        return stockValue.toLowerCase() !== String(targetValue).toLowerCase();
      }
      return stockValue !== targetValue;

    case 'between': {
      if (typeof stockValue !== 'number') return false;
      let minVal: number;
      let maxVal: number;

      if (Array.isArray(targetValue)) {
        minVal = Number(targetValue[0]);
        maxVal = Number(targetValue[1]);
      } else {
        minVal = Number(targetValue);
        maxVal = Number(rule.value2 ?? Infinity);
      }

      if (isNaN(minVal)) minVal = -Infinity;
      if (isNaN(maxVal)) maxVal = Infinity;
      return stockValue >= minVal && stockValue <= maxVal;
    }

    case 'in':
      if (!Array.isArray(targetValue) || targetValue.length === 0) return true;
      return targetValue.includes(stockValue);

    case 'not_in':
      if (!Array.isArray(targetValue) || targetValue.length === 0) return true;
      return !targetValue.includes(stockValue);

    case 'contains':
      return String(stockValue).toLowerCase().includes(String(targetValue).toLowerCase());

    default:
      return true;
  }
}

/**
 * Recursively evaluates a FilterGroup with AND / OR combinator
 */
export function evaluateFilterGroup(stock: StockQuote, group: FilterGroup): boolean {
  if (!group.enabled || !group.rules || group.rules.length === 0) {
    return true;
  }

  const activeRules = group.rules.filter((r) => r.enabled);
  if (activeRules.length === 0) return true;

  if (group.combinator === 'AND') {
    for (const item of activeRules) {
      if ('combinator' in item) {
        if (!evaluateFilterGroup(stock, item as FilterGroup)) return false;
      } else {
        if (!evaluateRule(stock, item as FilterRule)) return false;
      }
    }
    return true;
  } else {
    // OR combinator
    for (const item of activeRules) {
      if ('combinator' in item) {
        if (evaluateFilterGroup(stock, item as FilterGroup)) return true;
      } else {
        if (evaluateRule(stock, item as FilterRule)) return true;
      }
    }
    return false;
  }
}

/**
 * Evaluates text search across Symbol, Name, Sector, Industry, ISIN
 */
export function evaluateSearch(stock: StockQuote, query: string): boolean {
  if (!query || query.trim() === '') return true;
  const q = query.trim().toLowerCase();

  return (
    stock.symbol.toLowerCase().includes(q) ||
    stock.name.toLowerCase().includes(q) ||
    stock.sector.toLowerCase().includes(q) ||
    stock.industry.toLowerCase().includes(q) ||
    stock.isin.toLowerCase().includes(q)
  );
}

export interface FilterResult {
  data: StockQuote[];
  total: number;
  matched: number;
  durationMs: number;
}

/**
 * High-performance stock screener query pipeline
 */
export function filterStocks(
  stocks: StockQuote[],
  filterGroup?: FilterGroup | null,
  searchQuery?: string,
  selectedSectors?: string[],
  selectedMcap?: string[]
): FilterResult {
  const startTime = performance.now();

  const hasSearch = !!(searchQuery && searchQuery.trim().length > 0);
  const hasFilter = !!(filterGroup && filterGroup.enabled && filterGroup.rules && filterGroup.rules.length > 0);
  const hasSectorFilter = !!(selectedSectors && selectedSectors.length > 0);
  const hasMcapFilter = !!(selectedMcap && selectedMcap.length > 0);

  // Fast path if no filters are active
  if (!hasSearch && !hasFilter && !hasSectorFilter && !hasMcapFilter) {
    const durationMs = Number((performance.now() - startTime).toFixed(2));
    return {
      data: stocks,
      total: stocks.length,
      matched: stocks.length,
      durationMs,
    };
  }

  const results: StockQuote[] = [];

  for (let i = 0; i < stocks.length; i++) {
    const stock = stocks[i];

    if (hasSearch && !evaluateSearch(stock, searchQuery)) {
      continue;
    }

    if (hasSectorFilter && !selectedSectors.includes(stock.sector)) {
      continue;
    }

    if (hasMcapFilter && !selectedMcap.includes(stock.marketCapCategory)) {
      continue;
    }

    if (hasFilter && !evaluateFilterGroup(stock, filterGroup)) {
      continue;
    }

    results.push(stock);
  }

  const durationMs = Number((performance.now() - startTime).toFixed(2));

  return {
    data: results,
    total: stocks.length,
    matched: results.length,
    durationMs,
  };
}
