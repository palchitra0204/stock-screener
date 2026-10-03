import { StockQuote } from './stock';

export type FilterOperator =
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'eq'
  | 'neq'
  | 'between'
  | 'in'
  | 'not_in'
  | 'contains';

export type FilterFieldType = 'number' | 'string' | 'select' | 'boolean' | 'range';

export interface FilterMetricMetadata {
  id: keyof StockQuote;
  label: string;
  category: 'Price & Volume' | 'Valuation' | 'Profitability' | 'Financial Health' | 'Growth' | 'Technicals' | 'General';
  type: FilterFieldType;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string | number }[];
  description?: string;
  defaultOperator: FilterOperator;
  defaultValue: any;
}

export interface FilterRule {
  id: string;
  field: keyof StockQuote;
  operator: FilterOperator;
  value: any;
  value2?: any; // For 'between' operator
  enabled: boolean;
}

export interface FilterGroup {
  id: string;
  combinator: 'AND' | 'OR';
  rules: (FilterRule | FilterGroup)[];
  enabled: boolean;
}

export interface PresetScreen {
  id: string;
  name: string;
  description: string;
  icon?: string;
  badge?: string;
  filterGroup: FilterGroup;
  isCustom?: boolean;
}
