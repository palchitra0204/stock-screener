import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MarketOverviewCards } from '@/components/analytics/MarketOverviewCards';
import { SectorHeatmap } from '@/components/analytics/SectorHeatmap';
import { PerformanceBenchmarkModal } from '@/components/analytics/PerformanceBenchmarkModal';
import { useStockStore } from '@/stores/useStockStore';
import { generateRealisticStockQuotes } from '@/lib/mock-generator';

describe('Analytics and Benchmark Components', () => {
  const mockStocks = generateRealisticStockQuotes(50);

  beforeEach(() => {
    useStockStore.setState({
      stocks: mockStocks,
      filteredStocks: mockStocks,
      isBenchmarkModalOpen: true,
      lastFilterDurationMs: 11.5,
      lastSortDurationMs: 14.2,
      fps: 60,
    });
  });

  it('renders MarketOverviewCards with breadth and aggregate stats', () => {
    render(<MarketOverviewCards />);
    expect(screen.getByText(/Market Breadth/i)).toBeInTheDocument();
    expect(screen.getByText(/Aggregate M-Cap/i)).toBeInTheDocument();
    expect(screen.getByText(/Top Momentum/i)).toBeInTheDocument();
  });

  it('renders SectorHeatmap with 18 Indian sectors', () => {
    render(<SectorHeatmap />);
    expect(screen.getByText(/Sector Performance Heatmap/i)).toBeInTheDocument();
    expect(screen.getByText('Information Technology')).toBeInTheDocument();
    expect(screen.getByText('Banking & Financial Services')).toBeInTheDocument();
  });

  it('renders PerformanceBenchmarkModal with SLA targets', () => {
    render(<PerformanceBenchmarkModal />);
    expect(screen.getByText(/Performance Targets & Hardware Benchmark/i)).toBeInTheDocument();
    expect(screen.getByText(/LCP \(Largest Contentful Paint\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Filtering 5,000 Stocks Latency/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Run Stress Test/i })).toBeInTheDocument();
  });
});
