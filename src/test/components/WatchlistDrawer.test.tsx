import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { WatchlistDrawer } from '@/components/watchlist/WatchlistDrawer';
import { useStockStore } from '@/stores/useStockStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { generateRealisticStockQuotes } from '@/lib/mock-generator';

describe('WatchlistDrawer Component', () => {
  const mockStocks = generateRealisticStockQuotes(10);

  beforeEach(() => {
    useStockStore.setState({
      stocks: mockStocks,
      isWatchlistDrawerOpen: true,
    });
    useWatchlistStore.setState({
      watchlists: [
        {
          id: 'wl-primary',
          name: 'Primary Watchlist',
          symbols: [mockStocks[0].symbol, mockStocks[1].symbol],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      activeWatchlistId: 'wl-primary',
    });
  });

  it('renders WatchlistDrawer with watched stocks and summary card', () => {
    render(<WatchlistDrawer />);
    expect(screen.getByText(/Watchlists & Portfolios/i)).toBeInTheDocument();
    expect(screen.getByText(/Watchlist Summary/i)).toBeInTheDocument();
    expect(screen.getByText(mockStocks[0].symbol)).toBeInTheDocument();
    expect(screen.getByText(mockStocks[1].symbol)).toBeInTheDocument();
  });

  it('allows opening New Watchlist dialog', () => {
    render(<WatchlistDrawer />);
    const newBtn = screen.getByTitle('Create new watchlist');
    fireEvent.click(newBtn);
    expect(screen.getByText(/Create New Watchlist/i)).toBeInTheDocument();
  });
});
