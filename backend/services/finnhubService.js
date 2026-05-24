const axios = require("axios");
const cache = {};
const CACHE_TTL = 60000; // 60 seconds in ms

function getCached(key) {
  const item = cache[key];
  if (!item) return null;
  const isExpired = Date.now() - item.timestamp > CACHE_TTL;
  return isExpired ? null : item.data;
}

function setCache(key, data) {
  cache[key] = { data, timestamp: Date.now() };
}

// ─────────────────────────────────────────────
// Finnhub stock price
// Docs: https://finnhub.io/docs/api/quote
// Returns: { symbol, price, prevClose, change, percentChange, type }
// ─────────────────────────────────────────────

async function getStockPrice(symbol) {
  const cacheKey = `stock_${symbol}`;
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[cache HIT] ${symbol}`);
    return cached;
  }

  console.log(`[cache MISS] fetching ${symbol} from Finnhub`);

  const response = await axios.get("https://finnhub.io/api/v1/quote", {
    params: {
      symbol: symbol,
      token: process.env.FINNHUB_API_KEY,
    },
  });

  const q = response.data;

  // Finnhub returns 0s for invalid symbols — catch it
  if (!q.c || q.c === 0) {
    throw new Error(`Symbol "${symbol}" not found on Finnhub`);
  }

  const result = {
    symbol: symbol,
    price: q.c,           // current price
    prevClose: q.pc,      // previous close
    open: q.o,            // open price
    high: q.h,            // day high
    low: q.l,             // day low
    change: parseFloat((q.c - q.pc).toFixed(2)),
    percentChange: parseFloat(q.dp.toFixed(2)),
    type: "stock",
  };

  setCache(cacheKey, result);
  return result;
}

module.exports = { getStockPrice };