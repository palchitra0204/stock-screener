import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, CrosshairMode } from 'lightweight-charts';
import { StockQuote, OHLCV } from '@/types/stock';
import { IndicatorConfig, Timeframe } from '@/types/chart';
import { generate252DayOHLCV } from '@/lib/mock-generator';
import {
  calculateSMA,
  calculateEMA,
  calculateBollingerBands,
  calculateRSI,
  calculateVolumeProfile,
} from '@/lib/indicators';
import { formatINR, formatPercent, formatVolume } from '@/lib/formatters';
import { ChartIndicatorsMenu } from './ChartIndicatorsMenu';
import { Button } from '@/components/ui/Button';
import { Sliders, Maximize2, Minimize2, Eye } from 'lucide-react';
import { clsx } from 'clsx';

export interface CandlestickChartProps {
  stock: StockQuote;
  height?: number;
  showIndicatorsMenu?: boolean;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  stock,
  height = 480,
  showIndicatorsMenu = true,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>('1Y');
  const [showIndicators, setShowIndicators] = useState(false);
  const [indicators, setIndicators] = useState<IndicatorConfig>({
    sma20: true,
    sma50: true,
    sma200: false,
    ema20: false,
    ema50: false,
    bollingerBands: false,
    rsi14: true,
    volumeProfile: true,
    macd: false,
  });

  const [hoverData, setHoverData] = useState<{
    time?: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
  } | null>(null);

  // Generate 252-day OHLCV data
  const rawCandles = useMemo(() => {
    return generate252DayOHLCV(stock.price, stock.symbol);
  }, [stock.price, stock.symbol]);

  // Slice by timeframe
  const candles = useMemo(() => {
    switch (timeframe) {
      case '1D':
        return rawCandles.slice(-1);
      case '1W':
        return rawCandles.slice(-5);
      case '1M':
        return rawCandles.slice(-22);
      case '3M':
        return rawCandles.slice(-66);
      case '6M':
        return rawCandles.slice(-132);
      case '1Y':
      default:
        return rawCandles;
    }
  }, [rawCandles, timeframe]);

  // Volume Profile calculation
  const volumeProfile = useMemo(() => {
    return calculateVolumeProfile(candles, 18);
  }, [candles]);

  // Initialize and Render Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    container.innerHTML = '';

