import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DensitySelector } from '@/components/table/DensitySelector';
import { useStockStore } from '@/stores/useStockStore';

describe('DensitySelector Component', () => {
  it('renders Compact, Normal, and Comfortable density options', () => {
    render(<DensitySelector />);
    expect(screen.getByTitle(/Compact Row Density/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Normal Row Density/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Comfortable Row Density/i)).toBeInTheDocument();
  });

  it('updates density in Zustand store when clicked', () => {
    render(<DensitySelector />);
    const compactBtn = screen.getByTitle(/Compact Row Density/i);
    fireEvent.click(compactBtn);

    expect(useStockStore.getState().density).toBe('compact');
  });
});
