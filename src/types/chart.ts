import { OHLCV } from './stock';

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y';

export interface IndicatorConfig {
  sma20: boolean;
  sma50: boolean;
  sma200: boolean;
  ema20: boolean;
  ema50: boolean;
  bollingerBands: boolean;
  rsi14: boolean;
  volumeProfile: boolean;
  macd: boolean;
}

export interface IndicatorPoint {
  time: string | number;
  value: number;
}

export interface BollingerPoint {
  time: string | number;
  upper: number;
  lower: number;
  basis: number;
}

export interface MACDPoint {
  time: string | number;
  macd: number;
  signal: number;
  histogram: number;
}

export interface VolumeProfileBucket {
  price: number;
  volume: number;
  buyVolume: number;
  sellVolume: number;
  isPoc: boolean; // Point of Control
}

export interface StockChartData {
  symbol: string;
  timeframe: Timeframe;
  candles: OHLCV[];
  sma20: IndicatorPoint[];
  sma50: IndicatorPoint[];
  sma200: IndicatorPoint[];
  ema20: IndicatorPoint[];
  ema50: IndicatorPoint[];
  bollinger: BollingerPoint[];
  rsi: IndicatorPoint[];
  macd: MACDPoint[];
  volumeProfile: VolumeProfileBucket[];
}
