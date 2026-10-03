import { BollingerPoint, IndicatorPoint, MACDPoint, VolumeProfileBucket } from '@/types/chart';
import { OHLCV } from '@/types/stock';

/**
 * Calculates Simple Moving Average (SMA)
 */
export function calculateSMA(candles: OHLCV[], period: number): IndicatorPoint[] {
  if (!candles || candles.length < period) return [];
  const result: IndicatorPoint[] = [];

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  result.push({
    time: candles[period - 1].time,
    value: Number((sum / period).toFixed(2)),
  });

  for (let i = period; i < candles.length; i++) {
    sum += candles[i].close - candles[i - period].close;
    result.push({
      time: candles[i].time,
      value: Number((sum / period).toFixed(2)),
    });
  }

  return result;
}

/**
 * Calculates Exponential Moving Average (EMA)
 */
export function calculateEMA(candles: OHLCV[], period: number): IndicatorPoint[] {
  if (!candles || candles.length < period) return [];
  const result: IndicatorPoint[] = [];
  const multiplier = 2 / (period + 1);

  // Initial SMA as first EMA
  let initialSum = 0;
  for (let i = 0; i < period; i++) {
    initialSum += candles[i].close;
  }
  let prevEMA = initialSum / period;
  result.push({
    time: candles[period - 1].time,
    value: Number(prevEMA.toFixed(2)),
  });

  for (let i = period; i < candles.length; i++) {
    const currentClose = candles[i].close;
    const currentEMA = (currentClose - prevEMA) * multiplier + prevEMA;
    result.push({
      time: candles[i].time,
      value: Number(currentEMA.toFixed(2)),
    });
    prevEMA = currentEMA;
  }

  return result;
}

/**
 * Calculates Bollinger Bands (period, stdDev)
 */
export function calculateBollingerBands(
  candles: OHLCV[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerPoint[] {
  if (!candles || candles.length < period) return [];
  const result: BollingerPoint[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    const mean = sum / period;

    let varianceSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      varianceSum += Math.pow(candles[j].close - mean, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);

    result.push({
      time: candles[i].time,
      basis: Number(mean.toFixed(2)),
      upper: Number((mean + stdDev * stdDevMultiplier).toFixed(2)),
      lower: Number((mean - stdDev * stdDevMultiplier).toFixed(2)),
    });
  }

  return result;
}

/**
 * Calculates Relative Strength Index (RSI) using Wilder's Smoothing
 */
export function calculateRSI(candles: OHLCV[], period: number = 14): IndicatorPoint[] {
  if (!candles || candles.length <= period) return [];
  const result: IndicatorPoint[] = [];

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const firstRSI = avgLoss === 0 ? 100 : 100 - 100 / (1 + firstRS);
  result.push({
    time: candles[period].time,
    value: Number(firstRSI.toFixed(2)),
  });

  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

    result.push({
      time: candles[i].time,
      value: Number(rsi.toFixed(2)),
    });
  }

  return result;
}

/**
 * Calculates MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  candles: OHLCV[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDPoint[] {
  if (!candles || candles.length < slowPeriod + signalPeriod) return [];

  const fastEMA = calculateEMA(candles, fastPeriod);
  const slowEMA = calculateEMA(candles, slowPeriod);

  // Align timestamps
  const macdRaw: { time: string | number; value: number }[] = [];
  const slowMap = new Map(slowEMA.map((s) => [s.time, s.value]));

  for (const fast of fastEMA) {
    if (slowMap.has(fast.time)) {
      macdRaw.push({
        time: fast.time,
        value: Number((fast.value - slowMap.get(fast.time)!).toFixed(2)),
      });
    }
  }

  // Signal line = 9-period EMA of MACD line
  const mult = 2 / (signalPeriod + 1);
  if (macdRaw.length < signalPeriod) return [];

  let sum = 0;
  for (let i = 0; i < signalPeriod; i++) {
    sum += macdRaw[i].value;
  }
  let prevSignal = sum / signalPeriod;

  const result: MACDPoint[] = [
    {
      time: macdRaw[signalPeriod - 1].time,
      macd: macdRaw[signalPeriod - 1].value,
      signal: Number(prevSignal.toFixed(2)),
      histogram: Number((macdRaw[signalPeriod - 1].value - prevSignal).toFixed(2)),
    },
  ];

  for (let i = signalPeriod; i < macdRaw.length; i++) {
    const currentSignal = (macdRaw[i].value - prevSignal) * mult + prevSignal;
    result.push({
      time: macdRaw[i].time,
      macd: macdRaw[i].value,
      signal: Number(currentSignal.toFixed(2)),
      histogram: Number((macdRaw[i].value - currentSignal).toFixed(2)),
    });
    prevSignal = currentSignal;
  }

  return result;
}

/**
 * Calculates Volume Profile buckets across price levels
 */
export function calculateVolumeProfile(candles: OHLCV[], bucketsCount: number = 24): VolumeProfileBucket[] {
  if (!candles || candles.length === 0) return [];

  let minPrice = Infinity;
  let maxPrice = -Infinity;

  for (const c of candles) {
    if (c.low < minPrice) minPrice = c.low;
    if (c.high > maxPrice) maxPrice = c.high;
  }

  const range = maxPrice - minPrice;
  if (range <= 0) return [];

  const step = range / bucketsCount;
  const buckets: VolumeProfileBucket[] = Array.from({ length: bucketsCount }, (_, i) => ({
    price: Number((minPrice + (i + 0.5) * step).toFixed(2)),
    volume: 0,
    buyVolume: 0,
    sellVolume: 0,
    isPoc: false,
  }));

  for (const c of candles) {
    const avg = (c.open + c.close + c.high + c.low) / 4;
    const bucketIdx = Math.min(
      Math.max(0, Math.floor((avg - minPrice) / step)),
      bucketsCount - 1
    );

    const isBullish = c.close >= c.open;
    buckets[bucketIdx].volume += c.volume;
    if (isBullish) {
      buckets[bucketIdx].buyVolume += c.volume;
    } else {
      buckets[bucketIdx].sellVolume += c.volume;
    }
  }

  let maxVol = 0;
  let pocIndex = 0;
  buckets.forEach((b, idx) => {
    if (b.volume > maxVol) {
      maxVol = b.volume;
      pocIndex = idx;
    }
  });

  if (buckets[pocIndex]) {
    buckets[pocIndex].isPoc = true;
  }

  return buckets;
}
