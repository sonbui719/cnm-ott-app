const express = require("express");
const {
  sendOtp,
  verifyOtp,
  register,
  login,
  getMe
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;