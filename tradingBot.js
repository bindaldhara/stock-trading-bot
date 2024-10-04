require("dotenv").config();
const axios = require("axios");

const MOVING_AVERAGE_WINDOW_SIZE = 5;
const MAX_PRICE_HISTORY_LENGTH = 20;  // Maximum price history length

class TradingBot {
  constructor() {
    this.positions = [];
    this.balance = 50000; // Starting balance
    this.trades = []; 
    this.priceHistory = []; // To track price history for moving average
  }

  async fetchStockPrice(stockSymbol) {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/stock/${stockSymbol}`
      );
      return response.data.price;
    } catch (error) {
      console.error("Error fetching stock price:", error);
      return null;
    }
  }

  updatePriceHistory(currentPrice) {
    this.priceHistory.push(currentPrice);
    if (this.priceHistory.length > MAX_PRICE_HISTORY_LENGTH) {
      this.priceHistory.shift();
    }
  }

  async monitorStock(stockSymbol) {
    const currentPrice = await this.fetchStockPrice(stockSymbol);
    console.log(`Current price for ${stockSymbol}: ${currentPrice}`);
    if (currentPrice != null) {
      this.updatePriceHistory(currentPrice);
      this.makeTradeDecision(stockSymbol, currentPrice);
      return currentPrice;
    }
  }

  makeTradeDecision(stockSymbol, currentPrice) {
    let movingAverage = 0;
    if (this.priceHistory.length < MOVING_AVERAGE_WINDOW_SIZE) {
      movingAverage =
        this.priceHistory.reduce((total, curr) => total + curr, 0) /
        this.priceHistory.length;
    } else {
      const prices = this.priceHistory.slice(-MOVING_AVERAGE_WINDOW_SIZE);
      movingAverage =
        prices.reduce((total, curr) => total + curr, 0) /
        MOVING_AVERAGE_WINDOW_SIZE;
    }

    const priceChangeDrop =
      ((movingAverage - currentPrice) / movingAverage) * 100;
    const priceChangeRise =
      ((currentPrice - movingAverage) / movingAverage) * 100;

    console.log({ priceChangeDrop, priceChangeRise });

    if (priceChangeDrop >= 2) {
      console.log("buyyyy");
      console.log(`Buying ${stockSymbol} at ${currentPrice}.`);
      this.buy(stockSymbol, currentPrice);
    }

    else if (priceChangeRise >= 3) {
      console.log(`Selling ${stockSymbol} at ${currentPrice}.`);
      this.sell(stockSymbol, currentPrice);
    }
  }

  buy(stockSymbol, price) {
    const position = this.positions.find((p) => p.symbol === stockSymbol);
    const quantity = Math.floor(this.balance / price);

    if (quantity > 0) {
      this.balance -= quantity * price; 
      if (position) {
        position.avgPrice =
          (position.avgPrice * position.quantity + price * quantity) /
          (position.quantity + quantity); 
        position.quantity += quantity; 
      } else {
        this.positions.push({
          symbol: stockSymbol,
          avgPrice: price,
          quantity,
        }); 
      }
      this.trades.push({ action: "buy", symbol: stockSymbol, price, quantity });
      console.log(`Bought ${quantity} of ${stockSymbol} at ${price}.`);
    } else {
      console.log("Not enough balance to buy stock.");
    }
  }

  sell(stockSymbol, price) {
    const position = this.positions.find((p) => p.symbol === stockSymbol);
    if (position && position.quantity > 0) {
      const totalSellValue = position.quantity * price;
      this.balance += totalSellValue; 
      this.trades.push({
        action: "sell",
        symbol: stockSymbol,
        price,
        quantity: position.quantity,
      });
      console.log(`Sold all shares of ${stockSymbol} at ${price}.`);
      position.quantity = 0; 
      console.log(`Sold all shares of ${stockSymbol} at ${price}.`);
    } else {
        console.log("Not enough quantity to sell stock.");
    }
  }

  async getSummary() {
    const currentPrices = {};
    const totalValue = await this.positions.reduce(async (acc, pos) => {
      const currentPrice = await this.fetchStockPrice(pos.symbol);
      currentPrices[pos.symbol] = currentPrice;
      return acc + pos.quantity * currentPrice; 
    }, 0);
    console.log({ totalValue, currentPrices });

    const totalCost = this.positions.reduce((acc, pos) => {
      return acc + pos.avgPrice * pos.quantity; 
    }, 0);

    const profitLoss = totalValue - totalCost; 

    return {
      balance: this.balance, 
      positions: this.positions.map(({ symbol, avgPrice, quantity }) => ({
        symbol,
        avgPrice,
        quantity,
        currentValue: quantity * currentPrices[symbol], 
      })), 
      trades: this.trades, 
      profitLoss: profitLoss, 
    };
  }
}

module.exports = TradingBot;
