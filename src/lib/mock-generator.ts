import { Sector, MarketCapCategory, StockQuote, OHLCV } from '@/types/stock';
import { SECTORS } from './constants';

// Pseudo-random number generator with seed for deterministic results
class SeededRandom {
  private seed: number;

  constructor(seed: number = 42) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  intRange(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  choice<T>(array: readonly T[] | T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

// Top prominent Indian companies as realistic anchors
const SEED_COMPANIES = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Oil, Gas & Energy' as Sector, industry: 'Refineries & Petrochemicals', mcap: 'Large Cap' as MarketCapCategory, basePrice: 2980, pe: 28.4, roe: 13.8, de: 0.38 },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', sector: 'Information Technology' as Sector, industry: 'IT Services & Consulting', mcap: 'Large Cap' as MarketCapCategory, basePrice: 4250, pe: 31.2, roe: 48.5, de: 0.05 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Banking & Financial Services' as Sector, industry: 'Private Sector Bank', mcap: 'Large Cap' as MarketCapCategory, basePrice: 1680, pe: 18.9, roe: 16.4, de: 0.85 },
  { symbol: 'INFY', name: 'Infosys Ltd.', sector: 'Information Technology' as Sector, industry: 'IT Services & Consulting', mcap: 'Large Cap' as MarketCapCategory, basePrice: 1910, pe: 26.8, roe: 31.8, de: 0.08 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', sector: 'Banking & Financial Services' as Sector, industry: 'Private Sector Bank', mcap: 'Large Cap' as MarketCapCategory, basePrice: 1240, pe: 17.5, roe: 18.2, de: 0.72 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', sector: 'Telecommunications' as Sector, industry: 'Telecom Services', mcap: 'Large Cap' as MarketCapCategory, basePrice: 1650, pe: 54.2, roe: 19.1, de: 1.45 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking & Financial Services' as Sector, industry: 'Public Sector Bank', mcap: 'Large Cap' as MarketCapCategory, basePrice: 795, pe: 10.4, roe: 17.2, de: 1.1 },
  { symbol: 'ITC', name: 'ITC Ltd.', sector: 'Fast Moving Consumer Goods' as Sector, industry: 'Diversified FMCG & Cigarettes', mcap: 'Large Cap' as MarketCapCategory, basePrice: 505, pe: 29.1, roe: 29.5, de: 0.01 },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd.', sector: 'Infrastructure & Construction' as Sector, industry: 'Civil Construction & EPC', mcap: 'Large Cap' as MarketCapCategory, basePrice: 3620, pe: 37.8, roe: 15.6, de: 0.75 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', sector: 'Fast Moving Consumer Goods' as Sector, industry: 'Personal Care & Homecare', mcap: 'Large Cap' as MarketCapCategory, basePrice: 2840, pe: 58.6, roe: 20.3, de: 0.02 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', sector: 'Automobile & Ancillaries' as Sector, industry: 'Automobiles - 4 Wheelers & EV', mcap: 'Large Cap' as MarketCapCategory, basePrice: 960, pe: 10.8, roe: 36.2, de: 0.42 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd.', sector: 'Pharmaceuticals & Healthcare' as Sector, industry: 'Pharmaceuticals & Formulations', mcap: 'Large Cap' as MarketCapCategory, basePrice: 1920, pe: 38.5, roe: 16.9, de: 0.04 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', sector: 'Automobile & Ancillaries' as Sector, industry: 'Automobiles - Passenger Cars', mcap: 'Large Cap' as MarketCapCategory, basePrice: 12850, pe: 28.7, roe: 17.5, de: 0.01 },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', sector: 'Banking & Financial Services' as Sector, industry: 'Private Sector Bank', mcap: 'Large Cap' as MarketCapCategory, basePrice: 1210, pe: 14.2, roe: 17.9, de: 0.81 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', sector: 'Banking & Financial Services' as Sector, industry: 'Private Sector Bank', mcap: 'Large Cap' as MarketCapCategory, basePrice: 1820, pe: 21.0, roe: 14.8, de: 0.55 },
  { symbol: 'TITAN', name: 'Titan Company Ltd.', sector: 'Consumer Durables' as Sector, industry: 'Gems, Jewellery & Watches', mcap: 'Large Cap' as MarketCapCategory, basePrice: 3750, pe: 88.4, roe: 31.4, de: 0.65 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', sector: 'Banking & Financial Services' as Sector, industry: 'NBFC - Consumer & SME Finance', mcap: 'Large Cap' as MarketCapCategory, basePrice: 7420, pe: 32.5, roe: 22.8, de: 3.4 },
  { symbol: 'NTPC', name: 'NTPC Ltd.', sector: 'Power & Utilities' as Sector, industry: 'Thermal & Renewable Power', mcap: 'Large Cap' as MarketCapCategory, basePrice: 425, pe: 18.2, roe: 13.9, de: 1.25 },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd.', sector: 'Oil, Gas & Energy' as Sector, industry: 'Oil Exploration & Production', mcap: 'Large Cap' as MarketCapCategory, basePrice: 295, pe: 7.8, roe: 14.5, de: 0.35 },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', sector: 'Metals & Mining' as Sector, industry: 'Integrated Steel Producer', mcap: 'Large Cap' as MarketCapCategory, basePrice: 165, pe: 24.1, roe: 8.9, de: 0.88 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', sector: 'Automobile & Ancillaries' as Sector, industry: 'Automobiles - SUV & Tractors', mcap: 'Large Cap' as MarketCapCategory, basePrice: 3150, pe: 31.6, roe: 19.8, de: 0.15 },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', sector: 'Information Technology' as Sector, industry: 'IT Services & Consulting', mcap: 'Large Cap' as MarketCapCategory, basePrice: 535, pe: 23.4, roe: 15.2, de: 0.22 },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', sector: 'Information Technology' as Sector, industry: 'IT Services & Consulting', mcap: 'Large Cap' as MarketCapCategory, basePrice: 1840, pe: 28.5, roe: 24.6, de: 0.08 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', sector: 'Chemicals & Petrochemicals' as Sector, industry: 'Decorative Paints & Coatings', mcap: 'Large Cap' as MarketCapCategory, basePrice: 3150, pe: 54.2, roe: 26.5, de: 0.12 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', sector: 'Infrastructure & Construction' as Sector, industry: 'Cement & Building Materials', mcap: 'Large Cap' as MarketCapCategory, basePrice: 11400, pe: 42.1, roe: 13.4, de: 0.38 },
  { symbol: 'COALINDIA', name: 'Coal India Ltd.', sector: 'Metals & Mining' as Sector, industry: 'Coal Mining & Extraction', mcap: 'Large Cap' as MarketCapCategory, basePrice: 495, pe: 8.4, roe: 45.2, de: 0.05 },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd.', sector: 'Automobile & Ancillaries' as Sector, industry: 'Automobiles - 2 & 3 Wheelers', mcap: 'Large Cap' as MarketCapCategory, basePrice: 11800, pe: 38.6, roe: 27.5, de: 0.02 },
  { symbol: 'HAL', name: 'Hindustan Aeronautics Ltd.', sector: 'Defense & Aerospace' as Sector, industry: 'Defense Aviation & Helicopters', mcap: 'Large Cap' as MarketCapCategory, basePrice: 4650, pe: 38.9, roe: 29.8, de: 0.0 },
  { symbol: 'BEL', name: 'Bharat Electronics Ltd.', sector: 'Defense & Aerospace' as Sector, industry: 'Defense Electronics & Radars', mcap: 'Large Cap' as MarketCapCategory, basePrice: 298, pe: 46.2, roe: 26.4, de: 0.0 },
  { symbol: 'ZOMATO', name: 'Zomato Ltd.', sector: 'Information Technology' as Sector, industry: 'Food Delivery & Quick Commerce', mcap: 'Large Cap' as MarketCapCategory, basePrice: 275, pe: 115.0, roe: 7.5, de: 0.01 },
  { symbol: 'JIOFIN', name: 'Jio Financial Services Ltd.', sector: 'Banking & Financial Services' as Sector, industry: 'Financial Services Holding', mcap: 'Large Cap' as MarketCapCategory, basePrice: 345, pe: 120.0, roe: 2.1, de: 0.01 },
  { symbol: 'TRENT', name: 'Trent Ltd.', sector: 'Fast Moving Consumer Goods' as Sector, industry: 'Retail & Fashion Apparel', mcap: 'Large Cap' as MarketCapCategory, basePrice: 7650, pe: 165.0, roe: 28.5, de: 0.25 },
  { symbol: 'DLF', name: 'DLF Ltd.', sector: 'Real Estate & Realty' as Sector, industry: 'Real Estate Development', mcap: 'Large Cap' as MarketCapCategory, basePrice: 870, pe: 72.0, roe: 7.8, de: 0.12 },
  { symbol: 'INDIGO', name: 'InterGlobe Aviation Ltd.', sector: 'Logistics & Transportation' as Sector, industry: 'Aviation & Passenger Airlines', mcap: 'Large Cap' as MarketCapCategory, basePrice: 4680, pe: 21.5, roe: 42.0, de: 1.8 },
  { symbol: 'POLYCAB', name: 'Polycab India Ltd.', sector: 'Capital Goods' as Sector, industry: 'Cables, Wires & FMEG', mcap: 'Large Cap' as MarketCapCategory, basePrice: 6850, pe: 54.0, roe: 24.5, de: 0.04 },
  { symbol: 'PERSISTENT', name: 'Persistent Systems Ltd.', sector: 'Information Technology' as Sector, industry: 'Software & Digital Engineering', mcap: 'Mid Cap' as MarketCapCategory, basePrice: 5350, pe: 52.0, roe: 25.8, de: 0.06 },
  { symbol: 'COFORGE', name: 'Coforge Ltd.', sector: 'Information Technology' as Sector, industry: 'IT Solutions & Cloud Services', mcap: 'Mid Cap' as MarketCapCategory, basePrice: 7200, pe: 48.0, roe: 23.4, de: 0.35 },
  { symbol: 'DIXON', name: 'Dixon Technologies (India) Ltd.', sector: 'Consumer Durables' as Sector, industry: 'EMS & Electronic Manufacturing', mcap: 'Mid Cap' as MarketCapCategory, basePrice: 13800, pe: 110.0, roe: 29.5, de: 0.38 },
  { symbol: 'MAZDOCK', name: 'Mazagon Dock Shipbuilders Ltd.', sector: 'Defense & Aerospace' as Sector, industry: 'Defense Shipbuilding & Submarines', mcap: 'Mid Cap' as MarketCapCategory, basePrice: 4400, pe: 39.5, roe: 38.5, de: 0.0 },
  { symbol: 'SUZLON', name: 'Suzlon Energy Ltd.', sector: 'Power & Utilities' as Sector, industry: 'Wind Turbines & Green Energy', mcap: 'Mid Cap' as MarketCapCategory, basePrice: 82, pe: 65.0, roe: 26.0, de: 0.08 },
  { symbol: 'CDSL', name: 'Central Depository Services (India) Ltd.', sector: 'Banking & Financial Services' as Sector, industry: 'Financial Infrastructure', mcap: 'Mid Cap' as MarketCapCategory, basePrice: 1540, pe: 58.0, roe: 31.0, de: 0.0 },
  { symbol: 'KAYNES', name: 'Kaynes Technology India Ltd.', sector: 'Capital Goods' as Sector, industry: 'IoT & Electronics Manufacturing', mcap: 'Mid Cap' as MarketCapCategory, basePrice: 5200, pe: 125.0, roe: 18.5, de: 0.22 },
  { symbol: 'NETWEB', name: 'Netweb Technologies India Ltd.', sector: 'Information Technology' as Sector, industry: 'AI Supercomputing & Servers', mcap: 'Small Cap' as MarketCapCategory, basePrice: 2850, pe: 95.0, roe: 32.0, de: 0.05 },
  { symbol: 'MAPMYINDIA', name: 'C.E. Info Systems Ltd. (MapmyIndia)', sector: 'Information Technology' as Sector, industry: 'Digital Maps & Geospatial AI', mcap: 'Small Cap' as MarketCapCategory, basePrice: 2150, pe: 58.0, roe: 22.0, de: 0.01 },
  { symbol: 'CYIENT', name: 'Cyient Ltd.', sector: 'Information Technology' as Sector, industry: 'Engineering R&D Services', mcap: 'Mid Cap' as MarketCapCategory, basePrice: 1980, pe: 32.0, roe: 19.5, de: 0.25 },
  { symbol: 'KPITTECH', name: 'KPIT Technologies Ltd.', sector: 'Information Technology' as Sector, industry: 'Automotive Software & EV Tech', mcap: 'Mid Cap' as MarketCapCategory, basePrice: 1680, pe: 62.0, roe: 30.5, de: 0.12 },
  { symbol: 'ANGELONE', name: 'Angel One Ltd.', sector: 'Banking & Financial Services' as Sector, industry: 'Fintech & Retail Broking', mcap: 'Mid Cap' as MarketCapCategory, basePrice: 2850, pe: 21.0, roe: 42.0, de: 0.45 },
  { symbol: 'DEEPAKNTR', name: 'Deepak Nitrite Ltd.', sector: 'Chemicals & Petrochemicals' as Sector, industry: 'Specialty Chemicals & Intermediates', mcap: 'Mid Cap' as MarketCapCategory, basePrice: 2900, pe: 42.0, roe: 21.0, de: 0.03 },
  { symbol: 'RVNL', name: 'Rail Vikas Nigam Ltd.', sector: 'Infrastructure & Construction' as Sector, industry: 'Railway Infrastructure Projects', mcap: 'Mid Cap' as MarketCapCategory, basePrice: 520, pe: 68.0, roe: 21.5, de: 0.78 },
  { symbol: 'IRFC', name: 'Indian Railway Finance Corporation', sector: 'Banking & Financial Services' as Sector, industry: 'Railway Financing NBFC', mcap: 'Large Cap' as MarketCapCategory, basePrice: 175, pe: 28.0, roe: 14.5, de: 7.2 },
];

const SECTOR_INDUSTRIES: Record<Sector, string[]> = {
  'Information Technology': ['IT Services & Consulting', 'Software Products & SaaS', 'AI & Data Analytics', 'Fintech Platforms', 'Cloud & Cybersecurity', 'Digital Engineering'],
  'Banking & Financial Services': ['Private Sector Bank', 'Public Sector Bank', 'NBFC - Retail Lending', 'Wealth Management & Broking', 'Life & General Insurance', 'Housing Finance'],
  'Automobile & Ancillaries': ['Passenger Vehicles', 'Commercial Vehicles', '2 & 3 Wheelers', 'Auto Components & Tyres', 'EV Powertrain & Batteries', 'Forgings & Castings'],
  'Pharmaceuticals & Healthcare': ['Formulations & Generics', 'Active Pharma Ingredients (API)', 'Biotechnology', 'Hospitals & Healthcare Chains', 'Diagnostic Laboratories', 'Contract Research (CDMO)'],
  'Oil, Gas & Energy': ['Refineries & Petrochemicals', 'Oil & Gas Exploration', 'City Gas Distribution', 'Renewable Energy - Solar/Wind', 'Biofuels & Green Hydrogen'],
  'Metals & Mining': ['Integrated Steel', 'Aluminum & Copper', 'Mining & Minerals', 'Precious Metals & Refineries', 'Ferro Alloys & Sponge Iron'],
  'Fast Moving Consumer Goods': ['Packaged Foods & Beverages', 'Personal Care & Cosmetics', 'Home & Hygiene Care', 'Dairy Products', 'Edible Oils & Agri Processing', 'Cigarettes & Tobacco'],
  'Infrastructure & Construction': ['EPC & Civil Construction', 'Roads, Bridges & Highways', 'Cement & Concrete', 'Ports & Waterways Infrastructure', 'Urban Transit & Metro Rail'],
  'Defense & Aerospace': ['Defense Shipbuilding', 'Defense Electronics & Avionics', 'Missile Systems & Munitions', 'Drones & Unmanned Systems', 'Aerospace Components'],
  'Power & Utilities': ['Thermal Power Generation', 'Renewable Solar & Wind Parks', 'Power Transmission Grids', 'Power Distribution Discoms', 'Hydroelectric Projects'],
  'Telecommunications': ['Telecom Cellular Services', 'Telecom Towers & Fiber', 'Optical Transceivers & Equipment', 'Satellite Communications'],
  'Chemicals & Petrochemicals': ['Specialty Chemicals', 'Agrochemicals & Pesticides', 'Fluorochemicals', 'Pigments & Dyes', 'Industrial Gases & Polymer Solutions'],
  'Real Estate & Realty': ['Residential Real Estate', 'Commercial & IT Parks', 'REITs (Real Estate Trusts)', 'Industrial Warehousing Parks', 'Hospitality & Luxury Resorts'],
  'Consumer Durables': ['Air Conditioners & Cooling', 'Home Appliances', 'Consumer Electronics & TV', 'Watches & Wearables', 'Sanitaryware & Tiles'],
  'Capital Goods': ['Heavy Electrical Equipment', 'Industrial Machinery & Pumps', 'Process Automation & Robotics', 'Turbines & Generators', 'Switchgear & Transformers'],
  'Textiles & Apparels': ['Cotton Spinning & Yarn', 'Garment Export & Retail', 'Technical Textiles', 'Synthetic Fibres', 'Silk & Home Furnishing'],
  'Logistics & Transportation': ['Freight Forwarding & 3PL', 'Express Parcel Delivery', 'Cold Chain Warehousing', 'Airlines & Aviation', 'Container Shipping'],
  'Hotels & Tourism': ['Luxury Hotels & Palaces', 'Business & Budget Hotels', 'Online Travel & Ticketing', 'Theme Parks & Entertainment', 'Catering & Food Services'],
};

const PREFIXES = [
  'Adani', 'Tata', 'Reliance', 'Birla', 'Mahindra', 'Bajaj', 'Godrej', 'JSW', 'L&T', 'Hinduja',
  'Apex', 'Zenith', 'Bharat', 'Indian', 'Vibrant', 'Prime', 'Galaxy', 'Delta', 'Nova', 'Sterling',
  'Pinnacle', 'Matrix', 'Global', 'Universal', 'Dynamic', 'Premier', 'Sunrise', 'Apollo', 'Orient', 'Crown',
  'Paramount', 'Vanguard', 'Titan', 'Horizon', 'Synergy', 'Kalyan', 'Shree', 'Surya', 'Auro', 'Radico',
  'Kaveri', 'Ganga', 'Indus', 'Yamuna', 'Godavari', 'Narmada', 'Himalaya', 'Kaveri', 'Deccan', 'Maratha'
];

const SUFFIXES = [
  'Enterprises', 'Industries', 'Technologies', 'Solutions', 'Holdings', 'Financial', 'Infra', 'Power',
  'Capital', 'Services', 'Global', 'Ventures', 'Digital', 'Systems', 'Logistics', 'Pharma', 'Bio', 'Metals',
  'Energy', 'Polymers', 'Chemicals', 'Foods', 'Retail', 'Engineering', 'Motors', 'Textiles', 'Realty', 'Media'
];

export function generateRealisticStockQuotes(count: number = 5000): StockQuote[] {
  const rng = new SeededRandom(1337);
  const stocks: StockQuote[] = [];
  const usedSymbols = new Set<string>();

  // 1. First add the prominent seed companies
  for (const seed of SEED_COMPANIES) {
    if (stocks.length >= count) break;
    usedSymbols.add(seed.symbol);

    const price = Number((seed.basePrice * rng.range(0.95, 1.05)).toFixed(2));
    const changePercent = Number(rng.range(-4.5, 5.0).toFixed(2));
    const change = Number((price * (changePercent / 100)).toFixed(2));
    const previousClose = Number((price - change).toFixed(2));
    const open = Number((previousClose * rng.range(0.99, 1.01)).toFixed(2));
    const dayHigh = Number(Math.max(price, open, previousClose * rng.range(1.002, 1.03)).toFixed(2));
    const dayLow = Number(Math.min(price, open, previousClose * rng.range(0.97, 0.998)).toFixed(2));

    const marketCap = seed.mcap === 'Large Cap'
      ? Number(rng.range(50000, 1950000).toFixed(2))
      : seed.mcap === 'Mid Cap'
      ? Number(rng.range(15000, 49999).toFixed(2))
      : Number(rng.range(1000, 14999).toFixed(2));

    const volume = Math.floor(rng.range(200000, 15000000));
    const avgVolume30D = Math.floor(volume * rng.range(0.6, 1.5));
    const volumeSpike = Number((volume / avgVolume30D).toFixed(2));
    const deliveryPercent = Number(rng.range(28, 75).toFixed(1));

    const pe = seed.pe;
    const eps = Number((price / pe).toFixed(2));
    const pb = Number(rng.range(1.8, 12.0).toFixed(2));
    const bookValue = Number((price / pb).toFixed(2));
    const dividendYield = Number(rng.range(0.2, 4.5).toFixed(2));
    const evToEbitda = Number((pe * rng.range(0.55, 0.85)).toFixed(2));
    const pegRatio = Number(rng.range(0.8, 2.8).toFixed(2));

    const roe = seed.roe;
    const roce = Number((roe * rng.range(1.0, 1.35)).toFixed(2));
    const debtToEquity = seed.de;
    const currentRatio = Number(rng.range(1.1, 3.8).toFixed(2));
    const interestCoverage = Number(rng.range(4.0, 35.0).toFixed(1));
    const operatingMargin = Number(rng.range(12.0, 38.0).toFixed(2));
    const profitMargin = Number((operatingMargin * rng.range(0.5, 0.8)).toFixed(2));
    const revenueGrowth1Y = Number(rng.range(8.0, 32.0).toFixed(1));
    const profitGrowth1Y = Number(rng.range(10.0, 45.0).toFixed(1));
    const epsGrowth3Y = Number(rng.range(12.0, 35.0).toFixed(1));
    const freeCashFlow = Number((marketCap * rng.range(0.015, 0.07)).toFixed(2));

    const week52High = Number((price * rng.range(1.02, 1.35)).toFixed(2));
    const week52Low = Number((price * rng.range(0.55, 0.95)).toFixed(2));
    const distanceFrom52WHigh = Number((((price - week52High) / week52High) * 100).toFixed(2));
    const distanceFrom52WLow = Number((((price - week52Low) / week52Low) * 100).toFixed(2));

    const beta = Number(rng.range(0.65, 1.45).toFixed(2));
    const rsi14 = Number(rng.range(32, 78).toFixed(1));
    const sma20 = Number((price * rng.range(0.96, 1.04)).toFixed(2));
    const sma50 = Number((price * rng.range(0.92, 1.08)).toFixed(2));
    const sma200 = Number((price * rng.range(0.85, 1.15)).toFixed(2));
    const ema20 = Number((price * rng.range(0.97, 1.03)).toFixed(2));
    const ema50 = Number((price * rng.range(0.94, 1.06)).toFixed(2));
    const macd = Number(rng.range(-15, 25).toFixed(2));
    const macdSignal = Number((macd * rng.range(0.8, 1.1)).toFixed(2));
    const macdHist = Number((macd - macdSignal).toFixed(2));
    const upperBand = Number((price * 1.08).toFixed(2));
    const lowerBand = Number((price * 0.92).toFixed(2));

    const change1W = Number(rng.range(-6.5, 8.5).toFixed(2));
    const change1M = Number(rng.range(-12.0, 18.0).toFixed(2));
    const change1Y = Number(rng.range(-15.0, 95.0).toFixed(2));

    stocks.push({
      id: `stock-${seed.symbol.toLowerCase()}`,
      symbol: seed.symbol,
      name: seed.name,
      isin: `INE${Math.floor(rng.range(100, 999))}A010${Math.floor(rng.range(10, 99))}`,
      exchange: rng.next() > 0.15 ? 'NSE' : 'BSE',
      sector: seed.sector,
      industry: seed.industry,
      marketCapCategory: seed.mcap,
      price,
      previousClose,
      open,
      dayHigh,
      dayLow,
      change,
      changePercent,
      volume,
      avgVolume30D,
      deliveryPercent,
      volumeSpike,
      marketCap,
      pe,
      industryPe: Number((pe * rng.range(0.85, 1.15)).toFixed(1)),
      pb,
      evToEbitda,
      dividendYield,
      earningsPerShare: eps,
      bookValue,
      pegRatio,
      roe,
      roce,
      debtToEquity,
      currentRatio,
      interestCoverage,
      profitMargin,
      operatingMargin,
      revenueGrowth1Y,
      profitGrowth1Y,
      epsGrowth3Y,
      freeCashFlow,
      week52High,
      week52Low,
      distanceFrom52WHigh,
      distanceFrom52WLow,
      beta,
      rsi14,
      sma20,
      sma50,
      sma200,
      ema20,
      ema50,
      macd,
      macdSignal,
      macdHist,
      upperBand,
      lowerBand,
      change1W,
      change1M,
      change1Y,
      lastUpdated: 1700000000000 - rng.intRange(0, 30000),
    });
  }

  // 2. Procedurally generate the remaining stocks up to 5,000+
  let index = 1;
  while (stocks.length < count) {
    const sector = rng.choice(SECTORS);
    const industries = SECTOR_INDUSTRIES[sector];
    const industry = rng.choice(industries);
    const prefix = rng.choice(PREFIXES);
    const suffix = rng.choice(SUFFIXES);

    // Generate unique symbol
    let rawSymbol = (prefix.substring(0, 4) + suffix.substring(0, 4)).toUpperCase();
    if (usedSymbols.has(rawSymbol)) {
      rawSymbol = `${rawSymbol.substring(0, 6)}${index % 1000}`;
    }
    if (usedSymbols.has(rawSymbol)) {
      rawSymbol = `EQ${index}`;
    }
    usedSymbols.add(rawSymbol);

    const name = `${prefix} ${suffix} India Ltd.`;
    const mcapCategoryRandom = rng.next();
    let marketCapCategory: MarketCapCategory = 'Micro Cap';
    let marketCap = 0;

    if (mcapCategoryRandom < 0.05) {
      marketCapCategory = 'Large Cap';
      marketCap = Number(rng.range(50000, 450000).toFixed(2));
    } else if (mcapCategoryRandom < 0.25) {
      marketCapCategory = 'Mid Cap';
      marketCap = Number(rng.range(15000, 49999).toFixed(2));
    } else if (mcapCategoryRandom < 0.65) {
      marketCapCategory = 'Small Cap';
      marketCap = Number(rng.range(2500, 14999).toFixed(2));
    } else {
      marketCapCategory = 'Micro Cap';
      marketCap = Number(rng.range(50, 2499).toFixed(2));
    }

    // Realistic price modeling
    const price = Number(rng.range(15, 6500).toFixed(2));
    const changePercent = Number(rng.range(-8.5, 9.5).toFixed(2));
    const change = Number((price * (changePercent / 100)).toFixed(2));
    const previousClose = Number((price - change).toFixed(2));
    const open = Number((previousClose * rng.range(0.985, 1.015)).toFixed(2));
    const dayHigh = Number(Math.max(price, open, previousClose * rng.range(1.005, 1.045)).toFixed(2));
    const dayLow = Number(Math.min(price, open, previousClose * rng.range(0.955, 0.995)).toFixed(2));

    const volume = Math.floor(rng.range(5000, 3500000));
    const avgVolume30D = Math.floor(volume * rng.range(0.5, 2.0));
    const volumeSpike = Number((volume / (avgVolume30D || 1)).toFixed(2));
    const deliveryPercent = Number(rng.range(15, 88).toFixed(1));

    // Sector-based realistic P/E & ratios
    let baseSectorPE = 25.0;
    if (sector === 'Information Technology') baseSectorPE = 32.0;
    else if (sector === 'Banking & Financial Services') baseSectorPE = 16.0;
    else if (sector === 'Metals & Mining') baseSectorPE = 10.0;
    else if (sector === 'Fast Moving Consumer Goods') baseSectorPE = 45.0;
    else if (sector === 'Defense & Aerospace') baseSectorPE = 40.0;
    else if (sector === 'Pharmaceuticals & Healthcare') baseSectorPE = 35.0;
    else if (sector === 'Real Estate & Realty') baseSectorPE = 38.0;

    const pe = Math.max(4.5, Number((baseSectorPE * rng.range(0.4, 2.2)).toFixed(1)));
    const eps = Number((price / pe).toFixed(2));
    const pb = Math.max(0.5, Number(rng.range(0.8, 14.0).toFixed(2)));
    const bookValue = Number((price / pb).toFixed(2));
    const dividendYield = Number(rng.range(0.0, 5.5).toFixed(2));
    const evToEbitda = Math.max(3.0, Number((pe * rng.range(0.5, 0.9)).toFixed(1)));
    const pegRatio = Number(rng.range(0.4, 3.5).toFixed(2));

    const roe = Number(rng.range(-5.0, 42.0).toFixed(1));
    const roce = Number((roe * rng.range(0.9, 1.4)).toFixed(1));
    const debtToEquity = Number(rng.range(0.0, 2.5).toFixed(2));
    const currentRatio = Number(rng.range(0.8, 4.5).toFixed(2));
    const interestCoverage = Number(rng.range(1.2, 40.0).toFixed(1));
    const operatingMargin = Number(rng.range(-5.0, 45.0).toFixed(1));
    const profitMargin = Number((operatingMargin * rng.range(0.4, 0.75)).toFixed(1));
    const revenueGrowth1Y = Number(rng.range(-15.0, 65.0).toFixed(1));
    const profitGrowth1Y = Number(rng.range(-25.0, 95.0).toFixed(1));
    const epsGrowth3Y = Number(rng.range(-10.0, 50.0).toFixed(1));
    const freeCashFlow = Number((marketCap * rng.range(-0.02, 0.08)).toFixed(2));

    const week52High = Number((price * rng.range(1.01, 1.65)).toFixed(2));
    const week52Low = Number((price * rng.range(0.45, 0.98)).toFixed(2));
    const distanceFrom52WHigh = Number((((price - week52High) / week52High) * 100).toFixed(2));
    const distanceFrom52WLow = Number((((price - week52Low) / week52Low) * 100).toFixed(2));

    const beta = Number(rng.range(0.45, 2.1).toFixed(2));
    const rsi14 = Number(rng.range(18, 86).toFixed(1));
    const sma20 = Number((price * rng.range(0.92, 1.08)).toFixed(2));
    const sma50 = Number((price * rng.range(0.88, 1.12)).toFixed(2));
    const sma200 = Number((price * rng.range(0.80, 1.25)).toFixed(2));
    const ema20 = Number((price * rng.range(0.94, 1.06)).toFixed(2));
    const ema50 = Number((price * rng.range(0.90, 1.10)).toFixed(2));
    const macd = Number(rng.range(-30, 30).toFixed(2));
    const macdSignal = Number((macd * rng.range(0.75, 1.15)).toFixed(2));
    const macdHist = Number((macd - macdSignal).toFixed(2));
    const upperBand = Number((price * 1.1).toFixed(2));
    const lowerBand = Number((price * 0.9).toFixed(2));

    const change1W = Number(rng.range(-12.0, 14.0).toFixed(2));
    const change1M = Number(rng.range(-22.0, 32.0).toFixed(2));
    const change1Y = Number(rng.range(-45.0, 180.0).toFixed(2));

    stocks.push({
      id: `stock-${rawSymbol.toLowerCase()}`,
      symbol: rawSymbol,
      name,
      isin: `INE${Math.floor(rng.range(100, 999))}A010${Math.floor(rng.range(10, 99))}`,
      exchange: rng.next() > 0.2 ? 'NSE' : 'BSE',
      sector,
      industry,
      marketCapCategory,
      price,
      previousClose,
      open,
      dayHigh,
      dayLow,
      change,
      changePercent,
      volume,
      avgVolume30D,
      deliveryPercent,
      volumeSpike,
      marketCap,
      pe,
      industryPe: Number((baseSectorPE * rng.range(0.9, 1.1)).toFixed(1)),
      pb,
      evToEbitda,
      dividendYield,
      earningsPerShare: eps,
      bookValue,
      pegRatio,
      roe,
      roce,
      debtToEquity,
      currentRatio,
      interestCoverage,
      profitMargin,
      operatingMargin,
      revenueGrowth1Y,
      profitGrowth1Y,
      epsGrowth3Y,
      freeCashFlow,
      week52High,
      week52Low,
      distanceFrom52WHigh,
      distanceFrom52WLow,
      beta,
      rsi14,
      sma20,
      sma50,
      sma200,
      ema20,
      ema50,
      macd,
      macdSignal,
      macdHist,
      upperBand,
      lowerBand,
      change1W,
      change1M,
      change1Y,
      lastUpdated: 1700000000000 - rng.intRange(0, 60000),
    });

    index++;
  }

  return stocks;
}

/**
 * Generates 252 trading days (1 standard Indian market year) of realistic OHLCV data
 */
export function generate252DayOHLCV(currentPrice: number, symbol: string): OHLCV[] {
  // Hash the symbol to create deterministic seed per stock
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = (hash << 5) - hash + symbol.charCodeAt(i);
    hash |= 0;
  }
  const rng = new SeededRandom(Math.abs(hash) + 777);

  const numDays = 252;
  const candles: OHLCV[] = [];

  // Start from approximately 1 year ago, skipping weekends
  const endDate = new Date('2026-10-02');
  const dates: string[] = [];
  const cur = new Date(endDate);

  while (dates.length < numDays) {
    const dayOfWeek = cur.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Format as YYYY-MM-DD
      const yyyy = cur.getFullYear();
      const mm = String(cur.getMonth() + 1).padStart(2, '0');
      const dd = String(cur.getDate()).padStart(2, '0');
      dates.unshift(`${yyyy}-${mm}-${dd}`);
    }
    cur.setDate(cur.getDate() - 1);
  }

  // Work backwards from currentPrice or forward with a realistic drift
  const annualVolatility = rng.range(0.22, 0.45);
  const dailyVolatility = annualVolatility / Math.sqrt(252);
  const drift = rng.range(-0.08, 0.28) / 252; // annualized drift converted to daily

  let price = currentPrice * Math.exp(-drift * numDays + (rng.range(-0.15, 0.15)));
  price = Math.max(5, price);

  for (let i = 0; i < numDays; i++) {
    const dateStr = dates[i];
    const isLastDay = i === numDays - 1;

    let dayClose: number;
    if (isLastDay) {
      dayClose = currentPrice;
    } else {
      // Geometric random walk with drift
      const shock = (rng.next() + rng.next() + rng.next() - 1.5) * 2; // Approximate normal dist
      const ret = drift + dailyVolatility * shock;
      dayClose = Math.max(5, price * Math.exp(ret));
    }

    const open = i === 0 ? price : candles[i - 1].close * (1 + rng.range(-0.008, 0.008));
    const high = Math.max(open, dayClose) * (1 + rng.range(0.002, 0.025));
    const low = Math.min(open, dayClose) * (1 - rng.range(0.002, 0.025));
    const baseVol = Math.floor(rng.range(50000, 3500000));
    // Volume spikes on high return days
    const returnAbs = Math.abs((dayClose - open) / open);
    const volume = Math.floor(baseVol * (1 + returnAbs * 15));

    candles.push({
      time: dateStr,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(dayClose.toFixed(2)),
      volume,
    });

    price = dayClose;
  }

  return candles;
}

// In-memory singleton cached stock database
let cachedStockQuotes: StockQuote[] | null = null;

export function getCachedStockQuotes(count: number = 5000): StockQuote[] {
  if (!cachedStockQuotes || cachedStockQuotes.length !== count) {
    cachedStockQuotes = generateRealisticStockQuotes(count);
  }
  return cachedStockQuotes;
}
