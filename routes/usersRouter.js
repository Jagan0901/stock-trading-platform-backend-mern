const express = require("express");
const {
  registerUser,
  authUser,
  getWalletBalance
} = require("../controllers/usersController");
const { protect } = require("../middleware/authMiddleware");

const userRouter = express.Router();

userRouter.post("/", registerUser);
userRouter.post("/login", authUser);
userRouter.get("/wallet", protect, getWalletBalance);

module.exports = userRouter;