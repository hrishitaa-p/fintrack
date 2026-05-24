async function updatePrice() {
    const cryptoId = document.getElementById("crypto-id").value;
    const quantity = Number(document.getElementById("quantity").value);
    const buyPrice = Number(document.getElementById("buy-price").value);
  
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`;
  
    const response = await fetch(url);
    const data = await response.json();
  
    const livePrice = data[cryptoId].usd;
  
    const investedAmount = quantity * buyPrice;
    const currentValue = quantity * livePrice;
    const profitLoss = currentValue - investedAmount;
    const returnPercent = (profitLoss / investedAmount) * 100;
  
    document.getElementById("live-price").textContent = `$${livePrice.toFixed(2)}`;
    document.getElementById("current-value").textContent = `$${currentValue.toFixed(2)}`;
    document.getElementById("profit-loss").textContent = `$${profitLoss.toFixed(2)}`;
    document.getElementById("return-percent").textContent = `${returnPercent.toFixed(2)}%`;
    document.getElementById("last-updated").textContent = new Date().toLocaleTimeString();
  }
  
  updatePrice();
  
  setInterval(updatePrice, 30000);