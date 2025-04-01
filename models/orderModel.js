const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stock: { type: String, required: true },
  type: { type: String, enum: ["buy", "sell"], required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  executedAt: { type: Date },
  reason: { type: String } // For failed orders
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;