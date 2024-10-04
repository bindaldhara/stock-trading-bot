const express = require("express");
const cors = require("cors");
const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const mockData = [
  { symbol: "NIFTY", price: 15000 },
  { symbol: "NIFTY", price: 15200 },
  { symbol: "NIFTY", price: 14800 },
  { symbol: "NIFTY", price: 15500 },
  { symbol: "NIFTY", price: 15700 },
  { symbol: "NIFTY", price: 14900 },
  { symbol: "NIFTY", price: 15300 },
  { symbol: "NIFTY", price: 15400 },
  { symbol: "NIFTY", price: 15100 },
];

let currentIndex = 0;

app.get("/api/stock/:symbol", (req, res) => {
  const { symbol } = req.params;

  if (symbol === "NIFTY") {
    const data = mockData[currentIndex];
    currentIndex++;

    if (currentIndex >= mockData.length) {
      currentIndex = 0; 
    }

    res.json(data);
  } else {
    res.status(404).json({ message: "Stock not found" });
  }
});

app.listen(port, () => {
  console.log(`Mock API running at http://localhost:${port}`);
});
