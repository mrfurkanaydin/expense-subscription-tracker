// Investment Types

export type InvestmentType =
  | "metal"
  | "stock_us"
  | "stock_bist"
  | "fund"
  | "bes";

export interface Investment {
  id: string;
  user_id: string;
  type: InvestmentType;
  symbol: string;
  name: string;
  quantity: number;
  purchase_price: number;
  purchase_currency: string;
  purchase_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvestmentRequest {
  user_id: string;
  type: InvestmentType;
  symbol: string;
  name: string;
  quantity: number;
  purchase_price: number;
  purchase_currency: string;
  purchase_date: string;
  notes?: string;
}

// Market data types
export interface MarketPrice {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  high24h?: number;
  low24h?: number;
  lastUpdated: string;
  isCached?: boolean;
}

export interface PortfolioItem extends Investment {
  currentPrice: number;
  currentValue: number;
  totalCost: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
  byType: {
    type: InvestmentType;
    value: number;
    percentage: number;
  }[];
}

// Investment type labels
export const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  metal: "Değerli Maden",
  stock_us: "ABD Borsası",
  stock_bist: "Borsa İstanbul",
  fund: "Fon",
  bes: "BES",
};

// Investment type icons (emoji)
export const INVESTMENT_TYPE_ICONS: Record<InvestmentType, string> = {
  metal: "💎",
  stock_us: "🇺🇸",
  stock_bist: "🇹🇷",
  fund: "🏦",
  bes: "🏠",
};

// Investment type colors
export const INVESTMENT_TYPE_COLORS: Record<InvestmentType, string> = {
  metal: "#fbbf24", // Gold
  stock_us: "#3b82f6", // Blue
  stock_bist: "#ef4444", // Red
  fund: "#8b5cf6", // Purple
  bes: "#10b981", // Green
};

// Popular symbols by type
export const POPULAR_SYMBOLS: Record<
  InvestmentType,
  { symbol: string; name: string }[]
> = {
  metal: [
    // Türkiye Altın Türleri
    { symbol: "GRAM_ALTIN", name: "Gram Altın" },
    { symbol: "CEYREK_ALTIN", name: "Çeyrek Altın" },
    { symbol: "YARIM_ALTIN", name: "Yarım Altın" },
    { symbol: "TAM_ALTIN", name: "Tam Altın (Ziynet)" },
    { symbol: "CUMHURIYET", name: "Cumhuriyet Altını" },
    { symbol: "ATA_ALTIN", name: "Ata Altın" },
    { symbol: "RESAT_ALTIN", name: "Reşat Altın" },
    { symbol: "HAMIT_ALTIN", name: "Hamit Altın" },
    { symbol: "BILEZIK_14", name: "14 Ayar Bilezik (gr)" },
    { symbol: "BILEZIK_22", name: "22 Ayar Bilezik (gr)" },
    // Gümüş
    { symbol: "GUMUS_GRAM", name: "Gümüş (Gram)" },
    // Uluslararası
    { symbol: "ONS_ALTIN", name: "Ons Altın (USD)" },
    { symbol: "ONS_GUMUS", name: "Ons Gümüş (USD)" },
  ],
  stock_us: [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
    { symbol: "META", name: "Meta Platforms" },
  ],
  stock_bist: [
    { symbol: "THYAO", name: "Türk Hava Yolları" },
    { symbol: "SASA", name: "SASA Polyester" },
    { symbol: "ASELS", name: "Aselsan" },
    { symbol: "KCHOL", name: "Koç Holding" },
    { symbol: "AKBNK", name: "Akbank" },
    { symbol: "GARAN", name: "Garanti BBVA" },
    { symbol: "TUPRS", name: "Tüpraş" },
    { symbol: "EREGL", name: "Ereğli Demir Çelik" },
  ],
  fund: [
    { symbol: "VOO", name: "Vanguard S&P 500 ETF" },
    { symbol: "QQQ", name: "Invesco QQQ Trust" },
    { symbol: "SPY", name: "SPDR S&P 500 ETF" },
  ],
  bes: [{ symbol: "BES", name: "Bireysel Emeklilik" }],
};
