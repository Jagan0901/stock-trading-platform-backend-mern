const Portfolio = require("../models/portfolioModel");
const Stock = require("../models/stockModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

// Leaderboard controller
const getLeaderboard = asyncHandler(async (req, res) => {
  // Get all users with their portfolio values
  const users = await User.find({}).select("name wallet");

  const usersWithPortfolioValues = await Promise.all(
    users.map(async (user) => {
      const portfolio = await Portfolio.find({ user: user._id });

      // Calculate total portfolio value
      let portfolioValue = 0;
      for (const item of portfolio) {
        const stock = await Stock.findOne({ symbol: item.stock });
        portfolioValue += item.quantity * (stock?.currentPrice || 0);
      }

      // Add wallet balance to portfolio value
      const totalValue = portfolioValue + user.wallet;

      return {
        userId: user._id,
        name: user.name,
        portfolioValue: totalValue,
      };
    })
  );

  // Sort by portfolio value (descending)
  const leaderboard = usersWithPortfolioValues
    .sort((a, b) => b.portfolioValue - a.portfolioValue)
    .map((user, index) => ({
      rank: index + 1,
      name: user.name,
      value: user.portfolioValue,
    }));

  res.status(200).json(leaderboard);
});

module.exports = { getLeaderboard };