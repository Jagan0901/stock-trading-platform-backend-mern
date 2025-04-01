const Stock = require("../models/stockModel");
const cron = require("node-cron");

// Sample stocks data
const stocksData = [
  { symbol: "RELIANCE", name: "Reliance Industries", basePrice: 2500 },
  { symbol: "TCS", name: "Tata Consultancy Services", basePrice: 3450 },
  { symbol: "HDFCBANK", name: "HDFC Bank", basePrice: 1400 },
  { symbol: "INFOSYS", name: "Infosys", basePrice: 1500 },
  { symbol: "ICICIBANK", name: "ICICI Bank", basePrice: 900 },
];

// Initialize stocks if they don't exist
const initializeStocks = async () => {
  for (const stock of stocksData) {
    const exists = await Stock.findOne({ symbol: stock.symbol });
    if (!exists) {
      await Stock.create({
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: stock.basePrice,
        historicalPrices: [{ price: stock.basePrice }],
      });
    }
  }
};

// Update stock prices with random fluctuations
const updateStockPrices = async () => {
  const stocks = await Stock.find({});

  for (const stock of stocks) {
    // Random price change between -2% and +2%
    const changePercent = (Math.random() * 4 - 2) / 100;
    const newPrice = stock.currentPrice * (1 + changePercent);

    await Stock.findByIdAndUpdate(stock._id, {
      previousPrice: stock.currentPrice,
      currentPrice: newPrice,
      $push: { historicalPrices: { price: newPrice } },
    });
  }

  console.log(`Stock prices updated at ${new Date().toLocaleTimeString()}`);
};

// Start the cron job to update prices every minute
const startStockUpdater = () => {
  // Initialize stocks first
  initializeStocks().then(() => {
    console.log("Stocks initialized");

    // Then start updating prices every minute
    cron.schedule("* * * * *", updateStockPrices);
  });
};

module.exports = { startStockUpdater };
