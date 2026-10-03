export interface Watchlist {
  id: string;
  name: string;
  description?: string;
  symbols: string[];
  createdAt: number;
  updatedAt: number;
  color?: string;
}

export interface WatchlistStats {
  totalStocks: number;
  totalMarketCap: number;
  avgPE: number;
  avgROE: number;
  avgChange1D: number;
  gainersCount: number;
  losersCount: number;
}
