import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from '@/components/layout/Header';
import { useFilterStore } from '@/stores/useFilterStore';
import { useStockStore } from '@/stores/useStockStore';

describe('Header Component', () => {
  it('renders branding and search input', () => {
    render(<Header />);
    expect(screen.getByText(/BHARAT/i)).toBeInTheDocument();
    expect(screen.getByText(/SCREENER/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search 5,000\+ stocks/i)).toBeInTheDocument();
  });

  it('updates search query in store when user types', () => {
    render(<Header />);
    const input = screen.getByPlaceholderText(/Search 5,000\+ stocks/i);

    fireEvent.change(input, { target: { value: 'RELIANCE' } });
    expect(useFilterStore.getState().searchQuery).toBe('RELIANCE');
  });

  it('opens filter drawer when Filters button is clicked', () => {
    render(<Header />);
    const filtersBtn = screen.getByRole('button', { name: /Toggle filters/i });
    fireEvent.click(filtersBtn);
    expect(useStockStore.getState().isFilterDrawerOpen).toBe(true);
  });
});
