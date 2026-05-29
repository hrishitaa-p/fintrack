const express = require("express");
const router = express.Router();
const { getStockPrice } = require("../services/finnhubService");
const { getCryptoPrice } = require("../services/coingeckoService");

router.post("/portfolio/calculate", async (req, res) => {
  const { holdings } = req.body;

  if (!holdings || !Array.isArray(holdings)) {
    return res.status(400).json({ error: "holdings array is required" });
  }

  try {
    // Fetch live prices for all holdings in parallel
    const pricePromises = holdings.map((h) => {
      if (h.type === "crypto") {
        return getCryptoPrice(h.symbol.toLowerCase());
      } else {
        return getStockPrice(h.symbol.toUpperCase());
      }
    });

    const prices = await Promise.all(pricePromises);

    // Calculate P/L for each holding
    const results = holdings.map((holding, i) => {
      const livePrice = prices[i].price;
      const costBasis = holding.buyPrice * holding.quantity;
      const currentValue = livePrice * holding.quantity;
      const profitLoss = currentValue - costBasis;
      const profitLossPercent = (profitLoss / costBasis) * 100;
      const dailyChange = prices[i].change * holding.quantity;

      return {
        symbol: holding.symbol,
        type: holding.type,
        quantity: holding.quantity,
        buyPrice: holding.buyPrice,
        livePrice: livePrice,
        costBasis: parseFloat(costBasis.toFixed(2)),
        currentValue: parseFloat(currentValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        profitLossPercent: parseFloat(profitLossPercent.toFixed(2)),
        dailyChange: parseFloat(dailyChange.toFixed(2)),
        dailyChangePercent: prices[i].percentChange,
      };
    });

    // Portfolio-level summary
    const totalInvested = results.reduce((sum, h) => sum + h.costBasis, 0);
    const totalValue = results.reduce((sum, h) => sum + h.currentValue, 0);
    const totalProfitLoss = totalValue - totalInvested;
    const totalReturn = (totalProfitLoss / totalInvested) * 100;
    const totalDailyChange = results.reduce((sum, h) => sum + h.dailyChange, 0);

    res.json({
      summary: {
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        totalValue: parseFloat(totalValue.toFixed(2)),
        totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
        totalReturn: parseFloat(totalReturn.toFixed(2)),
        totalDailyChange: parseFloat(totalDailyChange.toFixed(2)),
      },
      holdings: results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;