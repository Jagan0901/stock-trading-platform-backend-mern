const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/usersRouter");
const stockRouter = require("./routes/stocksRouter");
const { startStockUpdater } = require("./services/stockUpdator");
const orderRouter = require("./routes/orderRouter");
const portfolioRouter = require("./routes/portfolioRouter");
const leaderboardRouter = require("./routes/leaderboardRouter");
// const taskRoutes = require("./routes/taskRoutes")

const app = express();

app.use(cors());

dotenv.config();
connectDB();
app.use(express.json()); // to accept json data

// Start stock price updates
startStockUpdater();

app.get("/", async(req,res)=>{
    res.send("API is running successfully");
})


app.use("/api/user", userRoutes);
app.use("/api/stocks", stockRouter);
app.use("/api/orders", orderRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/leaderboard", leaderboardRouter);

app.listen(
  process.env.PORT,
  console.log(`Server running on PORT ${process.env.PORT}`)
);