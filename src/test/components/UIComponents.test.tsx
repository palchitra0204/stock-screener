import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { Tabs } from '@/components/ui/Tabs';
import { Select } from '@/components/ui/Select';

describe('UI Primitives Library', () => {
  describe('Button', () => {
    it('renders with variants and handles clicks', () => {
      const handleClick = vi.fn();
      render(
        <Button variant="bull" size="sm" onClick={handleClick}>
          Buy Order
        </Button>
      );
      const btn = screen.getByRole('button', { name: /Buy Order/i });
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('displays spinner when isLoading is true', () => {
      render(<Button isLoading>Processing</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Input', () => {
    it('handles typing and clear button trigger', () => {
      const handleClear = vi.fn();
      render(<Input value="Test" onClear={handleClear} onChange={() => {}} />);
      const clearBtn = screen.getByLabelText('Clear input');
      fireEvent.click(clearBtn);
      expect(handleClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('Badge', () => {
    it('renders text with variant styles', () => {
      render(<Badge variant="bear">Bearish</Badge>);
      expect(screen.getByText('Bearish')).toBeInTheDocument();
    });
  });

  describe('Modal', () => {
    it('renders title and content when open, calls onClose when closed', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Modal Title">
          Modal Content
        </Modal>
      );
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();

      const closeBtn = screen.getByLabelText('Close dialog');
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Drawer', () => {
    it('renders title and dismiss button when open', () => {
      const handleClose = vi.fn();
      render(
        <Drawer isOpen={true} onClose={handleClose} title="Drawer Title">
          Drawer Body
        </Drawer>
      );
      expect(screen.getByText('Drawer Title')).toBeInTheDocument();
      expect(screen.getByText('Drawer Body')).toBeInTheDocument();

      const closeBtn = screen.getByLabelText('Close drawer');
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Slider', () => {
    it('triggers onChange on slider input', () => {
      const handleChange = vi.fn();
      render(<Slider min={0} max={100} value={50} onChange={handleChange} label="Threshold" />);
      expect(screen.getByText('Threshold')).toBeInTheDocument();
      const sliderInput = screen.getByRole('slider');
      fireEvent.change(sliderInput, { target: { value: 75 } });
      expect(handleChange).toHaveBeenCalledWith(75);
    });
  });

  describe('Switch', () => {
    it('toggles checkbox value on click', () => {
      const handleChange = vi.fn();
      render(<Switch checked={false} onChange={handleChange} label="Toggle Indicator" />);
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Tabs', () => {
    it('renders tabs and triggers onChange on selection', () => {
      const handleChange = vi.fn();
      render(
        <Tabs
          tabs={[
            { id: 'tab1', label: 'Tab 1' },
            { id: 'tab2', label: 'Tab 2' },
          ]}
          activeTab="tab1"
          onChange={handleChange}
        />
      );
      const tab2 = screen.getByText('Tab 2');
      fireEvent.click(tab2);
      expect(handleChange).toHaveBeenCalledWith('tab2');
    });
  });

  describe('Select', () => {
    it('renders options and handles change', () => {
      const handleChange = vi.fn();
      render(
        <Select
          options={[
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
          ]}
          value="a"
          onChange={handleChange}
        />
      );
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'b' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });
});
