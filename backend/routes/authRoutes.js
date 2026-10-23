
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Register and login
router.post("/register", register);
router.post("/login", login);

// Password reset using Gmail OTP
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Profile
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;
