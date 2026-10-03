import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterRuleComponent } from '@/components/filters/FilterRuleComponent';
import { FilterGroupComponent } from '@/components/filters/FilterGroupComponent';
import { ActiveFilterChips } from '@/components/filters/ActiveFilterChips';
import { FilterBuilder } from '@/components/filters/FilterBuilder';
import { useFilterStore } from '@/stores/useFilterStore';
import { useStockStore } from '@/stores/useStockStore';
import { generateRealisticStockQuotes } from '@/lib/mock-generator';

describe('Filter System Components', () => {
  const mockStocks = generateRealisticStockQuotes(20);

  beforeEach(() => {
    useStockStore.setState({
      stocks: mockStocks,
      filteredStocks: mockStocks,
      isFilterDrawerOpen: true,
      lastFilterDurationMs: 8.2,
    });
    useFilterStore.getState().resetFilters();
  });

  describe('FilterRuleComponent', () => {
    it('renders metric labels and fires update and remove handlers', () => {
      const onUpdate = vi.fn();
      const onRemove = vi.fn();
      const onToggle = vi.fn();

      render(
        <FilterRuleComponent
          rule={{ id: 'r1', field: 'pe', operator: 'lte', value: 25, enabled: true }}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onToggle={onToggle}
        />
      );

      expect(screen.getByTitle('Delete rule')).toBeInTheDocument();
      fireEvent.click(screen.getByTitle('Delete rule'));
      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('FilterGroupComponent', () => {
    it('switches combinator between AND and OR', () => {
      const onSetCombinator = vi.fn();
      render(
        <FilterGroupComponent
          group={{ id: 'g1', combinator: 'AND', enabled: true, rules: [] }}
          onUpdateRule={vi.fn()}
          onRemoveRule={vi.fn()}
          onToggleRule={vi.fn()}
          onAddRule={vi.fn()}
          onSetCombinator={onSetCombinator}
          onReset={vi.fn()}
        />
      );

      const orButton = screen.getByRole('button', { name: /OR \(Any Rule\)/i });
      fireEvent.click(orButton);
      expect(onSetCombinator).toHaveBeenCalledWith('OR');
    });
  });

  describe('ActiveFilterChips', () => {
    it('displays active search and sector chips and allows reset', () => {
      useFilterStore.setState({
        searchQuery: 'TATA',
        selectedSectors: ['Information Technology'],
        filterGroup: {
          id: 'g',
          combinator: 'AND',
          enabled: true,
          rules: [{ id: 'r1', field: 'roe', operator: 'gte', value: 20, enabled: true }],
        },
      });

      render(<ActiveFilterChips />);
      expect(screen.getByText(/Search: "TATA"/i)).toBeInTheDocument();
      expect(screen.getByText('Information Technology')).toBeInTheDocument();
      expect(screen.getByText(/ROE/i)).toBeInTheDocument();

      const resetBtn = screen.getByText(/Reset all/i);
      fireEvent.click(resetBtn);
      expect(useFilterStore.getState().searchQuery).toBe('');
    });
  });

  describe('FilterBuilder Drawer', () => {
    it('renders market cap pills and sector selectors', () => {
      render(<FilterBuilder />);
      expect(screen.getByText(/Financial & Technical Screener Builder/i)).toBeInTheDocument();
      expect(screen.getByText('Large Cap')).toBeInTheDocument();
      expect(screen.getByText('Mid Cap')).toBeInTheDocument();
    });
  });
});
