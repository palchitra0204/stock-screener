export type MarketCapCategory = 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Micro Cap';

export type Sector =
  | 'Information Technology'
  | 'Banking & Financial Services'
  | 'Automobile & Ancillaries'
  | 'Pharmaceuticals & Healthcare'
  | 'Oil, Gas & Energy'
  | 'Metals & Mining'
  | 'Fast Moving Consumer Goods'
  | 'Infrastructure & Construction'
  | 'Defense & Aerospace'
  | 'Power & Utilities'
  | 'Telecommunications'
  | 'Chemicals & Petrochemicals'
  | 'Real Estate & Realty'
  | 'Consumer Durables'
  | 'Capital Goods'
  | 'Textiles & Apparels'
  | 'Logistics & Transportation'
  | 'Hotels & Tourism';

export interface StockQuote {
  id: string;
  symbol: string;
  name: string;
  isin: string;
  exchange: 'NSE' | 'BSE';
  sector: Sector;
  industry: string;
  marketCapCategory: MarketCapCategory;

  // Real-time Pricing
  price: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume30D: number;
  deliveryPercent: number;
  volumeSpike: number; // current volume / avgVolume30D

  // Valuation
  marketCap: number; // in Crores (₹ Cr)
  pe: number;
  industryPe: number;
  pb: number;
  evToEbitda: number;
  dividendYield: number; // %
  earningsPerShare: number; // ₹ EPS TTM
  bookValue: number; // ₹ per share
  pegRatio: number;

  // Financial Health & Profitability
  roe: number; // %
  roce: number; // %
  debtToEquity: number;
  currentRatio: number;
  interestCoverage: number;
  profitMargin: number; // %
  operatingMargin: number; // %
  revenueGrowth1Y: number; // %
  profitGrowth1Y: number; // %
  epsGrowth3Y: number; // %
  freeCashFlow: number; // in Crores (₹ Cr)

  // Technical Indicators
  week52High: number;
  week52Low: number;
  distanceFrom52WHigh: number; // % difference: ((price - high) / high) * 100
  distanceFrom52WLow: number;  // % difference: ((price - low) / low) * 100
  beta: number;
  rsi14: number;
  sma20: number;
  sma50: number;
  sma200: number;
  ema20: number;
  ema50: number;
  macd: number;
  macdSignal: number;
  macdHist: number;
  upperBand: number; // Bollinger upper
  lowerBand: number; // Bollinger lower
  change1W: number; // %
  change1M: number; // %
  change1Y: number; // %

  // Metadata
  lastUpdated: number; // Unix timestamp ms
}

export interface OHLCV {
  time: string | number; // YYYY-MM-DD or timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TableDensity = 'compact' | 'normal' | 'comfortable';

export type TabCategory = 'overview' | 'valuation' | 'technicals' | 'fundamentals' | 'performance';

export interface ColumnDefinition {
  id: string;
  header: string;
  accessorKey: keyof StockQuote | string;
  category: TabCategory;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  description?: string;
  format?: (value: any, row: StockQuote) => string | React.ReactNode;
}
