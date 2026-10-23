
const User = require("../models/User");
const Booking = require("../models/Booking");
const Lab = require("../models/Lab");
const Test = require("../models/Test");
const bcrypt = require("bcryptjs");

// Admin dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalAgents,
      totalLabs,
      totalTests,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue,
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "agent" }),
      Lab.countDocuments({ isActive: true }),
      Test.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: "pending" }),
      Booking.countDocuments({ bookingStatus: "completed" }),
      Booking.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            bookingStatus: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAgents,
        totalLabs,
        totalTests,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all users, optionally filter by role
exports.getUsers = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.role) {
      if (!["customer", "agent", "lab", "admin"].includes(req.query.role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user role",
        });
      }

      filter.role = req.query.role;
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Get active agents for booking assignment
exports.getActiveAgents = async (req, res, next) => {
  try {
    const agents = await User.find({
      role: "agent",
      isActive: true,
    })
      .select("_id name email phone")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (error) {
    next(error);
  }
};

// Activate or deactivate a user
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body || {};

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const currentAdminId = req.user.id || req.user._id;

    if (currentAdminId?.toString() === id && !isActive) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status) {
      const allowedStatuses = [
        "pending",
        "confirmed",
        "sample-collected",
        "completed",
        "cancelled",
      ];

      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking status",
        });
      }

      filter.bookingStatus = req.query.status;
    }

    const bookings = await Booking.find(filter)
      .populate("customer", "name email phone")
      .populate("lab", "name city state phone")
      .populate("agent", "name email phone")
      .populate("tests.test", "name category duration")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Assign a booking to an active agent
exports.assignAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body || {};

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    if (!/^[0-9a-fA-F]{24}$/.test(agentId || "")) {
      return res.status(400).json({
        success: false,
        message: "Valid agentId is required",
      });
    }

    const agent = await User.findOne({
      _id: agentId,
      role: "agent",
      isActive: true,
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Active agent not found",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled bookings cannot be assigned",
      });
    }

    booking.agent = agent._id;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("customer", "name email phone")
      .populate("lab", "name city state")
      .populate("agent", "name email phone")
      .populate("tests.test", "name category");

    return res.status(200).json({
      success: true,
      message: "Agent assigned successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// Update booking status (Admin)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bookingStatus } = req.body || {};

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const allowedStatuses = [
      "pending",
      "confirmed",
      "sample-collected",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.bookingStatus === "cancelled" &&
      bookingStatus !== "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cancelled booking status cannot be changed",
      });
    }

    booking.bookingStatus = bookingStatus;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// Create Agent
exports.createAgent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      pinCode,
      address,
      password,
    } = req.body || {};

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
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const cleanPin = typeof pinCode === "string" ? pinCode.trim() : "";
    const cleanAddress =
      typeof address === "string" ? address.trim() : "";

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
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

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const agent = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      pinCode: cleanPin,
      address: cleanAddress,
      password: hashedPassword,
      role: "agent",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Agent created successfully.",
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        pinCode: agent.pinCode,
        address: agent.address,
        role: agent.role,
        isActive: agent.isActive,
      },
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

 
// Create Lab Staff and assign to a specific Lab
exports.createLabStaff = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      pinCode,
      address,
      password,
      labId,
    } = req.body || {};

    // Required fields
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof labId !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password ||
      !labId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and labId are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const cleanPin = typeof pinCode === "string" ? pinCode.trim() : "";
    const cleanAddress = typeof address === "string" ? address.trim() : "";

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
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

    if (!/^[0-9a-fA-F]{24}$/.test(labId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Lab ID.",
      });
    }

    // Only an existing, active Lab can be assigned
    const lab = await Lab.findOne({
      _id: labId,
      isActive: true,
    });

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: "Active Lab not found.",
      });
    }

    // Email must be unique across all user roles
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const staff = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      pinCode: cleanPin,
      address: cleanAddress,
      password: hashedPassword,
      role: "lab",
      lab: lab._id,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Lab Staff account created successfully.",
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        pinCode: staff.pinCode,
        address: staff.address,
        role: staff.role,
        lab: {
          id: lab._id,
          name: lab.name,
        },
        isActive: staff.isActive,
      },
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
