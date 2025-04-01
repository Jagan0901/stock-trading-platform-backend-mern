const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getPortfolio
} = require("../controllers/portfolioController");

const portfolioRouter = express.Router();

portfolioRouter.get("/", protect, getPortfolio);

module.exports = portfolioRouter;
