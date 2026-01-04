import type { MarketPrice } from "../types/investments";

// Cache for market prices (to avoid excessive API calls)
const priceCache = new Map<string, { price: MarketPrice; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute cache

// USD/TRY exchange rate
let usdTryRate = 35.0; // Reasonable default
let usdTryLastUpdate = 0;

// Turkish gold price cache
let goldPricesCache: Record<string, MarketPrice> = {};
let goldPricesLastUpdate = 0;

/**
 * Fetch stock price via our Next.js API route (avoids CORS)
 */
async function fetchStockPrice(symbol: string): Promise<MarketPrice | null> {
  try {
    const response = await fetch(
      `http://localhost:8080/market/stock?symbol=${encodeURIComponent(symbol)}`
    );

    if (!response.ok) {
      console.error(`Market API error for ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.error) {
      console.error(`Market API error for ${symbol}: ${data.error}`);
      return null;
    }

    // Capture cache status from header or data
    const cacheHeader = response.headers.get("X-Cache-Status");
    if (cacheHeader === "HIT" || data.isCached) {
      console.log(`[Cache HIT] ${symbol}`);
    } else {
      console.log(`[Cache MISS] ${symbol}`);
    }

    return {
      symbol: data.symbol,
      name: data.name,
      price: data.price,
      currency: data.currency,
      change: data.change,
      changePercent: data.changePercent,
      lastUpdated: data.lastUpdated,
      isCached: data.isCached || cacheHeader === "HIT",
    };
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch Turkish gold prices via our Next.js API route
 */
async function fetchTurkishGoldPrices(): Promise<Record<string, MarketPrice>> {
  // Return cached if fresh
  if (
    Date.now() - goldPricesLastUpdate < CACHE_TTL &&
    Object.keys(goldPricesCache).length > 0
  ) {
    return goldPricesCache;
  }

  try {
    const response = await fetch("http://localhost:8080/market/gold");

    if (!response.ok) {
      console.error("Gold API error:", response.status);
      return goldPricesCache;
    }

    const data = await response.json();

    if (data.error) {
      console.error("Gold API error:", data.error);
      return goldPricesCache;
    }

    // Capture cache status from header
    const cacheHeader = response.headers.get("X-Cache-Status");
    if (cacheHeader === "HIT") {
      console.log("[Cache HIT] Turkish Gold Prices");
    } else {
      console.log("[Cache MISS] Turkish Gold Prices");
    }

    // Process data to include isCached flag
    const processedData: Record<string, MarketPrice> = {};
    Object.keys(data).forEach((symbol) => {
      processedData[symbol] = {
        ...data[symbol],
        isCached: data[symbol].isCached || cacheHeader === "HIT",
      };
    });

    goldPricesCache = processedData;
    goldPricesLastUpdate = Date.now();

    return processedData;
  } catch (error) {
    console.error("Error fetching gold prices:", error);
    return goldPricesCache;
  }
}

/**
 * Fetch USD/TRY exchange rate
 */
async function fetchUsdTryRate(): Promise<number> {
  if (Date.now() - usdTryLastUpdate < CACHE_TTL) {
    return usdTryRate;
  }

  try {
    const response = await fetch(
      "http://localhost:8080/market/stock?symbol=USDTRY=X"
    );

    if (response.ok) {
      const data = await response.json();
      if (data.price) {
        usdTryRate = data.price;
        usdTryLastUpdate = Date.now();
      }
    }
  } catch (error) {
    console.error("Error fetching USD/TRY rate:", error);
  }

  return usdTryRate;
}

/**
 * Get market price for a symbol (with caching)
 */
export async function getMarketPriceAsync(
  symbol: string
): Promise<MarketPrice | null> {
  const upperSymbol = symbol.toUpperCase();

  // Check cache first
  const cached = priceCache.get(upperSymbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.price;
  }

  let price: MarketPrice | null = null;

  // Determine which API to use based on symbol
  if (isTurkishGoldSymbol(upperSymbol)) {
    const goldPrices = await fetchTurkishGoldPrices();
    price = goldPrices[upperSymbol] || null;
  } else {
    // Use our API route for stocks
    price = await fetchStockPrice(upperSymbol);
  }

  // Cache the result
  if (price) {
    priceCache.set(upperSymbol, { price, timestamp: Date.now() });
  }

  return price;
}

/**
 * Get market prices for multiple symbols
 */
export async function getMarketPricesAsync(
  symbols: string[]
): Promise<Map<string, MarketPrice>> {
  const prices = new Map<string, MarketPrice>();

  // Separate Turkish gold symbols from stock symbols
  const turkishGoldSymbols = symbols.filter((s) =>
    isTurkishGoldSymbol(s.toUpperCase())
  );
  const stockSymbols = symbols.filter(
    (s) => !isTurkishGoldSymbol(s.toUpperCase())
  );

  // Fetch Turkish gold prices in one batch
  if (turkishGoldSymbols.length > 0) {
    const goldPrices = await fetchTurkishGoldPrices();
    for (const symbol of turkishGoldSymbols) {
      const price = goldPrices[symbol.toUpperCase()];
      if (price) {
        prices.set(symbol.toUpperCase(), price);
        priceCache.set(symbol.toUpperCase(), { price, timestamp: Date.now() });
      }
    }
  }

  // Fetch stock prices (parallel requests)
  const stockPromises = stockSymbols.map(async (symbol) => {
    const price = await getMarketPriceAsync(symbol);
    if (price) {
      prices.set(symbol.toUpperCase(), price);
    }
  });

  await Promise.all(stockPromises);

  return prices;
}

/**
 * Synchronous fallback for immediate rendering (uses cache or returns null)
 */
export function getMarketPrice(symbol: string): MarketPrice | null {
  const upperSymbol = symbol.toUpperCase();
  const cached = priceCache.get(upperSymbol);

  if (cached) {
    // Trigger async refresh in background if cache is old
    if (Date.now() - cached.timestamp > CACHE_TTL / 2) {
      getMarketPriceAsync(upperSymbol).catch(console.error);
    }
    return cached.price;
  }

  // Check gold cache
  if (isTurkishGoldSymbol(upperSymbol) && goldPricesCache[upperSymbol]) {
    return goldPricesCache[upperSymbol];
  }

  // Trigger async fetch
  getMarketPriceAsync(upperSymbol).catch(console.error);
  return null;
}

/**
 * Synchronous version for immediate use
 */
export function getMarketPrices(symbols: string[]): Map<string, MarketPrice> {
  const prices = new Map<string, MarketPrice>();

  for (const symbol of symbols) {
    const price = getMarketPrice(symbol);
    if (price) {
      prices.set(symbol.toUpperCase(), price);
    }
  }

  // Trigger async fetch for all symbols
  getMarketPricesAsync(symbols).catch(console.error);

  return prices;
}

/**
 * Check if symbol is a Turkish gold type
 */
function isTurkishGoldSymbol(symbol: string): boolean {
  const turkishGoldSymbols = [
    "GRAM_ALTIN",
    "CEYREK_ALTIN",
    "YARIM_ALTIN",
    "TAM_ALTIN",
    "CUMHURIYET",
    "ATA_ALTIN",
    "RESAT_ALTIN",
    "HAMIT_ALTIN",
    "BILEZIK_14",
    "BILEZIK_22",
    "GUMUS_GRAM",
    "ONS_ALTIN",
    "ONS_GUMUS",
  ];
  return turkishGoldSymbols.includes(symbol.toUpperCase());
}

/**
 * Convert price to TRY
 */
export async function convertToTRYAsync(
  amount: number,
  currency: string
): Promise<number> {
  if (currency === "TRY") return amount;
  if (currency === "USD") {
    const rate = await fetchUsdTryRate();
    return amount * rate;
  }
  return amount;
}

/**
 * Synchronous convert (uses cached rate)
 */
export function convertToTRY(amount: number, currency: string): number {
  if (currency === "TRY") return amount;
  if (currency === "USD") return amount * usdTryRate;
  return amount;
}

/**
 * Get USD/TRY exchange rate
 */
export function getUsdTryRate(): number {
  // Trigger async update
  fetchUsdTryRate().catch(console.error);
  return usdTryRate;
}

/**
 * Generate sparkline data (from historical data or mock)
 */
export function generateSparklineData(
  currentPrice: number,
  volatility: number = 0.02
): number[] {
  const days = 7;
  const data: number[] = [];
  let price = currentPrice * (1 - volatility * 3);

  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.4) * volatility * currentPrice;
    price = Math.max(price + change, currentPrice * 0.9);
    data.push(Number(price.toFixed(2)));
  }

  data[data.length - 1] = currentPrice;
  return data;
}

/**
 * Force refresh all cached prices
 */
export function clearPriceCache(): void {
  priceCache.clear();
  goldPricesCache = {};
  goldPricesLastUpdate = 0;
}
