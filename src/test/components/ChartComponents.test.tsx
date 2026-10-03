import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChartIndicatorsMenu } from '@/components/chart/ChartIndicatorsMenu';
import { ChartModal } from '@/components/chart/ChartModal';
import { useStockStore } from '@/stores/useStockStore';
import { generateRealisticStockQuotes } from '@/lib/mock-generator';

describe('Chart Indicator & Modal Components', () => {
  const mockStocks = generateRealisticStockQuotes(5);

  it('renders ChartIndicatorsMenu and toggles indicators', () => {
    const handleChange = vi.fn();
    const config = {
      sma20: true,
      sma50: false,
      sma200: false,
      ema20: false,
      ema50: false,
      bollingerBands: false,
      rsi14: true,
      volumeProfile: true,
      macd: false,
    };

    render(<ChartIndicatorsMenu config={config} onChange={handleChange} />);
    expect(screen.getByText('SMA (20)')).toBeInTheDocument();
    expect(screen.getByText('SMA (50)')).toBeInTheDocument();
    expect(screen.getByText('Bollinger (20,2)')).toBeInTheDocument();
    expect(screen.getByText('Volume Profile')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    fireEvent.click(checkboxes[1]);
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders ChartModal when open', () => {
    useStockStore.setState({
      selectedStock: mockStocks[0],
      isChartModalOpen: true,
    });

    render(<ChartModal />);
    const matches = screen.getAllByText(new RegExp(`${mockStocks[0].symbol}`, 'i'));
    expect(matches.length).toBeGreaterThan(0);
  });
});
