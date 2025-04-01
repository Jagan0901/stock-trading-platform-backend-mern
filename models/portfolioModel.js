const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stock: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  averageBuyPrice: { type: Number, default: 0 }
}, { timestamps: true });

portfolioSchema.index({ user: 1, stock: 1 }, { unique: true });

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

module.exports = Portfolio;