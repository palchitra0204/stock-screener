import { StockQuote } from '@/types/stock';

/**
 * Exports stock data as CSV file
 */
export function exportToCSV(stocks: StockQuote[], filename: string = 'indian-stocks-screener.csv'): void {
  if (!stocks || stocks.length === 0) return;

  const headers = [
    'Symbol',
    'Company Name',
    'Exchange',
    'Sector',
    'Industry',
    'Market Cap Class',
    'Price (₹)',
    'Change (₹)',
    'Change (%)',
    'Market Cap (₹ Cr)',
    'P/E',
    'P/B',
    'ROE (%)',
    'ROCE (%)',
    'Debt to Equity',
    'Div Yield (%)',
    '52W High (₹)',
    '52W Low (₹)',
    'RSI (14)',
    'Volume',
    'Delivery (%)',
  ];

  const rows = stocks.map((s) => [
    `"${s.symbol}"`,
    `"${s.name.replace(/"/g, '""')}"`,
    s.exchange,
    `"${s.sector}"`,
    `"${s.industry}"`,
    s.marketCapCategory,
    s.price,
    s.change,
    s.changePercent,
    s.marketCap,
    s.pe,
    s.pb,
    s.roe,
    s.roce,
    s.debtToEquity,
    s.dividendYield,
    s.week52High,
    s.week52Low,
    s.rsi14,
    s.volume,
    s.deliveryPercent,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports stock data as formatted JSON file
 */
export function exportToJSON(stocks: StockQuote[], filename: string = 'indian-stocks-screener.json'): void {
  if (!stocks || stocks.length === 0) return;

  const jsonContent = JSON.stringify(stocks, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
