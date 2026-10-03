import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from '@/components/layout/Footer';
import { TickerTape } from '@/components/layout/TickerTape';
import { ShortcutsModal } from '@/components/layout/ShortcutsModal';
import { useStockStore } from '@/stores/useStockStore';
import { generateRealisticStockQuotes } from '@/lib/mock-generator';

describe('Layout Components', () => {
  const mockStocks = generateRealisticStockQuotes(20);

  it('renders Footer with compliance and telemetry stats', () => {
    render(<Footer />);
    expect(screen.getByText(/BharatScreener Pro 1A/i)).toBeInTheDocument();
    expect(screen.getByText(/WCAG 2.1 AA Compliant/i)).toBeInTheDocument();
  });

  it('renders TickerTape with marquee stocks', () => {
    useStockStore.setState({ stocks: mockStocks });
    render(<TickerTape />);
    expect(screen.getByLabelText(/Real-time Indian Market Ticker/i)).toBeInTheDocument();
  });

  it('renders ShortcutsModal when open', () => {
    useStockStore.setState({ isShortcutsModalOpen: true });
    render(<ShortcutsModal />);
    const matches = screen.getAllByText(/Keyboard Shortcuts/i);
    expect(matches.length).toBeGreaterThan(0);
    expect(screen.getByText(/Focus Quick Search bar/i)).toBeInTheDocument();
  });
});
