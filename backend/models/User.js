
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email"],
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 20,
    },

    pinCode: {
      type: String,
      trim: true,
      default: "",
      match: [/^\d{6}$/, "PIN code must contain 6 digits"],
    },

    address: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      enum: ["customer", "admin", "lab", "agent"],
      default: "customer",
      required: true,
    },

    // Lab Staff ko ek specific Lab se link karta hai.
    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Password reset OTP ka SHA-256 hash
    resetPasswordOtpHash: {
      type: String,
      select: false,
    },

    // OTP ki expiry date (5 minutes)
    resetPasswordOtpExpires: {
      type: Date,
      select: false,
    },

    // Galat OTP attempts count
    resetPasswordOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    // Zyada galat attempts par temporary block
    resetPasswordOtpBlockedUntil: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Lab Staff ko assigned Lab ke basis par find karne ke liye.
userSchema.index({ lab: 1, role: 1 });

module.exports = mongoose.model("User", userSchema);
