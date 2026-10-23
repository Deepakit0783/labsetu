
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT || 587),
  secure: Number(process.env.EMAIL_PORT || 587) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate JWT token
function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in the .env file");
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

// Safe user response
function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    pinCode: user.pinCode || "",
    address: user.address || "",
    role: user.role,
    isActive: user.isActive,
  };
}

// Register customer
exports.register = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        success: false,
        message: "Request body is missing.",
      });
    }

    const { name, email, phone, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    const cleanName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 128 characters.",
      });
    }

    if (cleanPhone && !/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must contain 10 digits.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      email: normalizedEmail,
      phone: cleanPhone,
      password: hashedPassword,
      role: "customer",
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        success: false,
        message: "Request body is missing.",
      });
    }

    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password
// Send a six-digit OTP to the registered email
exports.forgotPassword = async (req, res, next) => {
  try {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER or EMAIL_PASS is missing in .env");
    }

    const genericMessage =
      "If an account exists for this email, an OTP will be sent.";

    const user = await User.findOne({ email });

    // Do not reveal whether an account exists.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    // Generate a cryptographically secure six-digit OTP.
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Store only the OTP hash.
    user.resetPasswordOtpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.resetPasswordOtpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    user.resetPasswordOtpAttempts = 0;
    user.resetPasswordOtpBlockedUntil = undefined;

    await user.save();

    try {
      await transporter.sendMail({
        from: {
          name: "LabSetu",
          address: process.env.EMAIL_USER,
        },
        to: user.email,
        subject: "LabSetu Password Reset OTP",
        text: `Your LabSetu password reset OTP is ${otp}. It expires in 5 minutes. Do not share it with anyone.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#222;padding:20px">
            <h2>LabSetu Password Reset</h2>
            <p>Your password reset OTP is:</p>
            <h1 style="letter-spacing:8px;color:#0d9488">${otp}</h1>
            <p>This OTP expires in <strong>5 minutes</strong>.</p>
            <p>Do not share this OTP with anyone.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (mailError) {
      // Invalidate the OTP if email delivery fails.
      user.resetPasswordOtpHash = undefined;
      user.resetPasswordOtpExpires = undefined;
      user.resetPasswordOtpAttempts = 0;
      user.resetPasswordOtpBlockedUntil = undefined;

      await user.save();
      throw mailError;
    }

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    next(error);
  }
};

// POST /api/auth/reset-password
// Verify OTP and save the new password
exports.resetPassword = async (req, res, next) => {
  try {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const { otp, password } = req.body || {};

    if (!email || typeof otp !== "string" && typeof otp !== "number") {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 6-digit OTP.",
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 128 characters.",
      });
    }

    const user = await User.findOne({ email }).select(
      "+resetPasswordOtpHash " +
      "+resetPasswordOtpExpires " +
      "+resetPasswordOtpAttempts " +
      "+resetPasswordOtpBlockedUntil"
    );

    if (!user || !user.resetPasswordOtpHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Request a new OTP.",
      });
    }

    // Check temporary block.
    if (
      user.resetPasswordOtpBlockedUntil &&
      user.resetPasswordOtpBlockedUntil.getTime() > Date.now()
    ) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Try again after 15 minutes.",
      });
    }

    // Check OTP expiry.
    if (
      !user.resetPasswordOtpExpires ||
      user.resetPasswordOtpExpires.getTime() <= Date.now()
    ) {
      user.resetPasswordOtpHash = undefined;
      user.resetPasswordOtpExpires = undefined;
      user.resetPasswordOtpAttempts = 0;
      user.resetPasswordOtpBlockedUntil = undefined;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const submittedOtpHash = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

    const storedHash = Buffer.from(user.resetPasswordOtpHash, "hex");
    const enteredHash = Buffer.from(submittedOtpHash, "hex");

    const isOtpValid =
      storedHash.length === enteredHash.length &&
      crypto.timingSafeEqual(storedHash, enteredHash);

    if (!isOtpValid) {
      user.resetPasswordOtpAttempts =
        (user.resetPasswordOtpAttempts || 0) + 1;

      if (user.resetPasswordOtpAttempts >= 5) {
        user.resetPasswordOtpBlockedUntil = new Date(
          Date.now() + 15 * 60 * 1000
        );

        await user.save();

        return res.status(429).json({
          success: false,
          message: "Too many incorrect OTP attempts. Try again after 15 minutes.",
        });
      }

      await user.save();

      return res.status(400).json({
        success: false,
        message: `Incorrect OTP. ${
          5 - user.resetPasswordOtpAttempts
        } attempts remaining.`,
      });
    }

    // Hash the new password using the same method as registration.
    user.password = await bcrypt.hash(password, 12);

    // Make the OTP one-time use.
    user.resetPasswordOtpHash = undefined;
    user.resetPasswordOtpExpires = undefined;
    user.resetPasswordOtpAttempts = 0;
    user.resetPasswordOtpBlockedUntil = undefined;

    // Invalidate legacy reset links, if any remain.
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);
    next(error);
  }
};

// GET /api/auth/profile
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId).select(
      "name email phone pinCode address role isActive"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    return res.status(200).json({
      success: true,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { name, phone, mobile, pinCode, address } = req.body || {};

    const cleanName = typeof name === "string" ? name.trim() : "";

    const cleanPhone =
      typeof phone === "string"
        ? phone.trim()
        : typeof mobile === "string"
          ? mobile.trim()
          : null;

    const cleanPin = typeof pinCode === "string" ? pinCode.trim() : "";
    const cleanAddress =
      typeof address === "string" ? address.trim() : "";

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters.",
      });
    }

    if (
      cleanPhone === null ||
      (cleanPhone && !/^\d{10}$/.test(cleanPhone))
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number.",
      });
    }

    if (cleanPin && !/^\d{6}$/.test(cleanPin)) {
      return res.status(400).json({
        success: false,
        message: "PIN code must contain 6 digits.",
      });
    }

    if (cleanAddress.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Address cannot exceed 500 characters.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    user.name = cleanName;
    user.phone = cleanPhone;
    user.pinCode = cleanPin;
    user.address = cleanAddress;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};
