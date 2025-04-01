const Order = require("../models/orderModel");
const Portfolio = require("../models/portfolioModel");
const Stock = require("../models/stockModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const placeOrder = asyncHandler(async (req, res) => {
  const { stock, type, quantity } = req.body;
  const userId = req.user._id;

  // Validate input
  if (!stock || !type || !quantity || quantity <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid order details" });
  }

  // Get current stock price
  const stockData = await Stock.findOne({ symbol: stock });
  if (!stockData) {
    return res.status(404).json({ success: false, message: "Stock not found" });
  }

  const price = stockData.currentPrice;
  const totalAmount = price * quantity;

  // Check user's ability to execute order
  const user = await User.findById(userId);

  if (type === "buy") {
    if (user.wallet < totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }
  } else if (type === "sell") {
    const portfolioItem = await Portfolio.findOne({ user: userId, stock });
    if (!portfolioItem || portfolioItem.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient shares to sell",
      });
    }
  }

  // Create and execute order
  const order = await Order.create({
    user: userId,
    stock,
    type,
    quantity,
    price,
    status: "completed",
    executedAt: new Date(),
  });

  // Update user's portfolio and wallet
  if (type === "buy") {
    // Deduct from wallet
    user.wallet -= totalAmount;
    await user.save();

    // Add to portfolio
    let portfolioItem = await Portfolio.findOne({ user: userId, stock });
    if (!portfolioItem) {
      portfolioItem = new Portfolio({
        user: userId,
        stock,
        quantity: 0,
        averageBuyPrice: 0,
      });
    }

    const newTotalQuantity = portfolioItem.quantity + quantity;
    const newAveragePrice =
      (portfolioItem.averageBuyPrice * portfolioItem.quantity + totalAmount) /
      newTotalQuantity;

    portfolioItem.quantity = newTotalQuantity;
    portfolioItem.averageBuyPrice = newAveragePrice;
    await portfolioItem.save();
  } else if (type === "sell") {
    // Add to wallet
    user.wallet += totalAmount;
    await user.save();

    // Deduct from portfolio
    const portfolioItem = await Portfolio.findOne({ user: userId, stock });
    portfolioItem.quantity -= quantity;

    if (portfolioItem.quantity === 0) {
      await Portfolio.findByIdAndDelete(portfolioItem._id);
    } else {
      await portfolioItem.save();
    }
  }

  res.status(201).json({
    success: true,
    data: order,
    walletBalance: user.wallet,
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, data: orders });
});

module.exports = { placeOrder, getOrders };
