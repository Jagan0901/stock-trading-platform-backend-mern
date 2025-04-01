const Portfolio = require("../models/portfolioModel");
const Stock = require("../models/stockModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const getPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.find({ user: req.user._id });

  // Get current prices and calculate P&L
  const portfolioWithDetails = await Promise.all(
    portfolio.map(async (item) => {
      const stock = await Stock.findOne({ symbol: item.stock });
      const currentPrice = stock?.currentPrice || 0;
      const currentValue = item.quantity * currentPrice;
      const investmentValue = item.quantity * item.averageBuyPrice;
      const pl = currentValue - investmentValue;

      return {
        stock: item.stock,
        quantity: item.quantity,
        averageBuyPrice: item.averageBuyPrice,
        currentPrice: currentPrice,
        currentValue: currentValue,
        pl: pl,
      };
    })
  );

  res.status(200).json(portfolioWithDetails);
});



module.exports = { getPortfolio };
