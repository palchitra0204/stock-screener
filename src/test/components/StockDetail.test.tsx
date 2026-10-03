import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { StockDetailDrawer } from '@/components/stock-detail/StockDetailDrawer';
import { useStockStore } from '@/stores/useStockStore';
import { generateRealisticStockQuotes } from '@/lib/mock-generator';

describe('StockDetailDrawer Component', () => {
  const mockStocks = generateRealisticStockQuotes(5);

  beforeEach(() => {
    useStockStore.setState({
      selectedStock: mockStocks[0],
      isDetailDrawerOpen: true,
    });
  });

  it('renders company overview, price, and tabs', () => {
    render(<StockDetailDrawer />);
    expect(screen.getByText(mockStocks[0].symbol)).toBeInTheDocument();
    expect(screen.getByText(/52-Week Price Spectrum/i)).toBeInTheDocument();
    expect(screen.getByText(/Overview & Valuation/i)).toBeInTheDocument();
    expect(screen.getByText(/Financial Health & Growth/i)).toBeInTheDocument();
    expect(screen.getByText(/Technicals & Momentum/i)).toBeInTheDocument();
  });

  it('switches between detail tabs', () => {
    render(<StockDetailDrawer />);
    const healthTab = screen.getByText(/Financial Health & Growth/i);
    fireEvent.click(healthTab);

    expect(screen.getByText(/Return on Equity \(ROE\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Debt to Equity/i)).toBeInTheDocument();
  });
});
