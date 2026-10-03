import React from 'react';
import { FilterGroup, FilterRule } from '@/types/filter';
import { FilterRuleComponent } from './FilterRuleComponent';
import { Button } from '@/components/ui/Button';
import { Plus, GitMerge, RotateCcw } from 'lucide-react';

export interface FilterGroupComponentProps {
  group: FilterGroup;
  onUpdateRule: (ruleId: string, updates: Partial<FilterRule>) => void;
  onRemoveRule: (ruleId: string) => void;
  onToggleRule: (ruleId: string) => void;
  onAddRule: () => void;
  onSetCombinator: (combinator: 'AND' | 'OR') => void;
  onReset: () => void;
}

export const FilterGroupComponent: React.FC<FilterGroupComponentProps> = ({
  group,
  onUpdateRule,
  onRemoveRule,
  onToggleRule,
  onAddRule,
  onSetCombinator,
  onReset,
}) => {
  return (
    <div className="space-y-4">
      {/* Group Combinator Controls */}
      <div className="flex items-center justify-between bg-surface-400 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
            <GitMerge className="w-4 h-4 text-brand-accent" />
            <span>Match Condition:</span>
          </div>

          <div className="inline-flex bg-surface-200 p-1 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => onSetCombinator('AND')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                group.combinator === 'AND'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AND (All Rules)
            </button>
            <button
              type="button"
              onClick={() => onSetCombinator('OR')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                group.combinator === 'OR'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              OR (Any Rule)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {group.rules.length > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-2.5">
        {group.rules.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-slate-800 rounded-xl bg-surface-400/40">
            <p className="text-sm font-medium text-slate-300">No active custom filter rules</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add financial, valuation, or technical rules below, or pick one of the pre-built preset screeners.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={onAddRule}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="mt-3"
            >
              Add First Filter Rule
            </Button>
          </div>
        ) : (
          group.rules.map((item, idx) => {
            if ('field' in item) {
              return (
                <FilterRuleComponent
                  key={item.id || idx}
                  rule={item as FilterRule}
                  onUpdate={(updates) => onUpdateRule(item.id, updates)}
                  onRemove={() => onRemoveRule(item.id)}
                  onToggle={() => onToggleRule(item.id)}
                />
              );
            }
            return null;
          })
        )}
      </div>

      {/* Add Rule Button */}
      {group.rules.length > 0 && (
        <div className="flex justify-start pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onAddRule}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Another Filter Rule
          </Button>
        </div>
      )}
    </div>
  );
};