    const chart: IChartApi = createChart(container, {
      width: container.clientWidth,
      height: indicators.rsi14 ? height - 120 : height,
      layout: {
        background: { type: ColorType.Solid, color: '#090d16' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.4)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.4)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(51, 65, 85, 0.5)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: 'rgba(51, 65, 85, 0.5)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // 1. Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    const candleData = candles.map((c) => ({
      time: c.time as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    candleSeries.setData(candleData);

    // 2. Volume Histogram Series
    const volumeSeries = chart.addHistogramSeries({
      color: '#38bdf8',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Overlay scale
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const volumeData = candles.map((c) => ({
      time: c.time as any,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)',
    }));
    volumeSeries.setData(volumeData);

    // 3. Technical Indicator Overlays
    if (indicators.sma20) {
      const sma20Data = calculateSMA(candles, 20);
      if (sma20Data.length > 0) {
        const sma20Series = chart.addLineSeries({
          color: '#38bdf8', // Cyan
          lineWidth: 2,
          title: 'SMA 20',
        });
        sma20Series.setData(sma20Data as any);
      }
    }

    if (indicators.sma50) {
      const sma50Data = calculateSMA(candles, 50);
      if (sma50Data.length > 0) {
        const sma50Series = chart.addLineSeries({
          color: '#f59e0b', // Amber/Orange
          lineWidth: 2,
          title: 'SMA 50',
        });
        sma50Series.setData(sma50Data as any);
      }
    }

    if (indicators.sma200) {
      const sma200Data = calculateSMA(candles, 200);
      if (sma200Data.length > 0) {
        const sma200Series = chart.addLineSeries({
          color: '#a855f7', // Purple
          lineWidth: 2,
          title: 'SMA 200',
        });
        sma200Series.setData(sma200Data as any);
      }
    }

    if (indicators.ema20) {
      const ema20Data = calculateEMA(candles, 20);
      if (ema20Data.length > 0) {
        const ema20Series = chart.addLineSeries({
          color: '#facc15', // Yellow
          lineWidth: 2,
          title: 'EMA 20',
        });
        ema20Series.setData(ema20Data as any);
      }
    }

    if (indicators.ema50) {
      const ema50Data = calculateEMA(candles, 50);
      if (ema50Data.length > 0) {
        const ema50Series = chart.addLineSeries({
          color: '#ec4899', // Pink
          lineWidth: 2,
          title: 'EMA 50',
        });
        ema50Series.setData(ema50Data as any);
      }
    }

    if (indicators.bollingerBands) {
      const bbData = calculateBollingerBands(candles, 20, 2);
      if (bbData.length > 0) {
        const upperSeries = chart.addLineSeries({
          color: 'rgba(99, 102, 241, 0.7)',
          lineWidth: 1,
          lineStyle: 2,
          title: 'BB Upper',
        });
        const lowerSeries = chart.addLineSeries({
          color: 'rgba(99, 102, 241, 0.7)',
          lineWidth: 1,
          lineStyle: 2,
          title: 'BB Lower',
        });
        const basisSeries = chart.addLineSeries({
          color: 'rgba(99, 102, 241, 0.4)',
          lineWidth: 1,
          title: 'BB Basis',
        });

        upperSeries.setData(bbData.map((d) => ({ time: d.time as any, value: d.upper })));
        lowerSeries.setData(bbData.map((d) => ({ time: d.time as any, value: d.lower })));
        basisSeries.setData(bbData.map((d) => ({ time: d.time as any, value: d.basis })));
      }
    }

    // Subscribe crosshair move for tooltip
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData.get(candleSeries)) {
        const last = candles[candles.length - 1];
        if (last) {
          setHoverData({
            time: String(last.time),
            open: last.open,
            high: last.high,
            low: last.low,
            close: last.close,
            volume: last.volume,
          });
        }
        return;
      }

      const cData = param.seriesData.get(candleSeries) as any;
      const vData = param.seriesData.get(volumeSeries) as any;

      if (cData) {
        setHoverData({
          time: String(param.time),
          open: cData.open,
          high: cData.high,
          low: cData.low,
          close: cData.close,
          volume: vData?.value || 0,
        });
      }
    });

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Initial last candle preview
    const last = candles[candles.length - 1];
    if (last) {
      setHoverData({
        time: String(last.time),
        open: last.open,
        high: last.high,
        low: last.low,
        close: last.close,
        volume: last.volume,
      });
    }

    // 4. RSI Sub-Chart (if active)
    let rsiChart: IChartApi | null = null;
    if (indicators.rsi14 && rsiContainerRef.current) {
      rsiContainerRef.current.innerHTML = '';
      rsiChart = createChart(rsiContainerRef.current, {
        width: rsiContainerRef.current.clientWidth,
        height: 110,
        layout: {
          background: { type: ColorType.Solid, color: '#090d16' },
          textColor: '#94a3b8',
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace',
        },
        grid: {
          vertLines: { color: 'rgba(30, 41, 59, 0.3)' },
          horzLines: { color: 'rgba(30, 41, 59, 0.3)' },
        },
        rightPriceScale: {
          borderColor: 'rgba(51, 65, 85, 0.5)',
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: {
          visible: false,
        },
      });

      const rsiSeries = rsiChart.addLineSeries({
        color: '#818cf8',
        lineWidth: 2,
        title: 'RSI 14',
      });

      const rsiData = calculateRSI(candles, 14);
      if (rsiData.length > 0) {
        rsiSeries.setData(rsiData as any);
        // Overbought line (70)
        rsiSeries.createPriceLine({
          price: 70,
          color: 'rgba(244, 63, 94, 0.5)',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: '70 OB',
        });
        // Oversold line (30)
        rsiSeries.createPriceLine({
          price: 30,
          color: 'rgba(16, 185, 129, 0.5)',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: '30 OS',
        });
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      if (rsiChart) rsiChart.remove();
    };
  }, [candles, height, indicators]);

  const timeframes: Timeframe[] = ['1D', '1W', '1M', '3M', '6M', '1Y'];

