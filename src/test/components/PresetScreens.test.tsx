import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PresetScreens } from '@/components/filters/PresetScreens';
import { useFilterStore } from '@/stores/useFilterStore';

describe('PresetScreens Component', () => {
  it('renders pre-built strategy screeners', () => {
    render(<PresetScreens />);
    expect(screen.getByText('Nifty 50 Blue Chips')).toBeInTheDocument();
    expect(screen.getByText('High Growth Compounders')).toBeInTheDocument();
    expect(screen.getByText('52-Week High Breakouts')).toBeInTheDocument();
  });

  it('applies preset filter rules to store upon card click', () => {
    render(<PresetScreens />);
    const card = screen.getByText('Nifty 50 Blue Chips');
    fireEvent.click(card);

    const filterGroup = useFilterStore.getState().filterGroup;
    expect(filterGroup.rules.length).toBeGreaterThan(0);
    expect(useFilterStore.getState().activePresetId).toBe('nifty-50-giants');
  });
});
