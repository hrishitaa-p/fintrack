import { useMemo, useState } from "react";
import { getPrice } from "./api";
import "./App.css";

function App() {
  const [symbol, setSymbol] = useState("AAPL");
  const [type, setType] = useState("stock");
  const [priceData, setPriceData] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [holdingSymbol, setHoldingSymbol] = useState("AAPL");
  const [holdingType, setHoldingType] = useState("stock");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [holdings, setHoldings] = useState([]);
  const [portfolioError, setPortfolioError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setSearchError("");
    setPriceData(null);
    setIsSearching(true);

    try {
      const data = await getPrice(symbol, type);
      setPriceData(data);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleAddHolding(e) {
    e.preventDefault();
    setPortfolioError("");

    const parsedQuantity = Number(quantity);
    const parsedBuyPrice = Number(buyPrice);

    if (!holdingSymbol.trim()) {
      setPortfolioError("Enter a symbol.");
      return;
    }

    if (parsedQuantity <= 0 || parsedBuyPrice <= 0) {
      setPortfolioError("Quantity and buy price must be greater than 0.");
      return;
    }

    setIsAdding(true);

    try {
      const liveData = await getPrice(holdingSymbol, holdingType);

      const costBasis = parsedQuantity * parsedBuyPrice;
      const currentValue = parsedQuantity * liveData.price;
      const profitLoss = currentValue - costBasis;
      const profitLossPercent = (profitLoss / costBasis) * 100;
      const dailyChange = liveData.change * parsedQuantity;

      const newHolding = {
        id: crypto.randomUUID(),
        symbol:
          holdingType === "crypto"
            ? holdingSymbol.toLowerCase()
            : holdingSymbol.toUpperCase(),
        type: holdingType,
        quantity: parsedQuantity,
        buyPrice: parsedBuyPrice,
        livePrice: liveData.price,
        costBasis,
        currentValue,
        profitLoss,
        profitLossPercent,
        dailyChange,
        dailyChangePercent: liveData.percentChange,
      };

      setHoldings((prev) => [newHolding, ...prev]);
      setQuantity("");
      setBuyPrice("");
    } catch (err) {
      setPortfolioError(err.message);
    } finally {
      setIsAdding(false);
    }
  }

  function removeHolding(id) {
    setHoldings((prev) => prev.filter((holding) => holding.id !== id));
  }

  const summary = useMemo(() => {
    const totalInvested = holdings.reduce((sum, h) => sum + h.costBasis, 0);
    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalProfitLoss = totalValue - totalInvested;
    const totalReturn =
      totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
    const totalDailyChange = holdings.reduce((sum, h) => sum + h.dailyChange, 0);

    return {
      totalInvested,
      totalValue,
      totalProfitLoss,
      totalReturn,
      totalDailyChange,
    };
  }, [holdings]);

  const topAssets = holdings.slice(0, 4);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">F</div>
          <div>
            <h1>FinTrack</h1>
            <p>Smart Portfolio</p>
          </div>
        </div>

        <nav className="nav-menu">
          <a className="active">Dashboard</a>
          <a>Market</a>
          <a>Portfolio</a>
          <a>Watchlist</a>
          <a>Analytics</a>
        </nav>

        <div className="sidebar-card">
          <p className="small-label">Portfolio Health</p>
          <h3>{summary.totalReturn >= 0 ? "Positive" : "Needs Review"}</h3>
          <p>
            Your current return is{" "}
            <span className={summary.totalReturn >= 0 ? "green" : "red"}>
              {summary.totalReturn.toFixed(2)}%
            </span>
          </p>
        </div>
      </aside>

      <main className="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2>Investment Dashboard</h2>
          </div>

          <div className="status-pill">
            <span className="pulse"></span>
            Mock API Live
          </div>
        </header>

        <section className="summary-grid">
          <SummaryCard
            label="Total Invested"
            value={`$${summary.totalInvested.toFixed(2)}`}
          />
          <SummaryCard
            label="Current Value"
            value={`$${summary.totalValue.toFixed(2)}`}
          />
          <SummaryCard
            label="Profit / Loss"
            value={`$${summary.totalProfitLoss.toFixed(2)}`}
            trend={summary.totalProfitLoss}
          />
          <SummaryCard
            label="Total Return"
            value={`${summary.totalReturn.toFixed(2)}%`}
            trend={summary.totalReturn}
          />
        </section>

        <section className="main-grid">
          <div className="panel market-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Market Search</p>
                <h3>Search Stock or Crypto</h3>
              </div>
            </div>

            <form className="search-form" onSubmit={handleSearch}>
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="AAPL, TSLA, bitcoin"
              />

              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="stock">Stock</option>
                <option value="crypto">Crypto</option>
              </select>

              <button type="submit" disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </button>
            </form>

            {searchError && <p className="error-message">{searchError}</p>}

            {priceData ? (
              <div className="price-result">
                <div>
                  <p className="small-label">{priceData.type}</p>
                  <h2>{priceData.symbol}</h2>
                  <p className="big-price">${Number(priceData.price).toFixed(2)}</p>
                </div>

                <div className="price-stats">
                  <Stat label="Previous Close" value={`$${priceData.prevClose}`} />
                  <Stat
                    label="Change"
                    value={`${priceData.change >= 0 ? "+" : ""}${priceData.change}`}
                    trend={priceData.change}
                  />
                  <Stat
                    label="Percent Change"
                    value={`${priceData.percentChange >= 0 ? "+" : ""}${priceData.percentChange}%`}
                    trend={priceData.percentChange}
                  />
                </div>
              </div>
            ) : (
              <div className="empty-state">
                Search for an asset to view live price data.
              </div>
            )}
          </div>

          <div className="panel chart-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Performance</p>
                <h3>Portfolio Overview</h3>
              </div>
            </div>

            <div className="fake-chart">
              {[45, 58, 51, 66, 73, 69, 84, 78, 92, 88, 96, 91].map(
                (height, index) => (
                  <span key={index} style={{ height: `${height}%` }}></span>
                )
              )}
            </div>

            <div className="chart-footer">
              <p>Total daily change</p>
              <strong
                className={summary.totalDailyChange >= 0 ? "green" : "red"}
              >
                ${summary.totalDailyChange.toFixed(2)}
              </strong>
            </div>
          </div>
        </section>

        <section className="main-grid bottom-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Add Holding</p>
                <h3>Build Your Portfolio</h3>
              </div>
            </div>

            <form className="portfolio-form" onSubmit={handleAddHolding}>
              <input
                value={holdingSymbol}
                onChange={(e) => setHoldingSymbol(e.target.value)}
                placeholder="Symbol"
              />

              <select
                value={holdingType}
                onChange={(e) => setHoldingType(e.target.value)}
              >
                <option value="stock">Stock</option>
                <option value="crypto">Crypto</option>
              </select>

              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Quantity"
              />

              <input
                type="number"
                step="any"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="Buy Price"
              />

              <button type="submit" disabled={isAdding}>
                {isAdding ? "Adding..." : "Add Holding"}
              </button>
            </form>

            {portfolioError && <p className="error-message">{portfolioError}</p>}

            <div className="top-assets">
              <h4>Top Assets</h4>

              {topAssets.length === 0 ? (
                <p className="muted">No holdings added yet.</p>
              ) : (
                topAssets.map((asset) => (
                  <div className="asset-row" key={asset.id}>
                    <div>
                      <strong>{asset.symbol}</strong>
                      <p>{asset.type}</p>
                    </div>
                    <span className={asset.profitLoss >= 0 ? "green" : "red"}>
                      {asset.profitLoss >= 0 ? "+" : ""}$
                      {asset.profitLoss.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel holdings-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Portfolio</p>
                <h3>Your Holdings</h3>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Qty</th>
                    <th>Buy</th>
                    <th>Live</th>
                    <th>P/L</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {holdings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table">
                        Add a holding to see it here.
                      </td>
                    </tr>
                  ) : (
                    holdings.map((holding) => (
                      <tr key={holding.id}>
                        <td>
                          <strong>{holding.symbol}</strong>
                          <span>{holding.type}</span>
                        </td>
                        <td>{holding.quantity}</td>
                        <td>${holding.buyPrice.toFixed(2)}</td>
                        <td>${holding.livePrice.toFixed(2)}</td>
                        <td
                          className={holding.profitLoss >= 0 ? "green" : "red"}
                        >
                          {holding.profitLoss >= 0 ? "+" : ""}$
                          {holding.profitLoss.toFixed(2)}
                          <span>
                            {holding.profitLossPercent >= 0 ? "+" : ""}
                            {holding.profitLossPercent.toFixed(2)}%
                          </span>
                        </td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => removeHolding(holding.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, trend }) {
  const hasTrend = typeof trend === "number";

  return (
    <div className="summary-card">
      <p>{label}</p>
      <h3 className={hasTrend ? (trend >= 0 ? "green" : "red") : ""}>
        {value}
      </h3>
    </div>
  );
}

function Stat({ label, value, trend }) {
  const hasTrend = typeof trend === "number";

  return (
    <div className="stat">
      <p>{label}</p>
      <strong className={hasTrend ? (trend >= 0 ? "green" : "red") : ""}>
        {value}
      </strong>
    </div>
  );
}

export default App;