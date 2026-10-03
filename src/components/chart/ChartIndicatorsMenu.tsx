import React from 'react';
import { IndicatorConfig } from '@/types/chart';
import { Switch } from '@/components/ui/Switch';
import { Sliders } from 'lucide-react';

export interface ChartIndicatorsMenuProps {
  config: IndicatorConfig;
  onChange: (config: IndicatorConfig) => void;
}

export const ChartIndicatorsMenu: React.FC<ChartIndicatorsMenuProps> = ({
  config,
  onChange,
}) => {
  const toggle = (key: keyof IndicatorConfig) => {
    onChange({
      ...config,
      [key]: !config[key],
    });
  };

  return (
    <div className="bg-surface-400 border border-slate-800 rounded-xl p-3 space-y-3">
      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wider">
        <Sliders className="w-3.5 h-3.5 text-brand-accent" />
        <span>Technical Indicators</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Moving Averages */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Moving Averages
          </span>
          <div className="space-y-1.5">
            <Switch
              size="sm"
              checked={config.sma20}
              onChange={() => toggle('sma20')}
              label="SMA (20)"
            />
            <Switch
              size="sm"
              checked={config.sma50}
              onChange={() => toggle('sma50')}
              label="SMA (50)"
            />
            <Switch
              size="sm"
              checked={config.sma200}
              onChange={() => toggle('sma200')}
              label="SMA (200)"
            />
          </div>
        </div>

        {/* Exponential Averages */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Exponential (EMA)
          </span>
          <div className="space-y-1.5">
            <Switch
              size="sm"
              checked={config.ema20}
              onChange={() => toggle('ema20')}
              label="EMA (20)"
            />
            <Switch
              size="sm"
              checked={config.ema50}
              onChange={() => toggle('ema50')}
              label="EMA (50)"
            />
          </div>
        </div>

        {/* Volatility & Momentum */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Volatility & Momentum
          </span>
          <div className="space-y-1.5">
            <Switch
              size="sm"
              checked={config.bollingerBands}
              onChange={() => toggle('bollingerBands')}
              label="Bollinger (20,2)"
            />
            <Switch
              size="sm"
              checked={config.rsi14}
              onChange={() => toggle('rsi14')}
              label="RSI (14)"
            />
          </div>
        </div>

        {/* Volume */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Volume Dynamics
          </span>
          <div className="space-y-1.5">
            <Switch
              size="sm"
              checked={config.volumeProfile}
              onChange={() => toggle('volumeProfile')}
              label="Volume Profile"
            />
            <Switch
              size="sm"
              checked={config.macd}
              onChange={() => toggle('macd')}
              label="MACD (12,26,9)"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
