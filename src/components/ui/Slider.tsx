import React from 'react';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  formatValue?: (val: number) => string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  unit,
  formatValue,
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="w-full space-y-1.5">
      {(label || formatValue) && (
        <div className="flex justify-between text-xs">
          {label && <span className="text-slate-400 font-medium">{label}</span>}
          <span className="text-slate-200 font-mono">
            {formatValue ? formatValue(value) : `${value}${unit || ''}`}
          </span>
        </div>
      )}
      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-surface-100 rounded-lg appearance-none cursor-pointer accent-brand-500 focus:outline-none"
          style={{
            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${percentage}%, #1e293b ${percentage}%, #1e293b 100%)`,
          }}
        />
      </div>
    </div>
  );
};
