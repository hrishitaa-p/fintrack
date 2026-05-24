const express = require("express");
const router = express.Router();
const { getStockPrice } = require("../services/finnhubService");
const { getCryptoPrice } = require("../services/coingeckoService");

const CRYPTO_SYMBOLS = ["BTC","ETH","SOL","DOGE","ADA","BNB","XRP","AVAX","DOT","MATIC"];

router.get("/price/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const isCrypto = req.query.type === "crypto" || CRYPTO_SYMBOLS.includes(symbol.toUpperCase());

  try {
    const data = isCrypto
      ? await getCryptoPrice(symbol.toLowerCase())
      : await getStockPrice(symbol.toUpperCase());
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/mock/stock/:symbol", (req, res) => {
  res.json({
    symbol: req.params.symbol.toUpperCase(),
    price: 190.25,
    prevClose: 188.15,
    change: 2.10,
    percentChange: 1.12,
    type: "stock",
  });
});

router.get("/mock/crypto/:coinId", (req, res) => {
  res.json({
    symbol: req.params.coinId,
    price: 68000.00,
    prevClose: 66500.00,
    change: 1500.00,
    percentChange: 2.26,
    type: "crypto",
  });
});

router.get("/stock/:symbol", async (req, res) => {
  try {
    const data = await getStockPrice(req.params.symbol.toUpperCase());
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/crypto/:coinId", async (req, res) => {
  try {
    const data = await getCryptoPrice(req.params.coinId.toLowerCase());
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/price/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const { type } = req.query;

  try {
    let data;
    if (type === "crypto") {
      data = await getCryptoPrice(symbol.toLowerCase());
    } else {
      data = await getStockPrice(symbol.toUpperCase());
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;