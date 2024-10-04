const express = require("express");
const TradingBot = require("./tradingBot");

const app = express();
const bot = new TradingBot();
const PORT = process.env.PORT || 3000;

let monitoringIntervalId;
let summaryIntervalId;

app.get("/start/:stockSymbol", (req, res) => {
  const { stockSymbol } = req.params;

  monitoringIntervalId = setInterval(async () => {
    await bot.monitorStock(stockSymbol);
  }, 1000);

  res.send("Monitoring started for " + stockSymbol);
});

app.get("/summary", async (req, res) => {
  const latestSummary = await bot.getSummary();
  console.log({ latestSummary });
  res.status(200).send(latestSummary);
});

app.get("/stop", (req, res) => {
  clearInterval(monitoringIntervalId);
  clearInterval(summaryIntervalId);
  res.send("Monitoring stopped.");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
