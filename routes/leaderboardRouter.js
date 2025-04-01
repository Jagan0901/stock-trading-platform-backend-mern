const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getLeaderboard } = require("../controllers/leaderboardController");


const leaderboardRouter = express.Router();

leaderboardRouter.get("/", protect, getLeaderboard);

module.exports = leaderboardRouter;
