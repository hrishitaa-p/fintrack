const axios = require("axios");

// ─────────────────────────────────────────────
// DAY 5: In-memory cache (same pattern as Finnhub)
// CoinGecko free tier: ~30 req/min — cache helps
// ─────────────────────────────────────────────

const cache = {};
const CACHE_TTL = 60000; // 60 seconds

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
// Ticker → CoinGecko ID mapping
// CoinGecko uses IDs like "bitcoin", not "BTC"
// Add more as needed
// ─────────────────────────────────────────────

const TICKER_TO_ID = {
  btc: "bitcoin",
  eth: "ethereum",
  sol: "solana",
  doge: "dogecoin",
  ada: "cardano",
  bnb: "binancecoin",
  xrp: "ripple",
  avax: "avalanche-2",
  dot: "polkadot",
  matic: "matic-network",
  // Already correct IDs pass through:
  bitcoin: "bitcoin",
  ethereum: "ethereum",
  solana: "solana",
  dogecoin: "dogecoin",
  cardano: "cardano",
};

function resolveId(input) {
  const lower = input.toLowerCase();
  return TICKER_TO_ID[lower] || lower; // fallback: use as-is
}

// ─────────────────────────────────────────────
// CoinGecko crypto price
// Docs: https://www.coingecko.com/api/documentation
// Endpoint: /simple/price
// Returns: { symbol, price, prevClose, change, percentChange, type }
// ─────────────────────────────────────────────

async function getCryptoPrice(input) {
  const coinId = resolveId(input);
  const cacheKey = `crypto_${coinId}`;
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[cache HIT] ${coinId}`);
    return cached;
  }

  console.log(`[cache MISS] fetching ${coinId} from CoinGecko`);

  const response = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price",
    {
      params: {
        ids: coinId,
        vs_currencies: "usd",
        include_24hr_change: true,
        include_24hr_vol: true,
      },
    }
  );

  const data = response.data[coinId];

  if (!data) {
    throw new Error(
      `Coin "${input}" not found on CoinGecko. Try using the full ID (e.g. "bitcoin" not "BTC")`
    );
  }

  const price = data.usd;
  const percentChange = parseFloat(data.usd_24h_change.toFixed(2));
  const change = parseFloat(((price * percentChange) / (100 + percentChange)).toFixed(2));
  const prevClose = parseFloat((price - change).toFixed(2));

  const result = {
    symbol: coinId,
    price: price,
    prevClose: prevClose,
    change: change,
    percentChange: percentChange,
    type: "crypto",
  };

  setCache(cacheKey, result);
  return result;
}

module.exports = { getCryptoPrice, resolveId };