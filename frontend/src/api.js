const API_BASE = "http://localhost:3001";

// Keep true for now because your teammate is handling real API key/backend.
// Later change this to false when real stock API is ready.
const USE_MOCK_API = true;

export async function getPrice(symbol, type) {
  const cleanSymbol =
    type === "crypto" ? symbol.toLowerCase().trim() : symbol.toUpperCase().trim();

  const endpoint = USE_MOCK_API
    ? type === "crypto"
      ? `${API_BASE}/api/prices/mock/crypto/${cleanSymbol}`
      : `${API_BASE}/api/prices/mock/stock/${cleanSymbol}`
    : type === "crypto"
      ? `${API_BASE}/api/prices/crypto/${cleanSymbol}`
      : `${API_BASE}/api/prices/stock/${cleanSymbol}`;

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error("Could not fetch price data.");
  }

  return response.json();
}