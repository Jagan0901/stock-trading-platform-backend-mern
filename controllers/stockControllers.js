const Stock = require("../models/stockModel");
const asyncHandler = require("express-async-handler");

//    Get all stock prices     GET /api/stocks
const getStockPrices = asyncHandler(async (req, res) => {
  const stocks = await Stock.find(
    {},
    { symbol: 1, currentPrice: 1, previousPrice: 1, _id: 0 }
  );

  const formattedStocks = stocks.map((stock) => ({
    symbol: stock.symbol,
    price: `₹${stock.currentPrice.toFixed(2)}`,
    change: `₹${(
      stock.currentPrice - (stock.previousPrice || stock.currentPrice)
    ).toFixed(2)}`,
  }));

  res.status(200).json(formattedStocks);
});

module.exports = { getStockPrices };