  return (
    <div className="w-full bg-surface-300 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Chart Top Header & Toolbar */}
      <div className="p-3 bg-surface-400/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Stock Info & Live OHLCV hover data */}
        <div className="flex items-center space-x-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-base text-slate-100">{stock.symbol}</span>
              <span className="text-xs px-1.5 py-0.2 bg-surface-100 text-slate-400 rounded">
                {stock.exchange}
              </span>
              <span className="text-sm font-semibold font-mono text-slate-200 tabular-nums">
                {formatINR(stock.price)}
              </span>
              <span
                className={clsx(
                  'text-xs font-mono font-semibold tabular-nums',
                  stock.changePercent >= 0 ? 'text-bull' : 'text-bear'
                )}
              >
                {formatPercent(stock.changePercent)}
              </span>
            </div>
            {/* Live OHLCV HUD values */}
            {hoverData && (
              <div className="flex items-center space-x-2.5 text-[11px] font-mono text-slate-400 mt-0.5">
                <span>
                  O: <span className="text-slate-200">{formatINR(hoverData.open || 0)}</span>
                </span>
                <span>
                  H: <span className="text-bull">{formatINR(hoverData.high || 0)}</span>
                </span>
                <span>
                  L: <span className="text-bear">{formatINR(hoverData.low || 0)}</span>
                </span>
                <span>
                  C: <span className="text-slate-200">{formatINR(hoverData.close || 0)}</span>
                </span>
                {hoverData.volume !== undefined && (
                  <span>
                    Vol: <span className="text-cyan-400">{formatVolume(hoverData.volume)}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Timeframes & Indicators Menu */}
        <div className="flex items-center space-x-2">
          {/* Timeframe Buttons */}
          <div className="inline-flex bg-surface-200 p-0.5 rounded-lg border border-slate-700">
            {timeframes.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={clsx(
                  'px-2 py-1 text-xs font-mono font-medium rounded-md transition-all',
                  timeframe === tf
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicators Toggle */}
          {showIndicatorsMenu && (
            <Button
              variant={showIndicators ? 'primary' : 'subtle'}
              size="sm"
              onClick={() => setShowIndicators(!showIndicators)}
              leftIcon={<Sliders className="w-3.5 h-3.5" />}
            >
              Indicators
            </Button>
          )}
        </div>
      </div>

      {/* Indicators Configuration Drawer */}
      {showIndicators && (
        <div className="p-3 bg-surface-400/50 border-b border-slate-800">
          <ChartIndicatorsMenu config={indicators} onChange={setIndicators} />
        </div>
      )}

      {/* Main Chart Canvas and Volume Profile Overlay */}
      <div className="relative w-full">
        <div ref={chartContainerRef} className="w-full relative" />

        {/* Volume Profile Sidebar Overlay */}
        {indicators.volumeProfile && volumeProfile.length > 0 && (
          <div
            className="absolute right-14 top-2 bottom-8 w-20 pointer-events-none opacity-40 flex flex-col justify-between py-1 z-10"
            title="Volume Profile distribution"
          >
            {volumeProfile.map((bucket, i) => {
              const maxVol = Math.max(...volumeProfile.map((b) => b.volume));
              const widthPct = Math.min(100, Math.max(5, (bucket.volume / maxVol) * 100));

              return (
                <div key={i} className="flex items-center justify-end w-full h-1.5 gap-0.5">
                  <div
                    style={{ width: `${widthPct}%` }}
                    className={clsx(
                      'h-full rounded-sm',
                      bucket.isPoc
                        ? 'bg-amber-400'
                        : bucket.buyVolume >= bucket.sellVolume
                        ? 'bg-bull'
                        : 'bg-bear'
                    )}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* RSI Sub-pane Container */}
        {indicators.rsi14 && (
          <div className="border-t border-slate-800/80">
            <div className="px-3 pt-1 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span className="font-semibold text-brand-accent">RSI (14) Relative Strength Index</span>
              <span className="text-slate-500">OB: 70 | OS: 30</span>
            </div>
            <div ref={rsiContainerRef} className="w-full h-[110px]" />
          </div>
        )}
      </div>
    </div>
  );
};
