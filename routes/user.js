const express = require("express");
const {
  registerUser,
  loginUser,
  verifyEmail,
  createBondLottoAccount,
  getBondLottoAccount,
  getUser,
  generateInvestmentCode,
  forgetPassword,
  resetPassword,
  logout,
} = require("../controllers/user");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email", protect, verifyEmail);
router.post("/forgot-password", forgetPassword);
router.post("/reset-password/:resetToken", resetPassword);
router.get("/", protect, getUser);
router.get("/logout", logout);

// BONDLOTTO API
router.post("/create-bondnote-account", protect, createBondLottoAccount);
router.get("/get-bondnote-account", protect, getBondLottoAccount);
router.post("/generate-investment-code", protect, generateInvestmentCode);

module.exports = router;
