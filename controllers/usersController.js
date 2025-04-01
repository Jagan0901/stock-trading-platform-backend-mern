// const User = require("../models/userModel");
// const asyncHandler = require("express-async-handler");
// const jwt = require("jsonwebtoken");


// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
// };

 
// const registerUser = asyncHandler(async (req, res) => {
//   const { name, email, password} = req.body;

//   if (!name || !email || !password) {
//     res.status(400).json("Please Enter all the Fields");
//     // throw new Error("Please Enter all the Feilds");
//   }

//   const userExists = await User.findOne({ email });

//   if (userExists) {
//     res.status(400).json("User already exists");
//     throw new Error("User already exists");
//   }
//   if(!/^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/g.test(password)){
//         res.status(404).json("Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character")
//         return;
//     }

//   const user = await User.create({
//     name,
//     email,
//     password
//   });

//   if (user) {
//     res.status(201).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       wallet: user.wallet,
//       token: generateToken(user._id),
//     });
//   } else {
//     res.status(400).json("User not found");
//     // throw new Error("User not found");
//   }
// });


// const authUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email });

//   if (user && (await user.matchPassword(password))) {
//     res.json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       wallet: user.wallet,
//       token: generateToken(user._id),
//     });
//   } else {
//     res.status(401).json("Invalid Email or Password");
//   }
// });

// const getWalletBalance = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id).select("wallet");
//   res.status(200).json({ balance: user.wallet });
// });

// module.exports = { registerUser, authUser, getWalletBalance };



const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields",
    });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  if (
    !/^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/g.test(
      password
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
    });
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      wallet: user.wallet,
      token: generateToken(user._id),
    },
  });
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      wallet: user.wallet,
      token: generateToken(user._id),
    },
  });
});

const getWalletBalance = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("wallet");
  res.status(200).json({
    success: true,
    data: {
      balance: user.wallet,
    },
  });
});

module.exports = { registerUser, authUser, getWalletBalance };