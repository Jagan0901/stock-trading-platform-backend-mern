const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { placeOrder, getOrders } = require("../controllers/orderController");

const orderRouter = express.Router();

orderRouter.post("/", protect, placeOrder);
orderRouter.get("/", protect, getOrders);

module.exports = orderRouter;
