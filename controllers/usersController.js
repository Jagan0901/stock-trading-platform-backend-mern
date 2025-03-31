const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

  // Register new user:   POST /api/user/
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password} = req.body;

  if (!name || !email || !password) {
    res.status(400).json("Please Enter all the Fields");
    // throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json("User already exists");
    throw new Error("User already exists");
  }
  if(!/^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/g.test(password)){
        res.status(404).json("Password pattern does not match")
        return;
    }

  const user = await User.create({
    name,
    email,
    password
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      wallet: user.wallet,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json("User not found");
    // throw new Error("User not found");
  }
});

//  Auth the user:    POST /api/user/login
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      wallet: user.wallet,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json("Invalid Email or Password");
    // throw new Error("Invalid Email or Password");
  }
});

module.exports = {registerUser, authUser };