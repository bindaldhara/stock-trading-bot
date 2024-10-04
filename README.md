# Stock Trading Bot

## Getting Started

1. Clone the repository:
   git clone <repository-link>

2. Navigate to the project directory:
   cd stock-trading-bot

3. Install dependencies:
   npm install

4. Start the server:
   node index.js

5. Start Mock API server 
    node mockAPI.js

## API Endpoints

- **Start Trading**: `GET /start/:stockSymbol`
  - Start monitoring a specific stock symbol.

- **Get summary**: `GET /summary`
  - Get the summary of trades done and P/L.

- **Stop Trading** : `GET /stop`
  - Stop monitoring


### Conclusion

This simple trading bot simulates a trading operation. For real-world applications, you would need to plug in a real stock market API. 