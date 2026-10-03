import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StockTable } from '@/components/table/StockTable';
import { ColumnVisibilityModal } from '@/components/table/ColumnVisibilityModal';
import { useStockStore } from '@/stores/useStockStore';
import { generateRealisticStockQuotes } from '@/lib/mock-generator';

describe('Table and Grid Components', () => {
  const mockStocks = generateRealisticStockQuotes(10);

  beforeEach(() => {
    useStockStore.setState({
      stocks: mockStocks,
      filteredStocks: mockStocks,
      selectedStock: mockStocks[0],
      visibleColumns: ['symbol', 'name', 'price', 'changePercent', 'marketCap', 'pe', 'roe', 'rsi14'],
      density: 'normal',
    });
  });

  it('renders StockTable with headers and toolbar', () => {
    render(<StockTable />);
    expect(screen.getByText(/Stock Grid/i)).toBeInTheDocument();
    expect(screen.getByText(/Export CSV/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Columns/i })).toBeInTheDocument();
  });

  it('renders ColumnVisibilityModal and toggles columns', () => {
    const handleClose = vi.fn();
    render(<ColumnVisibilityModal isOpen={true} onClose={handleClose} />);
    expect(screen.getByText(/Customize Stock Table Columns/i)).toBeInTheDocument();

    const selectAllBtn = screen.getByText('Select All');
    fireEvent.click(selectAllBtn);
    expect(useStockStore.getState().visibleColumns.length).toBeGreaterThan(10);
  });
});
