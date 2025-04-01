const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getStockPrices } = require("../controllers/stockControllers");

const stockRouter = express.Router();

stockRouter.get("/", protect, getStockPrices);

module.exports = stockRouter;
