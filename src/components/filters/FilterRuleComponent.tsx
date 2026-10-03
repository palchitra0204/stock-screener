import React from 'react';
import { FilterMetricMetadata, FilterOperator, FilterRule } from '@/types/filter';
import { FILTER_METRICS } from '@/lib/constants';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/Slider';
import { Trash2, CheckCircle2, Circle } from 'lucide-react';
import { StockQuote } from '@/types/stock';

export interface FilterRuleComponentProps {
  rule: FilterRule;
  onUpdate: (updates: Partial<FilterRule>) => void;
  onRemove: () => void;
  onToggle: () => void;
}

const OPERATOR_OPTIONS: { label: string; value: FilterOperator }[] = [
  { label: 'Greater than or equal (≥)', value: 'gte' },
  { label: 'Less than or equal (≤)', value: 'lte' },
  { label: 'Greater than (>)', value: 'gt' },
  { label: 'Less than (<)', value: 'lt' },
  { label: 'Between range', value: 'between' },
  { label: 'Equals (=)', value: 'eq' },
  { label: 'Not equals (≠)', value: 'neq' },
];

export const FilterRuleComponent: React.FC<FilterRuleComponentProps> = ({
  rule,
  onUpdate,
  onRemove,
  onToggle,
}) => {
  const metric = FILTER_METRICS.find((m) => m.id === rule.field) || FILTER_METRICS[0];

  const handleFieldChange = (fieldId: string) => {
    const selectedMetric = FILTER_METRICS.find((m) => m.id === fieldId);
    if (!selectedMetric) return;

    onUpdate({
      field: selectedMetric.id,
      operator: selectedMetric.defaultOperator,
      value: selectedMetric.defaultValue,
    });
  };

  const metricOptions = FILTER_METRICS.map((m) => ({
    label: `${m.label} (${m.category})`,
    value: m.id,
  }));

  return (
    <div
      className={`p-3 rounded-lg border transition-all duration-150 ${
        rule.enabled
          ? 'bg-surface-200/90 border-slate-700/80 shadow-sm'
          : 'bg-surface-400/50 border-slate-800 opacity-60'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="text-slate-400 hover:text-brand-accent transition-colors"
            title={rule.enabled ? 'Disable rule' : 'Enable rule'}
          >
            {rule.enabled ? (
              <CheckCircle2 className="w-4 h-4 text-brand-500" />
            ) : (
              <Circle className="w-4 h-4 text-slate-600" />
            )}
          </button>
          <span className="text-xs font-semibold text-slate-200">{metric.label}</span>
          {metric.unit && (
            <span className="text-[10px] px-1.5 py-0.2 bg-surface-100 rounded text-slate-400 font-mono">
              {metric.unit}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="text-slate-500 hover:text-bear p-1 rounded hover:bg-surface-100 transition-colors"
          title="Delete rule"
          aria-label="Delete rule"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
        {/* Metric Selector */}
        <div className="sm:col-span-5">
          <Select
            options={metricOptions}
            value={rule.field}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="text-xs py-1.5 bg-surface-300"
          />
        </div>

        {/* Operator Selector */}
        <div className="sm:col-span-3">
          <Select
            options={OPERATOR_OPTIONS}
            value={rule.operator}
            onChange={(e) => onUpdate({ operator: e.target.value as FilterOperator })}
            className="text-xs py-1.5 bg-surface-300"
          />
        </div>

        {/* Value Inputs / Sliders */}
        <div className="sm:col-span-4">
          {rule.operator === 'between' ? (
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                value={Array.isArray(rule.value) ? rule.value[0] : rule.value}
                onChange={(e) => {
                  const val2 = Array.isArray(rule.value) ? rule.value[1] : 100;
                  onUpdate({ value: [Number(e.target.value), val2] });
                }}
                className="text-xs py-1 px-2 h-8"
                placeholder="Min"
              />
              <span className="text-slate-500 text-xs">-</span>
              <Input
                type="number"
                value={Array.isArray(rule.value) ? rule.value[1] : (rule.value2 ?? 100)}
                onChange={(e) => {
                  const val1 = Array.isArray(rule.value) ? rule.value[0] : rule.value;
                  onUpdate({ value: [val1, Number(e.target.value)] });
                }}
                className="text-xs py-1 px-2 h-8"
                placeholder="Max"
              />
            </div>
          ) : metric.type === 'range' && metric.min !== undefined && metric.max !== undefined ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Slider
                  min={metric.min}
                  max={metric.max}
                  step={metric.step || 1}
                  value={Number(rule.value)}
                  onChange={(v) => onUpdate({ value: v })}
                />
                <span className="text-xs font-mono text-slate-200 min-w-[45px] text-right">
                  {rule.value}
                </span>
              </div>
            </div>
          ) : (
            <Input
              type={metric.type === 'number' ? 'number' : 'text'}
              value={rule.value}
              onChange={(e) =>
                onUpdate({
                  value: metric.type === 'number' ? Number(e.target.value) : e.target.value,
                })
              }
              className="text-xs py-1 px-2.5 h-8"
              placeholder={`Enter ${metric.label}...`}
            />
          )}
        </div>
      </div>
      {metric.description && (
        <p className="mt-1.5 text-[11px] text-slate-400 leading-tight">{metric.description}</p>
      )}
    </div>
  );
};
