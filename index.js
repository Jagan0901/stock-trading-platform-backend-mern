const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/usersRouter");
// const taskRoutes = require("./routes/taskRoutes")

const app = express();

dotenv.config();
connectDB();
app.use(express.json()); // to accept json data

app.get("/", async(req,res)=>{
    res.send("API is running successfully");
})


app.use("/api/user", userRoutes);
// app.use("/api/task", taskRoutes);

app.listen(
  process.env.PORT,
  console.log(`Server running on PORT ${process.env.PORT}`)
);