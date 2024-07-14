const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, please login");
  }

  //Verify token
  const verified = jwt.verify(token, process.env.JWT_SECRET);

  if (!verified) {
    res.status(401);
    throw new Error("Token has expired, please login");
  }

  const user = await User.findById(verified.id).select("-password");

  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  req.user = user;
  next();
});

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Unauthorized, Admin only");
  }
};

module.exports = { protect, adminOnly };
