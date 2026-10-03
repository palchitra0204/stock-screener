/**
 * Indian Number and Currency Formatting Utilities
 */

export function formatINR(val: number, decimals: number = 2): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return '₹' + val.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatIndianNumber(val: number, decimals: number = 0): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return val.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatMarketCap(val: number): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)}L Cr`;
  }
  if (val >= 1000) {
    return `₹${(val / 1000).toFixed(2)}k Cr`;
  }
  return `₹${val.toFixed(2)} Cr`;
}

export function formatVolume(val: number): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  if (val >= 10000000) {
    return `${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `${(val / 100000).toFixed(2)} L`;
  }
  if (val >= 1000) {
    return `${(val / 1000).toFixed(1)} K`;
  }
  return val.toString();
}

export function formatPercent(val: number, showSign: boolean = true, decimals: number = 2): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const sign = showSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(decimals)}%`;
}

export function formatRatio(val: number, decimals: number = 2): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return `${val.toFixed(decimals)}x`;
}

export function formatShortDate(timestamp: number | string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
