import React from 'react';
import { useFilterStore } from '@/stores/useFilterStore';
import { FILTER_METRICS } from '@/lib/constants';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';

export const ActiveFilterChips: React.FC = () => {
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const setSearchQuery = useFilterStore((state) => state.setSearchQuery);
  const selectedSectors = useFilterStore((state) => state.selectedSectors);
  const toggleSector = useFilterStore((state) => state.toggleSector);
  const selectedMcap = useFilterStore((state) => state.selectedMcap);
  const toggleMcap = useFilterStore((state) => state.toggleMcap);
  const filterGroup = useFilterStore((state) => state.filterGroup);
  const removeRule = useFilterStore((state) => state.removeRule);
  const resetFilters = useFilterStore((state) => state.resetFilters);
  const activePresetId = useFilterStore((state) => state.activePresetId);

  const activeRules = filterGroup.rules.filter((r) => r.enabled);
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedSectors.length > 0 ||
    selectedMcap.length > 0 ||
    activeRules.length > 0;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1 px-1 select-none">
      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
        <SlidersHorizontal className="w-3 h-3 text-brand-accent" />
        <span>Active Filters:</span>
      </span>

      {/* Search Query Chip */}
      {searchQuery.trim() && (
        <span className="inline-flex items-center gap-1 bg-brand-500/15 text-brand-accent border border-brand-500/30 text-xs px-2 py-0.5 rounded-full">
          <span>Search: &quot;{searchQuery}&quot;</span>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="hover:text-white"
            aria-label="Remove search filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Market Cap Chips */}
      {selectedMcap.map((mcap) => (
        <span
          key={mcap}
          className="inline-flex items-center gap-1 bg-surface-200 text-slate-300 border border-slate-700 text-xs px-2 py-0.5 rounded-full"
        >
          <span>{mcap}</span>
          <button
            type="button"
            onClick={() => toggleMcap(mcap)}
            className="hover:text-white"
            aria-label={`Remove ${mcap} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {/* Sector Chips */}
      {selectedSectors.map((sector) => (
        <span
          key={sector}
          className="inline-flex items-center gap-1 bg-surface-200 text-slate-300 border border-slate-700 text-xs px-2 py-0.5 rounded-full"
        >
          <span>{sector}</span>
          <button
            type="button"
            onClick={() => toggleSector(sector)}
            className="hover:text-white"
            aria-label={`Remove ${sector} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {/* Individual Custom Rules */}
      {activeRules.map((rule) => {
        if (!('field' in rule)) return null;
        const metric = FILTER_METRICS.find((m) => m.id === rule.field);
        const label = metric ? metric.label : rule.field;

        let valDisplay = rule.value;
        if (rule.operator === 'between' && Array.isArray(rule.value)) {
          valDisplay = `${rule.value[0]} - ${rule.value[1]}`;
        }

        return (
          <span
            key={rule.id}
            className="inline-flex items-center gap-1 bg-surface-200 text-slate-300 border border-slate-700 text-xs px-2 py-0.5 rounded-full"
          >
            <span className="font-mono text-[11px]">
              {label} {rule.operator} {String(valDisplay)}
            </span>
            <button
              type="button"
              onClick={() => removeRule(rule.id)}
              className="hover:text-white"
              aria-label={`Remove ${label} rule`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        );
      })}

      {/* Reset All Filters button */}
      <button
        type="button"
        onClick={resetFilters}
        className="text-[11px] text-slate-400 hover:text-bear flex items-center gap-1 ml-1 hover:underline cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Reset all</span>
      </button>
    </div>
  );
};
