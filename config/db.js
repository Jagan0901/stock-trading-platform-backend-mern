const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);

    // console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`MongoDB Connected...`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // process.exit(1); 
    // Exit with a non-zero status code to indicate an error
  }
};

module.exports = connectDB;