# FinTrack API Documentation

## Overview

The FinTrack API provides live stock and cryptocurrency price data, along with portfolio profit/loss calculations. It integrates with **Finnhub** for stock data and **CoinGecko** for crypto data, with built-in caching to manage API rate limits.

**Base URL (local development):**
```
http://localhost:3001
```

---

## Endpoints

### Health Check
```
GET /
```
Returns a confirmation that the server is running.

**Response:**
```json
{ "message": "FinTrack API is running" }
```

---

### Stock Price
```
GET /api/stock/:symbol
```
Returns live stock price data from Finnhub.

**Example:**
```
GET /api/stock/AAPL
GET /api/stock/TSLA
GET /api/stock/NVDA
```

**Response:**
```json
{
  "symbol": "AAPL",
  "price": 308.82,
  "prevClose": 304.99,
  "open": 306.12,
  "high": 311.40,
  "low": 305.84,
  "change": 3.83,
  "percentChange": 1.26,
  "type": "stock"
}
```

---

### Crypto Price
```
GET /api/crypto/:coinId
```
Returns live crypto price data from CoinGecko. Use the full coin ID (e.g. `bitcoin`, not `BTC`).

**Example:**
```
GET /api/crypto/bitcoin
GET /api/crypto/ethereum
GET /api/crypto/solana
```

**Supported coins:**
| Coin ID | Coin |
|---|---|
| bitcoin | Bitcoin |
| ethereum | Ethereum |
| solana | Solana |
| dogecoin | Dogecoin |
| cardano | Cardano |

**Response:**
```json
{
  "symbol": "bitcoin",
  "price": 76583,
  "prevClose": 76744.16,
  "change": -161.16,
  "percentChange": -0.21,
  "type": "crypto"
}
```

---

### Universal Price Lookup
```
GET /api/price/:symbol
```
Works for both stocks and crypto — no need to specify type. Known crypto tickers (BTC, ETH, SOL, etc.) are auto-detected.

**Example:**
```
GET /api/price/AAPL    → fetches from Finnhub (stock)
GET /api/price/BTC     → fetches from CoinGecko (crypto)
GET /api/price/ETH     → fetches from CoinGecko (crypto)
GET /api/price/TSLA    → fetches from Finnhub (stock)
```

You can also force the type with a query param:
```
GET /api/price/BTC?type=crypto
GET /api/price/AAPL?type=stock
```

**Response:** Same shape as stock or crypto endpoints above, with correct `type` field.

---

### Portfolio P/L Calculator
```
POST /api/portfolio/calculate
```
Accepts an array of holdings and returns current value, cost basis, profit/loss, and daily change for each asset plus a full portfolio summary.

**Request body:**
```json
{
  "holdings": [
    {
      "symbol": "AAPL",
      "type": "stock",
      "quantity": 2,
      "buyPrice": 180
    },
    {
      "symbol": "bitcoin",
      "type": "crypto",
      "quantity": 0.02,
      "buyPrice": 65000
    }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| symbol | string | yes | Stock ticker or crypto coin ID |
| type | string | yes | `"stock"` or `"crypto"` |
| quantity | number | yes | Number of shares or coins owned |
| buyPrice | number | yes | Price paid per share/coin |

**Response:**
```json
{
  "summary": {
    "totalInvested": 1660,
    "totalValue": 2149.26,
    "totalProfitLoss": 489.26,
    "totalReturn": 29.47,
    "totalDailyChange": 4.74
  },
  "holdings": [
    {
      "symbol": "AAPL",
      "type": "stock",
      "quantity": 2,
      "buyPrice": 180,
      "livePrice": 308.82,
      "costBasis": 360,
      "currentValue": 617.64,
      "profitLoss": 257.64,
      "profitLossPercent": 71.57,
      "dailyChange": 7.66,
      "dailyChangePercent": 1.26
    }
  ]
}
```

---

### Mock Endpoints (for frontend development)
These return hardcoded data — no API key needed. Use these while building the frontend UI.

```
GET /api/mock/stock/:symbol   → fake stock data
GET /api/mock/crypto/:coinId  → fake crypto data
```

**Response shape is identical to real endpoints** so switching from mock to real is a one-line URL change.

---

## Caching

Prices are cached in memory for **60 seconds** to avoid burning API rate limits. This means:
- The first request for a symbol hits the external API
- Subsequent requests within 60 seconds return the cached value
- The terminal logs `[cache HIT]` or `[cache MISS]` so you can see what's happening

---

## Environment Variables

Create a `.env` file in the `backend/` folder:

```
FINNHUB_API_KEY=your_key_here
PORT=3001
```

Never commit `.env` to GitHub. Get a free Finnhub key at https://finnhub.io.
CoinGecko does not require an API key for the free tier.

---

## Rate Limits

| API | Free Tier Limit | Strategy |
|---|---|---|
| Finnhub | 60 req/min | 60s cache |
| CoinGecko | ~30 req/min | 60s cache |

---

## Running Locally

```bash
cd backend
npm install
npm run dev
```

Server starts at `http://localhost:3001`.