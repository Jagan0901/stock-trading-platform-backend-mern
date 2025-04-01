// const Order = require("../models/orderModel");
// const Portfolio = require("../models/portfolioModel");
// const Stock = require("../models/stockModel");
// const User = require("../models/userModel");
// const asyncHandler = require("express-async-handler");
// const mongoose = require("mongoose");

// const placeOrder = asyncHandler(async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { stock, type, quantity } = req.body;
//     const userId = req.user._id;

//     if (!stock || !type || !quantity || quantity <= 0) {
//       throw new Error("Invalid order details");
//     }

 
//     const stockData = await Stock.findOne({ symbol: stock }).session(session);
//     if (!stockData) {
//       throw new Error("Stock not found");
//     }

//     const price = stockData.currentPrice;
//     const totalAmount = price * quantity;

//     const user = await User.findById(userId).session(session);
//     if (!user) {
//       throw new Error("User not found");
//     }

//     if (type === "buy") {
//       if (user.wallet < totalAmount) {
//         throw new Error("Insufficient wallet balance");
//       }
//     } else if (type === "sell") {
//       const portfolioItem = await Portfolio.findOne({
//         user: userId,
//         stock,
//       }).session(session);
//       if (!portfolioItem || portfolioItem.quantity < quantity) {
//         throw new Error("Insufficient shares to sell");
//       }
//     }


//     const order = await Order.create(
//       [
//         {
//           user: userId,
//           stock,
//           type,
//           quantity,
//           price,
//           status: "completed",
//           executedAt: new Date(),
//         },
//       ],
//       { session }
//     );

//     if (type === "buy") {
//       await User.findByIdAndUpdate(
//         userId,
//         { $inc: { wallet: -totalAmount } },
//         { session }
//       );
//     } else {
//       await User.findByIdAndUpdate(
//         userId,
//         { $inc: { wallet: totalAmount } },
//         { session }
//       );
//     }

//     if (type === "buy") {
//       let portfolioItem = await Portfolio.findOne({
//         user: userId,
//         stock,
//       }).session(session);

//       if (!portfolioItem) {
//         portfolioItem = new Portfolio({
//           user: userId,
//           stock,
//           quantity: 0,
//           averageBuyPrice: 0,
//         });
//       }

//       const newTotalQuantity = portfolioItem.quantity + quantity;
//       const newAveragePrice =
//         (portfolioItem.averageBuyPrice * portfolioItem.quantity + totalAmount) /
//         newTotalQuantity;

//       portfolioItem.quantity = newTotalQuantity;
//       portfolioItem.averageBuyPrice = newAveragePrice;
//       await portfolioItem.save({ session });
//     } else {
//       const portfolioItem = await Portfolio.findOne({
//         user: userId,
//         stock,
//       }).session(session);
//       portfolioItem.quantity -= quantity;

//       if (portfolioItem.quantity === 0) {
//         await Portfolio.findByIdAndDelete(portfolioItem._id, { session });
//       } else {
//         await portfolioItem.save({ session });
//       }
//     }

//     await session.commitTransaction();


//     const updatedUser = await User.findById(userId).select("wallet");

//     res.status(201).json({
//       success: true,
//       data: order[0],
//       walletBalance: updatedUser.wallet,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   } finally {
//     session.endSession();
//   }
// });

// const getOrders = asyncHandler(async (req, res) => {
//   const orders = await Order.find({ user: req.user._id }).sort({
//     createdAt: -1,
//   });
//   res.status(200).json({
//     success: true,
//     data: orders,
//   });
// });

// module.exports = { placeOrder, getOrders };


const mongoose = require("mongoose");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Portfolio = require("../models/portfolioModel");
const Stock = require("../models/stockModel");
const asyncHandler = require("express-async-handler");

const placeOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { stock, type, quantity } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!stock || !type || !quantity || quantity <= 0) {
      throw new Error("Invalid order details");
    }

    // Get stock price
    const stockData = await Stock.findOne({ symbol: stock }).session(session);
    if (!stockData) {
      throw new Error("Stock not found");
    }

    const price = stockData.currentPrice;
    const totalAmount = price * quantity;

    // Check user's balance or holdings
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    if (type === "buy") {
      if (user.wallet < totalAmount) {
        throw new Error("Insufficient wallet balance");
      }
    } else {
      const portfolioItem = await Portfolio.findOne({
        user: userId,
        stock,
      }).session(session);

      if (!portfolioItem || portfolioItem.quantity < quantity) {
        throw new Error("Insufficient shares to sell");
      }
    }

    // Create order
    const [order] = await Order.create(
      [
        {
          user: userId,
          stock,
          type,
          quantity,
          price,
          status: "completed",
          executedAt: new Date(),
        },
      ],
      { session }
    );

    // Update wallet using static method (won't trigger password hash)
    const walletUpdate = type === "buy" ? -totalAmount : totalAmount;
    await User.updateWallet(userId, walletUpdate);

    // Update portfolio
    if (type === "buy") {
      let portfolioItem = await Portfolio.findOne({
        user: userId,
        stock,
      }).session(session);

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
      await portfolioItem.save({ session });
    } else {
      const portfolioItem = await Portfolio.findOne({
        user: userId,
        stock,
      }).session(session);

      portfolioItem.quantity -= quantity;

      if (portfolioItem.quantity === 0) {
        await Portfolio.findByIdAndDelete(portfolioItem._id, { session });
      } else {
        await portfolioItem.save({ session });
      }
    }

    await session.commitTransaction();

    // Get fresh wallet balance
    const updatedUser = await User.findById(userId)
      .select("wallet")
      .session(session);

    res.status(201).json({
      success: true,
      data: {
        order,
        walletBalance: updatedUser.wallet,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
});

const getOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = {
  placeOrder,
  getOrders,
};