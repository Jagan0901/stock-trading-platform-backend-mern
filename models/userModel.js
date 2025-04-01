// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

// const userSchema = mongoose.Schema(
//   {
//     name: { type: "String", required: true },
//     email: { type: "String", unique: true, required: true },
//     password: { type: "String", required: true },
//     portfolio: [{ type: mongoose.Schema.Types.ObjectId, ref: "Portfolio" }],
//     wallet: { type: "Number", default: 100000 },
//   },
//   { timestaps: true }
// );

// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// userSchema.pre("save", async function (next) {
//   if (!this.isModified) {
//     next();
//   }

//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// const User = mongoose.model("User", userSchema);

// module.exports = User;

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    wallet: { type: Number, default: 100000 },
  },
  {
    timestamps: true,
    // Disable version key to prevent unnecessary document updates
    versionKey: false,
  }
);

// Enhanced password hashing middleware
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Skip hashing if already hashed
    if (this.password.startsWith("$2a$")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Add method to check if password needs hashing
userSchema.methods.needsPasswordHash = function () {
  return !this.password.startsWith("$2a$");
};

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;